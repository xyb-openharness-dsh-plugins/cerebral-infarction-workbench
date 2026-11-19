# 测试用例（M9，≤2）

场景预期来源：M2用户确认原型 SHA-256 `26b237db5774b795d105832aef5ae8750899349bf1b176c60f8ddd7e75ded026`；`docs/SPEC.md` §范围与安全目标、§一期候选3–5；用户确认一期模块EMR-01/02、EMR-03、REC-01、SET-01、PRIMER-01、AGENT-01。测试数据全部为合成文本。

## 用例1：出现疑似症状时先求助，交接信息可全未知

- **场景与前置**：工作区未配置资料目录、没有档案；用户/照护者打开急症首页。不得因资料或网络阻断急症提示。
- **操作步骤**：1. 加载随包`public/index.html`。2. 确认呼救链接与FAST/BE-FAST说明显示。3. 打开就医交接，时间留空，填入合成症状文字、病史写“未知”。4. 生成摘要；不保存档案，不点击电话链接。
- **应该（SPEC/签认预期）**：呼救入口首屏可见，交接项可跳过；生成的临时摘要明确“本人/照护者提供，未经核实”，未知时间保留未知，不要求先选目录或档案；不会输出诊断或用药建议。
- **现实（实测＋证据）**：`node --disable-warning=ExperimentalWarning --test --test-concurrency=1 test/workbench-http-scenarios.test.mjs`退出码0，两项场景测试全过；本地Chromium 1440×1000实载页面并经CDP操作，输出`"scenario1":{"pass":true,"preview":"就医交接（本人/照护者提供，未经核实）\n最后正常/发现时间：未知/未填写\n观察情况：突然口齿不清（合成测试）\n补充病史：未知"}`。真实页面截图：[m9-local-home.png](evidence/m9-local-home.png)、[m9-handoff.png](evidence/m9-handoff.png)。电话链接仅检查存在，未实际发起系统拨号。
- **判定**：一致。
- **返工决定**：不需要。

## 用例2：目录配置后保存急症交接、索引来源并记录私密问题

- **场景与前置**：本地HTTP测试宿主和浏览器；目录由合成测试直接选择API配置并通过同源消息通知页面，不代表真实Desktop目录picker；其中只有合成文本文件与合成档案。
- **操作步骤**：1. 设置所选资料目录。2. 选择合成档案A。3. 填写照护者报告症状但时间未知，生成摘要并显式保存。4. 在资料整理页索引`synthetic-note.txt`。5. 保存一个私密问题草稿。6. 通过bootstrap读回事件、文件和问题状态。
- **应该（SPEC/签认预期）**：急症交接标为照护者自述/未经核实，unknown时间不被推测；本机文档只登记来源和路径，不上传/解析正文；问题标私密草稿；合成档案标记与真实档案分开。
- **现实（实测＋证据）**：同一测试命令退出码0；浏览器输出`"scenario2":{"pass":true,"eventAssertion":"caregiver_reported","documentCount":2,"privateQuestionCount":1,"rootConfigured":true}`，其中文档总数包含一条既有合成seed和本次索引；问题私密计数为1。页面截图：[m9-records.png](evidence/m9-records.png)。本地SQLite测试确认通过本机服务路由；没有真实Desktop picker/会话或外部云端传输验证。
- **判定**：一致。
- **返工决定**：不需要。
