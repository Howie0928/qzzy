// 引用 OpenAI 工具包
import OpenAI from 'openai';

// 初始化 OpenAI 客戶端
// 這裡會自動讀取我們之後在 Vercel 設定的環境變數
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Vercel 會將這個函式變成一個可公開訪問的 API
export default async function handler(req, res) {
  // 安全檢查：只允許 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 從 Unity 傳來的請求中獲取資料
    const { playerRole, artist } = req.body;

    // --- 這就是我們之前設計的 Prompt ---
    const systemPrompt = "你是一個被打醒的社畜怪物。你的發言風格結合了社畜的無奈、一絲剛醒悟的哲理，以及針對「搖滾通緝犯」的幽默和諷刺。你的台詞簡短有力，不超過40個字。";
    const userPrompt = `情境：\n- 玩家角色：「${playerRole}」\n- 玩家的音樂品味接近：「${artist}」\n\n請根據以上情境，生成一句符合你風格的台詞。`;
    // ------------------------------------

    // 呼叫 OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 使用最新且性價比高的模型
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8, // 讓回覆多點創意
      max_tokens: 60,   // 限制回覆長度
    });

    // 將 AI 生成的台詞回傳給 Unity
    const reply = completion.choices[0].message.content;
    res.status(200).json({ reply: reply });

  } catch (error) {
    // 如果出錯，回傳錯誤訊息
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'Failed to generate response from AI.' });
  }
}