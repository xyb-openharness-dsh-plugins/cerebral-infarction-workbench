import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Workbench, forbiddenRoot } from '../dsh/workbench.js'

function dirs() {
  const base = mkdtempSync(resolve('.ciwb-check-'))
  const configRoot = join(base, 'config')
  const dataRoot = join(base, 'selected-data')
  mkdirSync(configRoot); mkdirSync(dataRoot)
  return { base, configRoot, dataRoot }
}

test('急症可跳过资料目录；选择后使用 v2 本机库与两套合成档案', () => {
  const paths = dirs(); const service = new Workbench({ configRoot: paths.configRoot })
  try {
    assert.equal(service.bootstrap().dataDirectory.configured, false)
    assert.equal(service.bootstrap().subjects.length, 0)
    service.setRoot(paths.dataRoot)
    const data = service.bootstrap()
    assert.equal(data.schemaVersion, 2)
    assert.equal(data.subjects.length, 2)
    assert.ok(data.subjects.every((subject) => subject.isDemo))
    const added = service.createSubject({ displayLabel: '本机档案测试', subjectRole: 'self' })
    assert.equal(added.isDemo, false)
    const event = service.createAcuteEvent({ subjectId: added.id, reporterRole: 'caregiver', timepoints: [{ timeKind: 'last_known_well', precision: 'unknown' }] })
    assert.equal(event.assertionStatus, 'caregiver_reported')
    service.createQuestion({ subjectId: added.id, questionText: '用于单元测试的自拟问题', isPrivate: true })
    assert.equal(service.bootstrap(added.id).questions.length, 1)
  } finally { service.close(); rmSync(paths.base, { recursive: true, force: true }) }
})

test('文件索引限定资料根内，拒绝临时/主目录和无效时间值', () => {
  const paths = dirs(); const service = new Workbench({ configRoot: paths.configRoot })
  try {
    assert.match(forbiddenRoot(resolve('/')), /不能作为资料目录/)
    service.setRoot(paths.dataRoot)
    const subject = service.bootstrap().subjects[0]
    writeFileSync(join(paths.dataRoot, 'synthetic.txt'), '合成测试内容，不是真实患者资料。')
    assert.equal(service.indexDocument({ subjectId: subject.id, relativePath: 'synthetic.txt' }).reviewState, 'unreviewed')
    assert.throws(() => service.indexDocument({ subjectId: subject.id, relativePath: '../outside.txt' }), /路径无效/)
    assert.throws(() => service.createAcuteEvent({ subjectId: subject.id, timepoints: [{ timeKind: 'first_observed', precision: 'exact' }] }), /必须提供时间值/)
  } finally { service.close(); rmSync(paths.base, { recursive: true, force: true }) }
})
