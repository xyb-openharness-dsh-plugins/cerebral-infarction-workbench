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
| M7 | 发布说明草稿 | 待做；只备草稿 |
| M8 | 市场材料草稿 | 待做；只备草稿，不投稿 |
| M9 | 五项门禁、最多2项真实场景测试、版本0.2.0和报告 | 待做；当前audit有失败，未收口 |

当前顺序：先解决M6发现的架构与静态审计差异，再完成M6证据提交；之后依次M7–M9。Desktop安装必须以`node scripts/check-install.mjs`识别的DSH Desktop活动profile为准；没有该环境则如实标未验证。
