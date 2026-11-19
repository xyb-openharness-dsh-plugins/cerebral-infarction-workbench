import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { apply } from '../dsh/index.js'

const base = resolve('.m9-http-synthetic')
const configRoot = join(base, 'config')
const dataRoot = join(base, 'chosen-data')
let server, origin, cleanup

test.before(async () => {
  rmSync(base, { recursive: true, force: true }); mkdirSync(base, { recursive: true })
  const routes = new Map()
  const ctx = {
    webServer: { register({ path, handler }) { routes.set(path, handler); return () => routes.delete(path) } },
    connection: { requestRejection(req) { return req.headers['x-test-unauth'] ? 401 : undefined } },
    effect(effect) { cleanup = effect() },
    desktopWorkbenches: { register() { return () => {} } },
  }
  apply(ctx, { root: configRoot })
  server = createServer((req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname
    const handler = routes.get(path)
    if (!handler) { res.writeHead(404); res.end(); return }
    handler(req, res)
  })
  await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen))
  origin = `http://127.0.0.1:${server.address().port}`
})

test.after(async () => {
  cleanup?.()
  if (server?.listening) await new Promise((resolveClose) => server.close(resolveClose))
  rmSync(base, { recursive: true, force: true })
})

async function request(path, method = 'GET', body) {
  const response = await fetch(origin + path, { method, headers: body ? { 'content-type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined })
  return { status: response.status, body: await (response.headers.get('content-type')?.includes('json') ? response.json() : response.text()) }
}

test('场景1：疑似急症先呼救；交接字段未知仍可保存为照护者自述', async () => {
  const ui = await request('/api/cerebral-infarction-workbench/ui/')
  assert.equal(ui.status, 200)
  assert.match(ui.body, /href="tel:120"/)
  assert.match(ui.body, /症状暂时好转也不要延迟求助/)
  assert.equal((await request('/api/cerebral-infarction-workbench/bootstrap')).body.dataDirectory.configured, false)
  const unauthorized = await fetch(origin + '/api/cerebral-infarction-workbench/bootstrap', { headers: { 'x-test-unauth': '1' } })
  assert.equal(unauthorized.status, 401)
})

test('场景2：选定资料目录后管理合成档案、索引文件并保存私密问题', async () => {
  mkdirSync(dataRoot, { recursive: true })
  const root = await request('/api/cerebral-infarction-workbench/root', 'POST', { dir: dataRoot })
  assert.equal(root.status, 200)
  const bootstrap = await request('/api/cerebral-infarction-workbench/bootstrap')
  assert.equal(bootstrap.body.schemaVersion, 2)
  assert.equal(bootstrap.body.subjects.length, 2)
  assert.ok(bootstrap.body.subjects.every((s) => s.isDemo))
  const created = await request('/api/cerebral-infarction-workbench/subjects', 'POST', { displayLabel: '合成端到端档案', subjectRole: 'self' })
  assert.equal(created.status, 201)
  const subjectId = created.body.subject.id
  writeFileSync(join(dataRoot, 'synthetic-note.txt'), '只用于M9端到端测试的合成文本。')
  const indexed = await request('/api/cerebral-infarction-workbench/documents', 'POST', { subjectId, relativePath: 'synthetic-note.txt' })
  assert.equal(indexed.status, 201)
  const question = await request('/api/cerebral-infarction-workbench/questions', 'POST', { subjectId, questionText: '请解释合成报告中的术语。', isPrivate: true })
  assert.equal(question.status, 201)
  const final = await request(`/api/cerebral-infarction-workbench/bootstrap?subjectId=${encodeURIComponent(subjectId)}`)
  assert.equal(final.body.documents.length, 1)
  assert.equal(final.body.questions[0].isPrivate, true)
  assert.equal(existsSync(join(dataRoot, 'synthetic-note.txt')), true)
  assert.equal((await request('/api/cerebral-infarction-workbench/files')).body.files.includes('synthetic-note.txt'), true)
})
