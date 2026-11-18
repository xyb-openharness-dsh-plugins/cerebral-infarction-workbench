# API 合同

状态：M3候选读写合同，数据schema v1已冻结；实际业务端点由M5实现并实测。

API 前缀：/api/<项目唯一slug>；鉴权由宿主 connection 合同处理，不因 loopback 就跳过。

| 方法/路径 | 意图 | 输入字段/类型/约束 | 成功响应 | 错误码 | 读写实体 | 幂等/事务 |
| --- | --- | --- | --- | --- | --- | --- |
| GET /health | 版本与能力 | 无 | version/apiVersion/capabilities | capability_unavailable | 无 | 只读 |
| GET /bootstrap | 工作台初始读模型 | profile可选；禁止跨档案 | schemaVersion、subjects、activeSubject、目录/参考包状态 | 400/503 | subject/source/document/question | 只读快照 |
| POST /subjects | 新建本人/照护对象档案 | displayLabel、subjectRole、requestId | subject、revision | 400/409/503 | subjects/source_records | requestId幂等；单事务 |
| POST /acute-events | 建立疑似事件 | subjectId、reporterRole、timepoints、observations、source；字段均可未知/跳过 | event与交接摘要草稿 | 400/404/409/503 | acute_events、event_timepoints、symptom_observations、source_records | requestId幂等；事务 |
| POST /documents | 登记用户资料 | subjectId、displayLabel、documentKind、user-chosen relativePath、date/source | document索引记录 | 400/404/409/503 | clinical_documents、source_records | 不接收任意绝对路径；事务 |
| POST /questions | 新建/修订复诊问题 | subjectId、questionText、source、expectedRevision、requestId | question + revision | 400/404/409/503 | care_questions、source_records | 乐观并发；事务 |
| PATCH /settings/data-directory | 记录已确认的资料目录状态 | picker结果/状态；取消不写 | state，不回显完整敏感路径 | 400/503 | workbench_settings | 用户取消零副作用 |

通用字段：subject/project ID、occurredAt 的时区、单位、revision、来源 ref、reviewState、request ID。列出空记录、非法输入、主体不存在、取消、并发覆盖、服务不可用的实际响应。

读模型样例和写命令样例各一份。前端未知字段如何兼容？修改何时使快照过期？本地与外部能力错误如何区分？


## API边界

业务写入限于已确认档案、来源、急症交接、资料索引和自拟问题。错误响应不得包含绝对资料目录或患者原文。未知字段在读模型中显式返回`unknown`/`null`，未确认内容不转成已核实事实。`/api/.../health`沿用模板；所有路径继续使用本项目slug和宿主`connection.requestRejection`鉴权。会话操作不伪造自建接口：M5仅在当前Desktop公开服务能力可验证时调用`newSession`和`subscribe`，否则显示宿主能力不可用且保留本地功能。此为M3合同草案，端点尚未实现。
