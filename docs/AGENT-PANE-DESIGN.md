# DSH 原生 Agent 面板设计（M2原型合同）

状态：交互原型只模拟宿主容器，不伪造 DSH 会话。目标 Desktop / Harness 版本未在本机核验。

- 主工作台居中/占主区；原生 Agent 在右侧、默认关闭。入口在顶栏“打开 AI 对话”。
- HTML 的右栏明确标“宿主模拟 · 非真实 DSH 会话”，不显示假聊天记录、不创建会话、不发送个人资料。
- 右栏示意宽度35%，通过可拖动 splitter 调整25%–45%；键盘方向键、Home、End与ARIA separator值更新。窄屏不渲染伪聊天区，不覆盖核心急症入口。
- 独立隐藏/重开；模拟连接中、失败、已有草稿冲突状态。冲突时保留用户草稿，不覆盖/不发送。
- 生产实现合同：必须按目标Desktop官方API核实 `newSession`、`subscribe`、ownership/defaultWorkspace和会话归属；已有会话复用，重复点击不重建；异常时保留工作台状态。原生聊天本身由宿主提供。
- 目标Desktop未安装或未检测到；面板可见、会话创建、订阅和发送均未验证，不可称为已接通。

M2原型路径：`prototypes/v0.2/index.html`；HTML行为说明在 `docs/UI-PARITY.md`。原型不是DSH实机UI验收。
