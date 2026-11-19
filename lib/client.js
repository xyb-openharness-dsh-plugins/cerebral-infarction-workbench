/* 由 scripts/build-client.mjs 从 src/client.js 生成，勿手改。 */
/* 面板参数来自 lib/layout.js，版本来自 lib/version.js（VERSION 派生）。 */
window.__ModuleLoader__.load({
  id: "@xyb-openharness-dsh-plugins/cerebral-infarction-workbench",
  factory(require) {
    const React = require('react')
    /* 注入点：与 lib/layout.js 同源，客户端不许另写一份 0.65 */
    const PANEL_LAYOUT = {"customFrame":true,"businessSide":"left","businessWidth":0.65}
    /* 会话面板参数（默认/最小/最大/步进）同源于 lib/layout.js */
    const AGENT_PANE = {"min":0.25,"max":0.45,"default":0.35,"step":0.02}
    const UI_ENTRY = "/api/cerebral-infarction-workbench/ui/"
    const BUILD_VERSION = "0.1.0"

    const h = React.createElement
    const META = {"title":"脑梗死工作台（暂定名，待用户追认）","description":"面向脑梗死患者及照护者的急症识别、就医准备与资料整理工作台；不替代急救或临床判断。"}
    const theme = "/* Scope to business content; never style host navigation globally. */\n.wb-cerebral-infarction-workbench {\n  --wb-paper: #f7f8fa; --wb-surface: #ffffff; --wb-ink: #1a1a1a;\n  --wb-muted: #4a4a4a; --wb-line: #d9dde3; --wb-mint: #f1f2f4;\n  --wb-mint-ink: #a3232d; --wb-action: #a3232d; --wb-action-ink: #ffffff;\n  --wb-pink: #f7e8e9; --wb-blue: #eef1f4; --wb-yellow: #f5f2e9;\n  --wb-radius: 3px; --wb-gap: 16px; --wb-group-gap: 24px;\n  color: var(--wb-ink); background: var(--wb-paper); font: 16px/1.65 -apple-system,BlinkMacSystemFont,\"PingFang SC\",\"Microsoft YaHei\",sans-serif;\n  font-variant-numeric: tabular-nums; min-width: 0; min-height: 0; container-type: inline-size;\n}\n.wb-cerebral-infarction-workbench[data-font=large] { font-size: 19px; }\n.wb-cerebral-infarction-workbench * { box-sizing: border-box; }\n.wb-cerebral-infarction-workbench button,.wb-cerebral-infarction-workbench input,.wb-cerebral-infarction-workbench select { font: inherit; }\n.wb-cerebral-infarction-workbench button { min-height: 44px; cursor: pointer; }\n.wb-cerebral-infarction-workbench :focus-visible { outline: 3px solid var(--wb-mint-ink); outline-offset: 3px; }\n.wb-cerebral-infarction-workbench .wb-primary { background: var(--wb-action); color: var(--wb-action-ink); border: 0; border-radius: 999px; padding: 9px 20px; }\n.wb-cerebral-infarction-workbench .wb-flower { display: inline-block; width: 24px; height: 24px; flex: 0 0 auto; margin-inline-end: 10px; animation: wb-flower-turn 12s linear infinite; }\n@keyframes wb-flower-turn { to { transform: rotate(360deg); } }\n@media (prefers-color-scheme: dark) {\n  .wb-cerebral-infarction-workbench { --wb-paper:#202124; --wb-surface:#28292c; --wb-ink:#f2f2f2; --wb-muted:#c4c5c7; --wb-line:#505156; --wb-mint:#333438; --wb-mint-ink:#f08a90; --wb-action:#c9515a; --wb-action-ink:#fff; --wb-pink:#45333a; --wb-blue:#283d4c; --wb-yellow:#473e25; }\n}\n@media (prefers-reduced-motion: reduce) {\n  .wb-cerebral-infarction-workbench .wb-flower { animation:none; }\n}\n"

    /* ---- 原生 AI 对话面板：宽度与草稿常量（家族同一契约） ----
     * 为什么骨架就带这套接线：check-agent-pane-contract 是 init check 链的一员，
     * 骨架若不接线，新仓第一天基线必红（2026-11-12 cidp-workbench 夜班实测，
     * 回流见 docs/LESSONS.md L90）。这里是与家族仓同一套判定：会话归属看
     * service.ownsSession / currentSession，不用 conversation prop 的真值判断
     * （customFrame 下宿主恒传一个隐藏的 conversation 容器，真值判断必误判）。 */
    const AGENT_MIN = AGENT_PANE.min
    const AGENT_MAX = AGENT_PANE.max
    const AGENT_DEFAULT = AGENT_PANE.default
    const AGENT_STEP = AGENT_PANE.step
    const NARROW_BELOW = 900
    const DRAWER_MAX = 420
    const WIDTH_KEY = 'cerebral-infarction-workbench.agentWidth'
    const DRAFT_KEY = 'cerebral-infarction-workbench.agentDraft'
    const NO_SESSION_CAPABILITY_NOTE = '宿主没有提供会话创建能力（service.newSession 不可用），AI 对话暂时打不开。'

    function loadWidth() {
      try {
        const saved = Number(localStorage.getItem(WIDTH_KEY))
        if (Number.isFinite(saved) && saved >= AGENT_MIN && saved <= AGENT_MAX) return saved
      } catch { /* 隐私模式忽略 */ }
      return AGENT_DEFAULT
    }
    function saveWidth(value) {
      try { localStorage.setItem(WIDTH_KEY, String(value)) } catch { /* 隐私模式忽略 */ }
    }
    const round4 = (n) => Math.round(n * 10000) / 10000
    const snapWidth = (n) => Math.min(AGENT_MAX, Math.max(AGENT_MIN, n))

    function buildPanel(React, host) {
      const { useState, useEffect, useRef } = React
      const service = host?.desktopWorkbenches

      /* ---------------- 会话归属（与家族各仓同一套判定） ---------------- */

      function currentSession() {
        if (typeof service?.currentSession === 'function') return service.currentSession() || null
        const snapshot = host?.sessions?.list?.getSnapshot?.()
        return snapshot?.current || Object.keys(snapshot?.byId || {}).find((id) =>
          (snapshot.byId[id]?.retainedBy?.mainView ?? 0) > 0) || null
      }
      function workbenchOwnsSession(sessionId) {
        if (!sessionId) return false
        return typeof service?.ownsSession === 'function' ? Boolean(service.ownsSession(sessionId)) : false
      }
      function ownedSession() {
        const id = currentSession()
        return workbenchOwnsSession(id) ? id : null
      }

      /* ---------------- 原生草稿：只填不发 ---------------- */

      function appendDraft(sessionId, prompt) {
        if (!sessionId || ownedSession() !== sessionId) throw new Error('会话已切换，请回到本工作台再操作')
        const scoped = host.sessions.scope?.(sessionId)
        const conversation = scoped?.get?.('conversation')
        if (!conversation) throw new Error('对话输入不可用')
        const input = conversation.input.for(scoped)
        const snapshot = input.state.getSnapshot()
        if (snapshot.occurrences?.length || (snapshot.phase && snapshot.phase !== 'plain')) {
          throw new Error('当前草稿含引用或正在提交，请先在原生会话里处理')
        }
        const current = snapshot.draft || ''
        input.setDraft(current.trim() ? `${current}\n\n${prompt}` : prompt)
      }

      let pendingDraft = null
      try {
        const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null')
        if (saved?.sessionId && saved?.prompt) pendingDraft = saved
      } catch { /* 隐私模式忽略 */ }
      function rememberDraft(entry) {
        pendingDraft = entry
        try {
          if (entry) localStorage.setItem(DRAFT_KEY, JSON.stringify(entry))
          else localStorage.removeItem(DRAFT_KEY)
        } catch { /* 隐私模式忽略 */ }
      }
      function flushDraft() {
        if (!pendingDraft) return false
        try {
          appendDraft(pendingDraft.sessionId, pendingDraft.prompt)
          rememberDraft(null)
          return true
        } catch { return false /* composer 未就绪：留到下一轮 */ }
      }

      function onboardingPrompt() {
        return [
          `你正在协助我使用「${META.title}」。它只整理本机资料，不做诊断、不给处置建议、不做病情判定。`,
          '里面是我自己记录的病程与检查经过；分工：你帮我汇总已记录的内容、指出缺项；判断和处置由我和我的医生决定。',
          '没有记录的项请写"没有"，不要补写或推测；标了私密的内容不要复述。',
        ].join('\n')
      }

      /* ---------------- 样式（骨架阶段内联；M5 移植 public 主题） ---------------- */

      const rootStyle = { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--wb-paper, #f7faf8)' }
      const headerStyle = {
        display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: '10px 16px',
        borderBottom: '1px solid var(--wb-line, #dce7df)', minHeight: 38,
        paddingInlineStart: 'var(--dsh-frame-leading-clearance, 0px)',
      }
      const hintStyle = { marginLeft: 'auto', color: 'var(--wb-muted, #596c62)', fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
      const bodyStyle = { position: 'relative', flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }
      const businessStyle = { flex: '1 1 auto', minWidth: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16, padding: 20 }
      const paneStyle = {
        position: 'relative', flex: '0 0 auto', display: 'flex', flexDirection: 'column',
        minHeight: 0, overflow: 'hidden', background: 'var(--wb-surface, #fff)', borderLeft: '1px solid var(--wb-line, #dce7df)',
      }
      const drawerStyle = { position: 'absolute', inset: '0 0 0 auto', borderLeft: '1px solid var(--wb-line, #dce7df)', boxShadow: '-8px 0 24px rgba(0,0,0,0.14)' }
      const splitterStyle = {
        position: 'absolute', top: 0, bottom: 0, width: 1, marginRight: -0.5,
        zIndex: 2, background: 'var(--wb-line, #dce7df)', cursor: 'col-resize', touchAction: 'none',
      }
      const splitterHoverStyle = { ...splitterStyle, background: 'var(--wb-action, #b95023)', boxShadow: '0 0 6px rgba(185,80,35,0.55)' }
      const splitterDragStyle = { ...splitterHoverStyle, boxShadow: '0 0 10px rgba(185,80,35,0.8)' }
      const splitterHitStyle = { position: 'absolute', top: 0, bottom: 0, left: -5, width: 11, background: 'transparent', cursor: 'col-resize' }
      const dragShieldStyle = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 4, cursor: 'col-resize', background: 'transparent', touchAction: 'none' }
      const buttonStyle = { minHeight: 30, border: 0, borderRadius: 999, padding: '5px 12px', whiteSpace: 'nowrap', background: 'var(--wb-action, #b95023)', color: 'var(--wb-action-ink, #fff)', font: 'inherit', fontWeight: 600, cursor: 'pointer' }
      const ghostStyle = { ...buttonStyle, background: 'transparent', color: 'var(--wb-action, #b95023)', border: '1px solid var(--wb-line, #dce7df)' }
      const padStyle = { display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', padding: 20, color: 'var(--wb-muted, #596c62)', fontSize: 12.5, lineHeight: 1.75 }
      const cardStyle = { background: 'var(--wb-surface, #fff)', border: '1px solid var(--wb-line, #dce7df)', borderRadius: 'var(--wb-radius, 18px)', padding: 20 }

      return function Panel({ conversation }) {
        const [health, setHealth] = useState(null)
        const [page, setPage] = useState('急症首页')
        const [model, setModel] = useState({ subjects: [], documents: [], questions: [], dataDirectory: { status: 'not_selected' } })
        const [primer, setPrimer] = useState(null)
        const [handoff, setHandoff] = useState({ time: '', symptoms: '', reporter: 'caregiver', history: '' })
        const [draftSummary, setDraftSummary] = useState('')
        const [questionDraft, setQuestionDraft] = useState('')
        const [subjectName, setSubjectName] = useState('')
        const [fileCandidates, setFileCandidates] = useState([])
        const [selectedFile, setSelectedFile] = useState('')
        const [dirNote, setDirNote] = useState('')
        const [error, setError] = useState('')
        const [large, setLarge] = useState(false)
        const [attempt, setAttempt] = useState(0)
        const [width, setWidth] = useState(loadWidth)
        const [paneOpen, setPaneOpen] = useState(true)
        const [connecting, setConnecting] = useState(false)
        const [narrow, setNarrow] = useState(false)
        const [dragging, setDragging] = useState(false)
        const [hovering, setHovering] = useState(false)
        const [note, setNote] = useState('')
        const [, setSessionRevision] = useState(0)

        const dragHostRef = useRef(null)
        const frameRef = useRef(null)
        const creatingRef = useRef(false)

        const API = '/api/cerebral-infarction-workbench'
        async function api(path, options = {}) {
          const response = await fetch(`${API}${path}`, { credentials: 'same-origin', ...options,
            headers: { ...(options.body ? { 'content-type': 'application/json' } : {}), ...(options.headers || {}) } })
          const result = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(result.error || `服务请求失败 (${response.status})`)
          return result
        }
        async function refresh(subjectId) {
          const result = await api(`/bootstrap${subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : ''}`)
          setModel(result)
          if (result.dataDirectory?.configured) {
            try { const files = await api('/files'); setFileCandidates(files.files || []) } catch { setFileCandidates([]) }
          } else setFileCandidates([])
        }

        /* customFrame 下宿主始终传 conversation 容器；无会话时只是 display:none。
           用归属服务判断当前工作台是否真的有会话，不能用 prop 是否为真值。 */
        const activeSession = ownedSession()
        const hasConversation = Boolean(activeSession)
        const canOpenSession = typeof service?.newSession === 'function'

        useEffect(() => {
          setError('')
          const controller = new AbortController()
          fetch('/api/cerebral-infarction-workbench/health', { signal: controller.signal, credentials: 'same-origin' })
            .then(async (response) => {
              if (!response.ok) throw new Error(`服务连接失败 (${response.status})`)
              const result = await response.json()
              if (!controller.signal.aborted) setHealth(result)
              if (!controller.signal.aborted) void refresh().catch((failure) => setError(failure.message))
            })
            .catch((failure) => { if (!controller.signal.aborted) setError(failure.message) })
          return () => controller.abort()
        }, [attempt])

        useEffect(() => { api('/primer').then(setPrimer).catch(() => setPrimer(null)) }, [])

        async function pickDataDir() {
          const ui = host?.uiWorkspace
          if (!ui || typeof ui.pickDirectory !== 'function') { setDirNote('宿主未提供目录选择能力；当前资料目录未更改。'); return }
          let dir
          try { dir = await ui.pickDirectory() } catch (failure) { setDirNote(`目录选择失败：${failure?.message ?? failure}`); return }
          if (!dir) { setDirNote('已取消目录选择；当前资料目录未更改。'); return }
          if (isForbiddenDir(dir)) { setDirNote('主目录、桌面、下载目录和临时目录不能作为资料目录。'); return }
          if (model.dataDirectory?.configured && !window.confirm('切换后不会搬迁旧目录中的资料。继续选择新目录？')) return
              try { const selected = await api('/root', { method: 'POST', body: JSON.stringify({ dir }) }); setDirNote('资料目录已设置。旧目录数据不会自动搬迁。'); await refresh(); frameRef.current?.contentWindow?.postMessage({ type: 'cerebral-infarction-workbench:root-changed', dir: selected.dir }, window.location.origin) }
          catch (failure) { setDirNote(failure.message) }
        }

        function isForbiddenDir(value) {
          const dir = String(value || '').replace(/\\/g, '/').replace(/\/$/, '')
          const home = host?.uiWorkspace?.homeDirectory
          return !dir || dir === '/' || dir === 'C:' || dir === home || /(^|\/)(Desktop|桌面|Downloads?|下载|tmp)$/i.test(dir) || /^(\/home|\/Users)\/[^/]+$/i.test(dir) || /^[A-Z]:\/Users\/[^/]+$/i.test(dir)
        }

        function makeHandoff() {
          const summary = `就医交接（由本人/照护者提供，未经核实）\n最后正常/发现时间：${handoff.time || '未知/未填写'}\n观察到的情况：${handoff.symptoms || '未填写'}\n提供者：${handoff.reporter === 'self' ? '本人' : '照护者/见证人'}\n补充病史：${handoff.history || '未填写'}\n此摘要仅供转述，不能延误联系急救。`
          setDraftSummary(summary)
        }

        async function saveHandoff() {
          if (!model.activeSubjectId) { setNote('先选择或创建档案；也可以只复制临时交接内容。'); return }
          const [date, time] = (handoff.time || '').split('T')
          try {
            const note = [handoff.symptoms && `观察情况：${handoff.symptoms}`, handoff.history && `补充病史（未核实）：${handoff.history}`].filter(Boolean).join('\n')
            await api('/acute-events', { method: 'POST', body: JSON.stringify({ subjectId: model.activeSubjectId, reporterRole: handoff.reporter, observations: note ? [{ signKey: 'other', state: 'present', note }] : [], timepoints: date && time ? [{ timeKind: 'last_known_well', precision: 'exact', value: handoff.time, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }] : [{ timeKind: 'last_known_well', precision: 'unknown' }] }) })
            setNote('交接已保存为未经核实的自述记录。'); await refresh(model.activeSubjectId)
          } catch (failure) { setNote(failure.message) }
        }

        const selectedSubject = model.subjects?.find((subject) => subject.id === model.activeSubjectId)
        const activeProfile = model.activeSubjectId
        const sectionStyle = { background: 'var(--wb-surface)', border: '1px solid var(--wb-line)', borderRadius: 3, padding: 20, marginBottom: 16 }
        const navStyle = { width: 184, flex: '0 0 184px', padding: 12, background: 'var(--wb-surface)', borderRight: '1px solid var(--wb-line)', overflowY: 'auto' }
        const fieldStyle = { display: 'block', width: '100%', maxWidth: 680, margin: '6px 0 14px', padding: 10, border: '1px solid var(--wb-line)', borderRadius: 6, background: 'var(--wb-surface)', color: 'inherit' }
        function renderPage() {
          if (page === '疾病概要') return h('div', null,
            h('button', { style: ghostStyle, onClick: () => setPage('急症首页') }, '返回首页'),
            h('h1', null, primer?.title || '疾病概要'),
            ...(primer?.sections || []).map((section) => h('section', { key: section.id, style: sectionStyle },
              h('h2', null, section.title),
              ...(section.paragraphs || []).map((p, i) => h('p', { key: `p${i}` }, p)),
              ...(section.facts || []).map((p, i) => h('p', { key: `f${i}` }, p)),
              ...(section.sources || []).map((source, i) => h('p', { key: `s${i}` }, h('a', { href: source.url, target: '_blank', rel: 'noreferrer' }, source.org), ` — ${source.note || ''}`)))),
            h('p', null, '这一句需要问你的医生。'))
          if (page === '就医交接') return h('div', null,
            h('h1', null, '可选就医交接'),
            h('p', { role: 'alert' }, '疑似卒中请立即联系当地急救服务；填写资料不是求助前置条件。'),
            h('label', null, '最后正常/发现时间（可留空）', h('input', { style: fieldStyle, type: 'datetime-local', value: handoff.time, onChange: (e) => setHandoff({ ...handoff, time: e.target.value }) })),
            h('label', null, '观察到的情况（照原话记录）', h('textarea', { style: fieldStyle, rows: 3, value: handoff.symptoms, onChange: (e) => setHandoff({ ...handoff, symptoms: e.target.value }) })),
            h('label', null, '信息提供者', h('select', { style: fieldStyle, value: handoff.reporter, onChange: (e) => setHandoff({ ...handoff, reporter: e.target.value }) }, h('option', { value: 'caregiver' }, '照护者/见证人'), h('option', { value: 'self' }, '本人'))),
            h('label', null, '补充病史（可留空）', h('textarea', { style: fieldStyle, rows: 2, value: handoff.history, onChange: (e) => setHandoff({ ...handoff, history: e.target.value }) })),
            h('button', { style: buttonStyle, onClick: makeHandoff }, '生成临时交接摘要'),
            draftSummary && h('section', { style: sectionStyle }, h('pre', { style: { whiteSpace: 'pre-wrap', font: 'inherit' } }, draftSummary), h('button', { style: ghostStyle, onClick: () => navigator.clipboard?.writeText(draftSummary).then(() => setNote('摘要已复制')) }, '复制摘要'), h('button', { style: ghostStyle, onClick: () => void saveHandoff() }, '保存到所选本机档案')))
          if (page === '资料整理') return h('div', null, h('h1', null, '资料整理'), !model.dataDirectory?.configured && h('p', null, '尚未选择本机资料目录。合成示例仅用于演示。'), h('h2', null, selectedSubject?.displayLabel || '未选档案'), h('ul', null, ...(model.documents || []).map((doc) => h('li', { key: doc.id }, `${doc.displayLabel} · ${doc.documentDate || '日期未核'} · ${doc.reviewState} · ${doc.originalAttached ? '原件在目录中' : '仅示例索引/原件未找到'}`))), model.dataDirectory?.configured && h('div', { style: sectionStyle }, h('h3', null, '索引目录中的本机文件'), h('select', { style: fieldStyle, value: selectedFile, onChange: (e) => setSelectedFile(e.target.value) }, h('option', { value: '' }, '选择文件'), ...fileCandidates.map((file) => h('option', { key: file, value: file }, file))), h('button', { style: buttonStyle, disabled: !selectedFile || !model.activeSubjectId, onClick: async () => { try { await api('/documents', { method: 'POST', body: JSON.stringify({ subjectId: model.activeSubjectId, relativePath: selectedFile, displayLabel: selectedFile.split('/').at(-1) }) }); setSelectedFile(''); await refresh(model.activeSubjectId) } catch (e) { setNote(e.message) } } }, '仅索引来源与路径')), h('p', null, '只写入文件元数据与 SHA-256；不会上传或自动解析文件内容。'), h('label', null, '要留给医护人员的问题', h('textarea', { style: fieldStyle, value: questionDraft, onChange: (e) => setQuestionDraft(e.target.value) })), h('button', { style: buttonStyle, disabled: !model.activeSubjectId || !questionDraft.trim(), onClick: async () => { try { await api('/questions', { method: 'POST', body: JSON.stringify({ subjectId: model.activeSubjectId, questionText: questionDraft, isPrivate: true }) }); setQuestionDraft(''); await refresh(model.activeSubjectId) } catch (e) { setNote(e.message) } } }, '保存问题草稿'), h('ul', null, ...(model.questions || []).map((q) => h('li', { key: q.id }, `${q.questionText} · ${q.isPrivate ? '私密' : '普通'} · 草稿`))))
          if (page === '设置') return h('div', null, h('h1', null, '设置与隐私边界'), h('p', null, `资料目录：${model.dataDirectory?.configured ? model.dataDirectory.dir : '未选择'}`), h('button', { style: buttonStyle, onClick: () => void pickDataDir() }, '选择本机资料目录'), h('p', { role: 'status' }, dirNote), h('p', null, '资料保存在所选本机目录。急症求助无需选择目录。AI 会话由 DSH 宿主提供；发送内容由你在原生会话里明确提交。'), h('p', null, '医学资料来源及核验状态见疾病概要；临床专业审核尚未完成。'))
          if (page === '档案管理') return h('div', null, h('h1', null, '档案管理'), h('label', null, '当前档案', h('select', { style: fieldStyle, value: activeProfile || '', onChange: (e) => void refresh(e.target.value) }, ...(model.subjects || []).map((s) => h('option', { key: s.id, value: s.id }, `${s.displayLabel}${s.isDemo ? '（合成示例）' : ''}`)))), h('label', null, '新档案显示名称', h('input', { style: fieldStyle, value: subjectName, onChange: (e) => setSubjectName(e.target.value) })), h('button', { style: buttonStyle, onClick: async () => { try { const out = await api('/subjects', { method: 'POST', body: JSON.stringify({ displayLabel: subjectName, subjectRole: 'self' }) }); setSubjectName(''); setModel(out.bootstrap) } catch (e) { setNote(e.message) } } }, '新建本机档案'))
          return h('div', null, h('section', { style: { ...sectionStyle, borderLeft: '5px solid #a62e34' } }, h('p', null, '疑似脑卒中症状：先呼救，不要等待填写资料或应用判断。'), h('a', { href: 'tel:120', style: { ...buttonStyle, display: 'inline-block', textDecoration: 'none', lineHeight: '40px' } }, '拨打 120'), h('p', null, '中国大陆急救电话；其他地区请拨当地急救号码。'), h('p', null, '不确定是否为脑梗死，也应由急救人员评估。症状自行缓解也不要因此延迟求助。')), h('section', { style: sectionStyle }, h('h2', null, 'FAST / BE-FAST 识别提示'), h('p', null, 'F 面部：是否出现一侧面部不对称？'), h('p', null, 'A 手臂：是否突然无力或抬举困难？'), h('p', null, 'S 言语：是否含糊或难以理解？'), h('p', null, 'B 平衡、E 眼部：是否突然失衡或视力异常？'), h('p', null, 'T 时间：记录最后正常时间，并立即呼救。该提示不能排除卒中或其他急症。')), h('section', { style: sectionStyle }, h('h2', null, '院内评估时间窗信息'), h('p', null, '部分再灌注治疗存在严格时间窗，静脉溶栓常见评估窗口可至发病后4.5小时；部分患者还可能按影像等条件评估更晚窗口，机械取栓可在特定患者中评估至24小时。均不是个人资格判断，也不是等待时限。'), h('p', null, '立即联系急救服务；不要因填写时间或核对资料而延误。')))
        }

        // 挂载后消化未送达的草稿（composer 就绪一轮一次），并订阅会话变化触发重渲染。
        useEffect(() => {
          const interval = setInterval(() => { if (flushDraft()) setNote('草稿已填入会话，按回车发送') }, 500)
          const unsubscribe = service?.subscribe?.(() => {
            setSessionRevision((revision) => revision + 1)
            setNote('')
          })
          return () => { clearInterval(interval); unsubscribe?.() }
        }, [])

        // 窄屏判定用容器宽度而不是窗口宽度：宿主主区宽度不等于窗口宽度。
        useEffect(() => {
          const node = dragHostRef.current
          if (!node || typeof ResizeObserver !== 'function') return undefined
          const observer = new ResizeObserver((entries) => {
            const w = entries[0]?.contentRect?.width ?? 0
            setNarrow(w > 0 && w < NARROW_BELOW)
          })
          observer.observe(node)
          return () => observer.disconnect()
        }, [])

        const applyWidth = (next) => {
          const snapped = round4(snapWidth(next))
          setWidth(snapped)
          saveWidth(snapped)
        }
        const stopDrag = () => { dragHostRef.current = null; setDragging(false) }

        useEffect(() => {
          if (!dragging) return undefined
          const onMove = (event) => {
            const rect = dragHostRef.current?.getBoundingClientRect?.()
            if (!rect?.width) return
            applyWidth((rect.right - event.clientX) / rect.width)
          }
          document.addEventListener('pointermove', onMove)
          document.addEventListener('pointerup', stopDrag)
          document.addEventListener('pointercancel', stopDrag)
          return () => {
            document.removeEventListener('pointermove', onMove)
            document.removeEventListener('pointerup', stopDrag)
            document.removeEventListener('pointercancel', stopDrag)
          }
        }, [dragging])

        const onSplitterPointerDown = (event) => {
          event.preventDefault()
          try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* 旧宿主无指针捕获 */ }
          dragHostRef.current = dragHostRef.current || event.currentTarget.parentElement
          setDragging(true)
        }
        const onSplitterKeyDown = (event) => {
          const delta = { ArrowLeft: AGENT_STEP, ArrowRight: -AGENT_STEP }[event.key]
          if (delta !== undefined) { event.preventDefault(); applyWidth(width + delta); return }
          if (event.key === 'Home') { event.preventDefault(); applyWidth(AGENT_MAX); return }
          if (event.key === 'End') { event.preventDefault(); applyWidth(AGENT_MIN) }
        }

        /* ---- 打开 / 复用 AI 会话（不自动发送） ---- */

        async function openAgent(prompt = null) {
          setNote('')
          if (!canOpenSession) { setNote(NO_SESSION_CAPABILITY_NOTE); return }
          const existing = ownedSession()
          if (existing) {
            setPaneOpen(true)
            if (prompt) {
              rememberDraft({ sessionId: existing, prompt })
              setNote(flushDraft() ? '已填入会话草稿，按回车发送' : '会话输入框还没就绪；内容已暂存')
            }
            return
          }
          // 快速连点时不并发创建出两条会话。
          if (creatingRef.current) return
          creatingRef.current = true
          setConnecting(true)
          try {
            // 优先用宿主默认工作区；没有可用工作区时把 undefined 交给宿主，
            // 由宿主按它的流程提示选择资料目录，并负责创建、绑定和激活会话。
            let workspaceId
            try { workspaceId = service.defaultWorkspace?.()?.workspaceId } catch { workspaceId = undefined }
            const id = await service.newSession(workspaceId)
            if (!id) {
              setNote('已取消资料目录选择，没有创建会话。可以再次点击「AI 对话」重试。')
              return
            }
            setPaneOpen(true)
            rememberDraft({ sessionId: id, prompt: prompt || onboardingPrompt() })
            setNote(flushDraft()
              ? '会话已就绪：草稿已填入右侧输入框，按回车发送'
              : '会话已就绪；输入框就绪后草稿会自动填入')
          } catch (error) {
            setNote(`没能调起会话：${error?.message ?? error}。可以再次点击「AI 对话」重试。`)
          } finally {
            creatingRef.current = false
            setConnecting(false)
          }
        }

        function onAgentClick() {
          if (!hasConversation) { void openAgent(); return }
          setPaneOpen((open) => !open)
          setNote('')
        }

        async function deliverContext(prompt) {
          const id = ownedSession()
          if (id) {
            setPaneOpen(true)
            rememberDraft({ sessionId: id, prompt })
            setNote(flushDraft() ? '已填入会话草稿，按回车发送' : '会话输入框还没就绪；内容已暂存')
            return
          }
          await openAgent(prompt)
        }

        // 业务页只认「自己 + 同源」发来的消息；handler 每轮换最新闭包，effect 只注册一次。
        const deliverRef = useRef(null)
        deliverRef.current = deliverContext
        useEffect(() => {
          function onMessage(event) {
            const data = event.data
            if (!data || typeof data !== 'object') return
                if (!frameRef.current || event.source !== frameRef.current.contentWindow) return
                if (event.origin !== window.location.origin) return
                if (data.type === 'cerebral-infarction-workbench:directory-pick') { void pickDataDir(); return }
            if (data.type === 'cerebral-infarction-workbench:agent-open') { void openAgent(); return }
            if (data.type !== 'cerebral-infarction-workbench:agent-draft') return
            const prompt = typeof data.prompt === 'string' ? data.prompt.trim() : ''
            if (prompt) void deliverRef.current?.(prompt.slice(0, 8000))
          }
          window.addEventListener('message', onMessage)
          return () => window.removeEventListener('message', onMessage)
        }, [])

        const agentLabel = !canOpenSession
          ? 'AI 对话暂不可用'
          : connecting ? '正在连接…'
            : !hasConversation ? 'AI 对话'
              : paneOpen ? '收起 AI 对话' : '打开 AI 对话'
        // 能力缺失时的说明不能被会话订阅回调里的 setNote('') 冲掉：渲染期兜一层。
        const shownNote = note || (canOpenSession ? '' : NO_SESSION_CAPABILITY_NOTE)

        const percent = Math.round(width * 100)
        const paneVisible = paneOpen && (hasConversation || connecting)

        return h('main', { className: 'wb-cerebral-infarction-workbench', 'data-font': large ? 'large' : 'standard', style: rootStyle },
          // 首个子元素必须是语义 <header>：避让 macOS 窗口按钮（--dsh-frame-leading-clearance）。
          h('header', { style: headerStyle },
                h('strong', null, META.title),
                h('span', { 'aria-live': 'polite' }, health ? `v${health.version}` : `v${BUILD_VERSION}`),
                h('button', { type: 'button', style: ghostStyle, 'aria-label': '脑梗死疾病概要', title: '疾病概要', onClick: () => frameRef.current?.contentWindow?.postMessage({ type: 'cerebral-infarction-workbench:open-primer' }, window.location.origin) }, '?'),
            h('button', { type: 'button', 'aria-pressed': large, onClick: () => setLarge(!large) }, large ? '标准字' : '大字'),
            h('span', { style: hintStyle, title: shownNote || '界面由业务区提供' },
              shownNote || '本机数据 · 仅回顾不解读'),
            h('button', {
              type: 'button',
              style: buttonStyle,
              onClick: onAgentClick,
              disabled: connecting || (!hasConversation && !canOpenSession),
              'aria-label': `AI 对话：${agentLabel}`,
            }, agentLabel),
            hasConversation && paneOpen && h('button', {
              type: 'button', style: ghostStyle, onClick: () => setPaneOpen(false),
              'aria-label': '收起 AI 对话面板',
            }, '×')),
          h('style', null, theme),
          h('div', { ref: dragHostRef, style: bodyStyle },
            h('nav', { style: navStyle, 'aria-label': '工作台导航' },
              ...['急症首页', '就医交接', '资料整理', '档案管理', '设置', '疾病概要'].map((label) => h('button', { key: label, type: 'button', style: { ...ghostStyle, width: '100%', marginBottom: 6, borderColor: page === label ? 'var(--wb-action)' : 'var(--wb-line)' }, onClick: () => setPage(label) }, label)),
              h('small', null, selectedSubject ? `当前档案：${selectedSubject.displayLabel}${selectedSubject.isDemo ? '（合成）' : ''}` : '未选择档案')),
                h('div', { style: { ...businessStyle, padding: 0, gap: 0 } },
                  h('iframe', { ref: frameRef, src: UI_ENTRY, title: `${META.title} · 业务工作台`, style: { display: 'block', width: '100%', height: '100%', minHeight: 0, border: 0, background: 'var(--wb-paper)' }, sandbox: 'allow-scripts allow-same-origin allow-forms allow-downloads', 'aria-label': '脑梗死业务工作台' })),
            // 分隔线夹在业务区与原生会话之间。
            !narrow && paneVisible && h('div', {
              role: 'separator',
              'aria-orientation': 'vertical',
              'aria-label': '调整 AI 对话面板宽度',
              'aria-valuemin': Math.round(AGENT_MIN * 100),
              'aria-valuemax': Math.round(AGENT_MAX * 100),
              'aria-valuenow': percent,
              tabIndex: 0,
              style: {
                ...(dragging ? splitterDragStyle : hovering ? splitterHoverStyle : splitterStyle),
                right: `${percent}%`,
              },
              onPointerDown: onSplitterPointerDown,
              onPointerEnter: () => setHovering(true),
              onPointerLeave: () => setHovering(false),
              onKeyDown: onSplitterKeyDown,
            },
              h('span', { style: splitterHitStyle, 'aria-hidden': 'true' })),
            // 原生会话始终挂载：隐藏走 display，不卸载（否则丢输入框与草稿状态）。
            h('aside', {
              style: {
                ...paneStyle,
                ...(narrow ? drawerStyle : null),
                width: narrow ? `min(92%, ${DRAWER_MAX}px)` : `${percent}%`,
                display: paneVisible ? 'flex' : 'none',
              },
              'aria-label': 'AI 对话',
              'aria-hidden': paneVisible ? undefined : 'true',
            }, hasConversation && conversation ? conversation : h('div', { style: padStyle },
              h('b', null, connecting ? '正在准备 AI 对话' : 'AI 对话还没开始'),
              h('span', null, connecting
                ? '宿主正在恢复会话或等待你选择资料目录。'
                : '点顶栏「AI 对话」创建或打开本工作台的原生会话。'),
              h('span', null, '没有会话也不影响记录：业务区的资料整理照常可用。'))),
            dragging && !narrow && h('div', { 'aria-hidden': 'true', style: dragShieldStyle })))
      }
    }

    const INJECT = ['desktopWorkbenches']

    function apply(ctx) {
      const Panel = buildPanel(React, ctx)
      ctx.effect(() => ctx.desktopWorkbenches.register({title: META.title, repository: 'https://github.com/xyb-openharness-dsh-plugins/cerebral-infarction-workbench', description: META.description, ...PANEL_LAYOUT}, Panel))
    }


    return { apply, inject: INJECT }
  }
})
