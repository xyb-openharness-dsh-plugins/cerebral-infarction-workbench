import Schema from '@deepseek-ai/schemastery'
import { readFileSync } from 'node:fs'
import { Workbench } from './workbench.js'

export const name = 'cerebral-infarction-workbench-main'
export const inject = ['webServer', 'connection']
export const Config = Schema.object({ root: Schema.string().required() })
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const PREFIX = '/api/cerebral-infarction-workbench'
const PRIMER = JSON.parse(readFileSync(new URL('../research/disease-primer.json', import.meta.url), 'utf8'))

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(body))
}

function readJson(req, limit = 64 * 1024) {
  return new Promise((resolveBody, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) { reject(Object.assign(new Error('请求体超过64KB'), { status: 413 })); req.destroy(); return }
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (!size) return resolveBody({})
      try { resolveBody(JSON.parse(Buffer.concat(chunks).toString('utf8'))) }
      catch { reject(Object.assign(new Error('JSON格式无效'), { status: 400 })) }
    })
    req.on('error', reject)
  })
}

export function apply(ctx, config = {}) {
  if (!ctx.webServer?.register) throw new Error('Desktop webServer.register is unavailable')
  if (!config?.root) throw new Error('Workbench config.root must be provided by dshHomePath')
  const workbench = new Workbench({ configRoot: config.root })
  const auth = (req, res) => {
    if (typeof ctx.connection?.requestRejection !== 'function') {
      sendJson(res, 503, { error: 'connection authentication capability unavailable' }); return false
    }
    const rejection = ctx.connection.requestRejection(req)
    if (rejection !== undefined) { sendJson(res, rejection, { error: 'Authentication required' }); return false }
    return true
  }
  const guard = (method, handler) => async (req, res) => {
    if (!auth(req, res)) return
    if (req.method !== method) return sendJson(res, 405, { error: 'Method not allowed' })
    try { await handler(req, res) }
    catch (error) { sendJson(res, error.status || 500, { ok: false, error: error.message || String(error) }) }
  }
  const definitions = [
    [`${PREFIX}/health`, 'GET', async (_req, res) => sendJson(res, 200, { ok: true, version: manifest.version, apiVersion: 'v1', capabilities: ['health', 'bootstrap', 'directory', 'subjects', 'acute-events', 'documents', 'questions'] })],
    [`${PREFIX}/primer`, 'GET', async (_req, res) => sendJson(res, 200, PRIMER)],
    [`${PREFIX}/bootstrap`, 'GET', async (req, res) => {
      const url = new URL(req.url, 'http://localhost')
      sendJson(res, 200, workbench.bootstrap(url.searchParams.get('subjectId')))
    }],
    [`${PREFIX}/root`, 'GET', async (_req, res) => sendJson(res, 200, { ok: true, ...workbench.currentRootInfo() })],
    [`${PREFIX}/root`, 'POST', async (req, res) => sendJson(res, 200, { ok: true, ...workbench.setRoot((await readJson(req)).dir) })],
    [`${PREFIX}/files`, 'GET', async (_req, res) => sendJson(res, 200, { files: workbench.listFiles() })],
    [`${PREFIX}/subjects`, 'POST', async (req, res) => {
      const created = workbench.createSubject(await readJson(req))
      sendJson(res, 201, { subject: created, bootstrap: workbench.bootstrap(created.id) })
    }],
    [`${PREFIX}/acute-events`, 'POST', async (req, res) => {
      const created = workbench.createAcuteEvent(await readJson(req))
      sendJson(res, 201, { event: created, bootstrap: workbench.bootstrap(created.subjectId) })
    }],
    [`${PREFIX}/documents`, 'POST', async (req, res) => {
      const created = workbench.indexDocument(await readJson(req))
      sendJson(res, 201, { document: created, bootstrap: workbench.bootstrap(created.subjectId) })
    }],
    [`${PREFIX}/questions`, 'POST', async (req, res) => {
      const created = workbench.createQuestion(await readJson(req))
      sendJson(res, 201, { question: created, bootstrap: workbench.bootstrap(created.subjectId) })
    }],
  ]
  ctx.effect(() => {
    const cleanups = definitions.map(([path, method, handler]) => ctx.webServer.register({
      kind: 'exact', path, handler: guard(method, handler),
    }))
    return () => { for (const cleanup of cleanups) if (typeof cleanup === 'function') cleanup(); workbench.close() }
  }, 'cerebral-infarction-workbench service')
}
