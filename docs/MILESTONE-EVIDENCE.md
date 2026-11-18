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

### M1（2026-11-18）

- **交付物**：`docs/USER-RESEARCH.md`、`docs/SCENARIOS.md`、`docs/FEATURE-INVENTORY.csv`、`docs/CORE-MODULES.md`、`docs/FEATURE-REVIEW.md`、`docs/INTERACTION-DESIGN.md`、`docs/UI-DESIGN.md`、`docs/ACCEPTANCE.md`、`docs/SCHEMA.md`（候选）、`docs/HVT-REVIEW.md`、`docs/DESIGNER-BRIEF.md`、`docs/DESIGN-SESSION.md`、`docs/DESIGN-REVIEW.md`、`docs/PHASE-PLAN.md`、`docs/SOURCES.md`、M1主提交及本证据提交（由后续git log可核）。G1标记“自动签认，待晨审追认”。
- **验证/研究命令**：本次实际打开国家卫健委《脑血管病防治指南（2024年版）》官方PDF（浏览器行60–100）、AHA/ASA 2026指南要点（行35–48）、ASA症状页（行15–43、111–143）、Wang et al 2021患者访谈全文（行108–143及251–310）；`python3 skills/hvt-requirement-review/scripts/hvt_scan.py --project . --terms /tmp/cerebral-infarction-hvt-terms.json --out /tmp/cerebral-infarction-hvt-scan.md --json /tmp/cerebral-infarction-hvt-scan.json`。
- **关键输出**：HVT扫描输出 `扫描文档：83 份`；`S2 ... S=1 M=1 F=1 I=1 A=1 C=5`；`S1 ... S=1 M=1 F=1 I=1 A=1 C=5`；`有命中但 C≤2 ... 0 个`；`五层齐全 ... 2 个`。扫描为启发式初值，实际逐文档复核定位在 HVT-REVIEW §2，不能将术语命中本身等同覆盖。浏览器来源事实：NHC指南发布日期 `2024年12月10日`；其原文列BEFAST与立即拨120；访谈纳入 `24` 名延迟就医患者。
- **未验证/局限**：无真实患者/照护者访谈；无神经科/急救临床审核；AHA完整指南原件、NHC地方服务规则、卒中中心数据、登记试验包未取得；AI独立review未完成；M2原型和用户确认尚未做。设计自动G1签认依据用户任务明确授权，标注待晨审追认。
