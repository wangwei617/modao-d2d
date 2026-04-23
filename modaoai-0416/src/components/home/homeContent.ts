export interface HomeCaseItem {
  id: string;
  tabId: string;
  tag: string;
  title: string;
  subtitle: string;
  cardTitle: string;
  badge: string;
  image: string;
  accent: 'indigo' | 'emerald' | 'orange' | 'blue' | 'pink' | 'violet' | 'cyan' | 'amber' | 'teal';
  featured?: boolean;
}

export interface PromptSuggestionItem {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  /** 热门混排时标记来源二级，用于卡片角标 */
  sourceTag?: string;
}

const TAG_PROMPT_SUGGESTIONS: Record<string, PromptSuggestionItem[]> = {
  'AI生成原型': [
    { id: 'prototype-crm', title: 'CRM 销售原型', subtitle: '线索 / 商机 / 跟进记录', prompt: '生成一个 CRM 销售管理原型，包含客户列表、商机详情、跟进记录、销售漏斗和权限控制页面。' },
    { id: 'prototype-oa', title: '协同办公平台', subtitle: '工作台 / 审批 / 通知', prompt: '做一个企业协同办公平台原型，包含工作台、审批流、消息通知、日程和个人中心页面。' },
    { id: 'prototype-service', title: '客户服务系统', subtitle: '工单 / 会话 / 知识库', prompt: '设计一个客户服务系统原型，覆盖工单流转、会话处理、知识库查询、质检和报表模块。' },
    { id: 'prototype-recruiting', title: '招聘管理后台', subtitle: '职位 / 候选人 / 面试流程', prompt: '生成一个招聘管理平台原型，包含职位发布、候选人管理、面试流程、评价记录和数据概览。' },
    { id: 'prototype-education', title: '教育服务平台', subtitle: '课程 / 班级 / 学员', prompt: '做一个教育服务平台原型，包含课程管理、班级列表、学员详情、学习进度和消息通知。' },
    { id: 'prototype-supplychain', title: '供应链协同系统', subtitle: '采购 / 库存 / 对账', prompt: '生成一个供应链协同系统原型，覆盖采购单、库存预警、供应商管理、对账和分析看板。' },
  ],
  '原型概念图': [
    { id: 'concept-ai-workbench', title: 'AI 工作台概念图', subtitle: '模块灵感 / 未来感布局', prompt: '围绕 AI 工作台做一版概念原型图，突出模块组合、智能推荐和未来感信息层级。' },
    { id: 'concept-healthcare', title: '医疗服务概念图', subtitle: '场景串联 / 服务闭环', prompt: '帮我快速产出一版医疗服务平台概念原型，重点表现用户流程、服务节点和页面氛围。' },
    { id: 'concept-retail', title: '零售经营概念图', subtitle: '经营驾驶舱 / 门店协同', prompt: '生成一版零售经营平台概念原型图，展示总部驾驶舱、门店巡检和运营协同的核心模块。' },
    { id: 'concept-finance', title: '金融产品概念图', subtitle: '风险 / 审批 / 看板', prompt: '做一版金融业务系统概念原型图，用于内部脑暴，强调风控审批、业务流和数据看板。' },
    { id: 'concept-logistics', title: '物流平台概念图', subtitle: '运输 / 轨迹 / 告警', prompt: '输出一版物流调度平台概念原型，快速呈现调度中心、车辆轨迹、异常告警和协同关系。' },
    { id: 'concept-marketing', title: '营销增长概念图', subtitle: '投放 / 线索 / 转化', prompt: '围绕营销增长平台生成概念原型图，突出投放监控、线索管理和转化分析。' },
  ],
  '可视化大屏': [
    { id: 'dashboard-hospital', title: '智慧医院大屏', subtitle: '床位 / 手术 / 能耗告警', prompt: '设计一个智慧医院运营大屏，包含床位使用率、手术量趋势、能耗数据和病区告警，深色主题，多分区布局。' },
    { id: 'dashboard-commerce', title: '电商经营看板', subtitle: 'GMV / 转化 / 库存预警', prompt: '生成一个电商实时经营看板，展示 GMV、支付转化、渠道来源、库存预警和订单地图，适合大屏轮播。' },
    { id: 'dashboard-factory', title: '工厂生产监控', subtitle: '设备 / 节拍 / 良率', prompt: '设计一个工厂生产监控大屏，包含设备运行状态、产线节拍、良品率、异常告警和班次统计。' },
    { id: 'dashboard-city', title: '城市指挥中心', subtitle: '交通 / 事件 / 气象热力', prompt: '做一个城市运行指挥大屏，展示交通流量、重点事件、气象预警和区域热力图，信息密度高一点。' },
    { id: 'dashboard-energy', title: '新能源驾驶舱', subtitle: '发电 / 储能 / 故障趋势', prompt: '生成一个新能源运营驾驶舱，含发电量、储能状态、站点分布、故障告警和趋势分析模块。' },
    { id: 'dashboard-group', title: '集团经营总览', subtitle: 'KPI / 趋势 / 业务明细', prompt: '帮我做一个集团经营总览大屏，分为顶部 KPI、中部趋势图和底部业务明细，支持多层级导航。' },
  ],
  'App/小程序': [
    { id: 'app-grocery', title: '生鲜电商小程序', subtitle: '首页 / 商详 / 购物车', prompt: '做一个生鲜电商小程序原型，包含首页、分类、商详、购物车、结算和个人中心，多页联动。' },
    { id: 'app-telehealth', title: '在线问诊 App', subtitle: '挂号 / 问诊 / 处方', prompt: '生成一个在线问诊 App 原型，覆盖挂号、候诊、图文咨询、视频问诊、处方和订单页面。' },
    { id: 'app-local', title: '本地生活服务', subtitle: '团购 / 商家 / 下单评价', prompt: '设计一个本地生活服务小程序，包含团购、商家详情、下单支付、评价和会员权益页面。' },
    { id: 'app-social', title: '兴趣社区 App', subtitle: '推荐流 / 话题 / 消息', prompt: '做一个社交兴趣社区 App 原型，包含推荐流、话题详情、发布页、消息和个人主页。' },
    { id: 'app-saas', title: '移动工作台', subtitle: '任务 / 审批 / 数据概览', prompt: '生成一个 SaaS 移动端工作台原型，包含任务列表、审批中心、消息提醒和数据概览。' },
    { id: 'app-edu', title: '教育小程序', subtitle: '课程 / 学习进度 / 直播', prompt: '设计一个教育类小程序原型，包含课程首页、详情、学习进度、直播间和打卡页面。' },
  ],
  'B端管理后台': [
    { id: 'admin-crm', title: 'CRM 销售后台', subtitle: '客户 / 商机 / 漏斗', prompt: '做一个 CRM 后台原型，包含客户列表、商机跟进、销售漏斗、权限角色和数据导出页面。' },
    { id: 'admin-erp', title: 'ERP 管理后台', subtitle: '采购 / 库存 / 财务审批', prompt: '生成一个 ERP 管理后台，包含采购、库存、订单、财务汇总和审批流，信息结构清晰一点。' },
    { id: 'admin-ticket', title: '工单系统后台', subtitle: '工单池 / SLA / 操作记录', prompt: '设计一个工单系统后台，包含工单池、指派、状态流转、操作记录和 SLA 统计页面。' },
    { id: 'admin-ops', title: '运营配置后台', subtitle: '审核 / 标签 / 活动配置', prompt: '做一个运营后台原型，包含内容审核、用户标签、活动配置、数据报表和消息模板管理。' },
    { id: 'admin-table', title: '复杂表格后台', subtitle: '筛选 / 抽屉 / 批量操作', prompt: '生成一个 B 端管理系统，重点展示复杂表格、筛选、批量操作、详情抽屉和权限配置。' },
    { id: 'admin-support', title: '客服管理后台', subtitle: '会话 / 质检 / 排班绩效', prompt: '设计一个客服管理后台，包含会话监控、知识库、质检评分、排班和绩效报表页面。' },
  ],
  '图片转原型': [
    { id: 'image-prototype-sketch', title: '草图转交互原型', subtitle: '手绘 / 线框 / 页面结构', prompt: '我会上传一张手绘草图，请识别页面结构、组件层级和跳转关系，生成一版可交互 HTML 原型。' },
    { id: 'image-prototype-mobile', title: '截图转 App 原型', subtitle: '页面还原 / 底部导航 / 交互', prompt: '根据上传的移动端截图，帮我提取页面布局和组件信息，生成一版可点击的 App 原型。' },
    { id: 'image-prototype-dashboard', title: '看板图转大屏原型', subtitle: '模块拆解 / 图表占位 / 信息层级', prompt: '上传一张数据看板图片，帮我拆解成各个模块并生成可交互的大屏原型，保留主信息层级。' },
    { id: 'image-prototype-web', title: '网页截图转原型', subtitle: '区块识别 / 样式接近 / 可走查', prompt: '把这张网页截图转换成可走查的 HTML 原型，识别头图、内容区块、按钮和表单结构。' },
    { id: 'image-prototype-flow', title: '流程草图转页面', subtitle: '节点说明 / 页面映射 / 状态补全', prompt: '我会上传一张流程草图，请结合节点关系补全页面状态，并输出对应的产品原型。' },
    { id: 'image-prototype-wireframe', title: '低保真线框补全', subtitle: '布局优化 / 缺失状态 / 组件规范', prompt: '根据低保真线框图生成一版更完整的产品原型，补齐空状态、弹窗和按钮交互。' },
  ],
  'HTML转原型': [
    { id: 'html-import-site', title: '官网 HTML 导入', subtitle: '静态页面 / 区块还原', prompt: '我会提供一个官网 HTML 文件，请提取页面结构和内容模块，转换成可走查的产品原型。' },
    { id: 'html-import-admin', title: '后台页面转原型', subtitle: '表格 / 筛选 / 抽屉', prompt: '把这份后台 HTML 转成墨刀原型，保留表格、筛选、详情抽屉和主要交互状态。' },
    { id: 'html-import-campaign', title: '活动页转原型', subtitle: '主视觉 / 表单 / CTA', prompt: '根据活动页 HTML 还原为原型页面，识别主视觉、表单区、CTA 和转化路径。' },
    { id: 'html-import-mobile', title: 'H5 页面迁移', subtitle: '移动布局 / 组件映射', prompt: '上传一个 H5 页面的 HTML，帮我映射为移动端原型，保留导航、模块层级和关键状态。' },
    { id: 'html-import-portal', title: '门户页结构整理', subtitle: '内容区块 / 层级优化', prompt: '将现有门户站 HTML 梳理为更适合评审的原型，优化区块层级和组件拆分。' },
    { id: 'html-import-docs', title: '说明页转原型', subtitle: '文档 / 步骤 / 空状态', prompt: '把导入说明类 HTML 页面转成可评审原型，补齐步骤说明、帮助信息和空状态。' },
  ],
  '素材转原型': [
    { id: 'community-saas', title: 'SaaS 模板迁移', subtitle: '组件复用 / 页面补齐', prompt: '参考社区里的 SaaS 模板素材，帮我扩展成完整原型，补齐概览、列表、详情和设置页面。' },
    { id: 'community-ecommerce', title: '电商素材延展', subtitle: '首页 / 商详 / 交易流', prompt: '基于社区电商素材生成一套可编辑原型，包含首页、分类、商详、购物车和订单流程。' },
    { id: 'community-dashboard', title: '大屏素材重组', subtitle: '模块拼接 / 信息优化', prompt: '结合社区大屏素材，快速重组一版经营驾驶舱原型，优化信息层级和图表布局。' },
    { id: 'community-admin', title: '后台素材复用', subtitle: '表格 / 权限 / 配置', prompt: '用社区后台素材做一套管理系统原型，重点补齐权限配置、复杂列表和详情面板。' },
    { id: 'community-app', title: '移动素材套用', subtitle: '导航 / 列表 / 详情', prompt: '参考社区移动端素材，产出一套完整 App 原型，覆盖首页、列表、详情、消息和个人中心。' },
    { id: 'community-brand', title: '品牌官网素材延展', subtitle: '头图 / 亮点 / 联系方式', prompt: '使用社区官网素材快速生成品牌官网原型，扩展头图、核心卖点、案例和联系方式模块。' },
  ],
  '界面规范评审': [
    { id: 'review-design-system', title: '设计系统走查', subtitle: '颜色 / 字体 / 间距', prompt: '请对这套界面进行规范评审，检查颜色、字体、间距、按钮和表单控件的一致性。' },
    { id: 'review-backoffice', title: '后台界面评审', subtitle: '表格 / 导航 / 状态', prompt: '帮我评审一个后台系统界面，重点看导航层级、表格规范、状态表达和操作一致性。' },
    { id: 'review-mobile', title: '移动端规范检查', subtitle: '栅格 / 触控 / 底部导航', prompt: '对移动端界面做一次规范检查，关注栅格、触控热区、底部导航和页面层级。' },
    { id: 'review-component', title: '组件一致性评审', subtitle: '按钮 / 弹窗 / 表单', prompt: '检查当前设计稿里的组件规范是否统一，输出按钮、弹窗、表单和提示反馈的评审结论。' },
    { id: 'review-brand', title: '品牌页面规范评审', subtitle: '视觉 / 文案 / CTA', prompt: '评审一版品牌官网原型，检查视觉统一性、文案层级和 CTA 的表达是否清晰。' },
    { id: 'review-report', title: '输出评审报告', subtitle: '问题清单 / 优先级 / 建议', prompt: '根据上传的界面截图输出一份规范评审报告，按严重程度整理问题清单和修改建议。' },
  ],
  '参考图复刻原型': [
    { id: 'recreate-admin', title: '后台截图复刻', subtitle: '保留布局和模块层级', prompt: '参考一张已有后台截图，帮我高保真复刻成可点击原型，保留原布局和模块层级。' },
    { id: 'recreate-mobile', title: '移动页面复刻', subtitle: '结构和组件尽量一致', prompt: '根据一张移动端页面截图，做一版视觉和结构都尽量一致的 App 原型，还原组件细节。' },
    { id: 'recreate-homepage', title: '竞品首页迁移', subtitle: '版式 / 层级 / 氛围贴近', prompt: '按某个竞品官网首页的风格做一版复刻原型，要求版式、层级和氛围都接近原稿。' },
    { id: 'recreate-figma', title: 'Figma 页面还原', subtitle: '导出图转可点击原型', prompt: '我会上传一个 Figma 导出的页面截图，请帮我复刻成可交互 HTML 原型。' },
    { id: 'recreate-campaign', title: '活动页高保真复刻', subtitle: '主视觉 / 卡片 / CTA', prompt: '参考一个营销活动页截图，复刻主视觉、卡片模块和 CTA 区域，整体要还原得更完整。' },
    { id: 'recreate-migration', title: '现有产品改版迁移', subtitle: '保留架构，统一风格', prompt: '按现有产品页面截图做一次界面迁移，保留信息架构，但风格更统一、更现代。' },
  ],
  '单页网页原型': [
    { id: 'web-saas', title: 'SaaS 官网首页', subtitle: '头图 / 亮点 / 价格 CTA', prompt: '做一个 SaaS 官网首页原型，包含头图、功能亮点、客户案例、价格方案和底部 CTA。' },
    { id: 'web-campaign', title: '活动落地页', subtitle: '主视觉 / 流程 / 报名', prompt: '生成一个活动落地页原型，包含主视觉、福利说明、流程介绍、FAQ 和报名按钮。' },
    { id: 'web-product', title: '产品说明页', subtitle: '介绍 / 对比 / 常见问题', prompt: '设计一个产品说明页原型，突出功能介绍、对比优势、使用流程和常见问题。' },
    { id: 'web-brand', title: '品牌宣传页', subtitle: '品牌故事 / 场景 / 联系方式', prompt: '做一个品牌宣传单页，包含品牌故事、核心产品、场景展示和联系方式。' },
    { id: 'web-jobs', title: '招聘官网单页', subtitle: '团队 / 岗位 / 投递入口', prompt: '生成一个招聘官网单页，包含团队介绍、岗位列表、公司文化和投递入口。' },
    { id: 'web-guide', title: '导入说明页', subtitle: '步骤 / 注意事项 / 示例', prompt: '设计一个导入说明页原型，用于展示操作步骤、注意事项和示例截图。' },
  ],
  '单页组件原型': [
    { id: 'widget-login', title: '登录注册页', subtitle: '手机号 / 验证码 / 找回密码', prompt: '做一个登录注册页原型，包含手机号登录、验证码输入、第三方登录和找回密码。' },
    { id: 'widget-form', title: '配置表单', subtitle: '分组字段 / 校验 / 联动', prompt: '生成一个配置表单原型，包含多分组字段、校验提示、联动选项和提交反馈。' },
    { id: 'widget-payment', title: '支付确认组件', subtitle: '弹层 / 订单摘要 / CTA', prompt: '设计一个支付确认弹层和订单摘要组件，适合嵌入商城或服务类页面。' },
    { id: 'widget-import', title: '数据导入向导', subtitle: '上传 / 映射 / 校验结果', prompt: '做一个数据导入向导原型，包含上传、字段映射、校验结果和导入完成页面。' },
    { id: 'widget-pomodoro', title: '番茄钟工具', subtitle: '计时 / 任务 / 设置面板', prompt: '生成一个番茄钟小工具原型，包含计时、任务切换、统计和设置面板。' },
    { id: 'widget-drawer', title: '详情抽屉组件', subtitle: '记录 / 审批流 / 关联数据', prompt: '设计一个后台详情抽屉组件，包含信息区、操作记录、审批流和关联数据。' },
  ],
  '需求文档PRD': [
    { id: 'prd-telehealth', title: '在线问诊 PRD', subtitle: '角色 / 流程 / 合规要求', prompt: '帮我写一份在线问诊 App 的 PRD，包含用户角色、核心流程、异常流程、消息通知和合规要求。' },
    { id: 'prd-kb', title: '企业知识库 PRD', subtitle: '目标用户 / 模块 / 规划', prompt: '生成一个企业知识库产品的 PRD，覆盖目标用户、功能模块、信息架构和版本规划。' },
    { id: 'prd-coupon', title: '优惠券系统文档', subtitle: '发券 / 核销 / 后台指标', prompt: '写一份电商优惠券系统的需求文档，包括发券规则、核销流程、后台配置和数据指标。' },
    { id: 'prd-qc', title: '客服质检平台', subtitle: '评分规则 / 权限 / 报表', prompt: '帮我整理一个客服质检平台的 PRD，包含业务目标、角色权限、评分规则和报表需求。' },
    { id: 'prd-review', title: '内容审核后台', subtitle: '审核 / 标签 / 异常边界', prompt: '生成一个内容审核后台的 PRD，覆盖审核流程、标签策略、异常处理和权限边界。' },
    { id: 'prd-collab', title: '项目协同工具', subtitle: '任务 / 评论 / 提醒机制', prompt: '写一份项目协同工具的需求文档，包含任务流转、评论协作、提醒机制和验收标准。' },
  ],
  '视觉物料生图': [
    { id: 'image-kv', title: '科技主视觉', subtitle: 'AI 感 / 蓝青渐变 / 官网头图', prompt: '生成一张科技感产品主视觉，突出 AI 与速度感，蓝青渐变，适合官网头图。' },
    { id: 'image-banner', title: '电商促销 Banner', subtitle: '春季上新 / 轮播物料', prompt: '做一组电商促销 Banner，主题是春季上新，画面明亮、商品感强，适合首页轮播。' },
    { id: 'image-poster', title: '活动海报', subtitle: '报名信息 / 线下展会', prompt: '生成一张品牌活动海报，突出报名信息、时间地点和视觉冲击力，适合线下展会。' },
    { id: 'image-kv-launch', title: '发布会 KV', subtitle: '未来感 / 留白 / 大标题', prompt: '设计一版发布会 KV，强调未来感和空间感，保留大面积标题留白。' },
    { id: 'image-logo', title: '品牌 Logo 套系', subtitle: '简洁现代 / 可延展', prompt: '为一个咖啡品牌生成 Logo 和延展视觉，简洁现代，适合外卖和包装场景。' },
    { id: 'image-social', title: '社媒宣传物料', subtitle: '方图 / 横版 / 新品推广', prompt: '生成一组社交媒体宣传物料，包含方图和横版，风格统一，适合新品推广。' },
  ],
  '生成HTML格式': [
    { id: 'ppt-html-pitch', title: '融资路演 HTML 稿', subtitle: '章节结构 + 可嵌入关键页', prompt: '生成可在线演示的融资路演 HTML 幻灯片：分章节页面、关键数据与图表位、每页一句讲稿提示，便于内嵌到网页。' },
    { id: 'ppt-html-q', title: '季度汇报网页版', subtitle: '指标区 / 项目 / 下阶段', prompt: '做一套季度经营汇报用的 HTML 幻灯片，每页一主题，带标题层级与留白，可导出为静态页分享。' },
    { id: 'ppt-html-training', title: '培训课 HTML 课件', subtitle: '案例页 / 小结 / 作业页', prompt: '生成培训用 HTML 演示稿，包含目录、分节、案例与小结页，样式统一，方便浏览器全屏播放。' },
    { id: 'ppt-html-launch', title: '发布会 HTML 大纲页', subtitle: '痛点 / 演示 / 价格 CTA', prompt: '写一版新品发布用 HTML 幻灯片结构，每页有主标题、要点与配图占位，突出卖点与 CTA 页。' },
    { id: 'ppt-html-review', title: '复盘汇报网页幻灯片', subtitle: '渠道 / 问题 / 动作项', prompt: '生成市场复盘用 HTML 演示，按渠道/效果/问题/下步行动分屏，可打印或发链接评审。' },
    { id: 'ppt-html-summary', title: '项目总结 HTML 集', subtitle: '背景 / 数据 / 沉淀', prompt: '做项目总结用多页 HTML 演示：目标、里程碑、数据结果与经验沉淀，风格简洁偏汇报风。' },
  ],
  '生成图片格式': [
    { id: 'ppt-img-pitch', title: '路演逐页长图', subtitle: '16:9 横版，适合发群', prompt: '按融资路演故事线生成一套逐页 PPT 配图（长图/分页图均可），每页 16:9，标题与要点字清晰。' },
    { id: 'ppt-img-q', title: '季度汇报配图套系', subtitle: '统一主色与字重', prompt: '为季度经营汇报做一组幻灯片用图片：封面、数据页、问题分析、下阶段计划，风格统一。' },
    { id: 'ppt-img-training', title: '培训讲义图集', subtitle: '大字号 / 可投屏', prompt: '把培训课程拆成多页 16:9 图片，每页一个子主题，适合投屏，关键词加粗。' },
    { id: 'ppt-img-launch', title: '发布会长图分镜', subtitle: '场景图 + 卖点', prompt: '生成发布会用分镜图：用户痛点、产品场景、价格权益，可拼成长图发公众号。' },
    { id: 'ppt-img-review', title: '复盘页图片稿', subtitle: '图表位 + 结论', prompt: '制作市场复盘用图片页：表格/漏斗占位+文字总结，可导出为 PNG 插入文档。' },
    { id: 'ppt-img-summary', title: '结项汇报图版', subtitle: '一页一结论', prompt: '输出项目结项用逐页图片：背景、目标、过程、数据、复盘，每页一结论句。' },
  ],
  '生成PPTX格式': [
    { id: 'ppt-px-pitch', title: '融资路演 PPTX 大纲', subtitle: '市场 / 产品 / 财务预测', prompt: '生成一份可下载的融资路演 PPT 大纲与初稿，包含市场机会、产品方案、商业模式、竞争优势和财务预测。' },
    { id: 'ppt-px-quarterly', title: '季度经营汇报 PPTX', subtitle: '目标 / 项目 / 下阶段计划', prompt: '做一份季度经营汇报 PPTX 初稿，覆盖目标达成、关键项目、问题分析和下阶段计划。' },
    { id: 'ppt-px-training', title: '培训演示稿 PPTX', subtitle: 'AI 设计流程 / 方法 / 案例', prompt: '生成一份培训用 PPT 结构，主题是 AI 产品设计流程，包含案例、方法和注意事项，便于在 Office 里继续改。' },
    { id: 'ppt-px-launch', title: '新品发布会 PPTX 大纲', subtitle: '痛点 / 卖点 / 场景演示', prompt: '写一份新品发布会 PPTX 大纲，突出用户痛点、核心卖点、场景演示和价格策略。' },
    { id: 'ppt-px-review', title: '市场复盘 PPTX 初稿', subtitle: '渠道 / 效果 / 优化建议', prompt: '生成市场复盘 PPTX 初稿，包含渠道表现、投放效果、问题总结和优化建议。' },
    { id: 'ppt-px-summary', title: '项目总结 PPTX 汇报', subtitle: '背景 / 结果 / 经验沉淀', prompt: '做一份项目总结汇报 PPTX，覆盖背景目标、执行过程、结果数据和经验沉淀。' },
  ],
  美化PPT: [
    { id: 'ppt-beau-q', title: '季度汇报整稿优化', subtitle: '目录 / 图表 / 备注', prompt: '我将上传一份季度经营汇报 PPT，请统一字体与配色、对齐版式、优化信息层级，并标注母版可复用处。' },
    { id: 'ppt-beau-sales', title: '销售材料可读性', subtitle: '金句与数据高亮', prompt: '我有一份销售/客户材料 PPT，请强化标题与金句、规范图表样式，让打印与投屏都更清晰。' },
    { id: 'ppt-beau-training', title: '培训课件统一风格', subtitle: '模板 / 转场 / 版心', prompt: '上传内训 PPT 草稿，请套用统一母版、统一正文字级与行距、规范页眉页脚。' },
    { id: 'ppt-beau-brand', title: '品牌规范对齐', subtitle: '色值 / 字体 / Logo 区', prompt: '有品牌色与字体要求，请在我上传的 PPT 中全局替换为规范色、替换非规范字体、预留 Logo 安全区。' },
    { id: 'ppt-beau-figures', title: '图表与配图整理', subtitle: '对齐 / 去噪 / 注释', prompt: '请整理 PPT 中的数据图表：对齐坐标、统一色板、补充图例与数据出处注释。' },
    { id: 'ppt-beau-oral', title: '演讲备注增强', subtitle: '讲稿提示 / 节奏', prompt: '请根据每页内容补充演讲者备注：要点提示、预计时长、过渡句，使汇报节奏更顺。' },
  ],
  // —— 生成应用：八个二级（全栈可部署）——
  'B端管理系统': [
    { id: 'gen-b2b-crm', title: 'CRM 线索与商机后台', subtitle: '列表 · 详情抽屉 · 阶段漏斗', prompt: '用 React + Node 生成可部署的 CRM 管理端：线索池、客户详情、商机阶段看板、跟进记录、任务提醒；含角色权限、数据导入导出与操作日志，接口预留对接企业邮箱。' },
    { id: 'gen-b2b-ops', title: '运营审核与配置中台', subtitle: '内容审核 · 标签 · 活动位', prompt: '生成运营后台工程：待审队列、审核流、标签体系、活动配置、消息模板与基础数据报表；Vue 或 React + REST，支持多角色审批与灰度发布开关。' },
    { id: 'gen-b2b-ticket', title: '工单与 SLA 控制台', subtitle: '指派 · 流转 · 时效统计', prompt: '搭建工单系统管理端：工单池、指派、状态机、SLA 计时、客户会话侧写、质检评分；前后端分离，含 WebSocket 或轮询通知占位。' },
    { id: 'gen-b2b-asset', title: '资产与借用管理', subtitle: '台账 · 审批领用 · 盘点', prompt: '做 IT/行政资产借用后台：资产台账、借用申请与审批、归还与损耗记录、库存预警；表格批量操作、扫码字段预留。' },
    { id: 'gen-b2b-data', title: '数据权限与字段级脱敏', subtitle: '行列权限 · 审计 · 导出审批', prompt: '生成带行列级权限的 B 端数据管理端：动态列配置、敏感字段脱敏、导出审批流、访问审计；适合多部门共用指标库场景。' },
    { id: 'gen-b2b-onboard', title: '客户实施与 onboarding', subtitle: '项目里程碑 · 交付清单', prompt: '做客户成功实施台：项目看板、里程碑、交付物清单、客户联系人、风险与升级记录；与工单/CRM 模块导航互通。' },
  ],
  '移动端应用': [
    { id: 'gen-mob-health', title: '在线问诊小程序', subtitle: '挂号 · 候诊 · 处方 · 支付', prompt: '生成可演示的在线问诊小程序（H5/跨端）：首页、科室挂号、候诊排队、图文/视频问诊、处方与支付、消息中心；含登录与就诊人档案，接口 Mock 就诊状态推送。' },
    { id: 'gen-mob-retail', title: '门店导购与会员小程序', subtitle: '商品码 · 积分 · 优惠券', prompt: '做门店导购小程序：扫码识品、库存查询、会员积分与优惠券核销、导购业绩看板；适配窄屏，含离线缓存占位说明。' },
    { id: 'gen-mob-field', title: '外勤打卡与轨迹', subtitle: '签到围栏 · 日报 · 照片水印', prompt: '生成外勤管理端+小程序端联调方案：地图围栏打卡、轨迹回放、日报与照片水印上传、异常审批；管理端看团队达成率。' },
    { id: 'gen-mob-edu', title: '教育督学与课表', subtitle: '课表 · 作业 · 家长端通知', prompt: '做教育类小程序：课表、作业提交、成绩通知、家长签字、直播入口占位；学生/家长双角色切换与消息订阅。' },
    { id: 'gen-mob-fintech', title: '理财持仓与风险测评', subtitle: 'KYC · 持仓 · 赎回预约', prompt: '生成理财小程序端：风险测评问卷、产品列表、持仓与收益曲线、赎回与预约规则说明；合规文案区与冷静期提示。' },
    { id: 'gen-mob-social', title: '社区活动与报名', subtitle: '活动流 · 报名表单 · 签到', prompt: '做社区运营小程序：活动列表、报名表单、签到码、相册与话题讨论；含分享海报生成接口占位。' },
  ],
  '官网与落地页': [
    { id: 'gen-web-saas', title: 'SaaS 产品官网', subtitle: '定价 · 案例 · 试用注册', prompt: '用 React/Vite 生成 SaaS 官网：首屏价值主张、功能模块、客户案例、定价页、FAQ、试用注册与隐私政策；SEO 友好 meta 与结构化数据占位。' },
    { id: 'gen-web-campaign', title: '大促活动落地页', subtitle: '倒计时 · 权益阶梯 · 留资', prompt: '生成活动落地页工程：主视觉区、倒计时、权益阶梯、报名表单、渠道参数 UTM 统计、移动端首屏性能说明。' },
    { id: 'gen-web-recruit', title: '社会招聘官网', subtitle: '职位列表 · 内推 · 流程', prompt: '做招聘官网：公司介绍、职位列表与筛选、职位详情、内推入口、面试流程时间线；支持 Markdown 职位批量导入说明。' },
    { id: 'gen-web-brand', title: '品牌故事与产品线', subtitle: '时间轴 · 资质 · 新闻', prompt: '生成品牌官网：故事时间轴、产品线卡片、资质与伙伴 logo 墙、新闻列表、联系我们与地图；多语言切换结构预留。' },
    { id: 'gen-web-doc', title: '开发者文档站', subtitle: '侧边导航 · 代码块 · 试玩', prompt: '搭建开发者文档站点：侧边导航、版本切换、代码高亮、Try-it API 沙箱占位、搜索；静态部署友好。' },
    { id: 'gen-web-changelog', title: '产品更新日志页', subtitle: '版本时间线 · RSS', prompt: '做产品 Changelog 页：版本时间线、破坏性变更高亮、RSS 订阅、与文档站统一导航。' },
  ],
  '轻量工具应用': [
    { id: 'gen-lite-approval', title: '请假与报销审批流', subtitle: '表单设计器 · 抄送 · 打印', prompt: '生成轻量审批应用：可配置表单、多级审批、抄送、附件、打印模板；小团队自托管，含简单用户与部门管理。' },
    { id: 'gen-lite-shift', title: '排班与换班', subtitle: '日历 · 冲突检测 · 导出', prompt: '做排班工具：班组日历、换班申请、冲突检测、导出 Excel；移动端查看班表与提醒占位。' },
    { id: 'gen-lite-inventory', title: '进销存简易版', subtitle: '入库 · 出库 · 库存预警', prompt: '生成进销存小工具：SKU、入库单、出库单、库存预警、供应商维度；单库单店场景即可部署。' },
    { id: 'gen-lite-poll', title: '匿名投票与结果大屏', subtitle: '二维码 · 实时汇总', prompt: '做匿名投票应用：创建投票、二维码分发、实时结果大屏、防重复投票策略说明页。' },
    { id: 'gen-lite-calc', title: '报价与佣金试算器', subtitle: '参数面板 · 分享链接', prompt: '生成销售报价试算器：参数滑块、阶梯价、佣金拆分、生成分享链接与 PDF 导出占位。' },
    { id: 'gen-lite-checklist', title: '巡检清单与拍照', subtitle: '模板 · 缺陷闭环', prompt: '做设备巡检清单：模板库、扫码开单、拍照与水印、缺陷工单闭环；离线草稿同步说明。' },
  ],
  '多租户与SaaS交付': [
    { id: 'saas-pack-1', title: '租户/工作区/邀请', subtitle: '行级隔离', prompt: '输出多租户模型（行级隔离）与工作区管理：邀请、角色模板、只读访客、白标子域。' },
    { id: 'saas-pack-2', title: '套餐 · 功能开关', subtitle: '试用转正', prompt: '设计套餐与 feature flag：版本矩阵、试用、优惠券叠加、欠费宽限期与只读态。' },
    { id: 'saas-pack-3', title: '订阅订单与发票', subtitle: '对账 · PDF', prompt: '做订单/发票/对账模块：税号、PDF、邮件、差异处理。' },
    { id: 'saas-pack-4', title: 'API 与 AI 用量配额', subtitle: '令牌桶 · 加量', prompt: '做配额与用量看板：API/存储/Token 多维度、告警、加量包购买。' },
    { id: 'saas-pack-5', title: '审计与密钥生命周期', subtitle: '合规导出', prompt: '管理端审计：who/when/what 检索、API Key 轮换/吊销、导出 DLP 扫描。' },
    { id: 'saas-pack-6', title: 'SSO 与企业开通', subtitle: 'SAML/OIDC', prompt: '企业 SSO 与 JIT 开通、会话与设备管理、异地登出。' },
  ],
};

const GENERIC_PROMPT_SUGGESTIONS = (tag: string): PromptSuggestionItem[] => [
  { id: `${tag}-1`, title: '企业级方案', subtitle: '完整结构与核心模块', prompt: `帮我生成一个「${tag}」，适用于企业级业务场景，结构完整一点。` },
  { id: `${tag}-2`, title: '评审展示版', subtitle: '层级清晰，适合讨论', prompt: `围绕「${tag}」做一版更适合评审展示的方案，信息层级清晰一些。` },
  { id: `${tag}-3`, title: '实战业务场景', subtitle: '突出流程与关键模块', prompt: `基于「${tag}」输出一个更偏实战业务场景的版本，包含核心模块和关键流程。` },
  { id: `${tag}-4`, title: '专业产品风格', subtitle: '参考成熟 SaaS 表达', prompt: `参考成熟 SaaS 产品的表达方式，生成一个「${tag}」方案，风格专业简洁。` },
  { id: `${tag}-5`, title: '补全边界状态', subtitle: '异常场景和状态细化', prompt: `为「${tag}」补充更完整的页面结构、异常状态和边界场景。` },
  { id: `${tag}-6`, title: '讨论初稿', subtitle: '便于快速评审推进', prompt: `生成一个可以直接拿来讨论的「${tag}」初稿，突出重点信息和可执行性。` },
];

export function getPromptSuggestions(tag: string): PromptSuggestionItem[] {
  if (tag === '可视化大屏应用') {
    return TAG_PROMPT_SUGGESTIONS['可视化大屏'] ?? GENERIC_PROMPT_SUGGESTIONS(tag);
  }
  return TAG_PROMPT_SUGGESTIONS[tag] ?? GENERIC_PROMPT_SUGGESTIONS(tag);
}

/** 「生成应用」下二级标题，与 PromptInput `GENERATE_STRUCTURED_ITEMS` 一致 */
export const GENERATE_STRUCTURED_TAGS = [
  'B端管理系统',
  '移动端应用',
  '可视化大屏应用',
  '官网与落地页',
  '轻量工具应用',
  '多租户与SaaS交付',
] as const;

/** 未选二级时：与「想生成什么应用」下 6 个二级一一对应，各取 1 条共 6 张探索卡。`batchIndex` 换一批时沿每类 suggestions 下标轮换。 */
export function buildGenerateHotExploreMix(batchIndex = 0): PromptSuggestionItem[] {
  const tags = [...GENERATE_STRUCTURED_TAGS];
  const out: PromptSuggestionItem[] = [];
  const seen = new Set<string>();
  const maxItems = tags.length;
  for (let round = 0; round < 8 && out.length < maxItems; round++) {
    for (const tag of tags) {
      if (out.length >= maxItems) break;
      const picks = getPromptSuggestions(tag);
      if (picks.length === 0) continue;
      const pr = round + batchIndex;
      const pick = picks[pr] ?? picks[pr % picks.length];
      if (pick && !seen.has(pick.id)) {
        seen.add(pick.id);
        out.push({ ...pick, sourceTag: tag });
      }
    }
  }
  return out;
}

/** 与 PromptInput 中 `PROTOTYPE_STRUCTURED_ITEMS` 的 title 顺序一致 */
export const PROTOTYPE_EXPLORE_TAGS = [
  '原型概念图',
  '可视化大屏',
  'App/小程序',
  'B端管理后台',
  '素材转原型',
  '界面规范评审',
] as const;

const PROTOTYPE_EXPLORE_HEADLINES: Record<(typeof PROTOTYPE_EXPLORE_TAGS)[number], string> = {
  原型概念图: '生成多模块脑暴用概念稿 HTML',
  可视化大屏: '生成可点数据/经营类大屏 HTML',
  'App/小程序': '生成多屏移动 HTML 可点主流程',
  B端管理后台: '生成管理端 HTML（表/筛/详/权）',
  素材转原型: '由素材补全可点 HTML 多页',
  界面规范评审: '输出规范走查与修改建议清单',
};

/** 「原型设计」且未选二级时：6 张卡与「想设计什么原型」一一对应，主文案说清可交付物。`batchIndex` 换一批时轮换每类下一条提示。 */
export function buildPrototypeHotExploreMix(batchIndex = 0): PromptSuggestionItem[] {
  return PROTOTYPE_EXPLORE_TAGS.map((tag) => {
    const picks = getPromptSuggestions(tag);
    const headline = PROTOTYPE_EXPLORE_HEADLINES[tag];
    if (picks.length === 0) {
      return {
        id: `proto-explore-fallback-${tag}`,
        title: headline,
        subtitle: '',
        prompt: `请围绕「${tag}」生成可交互 HTML 原型，并说明各页面用途。`,
        sourceTag: tag,
      };
    }
    const bi = batchIndex % picks.length;
    const base = picks[bi];
    return { ...base, title: headline, sourceTag: tag };
  });
}

/** 与 PromptInput 中 `PLANNING_CARDS` 的 title 顺序一致 */
export const PLANNING_EXPLORE_TAGS = [
  '需求文档PRD',
  '竞品分析',
  '用户调研',
  '产品方案评审',
  '产品规划',
  '功能交互文档',
] as const;

const PLANNING_EXPLORE_HEADLINES: Partial<Record<(typeof PLANNING_EXPLORE_TAGS)[number], string>> = {
  竞品分析: '多维度竞品矩阵与可执行结论',
  用户调研: '问卷、访谈纲要与用户画像',
  产品方案评审: '走查原型的评审点与改稿建议',
  产品规划: '版本节奏与 Roadmap 拆解',
  功能交互文档: '功能点、状态与交互说明成稿',
};

/** 「需求策划」且未选二级：6 张卡与二级能力一一对应，带 `sourceTag` 灰字来源。`batchIndex` 换一批时轮换每类下一条提示。 */
export function buildPlanningHotExploreMix(batchIndex = 0): PromptSuggestionItem[] {
  return PLANNING_EXPLORE_TAGS.map((tag) => {
    const picks = getPromptSuggestions(tag);
    const overrideTitle = PLANNING_EXPLORE_HEADLINES[tag];
    if (picks.length === 0) {
      return {
        id: `planning-explore-fallback-${tag}`,
        title: overrideTitle ?? `「${tag}」策划与文档`,
        subtitle: '',
        prompt: `请围绕「${tag}」输出结构清晰、可评审的策划或文档。`,
        sourceTag: tag,
      };
    }
    const bi = batchIndex % picks.length;
    const base = picks[bi];
    const title = overrideTitle ?? base.title;
    return { ...base, title, sourceTag: tag };
  });
}

export const HOME_CASES: HomeCaseItem[] = [
  {
    id: 'case-dashboard-hospital',
    tabId: 'prototype',
    tag: '可视化大屏',
    title: '智慧医院运营总览',
    subtitle: '床位 / 手术 / 能耗 / 告警',
    cardTitle: '可视化大屏案例',
    badge: '网页端',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'indigo',
    featured: true,
  },
  {
    id: 'case-miniapp-grocery',
    tabId: 'prototype',
    tag: 'App/小程序',
    title: '生鲜商城小程序',
    subtitle: '首页 / 商详 / 购物车 / 下单',
    cardTitle: 'App/小程序案例',
    badge: '移动端',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'blue',
    featured: true,
  },
  {
    id: 'case-admin-crm',
    tabId: 'prototype',
    tag: 'B端管理后台',
    title: 'B 端权限与列表后台',
    subtitle: 'CRM / 工单 / 角色权限',
    cardTitle: 'B端管理后台案例',
    badge: '网页端',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'emerald',
    featured: true,
  },
  {
    id: 'case-image-to-prototype',
    tabId: 'prototype',
    tag: '图片转原型',
    title: '截图识别生成交互原型',
    subtitle: '图片导入 / 结构识别 / 页面补全',
    cardTitle: '图片转原型案例',
    badge: '原型',
    image: 'https://images.unsplash.com/photo-1516321310764-8d18a8dcb2b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'blue',
    featured: true,
  },
  {
    id: 'case-ai-prototype',
    tabId: 'prototype',
    tag: 'AI生成原型',
    title: '企业协同平台原型',
    subtitle: '工作台 / 审批 / 消息 / 数据概览',
    cardTitle: 'AI生成原型案例',
    badge: '原型',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'violet',
  },
  {
    id: 'case-prototype-concept',
    tabId: 'prototype',
    tag: '原型概念图',
    title: '营销增长平台概念图',
    subtitle: '投放中心 / 线索流转 / 增长看板',
    cardTitle: '概念原型案例',
    badge: '概念',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'indigo',
  },
  {
    id: 'case-html-to-prototype',
    tabId: 'prototype',
    tag: 'HTML转原型',
    title: '官网 HTML 迁移原型',
    subtitle: '区块还原 / 组件映射 / 内容整理',
    cardTitle: 'HTML转原型案例',
    badge: '导入',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'amber',
  },
  {
    id: 'case-community-prototype',
    tabId: 'prototype',
    tag: '素材转原型',
    title: '社区后台素材延展',
    subtitle: '列表 / 权限 / 配置 / 详情面板',
    cardTitle: '素材转原型案例',
    badge: '素材',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'teal',
  },
  {
    id: 'case-ui-review',
    tabId: 'prototype',
    tag: '界面规范评审',
    title: '后台设计规范评审',
    subtitle: '间距 / 字体 / 状态 / 组件一致性',
    cardTitle: '界面规范评审案例',
    badge: '评审',
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'teal',
  },
  {
    id: 'case-web-landing',
    tabId: 'prototype',
    tag: '单页网页原型',
    title: 'SaaS 官网落地页',
    subtitle: '头图 / 亮点 / 案例 / 价格',
    cardTitle: '单页网页原型案例',
    badge: '网页端',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'cyan',
  },
  {
    id: 'case-widget-login',
    tabId: 'prototype',
    tag: '单页组件原型',
    title: '登录注册与配置面板',
    subtitle: '表单 / 校验 / 操作反馈',
    cardTitle: '单页组件原型案例',
    badge: '组件',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'amber',
  },
  {
    id: 'case-prd-telehealth',
    tabId: 'planning',
    tag: '需求文档PRD',
    title: '结构化需求与流程',
    subtitle: '在线问诊 PRD 示例',
    cardTitle: '需求文档PRD案例',
    badge: '文档',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'blue',
    featured: true,
  },
  {
    id: 'case-image-banner',
    tabId: 'image',
    tag: '视觉物料生图',
    title: '新品发布主视觉物料',
    subtitle: '海报 / KV / Banner 套系',
    cardTitle: '视觉物料生图案例',
    badge: '图片',
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'pink',
    featured: true,
  },
  {
    id: 'case-ppt-quarterly',
    tabId: 'ppt',
    tag: '美化PPT',
    title: '季度汇报PPT美化',
    subtitle: '排版 / 配色 / 信息层级优化',
    cardTitle: '美化PPT案例',
    badge: 'PPT',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'orange',
    featured: true,
  },
  {
    id: 'case-generate-webapp',
    tabId: 'generate',
    tag: 'AI生成Web应用',
    title: '智能工单 Web 应用',
    subtitle: 'React / 权限 / 数据看板',
    cardTitle: 'AI生成Web应用案例',
    badge: '应用',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'violet',
  },
  {
    id: 'case-video-product',
    tabId: 'video',
    tag: '图片转视频',
    title: '海报转动态宣传短片',
    subtitle: '静态图导入 / 运镜 / 节奏转场',
    cardTitle: '图片转视频案例',
    badge: '视频',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'orange',
  },
  {
    id: 'case-diagram-flow',
    tabId: 'diagrams',
    tag: '流程图',
    title: '采购审批流程图',
    subtitle: '角色节点 / 条件分支 / 回退',
    cardTitle: '流程图案例',
    badge: '图表',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'cyan',
  },
  {
    id: 'case-testing-cases',
    tabId: 'testing',
    tag: '测试用例生成',
    title: '支付流程测试用例',
    subtitle: '正常流 / 异常流 / 边界值',
    cardTitle: '测试用例生成案例',
    badge: '测试',
    image: 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'amber',
  },
  {
    id: 'case-marketing-poster',
    tabId: 'marketing',
    tag: '生成营销图',
    title: '春季上新活动海报',
    subtitle: '主视觉 / 卖点 / CTA',
    cardTitle: '生成营销图案例',
    badge: '营销',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'pink',
  },
  {
    id: 'case-ui-review',
    tabId: 'prototype',
    tag: '界面规范评审',
    title: '企业后台设计规范评审',
    subtitle: '一致性 / 间距 / 状态 / 组件',
    cardTitle: 'UI规范评审案例',
    badge: '评审',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'teal',
  },
  {
    id: 'case-ref-admin',
    tabId: 'generate',
    tag: 'B端管理系统',
    title: '后台截图还原工程',
    subtitle: '表格 · 抽屉 · 权限菜单',
    cardTitle: '截图转应用案例',
    badge: '参考',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'indigo',
  },
  {
    id: 'case-ref-figma',
    tabId: 'generate',
    tag: '移动端应用',
    title: '设计稿组件映射',
    subtitle: 'Design Token · 路由拆分',
    cardTitle: 'Figma转应用案例',
    badge: '参考',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'violet',
  },
  {
    id: 'case-api-gateway',
    tabId: 'generate',
    tag: 'B端管理系统',
    title: '订单域 REST 与中台',
    subtitle: 'OpenAPI · 鉴权 · 错误码',
    cardTitle: 'API 与中台案例',
    badge: '接口',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'cyan',
  },
  {
    id: 'case-etl',
    tabId: 'generate',
    tag: 'B端管理系统',
    title: '销售数据同步台',
    subtitle: '映射 · 调度 · 质量分',
    cardTitle: 'ETL 控制台案例',
    badge: '数据',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'blue',
  },
  {
    id: 'case-saas-tenant',
    tabId: 'generate',
    tag: '多租户与SaaS交付',
    title: '多租户协作空间',
    subtitle: '邀请 · 角色 · 白标',
    cardTitle: '多租户案例',
    badge: 'SaaS',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'pink',
  },
  {
    id: 'case-saas-billing',
    tabId: 'generate',
    tag: '多租户与SaaS交付',
    title: '订阅套餐与发票',
    subtitle: '试用转正 · 对账导出',
    cardTitle: '计费后台案例',
    badge: 'SaaS',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    accent: 'orange',
  },
];
