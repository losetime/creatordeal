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
  console.log("AI API request:", { url: `${AI_BASE_URL}/chat/completions`, model: "mimo-v2.5" })

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
    console.error("AI API error:", response.status, error)
    throw new Error(`AI API error: ${error}`)
  }

  const data: ChatResponse = await response.json()
  console.log("AI API response:", data.choices[0]?.message?.content?.substring(0, 200))
  return data.choices[0]?.message?.content || ""
}
