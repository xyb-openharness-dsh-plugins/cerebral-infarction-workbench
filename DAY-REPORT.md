# 脑梗死工作台 M0–M9 收尾报告

日期：2026-11-19

仓库：`xyb-openharness-dsh-plugins/cerebral-infarction-workbench`

版本：`0.2.0`

暂定品牌：**脑梗死工作台（暂定名，待用户追认）**

## 里程碑状态

| 里程碑 | 状态 | 证据/交付 |
|---|---|---|
| M0 | 完成；初始化时骨架 `npm run check` 曾按原文失败，后续目录实现及M9全套检查已通过 | `docs/MILESTONE-EVIDENCE.md` §M0、§M5、§M9 |
| M1 | 完成；G1为“自动签认 · 待晨审追认” | `docs/MILESTONE-EVIDENCE.md` §M1 |
| M2 | 完成；用户于2026-11-19 07:44 CST确认指定SHA-256和一期范围 | `docs/PROTOTYPE-REVIEW.md`、证据表§M2 |
| M3 | schema v1冻结并扩展v2迁移，完成 | 证据表§M3 |
| M4 | 公开登记元数据与合成测试档案，完成 | 证据表§M4、`docs/CLINICAL-DATA.md` |
| M5 | 服务/API与已签认页面本地实现完成 | 证据表§M5 |
| M6 | 构建、打包本地验证完成；Desktop profile未验证 | 证据表§M6、§M9 |
| M7 | 仅发布说明草稿；未发布 | `docs/release-draft/M7-RELEASE-NOTES.md`、证据表§M7 |
| M8 | 仅市场介绍草稿；未投稿 | `docs/release-draft/M8-MARKET-COPY.md`、证据表§M8 |
| M9 | 本地代码/包门禁完成，版本0.2.0；两个场景实测一致 | `docs/MILESTONE-EVIDENCE.md` §M9、`docs/TEST-CASES.md` |

M2签认原型SHA-256：`26b237db5774b795d105832aef5ae8750899349bf1b176c60f8ddd7e75ded026`。一期确认范围为EMR-01/02、EMR-03、REC-01、SET-01、PRIMER-01、AGENT-01。G1仍待晨审追认。M2原型未被修改；M9兼容镜像不构成新签认。

## M9门禁与测试结论

- `npm run check`：退出码0；8个测试通过，schema、公开研究数据、目录安全、患者创建、文案等检查通过。
- `npm test`：退出码0；8通过、0失败。
- `npm run audit`：退出码0；40/40通过、0失败、0待人工。
- `dsh-wb-cli audit <项目目录>`：退出码0；40/40通过、0失败、0待人工。
- `node scripts/check-agent-pane-contract.mjs .`：退出码0；`pass=true`、`fails=[]`。该项为静态契约验证，不代表真实宿主交互。
- `npm pack --dry-run`与`npm pack --pack-destination /tmp`：退出码0；32个文件，包版本0.2.0。tarball SHA-256：`3ca5f8e1069e2d7f452b30ec66b895fa8f745c0b203d408600cfb0b94adec91c`。未发布。
- `docs/TEST-CASES.md`：两个高价值场景均判定一致。用例1确认疑似症状呼救优先、时间可未知、摘要注明未经核实；用例2确认合成档案、急症交接、资料索引和私密问题通过本地服务闭环。目录picker以API/同源消息模拟，非Desktop实测。

命令原文、关键输出、截图与包哈希详见`docs/MILESTONE-EVIDENCE.md` §M9。没有真实患者资料入仓；医学资料来自公开来源并标访问日期；产品不做诊断、疗效承诺或用药建议。

## 未验证项与待决定事项

本机检查结果为`✗ 这台机器上没有找到 DSH Desktop（io.dsh.desktop）。`，因此目标profile安装、退出重开、桌面列表打开、真实目录picker、真实`newSession`/`subscribe`运行和业务点击均**未验证**。电话系统拨号未验证；医学内容未由临床专业人员审核。测试采用本地HTTP/Chromium宿主stub和合成资料。

**阻塞分类：② 人工决定类。**

1. 需要在装有并启动DSH Desktop的机器上完成profile安装、重启和真实宿主交互走查；当前环境没有该应用。
2. 需要具备资质的临床审核者审阅医学内容。
3. 品牌正式名称待用户追认；G1自动签认待晨审追认。

M9本地实现和五项门禁已完成，不存在未做完的仓内代码门禁。未创建Release或tag，未修改组织BACKLOG。M7/M8仅留草稿。
