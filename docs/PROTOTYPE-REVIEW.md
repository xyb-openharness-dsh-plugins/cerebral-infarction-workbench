# HTML交互原型确认记录

状态：M2原型已制作并在本机 Chromium 实际预览；用户尚未确认原型哈希与一期模块范围。按 starter 闸口，在用户确认之前不进入 M3 schema 冻结及后续生产实现。

## 原型版本与范围

- 原型文件：`prototypes/v0.2/index.html`（M2 交付目录）；页面/包版本仍为 `0.1.0`，最终目标 `0.2.0` 在 M9 冻结。
- 同目录数据：`prototypes/v0.2/primer-data.js`。
- HTML SHA-256：`26b237db5774b795d105832aef5ae8750899349bf1b176c60f8ddd7e75ded026`。
- 暂定品牌“脑梗死工作台”，待用户追认。
- 本次确认范围建议：EMR-01/02 急症识别与呼救优先；EMR-03 可跳过的就医交接；REC-01 合成资料整理；SET-01 设置/隐私边界；PRIMER-01 疾病概要；AGENT-01 DSH原生会话宿主模拟（不是真实集成）。

## 实际预览证据

本机 Headless Chromium 154.0.8037.57，加载 `file:///data/home/dev/cerebral-infarction-workbench/prototypes/v0.2/index.html`。截图位于 `docs/evidence/`：`m2-prototype-home.png`、`m2-prototype-handoff.png`、`m2-prototype-primer.png`、`m2-prototype-agent-simulation.png`。

实际探针观察：急症首页有“疑似卒中，先联系急救服务”；交接页可以生成带“由本人/照护者提供，未经核实”的临时摘要；疾病概要页显示5个分节；Agent 状态演示显示“检测到原生草稿；保留用户输入，不覆盖、不发送”。Agent 面板在预览窗口中位于主工作区右侧网格列，不遮挡主区。以上是本地原型交互观察，不是 DSH Desktop 实机验证。

## 边界与未验证

呼救按钮不会拨打电话；目录按钮不会打开系统选择器；资料、设置和交接都不写入长期存储；没有真实AI会话、newSession/subscribe调用或资料发送；截图使用合成内容。电话、真实目录能力、宿主会话契约、DSH Desktop 实机安装/退出重开/点击均未验证。医学内容待神经科/急救专业人员审核。

## 用户签认

待用户对上述确切 HTML SHA-256 与模块范围作出确认。确认仅授权其列明范围进入 M3/M4/M5 实现，不等同临床审核或 Desktop 验收；如要求变更则先修改、重算哈希并重新预览，再请用户确认。
