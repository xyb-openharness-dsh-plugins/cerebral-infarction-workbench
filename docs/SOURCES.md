# 来源与证据使用规则

官方运行合同以官网当前版为准；目标环境能力以实际接口、类型、帮助和界面验证为准。已确认需求与原型是业务合同。项目实践用于提炼方法，不替代当前代码或实机证据。

## 官方资料

- O01：[开发规范快照](../reference/official/development-2026-10-09.md)，2026-10-09 版，采集于 2026-10-15。
- O02：历史本地官方规范副本，用于识别版本差异；不以其覆盖新版合同。
- O03：[市场验收规范快照](../reference/official/market-acceptance-2026-09-29.md)，仅在选择市场投稿时适用。

联网时核对官网更新。快照来源 URL 与 SHA-256 见 [来源清单](../reference/sources.json)。官方原文保留，不因社区教程改写而修改。

## 项目实践资料

来源包括需求与高精度原型、功能清单、数据设计、宿主适配、Agent 输入输出合同、部署日志、修复 diff 与验收记录。对外文档按问题和方法组织，省略原项目名称、本机路径和业务版本演进。来源清单保留资料编号、指纹与采样状态；没有附带原资料的记录不构成可公开复现的证明。

设计意图、工作区变更、已提交代码、历史用户反馈和当前测试结果应分别陈述。未重复执行的旧验收不能标为本次通过。具体缺陷与排查方法统一见 [开发典型错误和修复经验](LESSONS.md)。

## 第三方设计资源

U01：[hhx465453939/agent-taste-seed-system](https://github.com/hhx465453939/agent-taste-seed-system)，核对于 2026-10-16，提交 f447763a8e106effb2a4c8fdc5fd93cbb2ca2045。脚手架引用其方法，不随包复制原种子库或艺术素材。路径差异与适配见 [Taste Seed 指南](08-TASTE-SEED.md)。开发工具的本机安装状态不等于脚手架已捆绑该资源。

官方规范、第三方资源和品牌素材保留真实署名与许可说明；它们与教程中的匿名业务案例用途不同。

## M1 脑梗死桌面研究来源（访问 2026-11-18）

| 来源 | 类型/原件 | 用途与范围 | 状态 |
|---|---|---|---|
| 国家卫生健康委办公厅《脑血管病防治指南（2024年版）》<https://www.nhc.gov.cn/cms-search/downFiles/5683726a96d341dba9aa8090ed2f0734.pdf> | 官方 PDF 原件；通知 2024-12-10 | 脑梗死定义、中风120/BEFAST、院前流程 | 已打开原件；适用临床条款须专业复核 |
| AHA/ASA 2026 AIS guideline top things to know <https://professional.heart.org/en/science-news/2026-guideline-for-the-early-management-of-patients-with-acute-ischemic-stroke/top-things-to-know> | 官方摘要页；完整期刊指南原件未取得 | 国际治疗窗口更新/当地院前系统差异背景 | 已打开；非中国路径，不能移植适应证 |
| American Stroke Association Stroke Symptoms <https://www.stroke.org/en/about-stroke/stroke-symptoms> | 官方患者教育页面 | BEFAST、突发症状与急救呼叫 | 已打开；911属美国号码，不用于中国部署 |
| Wang PY et al. “Hesitating and Puzzling”: The Experiences and Decision Process of Acute Ischemic Stroke Patients with Prehospital Delay after the Onset of Symptoms. *Healthcare*. 2021;9(8):1061. doi:10.3390/healthcare9081061. <https://pmc.ncbi.nlm.nih.gov/articles/PMC8391298/> | 公开全文/台湾地区24名延迟到院患者定性访谈 | 犹豫、自我解释、先自处/附近就诊、症状加重后求助等体验线索 | 已打开全文；样本有限、非大陆代表性 |
| “Patients' and carers' experiences of gaining access to acute stroke care: a qualitative study.” PubMed <https://pubmed.ncbi.nlm.nih.gov/23184920/> | 摘要记录；全文未取得 | 后续患者/照护者研究线索 | 仅摘要层，未用其作详细需求结论 |
| NHC 2024-09-22 新闻发布会记录 <https://www.nhc.gov.cn/xcs/c100122/202409/091e0e2947bb410d95fe2d45933afa7b.shtml> | 官方新闻稿页面 | 后续待核语境 | 浏览器访问返回 HTTP 412，内容未取得，未引用具体说法 |

非临床决策数据：地方120规则、各地区卒中中心名录/实时能力、临床试验登记数据包尚未取得。
