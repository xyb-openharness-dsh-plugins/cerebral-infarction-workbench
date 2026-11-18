# 里程碑证据表（MILESTONE-EVIDENCE）

> 规则（AGENTS.md「证据要求与测试用例」，2026-11-18 定版）：**没有证据，不算完成。**
> 每个里程碑收口时填写一行；DAY-REPORT 的完成结论必须回指本表条目，回指不到的降级为「未验证」。
> 证据只认实测产物：命令原文与关键输出、退出码、数字、探针/截图、提交号。没跑过的不许写；查不到的如实写「未取得/未验证/待核」并列出已查路径。

| 里程碑 | 交付物（文件/提交号） | 验证命令 | 关键输出（原文摘录：数字/退出码） | 未验证项及原因 |
|---|---|---|---|---|
| M0 |  |  |  |  |
| M1 |  |  |  |  |
| M2 |  |  |  |  |
| M3 |  |  |  |  |
| M4 |  |  |  |  |
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
