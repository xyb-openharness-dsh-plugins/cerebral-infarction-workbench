# 数据模型候选（M1/M3待冻结）

状态：M1候选设计，不是生产schema；M3须在原型签认后冻结。只用合成数据，不入真实患者数据。

## 原则

区分主体、来源/证据、用户录入事实、急症临时工作流、资料目录与读模型。时间值必须能表达来源、未知、估计、时区；不能把“最后正常”和“症状发现”混为一列。症状自述不代表诊断；急症临时卡可在本地不持久保存。

## 候选实体

- `person_profile`：本人标识与可选显示名；本地稳定随机ID；不以姓名/身份证为主键。
- `care_relationship`：陪护者与本人关系、是否被授权访问长期档案；与临时急救代填分开。
- `acute_event`：疑似事件、首次异常观察、最后正常时间、记录主体、状态及来源标记；未知/估计/精确分开。
- `symptom_observation`：症状类别、发生/观察时间、观察者、原文；不派生诊断或排除结论。
- `handoff_snapshot`：由特定事件和确认过的字段生成的可导出临时快照；版本化生成时间，不回写原始事实。
- `clinical_document`：资料索引、原文件路径/校验摘要、来源机构/上传者、日期、文档类型、验证状态；原件不入仓。
- `care_question`：患者/家属自拟问题、来源事件/资料引用、状态与更正历史。

## 字段与约束候选

所有患者/照护者录入的临床内容带 `assertion_status`（self_reported / caregiver_reported / copied_from_document / clinician_confirmed / unknown）；默认不得提升到 clinician_confirmed。时间包含 `value`, `precision`, `timezone`, `source_id`; 缺失必须保留 unknown，不能填0。实体用 stable ID + revision；编辑/删除写审计事件或可追溯修订，不覆盖来源原文。医学抽取值另存候选，不自动晋升为事实。

## 演进矩阵

| 变化 | 稳定事实/关系 | 预计变化层 | 兼容策略 |
|---|---|---|---|
| 首页入口/导航改变 | acute_event、source不变 | UI read model | 迁移无关 |
| 增加症状字段 | observation类型/定义版本 | 定义目录/API版本 | 旧记录缺值解释为unknown，不回填阴性 |
| 急症流程新增跳过/重开 | 工作流实例状态，不改观察事实 | workflow definition/version | 流程版本升级，保留旧快照 |
| 来源文档更正 | 原件与新revision并存 | evidence/revision | 使摘要和缓存失效并重建 |
| 患者切换/照护授权撤销 | person/relationship权限 | projection/cache | 清除旧主体投影，保留患者原始资料 |

迁移、索引、备份、并发冲突与性能尚未实测；此版不冻结。

急性事件的 `observed_signs` 可包含用户/目击者描述的 FAST/BEFAST 相关观察（面部、手臂、言语、平衡、视力等），但这些字段仅表示观察到/未观察到/未知，不能产生“脑梗死/脑出血”诊断或排除状态。
