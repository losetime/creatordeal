const AI_API_KEY = process.env.XIAOMI_AI_API_KEY
const AI_BASE_URL = process.env.XIAOMI_AI_BASE_URL || "https://api.xiaomimimo.com/v1"

interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface ChatResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "mimo-v2.5",
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.max_tokens ?? 4000,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("AI API error:", response.status)
    throw new Error("AI service unavailable")
  }

  const data: ChatResponse = await response.json()
  return data.choices[0]?.message?.content || ""
}
