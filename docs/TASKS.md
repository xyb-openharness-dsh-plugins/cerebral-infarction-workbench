# 实施任务与当前交接

规格版本：M1 SPEC v0.1 + M2 确认记录（用户 2026-11-19 07:44 CST）。原型 SHA-256：`26b237db5774b795d105832aef5ae8750899349bf1b176c60f8ddd7e75ded026`。分支：`main`；当前包版本 M3 为 `0.1.0`，M9 目标 `0.2.0`。

| ID | 业务单元 | 前置依赖 | 拥有文件/模块 | 实现/检查要求 | 证据 | 状态 |
|---|---|---|---|---|---|---|
| T01 | 数据合同/冻结 | 用户确认的M2原型 | `docs/SCHEMA.md`、`schema/0001_initial.sql` | v1关系、来源、未知时间、隐私、修订、演进与回滚合同；M3 | `docs/MILESTONE-EVIDENCE.md §M3` | 已完成 |
| T02 | 公开临床/研究数据 | M3 | `research/`、参考数据模块 | 公开指南/登记记录；来源、日期、查询和快照；无患者级匹配 | `docs/CLINICAL-DATA.md`、公开查询快照331条、双合成档案fixture；M4证据见`docs/MILESTONE-EVIDENCE.md` | 已完成 |
| T03 | 服务/API与UI parity | M3、原型确认 | `dsh/`、`lib/`、`research/disease-primer.json`、migration/API | 急症优先、可选交接、双档案、本机索引、设置与primer；原生会话创建/订阅只由宿主接管 | `docs/API-CONTRACT.md`、`docs/UI-PARITY.md`、M5证据 | 本地代码完成；Desktop未验证 |
| T04 | 包与测试画像 | M4/M5 | `test/`、`docs/`、tarball | 合成资料；安装包检查；仅目标Desktop环境可核验的项如实标未验证 | M6证据待生成 | 待开始 |
| T05 | 交付草稿 | M5/M6 | `docs/RELEASE.md`、市场草稿 | M7/M8仅准备，不发布、不打tag、不投稿 | M7/M8证据待生成 | 待开始 |
| T06 | M9自检与报告 | 全部实现 | 文档、check/test/audit/pack | 2个以内端到端真实场景；五项门禁记录；`0.2.0`；无Release | M9证据待生成 | 待开始 |

## 用户确认与限制

- 仅一期范围：EMR-01/02、EMR-03、REC-01、SET-01、PRIMER-01、AGENT-01（记录于 `docs/PROTOTYPE-REVIEW.md`）。
- G1：自动签认 · 待晨审追认。
- 品牌“脑梗死工作台”为暂定名，待用户追认。
- 不诊断，不给治疗/用药建议；不入仓真实患者资料；不发Release、不打tag、不改组织BACKLOG。

## 当前交接（M5实施中）

失败/复现：无M3 schema探针失败；M0早期 `npm run check` 资料目录选择/落盘闸门失败记录在证据表，待M5修复与复测。
未验证：目标Desktop Node/SQLite版本、Desktop目录选择器、真机安装重启点击；临床审核。
M5当前已实现服务API与界面；M5收口前需补全验证记录并逐提交推送。`npm run check` 此轮实测通过，`npm test` 服务层6项全过。
下一步：完成M5提交和证据后进入M6打包/安装画像；M7/M8仅维护草稿，M9跑五项门禁、2个端到端用例并出报告。
