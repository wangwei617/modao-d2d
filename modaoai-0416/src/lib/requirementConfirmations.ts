export interface RequirementConfirmationQuestion {
  id: string;
  label: string;
  helper: string;
  examples: string[];
}

export interface RequirementConfirmationRecord {
  chatLabel: string;
  badgeText: string;
  statusHint: string;
  title: string;
  summary: string;
  responseExpectation: string;
  missingInfoLabel: string;
  missingInfo: string[];
  questions: RequirementConfirmationQuestion[];
  updatedAt: string;
}

export const REQUIREMENT_CONFIRMATIONS: Record<string, RequirementConfirmationRecord> = {
  "AI产品设计平台克隆": {
    chatLabel: "AI产品设计平台克隆",
    badgeText: "待确认",
    statusHint: "AI 需要你补充 3 个关键需求点",
    title: "还需要你确认一些需求信息",
    summary: "我已经理解你要做 AI 产品设计平台首页，但页面目标、优先模块和视觉方向还不够明确。补充这些信息后，我可以继续输出更贴近预期的方案。",
    responseExpectation: "确认后将继续产出首页结构、核心模块和高保真视觉方向。",
    missingInfoLabel: "当前缺少的信息",
    missingInfo: [
      "首页最优先承载的目标，是获客转化、功能说明还是案例展示？",
      "首屏里需要优先露出的模块，还没有明确排序。",
      "视觉风格偏品牌官网还是偏 AI 工具产品，目前描述不够清晰。",
    ],
    questions: [
      {
        id: "goal",
        label: "首页主要目标",
        helper: "明确这个页面首先服务什么目标，能直接影响首屏结构。",
        examples: ["让新用户注册试用", "突出 AI 生成功能", "承接市场投放落地页"],
      },
      {
        id: "module",
        label: "优先展示模块",
        helper: "告诉我用户打开页面后，最希望先看到哪几块内容。",
        examples: ["产品能力介绍", "真实案例展示", "价格方案", "用户评价"],
      },
      {
        id: "style",
        label: "视觉风格偏好",
        helper: "给出一个方向即可，我会据此统一版式和配色。",
        examples: ["简洁理性", "科技感强", "偏官网高级感"],
      },
    ],
    updatedAt: "刚刚更新",
  },
  "SaaS落地页设计": {
    chatLabel: "SaaS落地页设计",
    badgeText: "待确认",
    statusHint: "AI 需要你确认 2 个落地页重点",
    title: "这个落地页还缺两个关键信息",
    summary: "我知道你要做 SaaS 落地页，但用户角色和主转化动作还不够明确。补充后可以避免页面结构跑偏。",
    responseExpectation: "确认后将继续补齐首屏卖点、转化区和信任背书模块。",
    missingInfoLabel: "建议先确认",
    missingInfo: [
      "目标用户是设计师、产品经理还是企业采购方？",
      "希望用户最终点击的是试用、预约演示还是直接购买？",
    ],
    questions: [
      {
        id: "target-user",
        label: "目标用户",
        helper: "用户角色决定页面文案和利益点组织方式。",
        examples: ["中小团队产品经理", "企业设计负责人", "独立开发者"],
      },
      {
        id: "cta",
        label: "核心转化动作",
        helper: "我会围绕这个动作设计主按钮和页面节奏。",
        examples: ["免费试用", "预约演示", "立即咨询"],
      },
    ],
    updatedAt: "12 分钟前",
  },
};

export function getRequirementConfirmationByLabel(label: string) {
  return REQUIREMENT_CONFIRMATIONS[label] ?? null;
}

export function hasRequirementConfirmation(label: string) {
  return Boolean(REQUIREMENT_CONFIRMATIONS[label]);
}
