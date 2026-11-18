# M4 临床/研究数据来源与边界

数据获取日期：2026-11-19。品牌暂定“脑梗死工作台”，待用户追认。只使用公开来源与合成数据；仓库未放入真实患者资料。

## 已取得数据

ClinicalTrials.gov API v2 的公开研究登记元数据快照：`research/clinical-trials/ctgov-ischemic-stroke-2026-11-19.json`。官方 API 入口：<https://clinicaltrials.gov/data-api/api>；单项示例链接由快照中的 `registryUrl` 指向 ClinicalTrials.gov 官方记录页。其官方说明将 API 描述为访问公开研究记录的接口，查询结果应回到各登记页核验；登记记录由研究申办方/研究者提交，不能视为独立的疗效证据。访问日期：2026-11-19。

- 检索式：`query.cond=ischemic stroke`。
- 初次登记窗口：`AREA[StudyFirstPostDate]RANGE[2026-02-19,MAX]`；取最近九个月至访问当天；按 `StudyFirstPostDate:desc` 排序；每页100条，跟随所有 `nextPageToken`。
- 实测API结果：`totalCount=331; returned=331; pages=4; pageSizes=100,100,100,31; uniqueIDs=331`。首次公开登记日范围：`2026-02-19..2026-11-18`。
- 记录类型：`INTERVENTIONAL 239`、`OBSERVATIONAL 91`、`EXPANDED_ACCESS 1`。招募状态：`RECRUITING 131`、`NOT_YET_RECRUITING 152`、`COMPLETED 30`、`ACTIVE_NOT_RECRUITING 9`、`ENROLLING_BY_INVITATION 8`、`AVAILABLE 1`。
- 快照仅留登记编号、标题、类型、状态、阶段、条件、日期、官方记录链接和 API 返回记录的规范化 JSON 哈希；未保留原始整包、研究者/招募联系人、资格标准或参与者信息。哈希不是官方签名。
- 这不是“治疗效果”数据，也不是试验质量评价、招募推荐或个体资格判断。API 的条件检索结果存在词义相关范围，未对每条标题作临床相关性筛选，故按“检索命中登记元数据”报告，不宣称331条均为脑梗死干预试验。未制作患者匹配/招募入口。

## 临床解释来源

- 国家卫生健康委《脑血管病防治指南（2024年版）》官方PDF：定义与BEFAST/院前处置背景，原件已打开，访问日2026-11-18。<https://www.nhc.gov.cn/cms-search/downFiles/5683726a96d341dba9aa8090ed2f0734.pdf>
- 《中国急性缺血性卒中诊治指南2023》期刊全文PDF（第三方托管，不是期刊平台文件），页523–559，访问日2026-11-18。<https://health.net.cn/zb_users/upload/2024/11/202411281732759984808416.pdf>
- 《中国卒中学会急性缺血性卒中再灌注治疗指南2024》期刊全文PDF（第三方镜像），页1460–1478，访问日2026-11-18。<https://www.health.net.cn/zb_users/upload/2025/01/202501061736142322225198.pdf>
- AHA/ASA 2026指南仅取得官方“Top Things to Know”摘要入口，完整指南原文未取得；不得据此替代中国规范。链接及访问日期登记于 `docs/DISEASE-PRIMER.md`。

上述临床资料仅支撑解释层的急救优先和时间窗背景，不提供个人溶栓/取栓资格或用药指引，不承诺治疗结果。脑梗死本地临床专业审核尚未完成。

## 未取得/未验证

- 中国临床试验注册中心（ChiCTR）未完成可复现的全量查询/快照；本次检索命中官方个例页面，但不作为总体数量统计。不可将ClinicalTrials.gov数据当作中国登记全量。
- 未取得个体级临床数据、医院卒中中心名单、地方急救调度接口、研究结果汇总数据或真实病历；已查路径为 ClinicalTrials.gov API v2、国家卫健委指南PDF、期刊全文PDF、AHA/ASA指南摘要及 ChiCTR 官方公开页面。
- 快照是2026-11-19一次性检索，不代表当前招募状态；使用前需打开官方登记页复核。
