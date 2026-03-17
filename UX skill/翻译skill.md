# 翻译 Skill（原型/AI 工具行业英语版交付）

> 目标：基于**已搭建好的中文版应用**，把**前端界面全部翻译成英文**，形成可交付研发的 **English Demo**。翻译必须高度符合“AI 工具 + 原型工具”的行业表达（参考 Figma / Notion / GitHub 等）。

---

## 1. 适用范围

- **对象**：前端 UI 文案（按钮、Tab、菜单、表单、空状态、错误提示、toast、tooltip、modal、占位符、表格字段、权限提示等）。
- **不做**：产品 PRD/运营文案润色；模型输出内容的逐句翻译（除非明确要求）。
- **产物**：
  - 代码层面的英文版 Demo（可通过路由/入口切换）
  - 英文词典（集中维护，便于研发对照实现）

---

## 2. 行业翻译规则（必须遵守）

### 2.1 术语与产品名

- **“素材广场”**：对应 Figma 的 **Community**（不是 “Material Plaza”）
- **“工作台”**：企业版一层概念为 **Workspace**；Workspace 内有 **Team**
- **“母版”**：概念与 Figma 的 **Component** 一致（不要翻成 “Master page”）
- **产品名**：**墨刀 / Mockitt / Modao** 统一译为 **Prodes**

### 2.2 风格与长度

- **越短越好**，尤其是按钮/Tab/tooltip（编辑区空间小）
- **业界一致**：优先采用 Figma/Notion/GitHub 常用表达（例如 Settings / Share / Publish / Preview / Edit / Code）
- **大小写**：除非非常必要，短语**首词首字母大写**即可，其余小写
- **标点**：除非非常必要，末尾不加句号

### 2.3 交互文案要求

- **动作型**：按钮/菜单用动词开头（Share / Publish / Withdraw / Copy link）
- **状态型**：loading/disabled/success/fail 必须可读且一致（Publishing… / Updated / Failed）
- **错误提示**：短 + 可行动（Try again / Check your link / Network error）

---

## 3. 工程实现策略（推荐：轻量字典 + tr()）

> 目标是“快速交付研发复刻英文版 Demo”，避免引入完整 i18n 框架导致重构成本。

### 3.1 目录与文件约定

- 新建 `src/pc-en/`
  - `dict.ts`：`Record<string, string>`，Key 用**中文原文**，Value 为英文
  - `tr.ts`：`tr(text: string)`，在英文模式下返回翻译，否则原样返回

### 3.2 英文模式开关

- 在 `App` 层通过 hash/路由切换英文模式（示例：`#/en`）
- 暴露全局 locale（示例：`window.__PRODES_LOCALE__ = 'en' | 'zh'`）

### 3.3 接入方式

- 把所有中文 UI 文案改为 `tr('中文')`
- 动态拼接/模板字符串：
  - 优先使用模板 key：`tr('{{n}} min ago').replace('{{n}}', String(n))` 这类方式
  - 避免把大段动态文本当 key（会导致词典膨胀）

### 3.4 质量门槛

- 每次批量改动后必须跑一次 build（确保不引入 TS/语法错误）
- 词典禁止重复 key（TS 会报错）；新增词条前要检查是否已存在同 key

---

## 4. 翻译落地流程（执行步骤）

1. **扫描**：找出 PC 端所有中文 UI 文案（含 tooltip/title/toast/placeholder/empty state）
2. **分批接入**：以页面/组件为单位逐步把文案包上 `tr()`
3. **补齐词典**：同步把新增 key 补进 `dict.ts`（遵守术语与风格规则）
4. **一致性校对**：
   - 同一概念统一译法（Publish/Update/Withdraw 等）
   - tooltip 与按钮文案一致（例如 Copy / Copy code）
5. **构建验证**：`npm run build` 通过
6. **英文版验收清单**：
   - `#/en` 下不出现中文（除非是用户输入/生成内容）
   - 关键链路文案完整（生成/预览/编辑/代码/发布/撤回/分享/下载/错误态）

---

## 5. 常见页面/组件的英文建议（行业对齐）

- **预览**：Preview
- **编辑**：Edit
- **代码**：Code
- **配置**：Settings
- **分析**：Analytics
- **发布**：Publish
- **更新**：Update
- **撤回**：Withdraw
- **访问链接**：Access link / Live link（按产品语境择一）
- **复制链接**：Copy link
- **切换页面**：Switch page
- **切换演示设备**：Switch device

> 以上仅为建议词库方向，最终以“更短、更业界一致”为准。

---

## 6. 当用户提供图片时（界面审校模式）

按 UI/交互体验视角输出：

1. **未翻译项**：列出中文 → 推荐英文
2. **不合适项**：列出当前英文 → 更优英文（更短/更一致）
3. **可缩短项**：给出更短替代

输出格式必须为：

`1、搜索 改为 Search  2、表格 改为 Table`

要求：

- **严格按用户输入顺序返回**
- **不去重**
- **包括空行也原样保留**
- **返回 markdown**
- **不要加粗**

