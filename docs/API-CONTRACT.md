# API 合同

状态：M5实现；schema v2。路由源于 `dsh/index.js`，存储实现见 `dsh/workbench.js`。

API 前缀：/api/<项目唯一slug>；鉴权由宿主 connection 合同处理，不因 loopback 就跳过。

| 方法/路径 | 意图 | 输入字段/类型/约束 | 成功响应 | 错误码 | 读写实体 | 幂等/事务 |
| --- | --- | --- | --- | --- | --- | --- |
| GET /health | 版本与能力 | 无 | version/apiVersion/capabilities | capability_unavailable | 无 | 只读 |
| GET /primer | 疾病概要四段 | 无 | 与已签认primer-data一致的JSON | 500 | 无 | 只读 |
| GET /bootstrap?subjectId= | 工作台读模型 | subjectId可选 | schemaVersion、目录状态、subject清单与选中档案的资料/问题/急症摘要 | 503/409 | subjects/source/document/question/event | 只读快照 |
| GET /root | 目录状态 | 无 | 未选择或完整本机目录路径 | 503 | 无 | 只读；完整路径仅本机UI显示 |
| POST /root | 设置资料目录 | 用户选择的dir；拒绝主目录、桌面、下载根、tmp | ready目录状态 | 400/403/500 | 本地配置指针、SQLite | 先验证可写与迁移，取消不请求 |
| GET /files | 目录内候选文件 | 无；仅已选择目录 | 最多500项、最大深度3、白名单扩展名 | 409/500 | 无 | 不跟随符号链接 |
| POST /subjects | 新建本人/照护对象档案 | displayLabel、subjectRole | subject及更新读模型 | 400/409/500 | subjects | 单条写入 |
| POST /acute-events | 建立疑似事件 | subjectId、reporterRole、timepoints、observations；时间可unknown | event及更新读模型 | 400/404/409/500 | acute_events、event_timepoints、symptom_observations、source_records | SQLite事务 |
| POST /documents | 登记用户资料 | subjectId、relativePath、可选名称/类别/日期/隐私 | document索引记录 | 400/404/409/500 | clinical_documents、source_records | 目录边界、类型、50MB限制；不接收绝对路径 |
| POST /questions | 新建问题草稿 | subjectId、questionText、isPrivate | question及更新读模型 | 400/404/409/500 | care_questions、source_records | SQLite事务 |

状态码以当前代码中的HTTP状态与错误JSON为准；错误响应不回传原始用户文件内容。HTTP端点使用宿主`connection.requestRejection`。客户端会话通过`desktopWorkbenches.newSession`及`subscribe`，只填草稿不自动发送。

实现边界：未实现并发revision更新；急症/问题采用追加记录。客户端刷新read model以获得最新状态。数据目录的绝对路径保存在本机UI状态与用户选目录指针中，不上传。Desktop真实接口运行尚未验证。


## API边界

业务写入限于已选档案、来源、急症交接、资料索引和自拟问题。记录均标明自述/未核实；没有文件正文解析或患者试验匹配。服务端使用配置目录保存数据根指针；尚未实测目标Desktop数据路径与runtime兼容性。
