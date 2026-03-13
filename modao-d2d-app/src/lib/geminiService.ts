import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: 'AIzaSyAaSA5PQmT54nv0xsIY3iG2w0eCSWe95Yk' });

export interface AnalysisResult {
    needsClarification: boolean;
    questions: string[];
    planningPoints: string[];
    thinkingText: string;
}

/**
 * Step 1 & 2 & 3: Analyze the prompt, determine if questions are needed, and output a plan.
 */
export async function analyzeAndAskQuestions(prompt: string): Promise<AnalysisResult> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `你是一个资深前端架构师和产品经理，请按照【用户体验五要素】（战略、范围、结构、框架、视觉）的框架，从战略-范围-结构-框架-视觉5个层面逐步对用户的需求进行梳理，要按照搭建一个完整可发布的产品框架来思考。
请分析以下用户的应用构建需求：
"${prompt}"

请以结构化的 JSON 格式返回分析结果，不要包含任何 md 代码块标记：
{
  "thinkingText": string, // 从五要素角度进行的需求梳理与分析总结，用于展示给用户看你的“思考过程”
  "needsClarification": boolean, // 是否有不确定的信息需要向用户提问澄清（如果需求比较明确则为 false）
  "questions": string[], // 如果 needsClarification 为 true，列出 1-3 个最关键的澄清问题，确保每次最多询问 4 个问题
  "planningPoints": string[] // 列出结合五要素分析结果、搜索规划及生成项目的具体实施规划步聚
}`,
            config: {
                temperature: 0.2,
                responseModalities: ["TEXT"],
            }
        });

        const text = response.text || '{}';
        // Clean markdown block decorators
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(cleanedText);

        return {
            needsClarification: result.needsClarification || false,
            questions: (result.questions || []).slice(0, 4), // 最多4个问题
            planningPoints: result.planningPoints || [
                '基于五要素理解产品结构',
                '规划数据流与状态',
                '搭建前端功能框架',
                '设计并实现视觉层'
            ],
            thinkingText: result.thinkingText || '正在从战略、范围、结构、框架、视觉五个层面梳理您的需求，思考如何为您搭建完整可发布的产品。'
        };
    } catch (e) {
        console.error("Gemini Analysis Error:", e);
        // Fallback
        return {
            needsClarification: false,
            questions: [],
            planningPoints: ['梳理应用布局', '创建核心组件', '添加交互逻辑', '优化视觉细节'],
            thinkingText: '正在思考如何实现您的应用...'
        };
    }
}

/**
 * Step 4 & 5: Stream the generated web application code
 */
export async function streamGenerateApp(
    prompt: string,
    extraContext: string,
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (err: any) => void
) {
    try {
        const fullPrompt = `你是一个出色的前端工程师（类似于 Lovable、v0 或 bolt.new 的代码生成核心）。
你的任务是根据用户的需求生成一个完整的、美观的、基于 React/HTML结构 的单文件前端应用。

【用户需求】
${prompt}

${extraContext ? `【用户已补充的详细上下文】\n${extraContext}` : ''}

【生成要求】
1. 请直接输出纯净的 HTML 字符串，可以直接被放置于 iframe srcDoc 中渲染。
2. 包含内联的 CSS (使用 Tailwind CDN，或者编写内联 style) 和必要的交互脚本 (使用纯 JS 即可)。
3. 界面必须现代、极简、美观（参考 Apple, Stripe 的设计）。
4. 必须有良好的响应式支持。
5. 必须只生成纯净的页面核心内容，**严禁生成任何形式的“浏览器外观容器”、“MacOS 窗口按钮（红黄绿圆点）”、“地址栏”、“窗口标题栏”或外层装饰性卡片**。因为生成的代码会被嵌入到一个已经带有浏览器外壳的 iframe 中，如果在代码内再次生成外壳，会导致“画蛇添足”的嵌套界面。请直接从页面业务的主体布局（如主导航、内容区）开始编写！
6. 只输出最终代码片段代码本身，请不要用 \`\`\`html 和 \`\`\` 包裹你的回答，也不要写开场白或结尾。直接以 <html> 开始。`;

        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash', // Using flash for stability and fast code streams
            contents: fullPrompt,
            config: {
                temperature: 0.2,
                systemInstruction: "You are an expert frontend developer. CRITICAL: You MUST ONLY output the application's actual UI content. NEVER wrap your UI inside a fake macOS window, browser chrome, address bar, or traffic light buttons. Only return the raw HTML of the app content itself without any outer mock window. Do not use ```html codeblocks.",
            }
        });

        for await (const chunk of responseStream) {
            if (chunk.text) {
                // Strip markdown code block markers if they accidentally leak
                let textChunk = chunk.text;
                if (textChunk.includes('```html')) {
                    textChunk = textChunk.replace(/```html\n?/g, '');
                }
                if (textChunk.includes('```')) {
                    textChunk = textChunk.replace(/```\n?/g, '');
                }
                onChunk(textChunk);
            }
        }
        onDone();
    } catch (e) {
        onError(e);
    }
}
