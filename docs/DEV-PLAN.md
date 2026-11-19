# 开发计划与状态

| 阶段 | 交付物 | 状态/证据 |
|---|---|---|
| M0 | 骨架与文档九件 | 完成；`docs/MILESTONE-EVIDENCE.md` M0 |
| M1 | 三路研究、场景与自动G1签认（待晨审追认） | 完成；M1证据 |
| M2 | 交互原型、浏览器预览与用户签认 | 完成；哈希与签认见M2证据及`PROTOTYPE-REVIEW.md` |
| M3 | schema v1冻结 | 完成；M3证据 |
| M4 | 公开登记与合成测试资料 | 完成；M4证据 |
| M5 | 服务/API与已签认页面 | 完成本地代码；M5证据，Desktop未验证 |
| M6 | build、包清单、tarball与可行profile验证 | build/pack已验证；Desktop未安装，profile未验证 |
| M7 | 发布说明草稿 | 完成；`docs/release-draft/M7-RELEASE-NOTES.md`，未发布 |
| M8 | 市场材料草稿 | 完成；`docs/release-draft/M8-MARKET-COPY.md`，不含可投稿YAML，不投稿 |
| M9 | 五项门禁、最多2项真实场景测试、版本0.2.0和报告 | 本地收口；证据见`docs/MILESTONE-EVIDENCE.md §M9`与根目录`DAY-REPORT.md`，Desktop实机未验证 |

M0–M9代码与文档里程碑已收口；M9五项门禁通过。DSH Desktop安装必须以`node scripts/check-install.mjs`识别的活动profile为准；本机未发现目标app，安装/重启/UI走查仍标未验证。
