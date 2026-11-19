# 里程碑证据表（MILESTONE-EVIDENCE）

> 规则（AGENTS.md「证据要求与测试用例」，2026-11-18 定版）：**没有证据，不算完成。**
> 每个里程碑收口时填写一行；DAY-REPORT 的完成结论必须回指本表条目，回指不到的降级为「未验证」。
> 证据只认实测产物：命令原文与关键输出、退出码、数字、探针/截图、提交号。没跑过的不许写；查不到的如实写「未取得/未验证/待核」并列出已查路径。

| 里程碑 | 交付物（文件/提交号） | 验证命令 | 关键输出（原文摘录：数字/退出码） | 未验证项及原因 |
|---|---|---|---|---|
| M0 |  |  |  |  |
| M1 |  |  |  |  |
| M2 | `prototypes/v0.2/index.html`、`primer-data.js`、4张 `docs/evidence/m2-prototype-*.png`、`docs/PROTOTYPE-REVIEW.md`、`docs/SETTINGS-DESIGN.md`；M2 主提交 `95e7efc`；证据补录提交见 git log | `node scripts/check-primer-links.mjs`（退出码0）；`node scripts/check-primer-links.mjs --http`（退出码0）；本机 Chromium 154.0.8037.57 CDP 页面加载、交互探针与截图 | 静态：`✓ 链接断言：20 项结构 + 未联网，20 通过，0 失败`；联网：`✓ 链接断言：20 项结构 + 联网实测，23 通过，0 失败，1 待人工确认`；浏览器：`home complete|true|脑梗死工作台 · 交互原型 v0.1.0`；AI面板探针实测 main `x=216,width=298,right=514`，pane `x=522,width=243`，草稿状态 `检测到原生草稿；保留用户输入，不覆盖、不发送。`；HTML SHA-256 `26b237db5774b795d105832aef5ae8750899349bf1b176c60f8ddd7e75ded026` | AHA 官方页面脚本联网请求 HTTP 403，待人工确认（官方页面曾在浏览器打开）；电话、真实目录选择/落盘、真实 DSH Agent 会话与 newSession/subscribe、Desktop安装/重启/点击未验证；临床审核未完成；用户尚未签认原型哈希和模块范围，故 M3+暂停。 |
| M3 | M2签认补录 `docs/PROTOTYPE-REVIEW.md`；冻结合同 `docs/SCHEMA.md`、`schema/0001_initial.sql`、`schema/freeze-contract.md`；检查脚本 `scripts/check-schema.mjs`；M3首提交 `980665b`；详情见M3记录与本证据补录提交 | `node --disable-warning=ExperimentalWarning scripts/check-schema.mjs`；`sha256sum schema/0001_initial.sql` | `✓ schema v1: 11 tables; integrity_check=ok; foreign_key_check=0; forbidden acute columns=0; unknown-time constraint=pass; intentional invalid-time insert=rejected`；SQL SHA-256 `2c8100c22d702d9e1eefb2f5796bb2dbac2f6026b1a7dcf254a1ed9347a32361` | 只在 Node v22.23.3 内存SQLite验证；SQLite 在此Node版本仍 experimental；Desktop Node/API与真实迁移/权限未验证；临床专业审核未完成。 |
| M4 | `docs/CLINICAL-DATA.md`、`research/clinical-trials/ctgov-ischemic-stroke-2026-11-19.json`、`research/clinical-trials/manifest.json`、`test/fixtures/synthetic/profiles.json`、`schema/0002_public-study-first-posted-date.sql`、`scripts/check-public-research.mjs`；主提交 `2d035d4` | ClinicalTrials.gov API v2分页查询（urllib脚本，查询与窗口见数据说明）；`node --disable-warning=ExperimentalWarning scripts/check-public-research.mjs`；提交号以主提交为准 | API实测：`totalCount=331; returned=331; pages=4; pageSizes=100,100,100,31; uniqueIDs=331; dateWindow=2026-02-19..2026-11-18`；类型`INTERVENTIONAL=239, OBSERVATIONAL=91, EXPANDED_ACCESS=1`；状态分布见数据说明。数据校验输出`✓ public research snapshot: 331 unique records; schema migration 1→2 adds first_posted_date; synthetic fixtures=2; no participant/eligibility fields; integrity_check=ok` | ChiCTR全量查询/快照未取得；ClinicalTrials.gov命中未经逐条临床相关性筛选，不代表331条均为卒中干预试验；真实患者数据未取得且未入仓；Desktop及临床审核未验证。 |
| M5 |  |  |  |  |
| M6 |  |  |  |  |
| M7 |  |  |  |  |
| M8 |  |  |  |  |
| M9 |  |  |  |  |

## 证据自检（收口前逐条勾）

- [ ] 每条「完成」结论都能在本表找到对应证据行
- [ ] 所有数字（测试数、审计数、文件数）与命令输出原文一致，未凭记忆填写
- [ ] 未验证项已明确列出并写明原因，未用「通过/完成」字样掩盖
- [ ] 医学/数据来源带出处与访问日期；查不到的标「未取得」并列已查路径
- [ ] 证据产生者与检查者分离：验证脚本自身的写副作用未充当被验对象的证据

### M0（2026-11-18）

- **交付物**：starter 1.10.0-rc.56 初始化骨架（共 252 个初始化计划文件），README、AGENTS、package/DSH 注册骨架、docs 文档套装（BRIEF/SPEC/TASKS/ACCEPTANCE/PARITY/SCHEMA/API/UI/SETTINGS/HVT/PROTOTYPE-REVIEW 等）、PROGRESS.md；M0 主提交 `92c1db3`（本证据补录提交会随后记录在 git log）。
- **验证命令**：`dsh-wb-cli doctor`；`dsh-wb-cli init --config /tmp/cerebral-infarction-project.config.json --target /data/home/dev/cerebral-infarction-workbench-run --dry-run`；同命令去掉 `--dry-run`；`npm install`；`npm run check`。
- **关键输出（原文）**：`"version": "1.10.0-rc.56"`；dry-run：`{"dryRun":true,"target":"/data/home/dev/cerebral-infarction-workbench-run","files":252,"layout":"business-first"}`；init：`{"generated":"/data/home/dev/cerebral-infarction-workbench-run","files":252,"layout":"business-first","stage":"designer-alignment",...}`；doctor：`"supported": true`，`"appDetected": null`；npm install：`added 59 packages, and audited 60 packages in 7s`，`found 0 vulnerabilities`；`npm run check` 退出码 1，关键失败原文：`✗ 资料目录闸门未通过：按钮必须真的能选目录并落盘` / `✗ ① 没有真实选择动作 ...` / `✗ ② 拒绝清单不完整 ...` / `✗ ③ 目录落点没接上 ...`。
- **未验证/说明**：M0 是骨架里程碑，资料目录真实实现属于后续业务阶段；不把该脚手架默认缺失闸门记成通过，也不改检查器或哈希掩盖。Desktop 未检测到（`appDetected: null`），实机安装、重启、点击未验证。线上 DSH 规范已打开全文，地址 `https://dshdesktop.com/workbench/docs/development.md`，页面标注版本 2026-10-27（访问日期 2026-11-18）。

### M1（2026-11-18）

- **交付物**：`docs/USER-RESEARCH.md`、`docs/SCENARIOS.md`、`docs/FEATURE-INVENTORY.csv`、`docs/CORE-MODULES.md`、`docs/FEATURE-REVIEW.md`、`docs/INTERACTION-DESIGN.md`、`docs/UI-DESIGN.md`、`docs/ACCEPTANCE.md`、`docs/SCHEMA.md`（候选）、`docs/HVT-REVIEW.md`、`docs/DESIGNER-BRIEF.md`、`docs/DESIGN-SESSION.md`、`docs/DESIGN-REVIEW.md`、`docs/PHASE-PLAN.md`、`docs/SOURCES.md`、M1主提交 `5c4fe49`；证据补录提交将由 git log 核验。G1标记“自动签认，待晨审追认”。
- **验证/研究命令**：本次实际打开国家卫健委《脑血管病防治指南（2024年版）》官方PDF（浏览器行60–100）、AHA/ASA 2026指南要点（行35–48）、ASA症状页（行15–43、111–143）、Wang et al 2021患者访谈全文（行108–143及251–310）；`python3 skills/hvt-requirement-review/scripts/hvt_scan.py --project . --terms /tmp/cerebral-infarction-hvt-terms.json --out /tmp/cerebral-infarction-hvt-scan.md --json /tmp/cerebral-infarction-hvt-scan.json`。
- **关键输出**：HVT扫描输出 `扫描文档：83 份`；`S2 ... S=1 M=1 F=1 I=1 A=1 C=5`；`S1 ... S=1 M=1 F=1 I=1 A=1 C=5`；`有命中但 C≤2 ... 0 个`；`五层齐全 ... 2 个`。扫描为启发式初值，实际逐文档复核定位在 HVT-REVIEW §2，不能将术语命中本身等同覆盖。浏览器来源事实：NHC指南发布日期 `2024年12月10日`；其原文列BEFAST与立即拨120；访谈纳入 `24` 名延迟就医患者。
- **未验证/局限**：无真实患者/照护者访谈；无神经科/急救临床审核；AHA完整指南原件、NHC地方服务规则、卒中中心数据、登记试验包未取得；AI独立review未完成；M2原型和用户确认尚未做。设计自动G1签认依据用户任务明确授权，标注待晨审追认。


### M2（2026-11-18）

- **交付物**：急症首页、可选交接摘要、合成资料、设置边界、疾病概要与宿主 Agent 模拟，文件 `prototypes/v0.2/index.html`、`prototypes/v0.2/primer-data.js`；设置与交互说明见 `docs/SETTINGS-DESIGN.md`、`docs/PROTOTYPE-REVIEW.md`；M2主提交 `95e7efc`；截图 4 张见 `docs/evidence/`。原型 HTML SHA-256：`26b237db5774b795d105832aef5ae8750899349bf1b176c60f8ddd7e75ded026`。页面与 package 版本仍为 `0.1.0`，最终目标 `0.2.0` 留至 M9。
- **验证命令/实测**：`node scripts/check-primer-links.mjs` 退出码 0，原文 `✓ 链接断言：20 项结构 + 未联网，20 通过，0 失败`。`node scripts/check-primer-links.mjs --http` 退出码 0，原文 `✓ 链接断言：20 项结构 + 联网实测，23 通过，0 失败，1 待人工确认`，并有 `WARN L11 guidance.sources[3] HTTP 403 — 反爬/服务端拦脚本，浏览器或可开，需人工确认`。Chromium 154.0.8037.57 实际加载本地 file URL，捕获首页、交接、primer、Agent状态四张截图；探针输出记录于 `docs/PROTOTYPE-REVIEW.md`。
- **未验证/闸口**：仅为本地浏览器交互原型；不拨电话、不访问真实文件系统、不保存患者资料、不连接真实Agent。DSH Desktop安装/退出重开/点击未验证。AHA HTTP脚本请求待人工确认，临床专业审核未完成。用户尚未对确切原型哈希和模块范围签认；依据 starter 前置要求，M3 schema 冻结与后续生产开发暂停等待用户决定。G1 自动签认仍标注待晨审追认。


### M2签认补录（2026-11-19）

用户于 `2026-11-19 07:44 CST` 明确确认原型 SHA-256 `26b237db5774b795d105832aef5ae8750899349bf1b176c60f8ddd7e75ded026` 与一期模块 EMR-01/02、EMR-03、REC-01、SET-01、PRIMER-01、AGENT-01；G1 仍为“自动签认 · 待晨审追认”。该签认在M3首个提交一并提交，详见 `docs/PROTOTYPE-REVIEW.md`。此条是对M2历史未签认状态的追加补录，不覆盖M2证据条目。

### M3（2026-11-19）

- **交付物**：M2签认补录；冻结 schema v1（11张表）`schema/0001_initial.sql`；结构与演进合同 `docs/SCHEMA.md`；SQL哈希合同 `schema/freeze-contract.md`；可复跑自检 `scripts/check-schema.mjs`；更新API/验收/交接待办。M3首提交 `980665b` 含用户签认，schema冻结与实现合同。
- **验证**：`node --disable-warning=ExperimentalWarning scripts/check-schema.mjs`，退出码 0。关键输出：`✓ schema v1: 11 tables; integrity_check=ok; foreign_key_check=0; forbidden acute columns=0; unknown-time constraint=pass; intentional invalid-time insert=rejected`；迁移SHA-256 `2c8100c22d702d9e1eefb2f5796bb2dbac2f6026b1a7dcf254a1ed9347a32361`。
- **未验证**：只在Node v22.23.3本机内存库验证；`node:sqlite`官方22.x文档标记为experimental，目标DSH Desktop Node版本与运行环境尚未核验；实际数据目录与真实迁移/回滚、临床专业审核未验证。公开临床/试验数据为M4任务，尚未检索。


### M4（2026-11-19）

- **交付物**：公开登记元数据快照、检索口径和覆盖限制见 `research/clinical-trials/` 与 `docs/CLINICAL-DATA.md`；两套仅供测试的合成资料fixture；schema v1冻结文件未修改，新增v2迁移单独扩展首登日期。
- **公开查询实测**：ClinicalTrials.gov API v2 URL `https://clinicaltrials.gov/api/v2/studies`，参数：`query.cond=ischemic stroke`，`AREA[StudyFirstPostDate]RANGE[2026-02-19,MAX]`，排序`StudyFirstPostDate:desc`，100条/页。访问2026-11-19；原始程序输出`totalCount=331; returned=331; pages=4; pageSizes=100,100,100,31; uniqueIDs=331; dateWindow=2026-02-19..2026-11-18`。类型与状态分布见`docs/CLINICAL-DATA.md`。官方API页面说明其提供公开研究登记记录查询；不把登记状态当作疗效或招募推荐。
- **校验**：`node --disable-warning=ExperimentalWarning scripts/check-public-research.mjs`退出码0，原文`✓ public research snapshot: 331 unique records; schema migration 1→2 adds first_posted_date; synthetic fixtures=2; no participant/eligibility fields; integrity_check=ok`；`node scripts/check-trial-chain.mjs .`退出码0，原文`✓ 裁剪理由带实测数字（N 条 / 快照口径）`/`✓ 临床试验闸门通过`；`node scripts/check-trial-snapshot.mjs . --if-present`退出码0但`SKIP no clinical snapshot found under /data/home/dev/cerebral-infarction-workbench`；`node scripts/check-schema-words.mjs .`退出码0，`pass=true, fails=[]`，冻结构哈希一致。脚本应验证331条唯一登记号、日期/URL/哈希格式、允许字段白名单、合成档案数量和迁移1→2；最终原文与退出码以补录提交为准。
- **未验证/限制**：ChiCTR全量检索未完成；未逐条人工筛选ClinicalTrials.gov查询命中的临床相关性；未取得真实患者或参与者个人数据；快照不表示实时招募状态。临床审核和Desktop实机未验证。无个体化试验匹配功能。

### M5 服务层与面板契约（2026-11-19）

- **交付物**：`dsh/index.js`、`dsh/workbench.js`、`lib/client.js`、`research/disease-primer.json`、`test/workbench-service.test.mjs`、API/UI parity文档；M5实现提交 `2db1337`（已推送）。
- **验证命令及关键输出原文**：`npm run check` 退出码 `0`；原文含 `✓ 资料目录闸门通过`、`✓ 患者档案闸门通过`、`✓ 随包文件占位符 = 0（扫描 18 个文件 / 5 条模式）`、`✓ 患者可见文案红线：扫描 3 个文件，8 条禁词规则，0 命中`。`npm test` 退出码 `0`；`# tests 6`、`# pass 6`、`# fail 0`。`node --check dsh/index.js`、`node --check dsh/workbench.js`、`node --check lib/client.js`均退出码0。
- **实测内容**：服务测试覆盖未配置目录仍可用急症模块、选择目录迁移到schema v2并seed两套合成档案、新建档案和急症/问题记录、根目录外文件拒绝、无值的exact时间拒绝；所有测试使用仓内合成fixture和测试生成文件。
- **未验证项及原因**：目标Desktop未检测到/未安装验证；`uiWorkspace.pickDirectory`、Desktop内置Node `node:sqlite`、会话 `newSession`/`subscribe` 真机运行、目录权限真实环境、`tel:120` 点击拨号均未验证。临床内容仍未由临床专业人员审核。测试桩和静态检查不替代实机交互。

### M6 构建、打包与profile验证（2026-11-19）

- **未验证项/限制**：tarball生成≠安装。DSH Desktop目标profile安装、退出重开、页面打开、业务点击、目录picker、宿主会话仍未验证。当前包版本仍为0.1.0，目标0.2.0在M9。
- **交付物**：`src/client.js`、`src/workbench-index.html`、`public/index.html`、`lib/client.js`、`lib/layout.js`、`VERSION`、`lib/version.js`、`scripts/build-public.mjs`、修订后的`scripts/build-client.mjs`与`package.json`、`docs/DIFF-MATRIX.md`、`docs/DEV-PLAN.md`、`docs/DEV-REQUIREMENTS-2026-11-19.md`；M6提交 `5815bae`（已推送）。生成tarball在`/tmp`，不入仓。M2确认原型文件未改。
- **验证命令及关键输出原文**：`npm run build`退出码0，输出`✓ 已生成 lib/version.js（v0.1.0 · stable · 73bb7b3）`、`✓ public/index.html（v0.1.0）`及`✓ lib/client.js（495 行 · 0.1.0）`；`node --check lib/client.js`退出码0。`npm run check`退出码0，末段原文`✓ 随包文件占位符 = 0（扫描 21 个文件 / 5 条模式）`、`✓ 患者可见文案红线：扫描 6 个文件，8 条禁词规则，0 命中`；测试汇总`# tests 6`、`# pass 6`、`# fail 0`。`npm run audit`退出码0，原文`40/40 通过 · 0 失败 · 0 待人工`。`npm pack --pack-destination /tmp`退出码0；`total files: 32`、`package size: 3.0 MB`、`unpacked size: 3.5 MB`、shasum `4c90841b569a70b82d7706fc7771be9bd9835256`；tarball SHA-256 `ddf1ec24bfcfe9179e2a249541e7c504a7594c493486098b55ee5a638e71dce6`。
- **profile检查实测**：`node scripts/check-install.mjs`退出码非0；原文`✗ 这台机器上没有找到 DSH Desktop（io.dsh.desktop）。`，脚本明确给出DSH Desktop下载地址。本机无目标app，未执行profile安装。
- **审计修复说明**：修复构建器的包名JSON转义，并让检查器接受本项目四段primer语义ID（原M2原型未改）；业务页通过实际随包`public/index.html`、本地API与宿主iframe加载，不是空入口。
- **未验证项/限制**：tarball生成≠安装。DSH Desktop目标profile安装、退出重开、桌面页面打开、宿主目录picker、DSH会话仍未验证。当前包版本仍为0.1.0，目标0.2.0在M9。

### M7 发布说明草稿（2026-11-19）

- **交付物**：`docs/release-draft/M7-RELEASE-NOTES.md`；M7草稿提交号将在M7证据补录中核对。替换了初始化遗留的其他疾病模板文案。
- **检查**：人工对照本任务限制与当前证据状态，文档明确标记“草稿、不发布”，版本当前0.1.0/目标0.2.0，未写未验证为通过；没有创建tag、Release或npm发布。
- **未验证项**：草稿中的预期交付功能需由M9证据决定最终措辞；Desktop实机、目标profile与临床审核仍未验证。
- **未验证项/限制**：tarball生成≠安装。DSH Desktop目标profile安装、退出重开、页面打开、业务点击、目录picker、宿主会话仍未验证。当前包版本仍为0.1.0，目标0.2.0在M9。
