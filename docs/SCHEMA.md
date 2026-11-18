# 数据模型 v1（M3 已冻结）

冻结日期：2026-11-19。确认依据：M2 原型确认记录，SHA-256 `26b237db5774b795d105832aef5ae8750899349bf1b176c60f8ddd7e75ded026`。数据库定义唯一来源：`schema/0001_initial.sql`；其 SHA-256 与冻结说明见 `schema/freeze-contract.md`。冻结迁移不得编辑；变更只能新增 `000N_*.sql` 并递增 `PRAGMA user_version`。

## 存储选型与约束

选 SQLite：急症事件、时间点、观察、来源与患者资料之间需要外键、唯一约束、原子写与一致读；公开登记快照要能分离、按注册号去重。当前 Node v22.23.3 的 `node:sqlite` 可在本机执行，官方 Node v22 文档将其标为 experimental（2026-11-19 实际查阅）；桌面宿主 Node 版本尚未核实。M5 必须做运行时能力探测，缺少 `node:sqlite` 时明确服务不可用，不得退化成未约束 JSON。

数据库及文件仅写入用户主动选择并确认的资料目录；不得默默使用 home、仓库或临时目录。原件只保存为该目录内文件，数据库存相对路径、可选哈希和来源元信息；仓库只放合成夹具和公开研究材料，禁止真实患者资料。

所有 ID 为调用方生成的稳定 UUID 字符串；时间存 ISO 8601 文本，保留精度、时区和未知。任何人自述、照护者转述、文档转录与临床确认必须区分；未知是显式状态，不能改写为阴性。表中没有疾病诊断、风险、治疗资格、用药或预后派生列。

## 冻结实体

| 表 | 稳定键 | 关系与用途 | 主要约束/索引 |
|---|---|---|---|
| `subjects` | `id` | 本人/照护对象；`is_demo` 区分合成档案 | 角色 CHECK；标签限长 |
| `source_records` | `id` | 用户自述、照护者转述、文件、合成种子或公开参考来源 | 来源类别枚举；公开来源保留 URL/访问日 |
| `subject_relationships` | `id` | 代填者与访问范围、确认/撤销状态 | subject 外键；撤销需曾确认 |
| `acute_events` | `id` | 疑似急症的记录流程状态，不是确诊病例 | subject/source 外键；仅 open/handed_off/closed |
| `event_timepoints` | `id` | 分开保存最后正常与首次观察；未知与近似时间有明确精度 | event/source 外键；未知值必须 NULL |
| `symptom_observations` | `id` | FAST/BEFAST相关观察描述，不推断病因 | present/not_observed/unknown；来源角色；隐私标记 |
| `clinical_documents` | `id` | 用户目录内原件索引、来源、核对状态与修订链 | subject/source 外键；相对路径；sha256 可空；in_use |
| `care_questions` | `id` | 患者自拟复诊问题及状态、来源和修订 | subject/source 外键；不保存 AI 结论 |
| `public_studies` | `registry_id` | 公开注册平台研究元数据快照；不含参与者个人数据，不做个体匹配 | source 外键；快照日；原始记录哈希；状态索引 |
| `study_source_statuses` | `id` | 每个查询×来源的成功、空结果、失败、未查询状态 | 查询和来源唯一；失败状态不得变成零条 |
| `workbench_settings` | `setting_key` | 非临床设置状态 | 白名单键；限长 |

研究数据不直接成为个体病历。试验资料仅可作公开登记描述；本版不估算患者资格、不用用户资料自动筛选或排序试验。

## 写入、修订与事务

- 对用户已确认记录的纠正用新行和 `supersedes_id` 建链；由业务用例把旧 revision 置为非当前读模型。重要变更保留创建时间、来源与隐私状态；不覆盖报告原文。
- 跨表命令在 SQLite transaction 中写入；业务更新使用 expected revision，冲突返回 409 并重新读取，不静默覆盖。
- 外键使用 `ON DELETE RESTRICT`，业务记录默认软失效；删除/撤销只有显式用例提供并按关系检查。合成种子受保护，不可混入真实档案。
- SQL 迁移按序执行，在事务中备份旧库、应用迁移、检查外键与 `user_version`；失败还原备份，不清库。不回退已应用迁移文件。

## UI 与流程演进走查

| 变化 | 稳定事实 | 修改层 | 兼容/验收 |
|---|---|---|---|
| 首屏与导航拆合 | subject/event/source/document IDs | UI/版本化 read model | 不迁移，不复制页面事实 |
| 新观察类别/时间精度 | 观察行、来源、明确 unknown | 新受限枚举迁移或定义目录 | 旧行保留；未知类别不解释为阴性 |
| 急症步骤跳过、重新打开 | event 状态、观察与时间点 | workflow 定义版本/命令 | 快照保留；页面顺序变化不改事实 |
| 文件更正或替换 | 原文件、来源和 revision 链 | 新 document revision、投影失效 | 原件留存，不改写来源 |
| 新公开研究更新 | registry_id/source/snapshot_date | public_studies 快照 | 按登记号 upsert，新快照可追溯；不涉及患者库 |
| 旧库升版失败 | `user_version` 及 SQLite 文件 | migration runner | 备份恢复；不清库 |
| 宿主会话变化 | 无患者事实与会话 ID 绑定 | DSH host adapter | 会话 owner 属宿主；不进 patient schema |

并发写入、真实目录权限、断电恢复、宿主 Node 版本及桌面迁移尚未验证；实现与实际验收见 M5/M6 证据。
