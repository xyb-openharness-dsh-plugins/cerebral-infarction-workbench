import { DatabaseSync } from 'node:sqlite'
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { createHash, randomUUID } from 'node:crypto'
import { homedir, tmpdir } from 'node:os'
import { extname, isAbsolute, join, relative, resolve, sep } from 'node:path'

const SQL_DIR = new URL('../schema/', import.meta.url)
const MIGRATIONS = ['0001_initial.sql', '0002_public-study-first-posted-date.sql']
const DEMO = JSON.parse(readFileSync(new URL('../test/fixtures/synthetic/profiles.json', import.meta.url), 'utf8'))
const DOCUMENT_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.txt', '.docx'])
const now = () => new Date().toISOString()
const text = (value, max = 4000) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const fail = (message, status = 400) => Object.assign(new Error(message), { status })

export function forbiddenRoot(input) {
  if (typeof input !== 'string' || !input.trim()) return '请选择资料目录'
  let path
  try { path = resolve(input.trim()) } catch { return '资料目录路径无效' }
  const home = resolve(homedir())
  const bad = new Set([resolve('/'), home, join(home, 'Desktop'), join(home, 'Downloads'), join(home, '下载'), resolve(tmpdir()), '/private/tmp', '/var/tmp'])
  if (bad.has(path)) return '主目录本身、桌面、下载根目录或临时目录不能作为资料目录'
  if (/[\\/](Desktop|桌面|Downloads?|下载)[\\/]?$/i.test(path)) return '桌面或下载根目录不能作为资料目录'
  if (/(^|[\\/])tmp([\\/]|$)/i.test(path)) return '临时目录不能作为资料目录'
  return null
}

function within(root, candidate) {
  const rel = relative(root, candidate)
  return rel !== '' && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel)
}

export class Workbench {
  constructor({ configRoot }) {
    if (!configRoot) throw new Error('Workbench config root is required')
    this.configRoot = resolve(configRoot)
    mkdirSync(this.configRoot, { recursive: true })
    this.pointerPath = join(this.configRoot, '.data-root.json')
    this.db = null
    this.dataRoot = null
    this.dbPath = null
    try {
      const pointer = JSON.parse(readFileSync(this.pointerPath, 'utf8'))
      const blocked = forbiddenRoot(pointer?.dataRoot)
      if (!blocked && existsSync(pointer.dataRoot) && statSync(pointer.dataRoot).isDirectory()) this.openDataRoot(realpathSync(pointer.dataRoot))
    } catch { /* 首次启动、路径丢失或无效：保持可浏览的未配置状态 */ }
  }

  close() {
    try { this.db?.close() } catch { /* 已关闭 */ }
    this.db = null
  }

  currentRootInfo() {
    if (!this.dataRoot) return { status: 'not_selected', configured: false }
    return { status: 'ready', configured: true, dir: this.dataRoot }
  }

  setRoot(input) {
    const reason = forbiddenRoot(input)
    if (reason) throw fail(reason)
    let chosen
    try { chosen = realpathSync(input) } catch { throw fail('所选目录不存在或不可访问') }
    if (!statSync(chosen).isDirectory()) throw fail('所选路径不是目录')
    const writeProbe = join(chosen, `.ciwb-access-${randomUUID()}`)
    try { writeFileSync(writeProbe, '', { flag: 'wx', mode: 0o600 }) }
    catch { throw fail('无法在所选目录读写；当前目录设置未更改', 403) }
    try { unlinkSync(writeProbe) } catch { try { unlinkSync(writeProbe) } catch { /* 残留的空探针不含用户内容 */ } }

    const oldRoot = this.dataRoot
    this.close()
    try {
      this.openDataRoot(chosen)
      writeFileSync(this.pointerPath, JSON.stringify({ dataRoot: chosen, updatedAt: now() }, null, 2) + '\n', { mode: 0o600 })
      return this.currentRootInfo()
    } catch (error) {
      this.close()
      this.dataRoot = null
      this.dbPath = null
      if (oldRoot && existsSync(oldRoot)) {
        try { this.openDataRoot(oldRoot) } catch { /* 保留原错误；旧根仍在但需重开 */ }
      }
      throw error
    }
  }

  openDataRoot(root) {
    this.dataRoot = root
    this.dbPath = join(root, 'cerebral-infarction.sqlite')
    this.db = new DatabaseSync(this.dbPath)
    this.db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = DELETE; PRAGMA synchronous = FULL;')
    this.migrate()
    this.seedDemosIfEmpty()
  }

  migrate() {
    const version = Number(this.db.prepare('PRAGMA user_version').get()?.user_version || 0)
    if (version > MIGRATIONS.length) throw new Error(`数据库版本 ${version} 高于当前程序支持版本 ${MIGRATIONS.length}`)
    if (version === MIGRATIONS.length) return
    const backupPath = version > 0 ? join(this.dataRoot, `cerebral-infarction.before-v${MIGRATIONS.length}.${Date.now()}.sqlite`) : null
    if (backupPath) {
      const check = this.db.prepare('PRAGMA integrity_check').get()?.integrity_check
      if (check !== 'ok') throw new Error('迁移前数据库完整性检查失败；已停止迁移')
      this.db.close()
      this.db = null
      copyFileSync(this.dbPath, backupPath)
      this.db = new DatabaseSync(this.dbPath)
      this.db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = DELETE; PRAGMA synchronous = FULL;')
    }
    try {
      this.db.exec('BEGIN IMMEDIATE')
      let current = Number(this.db.prepare('PRAGMA user_version').get()?.user_version || 0)
      while (current < MIGRATIONS.length) {
        const migration = readFileSync(new URL(MIGRATIONS[current], SQL_DIR), 'utf8')
        this.db.exec(migration)
        current = Number(this.db.prepare('PRAGMA user_version').get()?.user_version || 0)
        if (current <= version || current > MIGRATIONS.length) throw new Error('迁移未递增或版本超出支持范围')
      }
      this.db.exec('COMMIT')
      const integrity = this.db.prepare('PRAGMA integrity_check').get()?.integrity_check
      if (integrity !== 'ok') throw new Error('迁移后数据库完整性检查失败')
    } catch (error) {
      try { this.db.exec('ROLLBACK') } catch { /* 事务可能已经回滚 */ }
      if (backupPath && existsSync(backupPath)) {
        this.db.close()
        this.db = null
        copyFileSync(backupPath, this.dbPath)
        this.db = new DatabaseSync(this.dbPath)
        this.db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = DELETE; PRAGMA synchronous = FULL;')
      }
      throw error
    }
  }

  seedDemosIfEmpty() {
    if (!this.db || Number(this.db.prepare('SELECT COUNT(*) AS n FROM subjects').get().n) > 0) return
    const timestamp = now()
    const insertSubject = this.db.prepare('INSERT INTO subjects(id,display_label,subject_role,is_demo,created_at,updated_at,revision) VALUES(?,?,?,?,?,?,1)')
    const insertSource = this.db.prepare('INSERT INTO source_records(id,source_kind,label,created_at) VALUES(?,?,?,?)')
    const insertDoc = this.db.prepare(`INSERT INTO clinical_documents(id,subject_id,document_kind,display_label,document_date,relative_path,source_id,review_state,assertion_status,is_private,in_use,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,'unreviewed','unknown',?,1,?,?)`)
    const insertQuestion = this.db.prepare(`INSERT INTO care_questions(id,subject_id,question_text,state,source_id,is_private,created_at,updated_at)
      VALUES(?,?,?,'draft',?,?,?,?)`)
    this.db.exec('BEGIN IMMEDIATE')
    try {
      for (const subject of DEMO.subjects) {
        insertSubject.run(subject.id, subject.displayLabel, subject.subjectRole, 1, timestamp, timestamp)
        for (const document of subject.documents) {
          const sourceId = `${document.id}-source`
          insertSource.run(sourceId, 'synthetic_seed', document.sourceLabel, timestamp)
          insertDoc.run(document.id, subject.id, document.kind, document.displayLabel, document.documentDate,
            document.relativePath, sourceId, 0, timestamp, timestamp)
        }
        for (const question of subject.questions) {
          const sourceId = `${question.id}-source`
          insertSource.run(sourceId, 'synthetic_seed', '合成演示资料', timestamp)
          insertQuestion.run(question.id, subject.id, question.text, sourceId, question.isPrivate ? 1 : 0, timestamp, timestamp)
        }
      }
      this.db.exec('COMMIT')
    } catch (error) { this.db.exec('ROLLBACK'); throw error }
  }

  requireDb() {
    if (!this.db || !this.dataRoot) throw fail('尚未选择资料目录；急症信息仍可浏览。', 409)
    return this.db
  }

  bootstrap(subjectId = null) {
    const base = { schemaVersion: Number(this.db?.prepare('PRAGMA user_version').get()?.user_version || 0), dataDirectory: this.currentRootInfo(), subjects: [], activeSubjectId: null, documents: [], questions: [], acuteEvents: [] }
    if (!this.db) return base
    const subjects = this.db.prepare('SELECT id,display_label AS displayLabel,subject_role AS subjectRole,is_demo AS isDemo,revision FROM subjects ORDER BY is_demo DESC, display_label COLLATE NOCASE').all().map((r) => ({ ...r, isDemo: Boolean(r.isDemo) }))
    const activeSubjectId = subjects.some((s) => s.id === subjectId) ? subjectId : subjects[0]?.id || null
    if (!activeSubjectId) return { ...base, subjects }
    const documents = this.db.prepare(`SELECT id,document_kind AS documentKind,display_label AS displayLabel,document_date AS documentDate,relative_path AS relativePath,review_state AS reviewState,assertion_status AS assertionStatus,is_private AS isPrivate,in_use AS inUse,revision
      FROM clinical_documents WHERE subject_id=? AND in_use=1 ORDER BY document_date DESC, created_at DESC`).all(activeSubjectId).map((r) => ({ ...r, isPrivate: Boolean(r.isPrivate), inUse: Boolean(r.inUse), originalAttached: existsSync(join(this.dataRoot, r.relativePath)) }))
    const questions = this.db.prepare(`SELECT id,question_text AS questionText,state,is_private AS isPrivate,revision,updated_at AS updatedAt
      FROM care_questions WHERE subject_id=? AND state<>'retired' ORDER BY updated_at DESC`).all(activeSubjectId).map((r) => ({ ...r, isPrivate: Boolean(r.isPrivate) }))
    const acuteEvents = this.db.prepare(`SELECT id,state,reporter_role AS reporterRole,assertion_status AS assertionStatus,created_at AS createdAt,revision
      FROM acute_events WHERE subject_id=? ORDER BY created_at DESC`).all(activeSubjectId)
    return { ...base, subjects, activeSubjectId, documents, questions, acuteEvents }
  }

  createSubject(input = {}) {
    const db = this.requireDb()
    const displayLabel = text(input.displayLabel, 80)
    const role = input.subjectRole === 'care_recipient' ? 'care_recipient' : input.subjectRole === 'self' ? 'self' : null
    if (!displayLabel) throw fail('请填写档案显示名称')
    if (!role) throw fail('档案类型无效')
    const id = randomUUID(); const timestamp = now()
    db.prepare('INSERT INTO subjects(id,display_label,subject_role,is_demo,created_at,updated_at,revision) VALUES(?,?,?,0,?,?,1)').run(id, displayLabel, role, timestamp, timestamp)
    return { id, displayLabel, subjectRole: role, isDemo: false, revision: 1 }
  }

  listFiles() {
    this.requireDb()
    const found = []
    const walk = (dir, depth = 0) => {
      if (depth > 3 || found.length >= 500) return
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
        const full = join(dir, entry.name)
        if (entry.isDirectory() && !entry.isSymbolicLink()) walk(full, depth + 1)
        else if (entry.isFile() && DOCUMENT_EXTENSIONS.has(extname(entry.name).toLowerCase()) && within(this.dataRoot, full)) {
          found.push(relative(this.dataRoot, full).split(sep).join('/'))
        }
      }
    }
    walk(this.dataRoot)
    return found.sort((a, b) => a.localeCompare(b, 'zh-CN')).slice(0, 500)
  }

  indexDocument(input = {}) {
    const db = this.requireDb()
    const subjectId = text(input.subjectId, 80)
    const rel = text(input.relativePath, 1024)
    if (!db.prepare('SELECT id FROM subjects WHERE id=?').get(subjectId)) throw fail('档案不存在', 404)
    if (!rel || rel.startsWith('/') || rel.includes('..') || rel.includes('\\')) throw fail('文件路径无效')
    const full = resolve(this.dataRoot, rel)
    if (!within(this.dataRoot, full)) throw fail('文件必须位于已确认的资料目录内')
    let real
    try { real = realpathSync(full) } catch { throw fail('文件不存在或不可访问', 404) }
    if (!within(this.dataRoot, real) || !statSync(real).isFile()) throw fail('所选项目不是资料目录内的普通文件')
    const extension = extname(real).toLowerCase()
    if (!DOCUMENT_EXTENSIONS.has(extension)) throw fail('该文件类型不在当前支持范围')
    if (statSync(real).size > 50 * 1024 * 1024) throw fail('文件超过50MB索引上限')
    const displayLabel = text(input.displayLabel, 240) || rel.split('/').at(-1)
    const kind = new Set(['visit_note','discharge_summary','imaging_report','laboratory_report','other']).has(input.documentKind) ? input.documentKind : 'other'
    const documentDate = /^\d{4}-\d{2}-\d{2}$/.test(input.documentDate || '') ? input.documentDate : null
    const id = randomUUID(); const sourceId = randomUUID(); const timestamp = now()
    const sourceKind = input.assertionStatus === 'user_reported' ? 'self_report' : 'document'
    db.exec('BEGIN IMMEDIATE')
    try {
      db.prepare('INSERT INTO source_records(id,source_kind,label,created_at) VALUES(?,?,?,?)').run(sourceId, sourceKind, '由用户选择的本机文件；内容未被自动解析', timestamp)
      db.prepare(`INSERT INTO clinical_documents(id,subject_id,document_kind,display_label,document_date,relative_path,sha256,media_type,source_id,review_state,assertion_status,is_private,in_use,created_at,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?,'unreviewed','copied_from_document',?,1,?,?)`).run(
        id, subjectId, kind, displayLabel, documentDate, rel, createHash('sha256').update(readFileSync(real)).digest('hex'),
        extension === '.pdf' ? 'application/pdf' : extension === '.txt' ? 'text/plain' : extension === '.png' ? 'image/png' : extension === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'image/jpeg',
        sourceId, input.isPrivate ? 1 : 0, timestamp, timestamp)
      db.exec('COMMIT')
    } catch (error) { db.exec('ROLLBACK'); throw error }
    return { id, subjectId, displayLabel, documentKind: kind, documentDate, reviewState: 'unreviewed', revision: 1 }
  }

  createQuestion(input = {}) {
    const db = this.requireDb()
    const subjectId = text(input.subjectId, 80); const questionText = text(input.questionText, 4000)
    if (!db.prepare('SELECT id FROM subjects WHERE id=?').get(subjectId)) throw fail('档案不存在', 404)
    if (!questionText) throw fail('请填写要记录的问题')
    const id = randomUUID(); const sourceId = randomUUID(); const timestamp = now()
    db.exec('BEGIN IMMEDIATE')
    try {
      db.prepare('INSERT INTO source_records(id,source_kind,label,created_at) VALUES(?,?,?,?)').run(sourceId, 'self_report', '患者/照护者自拟问题，不代表医学结论', timestamp)
      db.prepare(`INSERT INTO care_questions(id,subject_id,question_text,state,source_id,is_private,created_at,updated_at)
        VALUES(?,?,?,'draft',?,?,?,?)`).run(id, subjectId, questionText, sourceId, input.isPrivate ? 1 : 0, timestamp, timestamp)
      db.exec('COMMIT')
    } catch (error) { db.exec('ROLLBACK'); throw error }
    return { id, subjectId, questionText, state: 'draft', revision: 1, isPrivate: Boolean(input.isPrivate) }
  }

  createAcuteEvent(input = {}) {
    const db = this.requireDb()
    const subjectId = text(input.subjectId, 80)
    if (!db.prepare('SELECT id FROM subjects WHERE id=?').get(subjectId)) throw fail('档案不存在', 404)
    const reporter = new Set(['self','caregiver','witness','unknown']).has(input.reporterRole) ? input.reporterRole : 'unknown'
    const sourceKind = reporter === 'caregiver' || reporter === 'witness' ? 'caregiver_report' : reporter === 'self' ? 'self_report' : 'caregiver_report'
    const sourceId = randomUUID(); const id = randomUUID(); const timestamp = now()
    const eventTimes = Array.isArray(input.timepoints) ? input.timepoints.slice(0, 2) : []
    const observations = Array.isArray(input.observations) ? input.observations.slice(0, 20) : []
    const validSigns = new Set(['face','arm','speech','balance','vision','other'])
    const timeKinds = new Set(['last_known_well','first_observed'])
    db.exec('BEGIN IMMEDIATE')
    try {
      db.prepare('INSERT INTO source_records(id,source_kind,label,created_at) VALUES(?,?,?,?)').run(sourceId, sourceKind, '疑似急症交接：本人/照护者自述，未经核实', timestamp)
      db.prepare(`INSERT INTO acute_events(id,subject_id,state,reporter_role,assertion_status,source_id,created_at,updated_at,revision)
        VALUES(?,?,'handed_off',?,?,?, ?,?,1)`).run(id, subjectId, reporter, reporter === 'self' ? 'self_reported' : reporter === 'unknown' ? 'unknown' : 'caregiver_reported', sourceId, timestamp, timestamp)
      const insertTime = db.prepare(`INSERT INTO event_timepoints(id,event_id,time_kind,time_value,precision,timezone,source_id,created_at) VALUES(?,?,?,?,?,?,?,?)`)
      for (const item of eventTimes) {
        if (!timeKinds.has(item?.timeKind)) continue
        const precision = new Set(['exact','approximate','date_only','unknown']).has(item?.precision) ? item.precision : 'unknown'
        const value = precision === 'unknown' ? null : text(item?.value, 80) || null
        if (precision !== 'unknown' && !value) throw fail('已填写的时间必须提供时间值')
        insertTime.run(randomUUID(), id, item.timeKind, value, precision, text(item?.timezone, 80) || null, sourceId, timestamp)
      }
      const insertObservation = db.prepare(`INSERT INTO symptom_observations(id,event_id,sign_key,observation_state,observed_at,reporter_role,source_id,note,assertion_status,is_private,created_at)
        VALUES(?,?,?,?,?,?,?,?,?,0,?)`)
      for (const item of observations) {
        if (!validSigns.has(item?.signKey)) continue
        const state = new Set(['present','not_observed','unknown']).has(item?.state) ? item.state : 'unknown'
        insertObservation.run(randomUUID(), id, item.signKey, state, text(item?.observedAt, 80) || null, reporter, sourceId, text(item?.note, 2000) || null, reporter === 'self' ? 'self_reported' : reporter === 'unknown' ? 'unknown' : 'caregiver_reported', timestamp)
      }
      db.exec('COMMIT')
    } catch (error) { db.exec('ROLLBACK'); throw error }
    return { id, subjectId, state: 'handed_off', reporterRole: reporter, assertionStatus: reporter === 'self' ? 'self_reported' : reporter === 'unknown' ? 'unknown' : 'caregiver_reported', createdAt: timestamp, revision: 1 }
  }
}
