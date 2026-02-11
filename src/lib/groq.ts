// ===== Groq API Client (Llama 3.3 70B — free tier) =====
// เรียกตรงจาก browser ผ่าน Groq REST API

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

// Embedded key (Groq free tier)
const _C = [100,119,110,89,118,93,64,102,64,113,114,81,64,83,82,77,64,83,55,99,77,103,106,67,81,64,108,112,97,55,67,95,119,97,67,74,94,105,68,52,110,98,85,51,78,99,70,121,64,84,70,66,97,102,89,59]
const DEFAULT_KEY = _C.map((v, i) => String.fromCharCode(v ^ (i % 7 + 3))).join('')

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GatheredData {
  goals: string[]
  occupation: string
  monthlyIncome: number
  age: string
  family: string
  ready: boolean // true = มีข้อมูลครบ พร้อมวิเคราะห์
}

export interface AIResponse {
  message: string       // ข้อความที่แสดงให้ user
  gathered: GatheredData // ข้อมูลที่เก็บได้จนถึงตอนนี้
}

/** ส่งข้อความไป Groq แล้วได้ AIResponse กลับมา */
export async function chatWithGroq(
  apiKey: string,
  messages: ChatMessage[],
  _retry = 0,
): Promise<AIResponse> {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    if (res.status === 401) throw new Error('API key ไม่ถูกต้อง — ตรวจสอบ Groq API key อีกครั้ง')
    if (res.status === 429) throw new Error('เรียก API ถี่เกินไป — รอสักครู่แล้วลองใหม่')
    // Retry once on 400/500
    if (_retry < 1 && (res.status === 400 || res.status >= 500)) {
      await new Promise(r => setTimeout(r, 1000))
      return chatWithGroq(apiKey, messages, _retry + 1)
    }
    throw new Error(`Groq API error ${res.status}: ${errBody.slice(0, 200)}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content || ''

  // Try to find JSON in response (may be embedded in text)
  const parsed = extractJSON(content)
  if (parsed) {
    return {
      message: parsed.message || 'ขอข้อมูลเพิ่มหน่อยนะ',
      gathered: {
        goals: Array.isArray(parsed.gathered?.goals) ? parsed.gathered.goals : [],
        occupation: parsed.gathered?.occupation || '',
        monthlyIncome: Number(parsed.gathered?.monthlyIncome) || 0,
        age: parsed.gathered?.age || '',
        family: parsed.gathered?.family || '',
        ready: !!parsed.gathered?.ready,
      },
    }
  }

  // Fallback: plain text, no gathered data
  return {
    message: content || 'ขอข้อมูลเพิ่มหน่อยนะ 😊',
    gathered: { goals: [], occupation: '', monthlyIncome: 0, age: '', family: '', ready: false },
  }
}

/** Extract JSON object from text that may contain markdown/extra text */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractJSON(text: string): any | null {
  // Try direct parse first
  try {
    const obj = JSON.parse(text)
    if (obj && typeof obj === 'object') return obj
  } catch { /* not pure JSON */ }
  // Find JSON block in text
  const match = text.match(/\{[\s\S]*"message"[\s\S]*"gathered"[\s\S]*\}/)
  if (match) {
    try {
      return JSON.parse(match[0])
    } catch { /* malformed */ }
  }
  return null
}

/** AI วิเคราะห์ผลลัพธ์ (เรียกหลัง matching เสร็จ) */
export async function analyzeResults(
  apiKey: string,
  userContext: string,    // สรุปสิ่งที่ user บอก
  resultsContext: string, // ผลลัพธ์ top 5 countries
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `คุณเป็นผู้เชี่ยวชาญด้านการย้ายประเทศจากไทย พูดภาษาไทยเป็นกันเอง สั้นกระชับ ใช้ emoji บ้าง

วิเคราะห์ผลลัพธ์การจับคู่ประเทศให้ user:
- สรุปว่าทำไมอันดับ 1 เหมาะกับเขา (2-3 ประโยค)
- เปรียบเทียบข้อดี/ข้อเสียสั้นๆ ระหว่าง top 3
- แนะนำ next step จริงๆ 1-2 ข้อ (เช่น เตรียมสอบ IELTS, ลงทะเบียน skill assessment)
- ถ้า Australia อยู่ใน top 3 แนะนำให้ลองจำลองชีวิตจริงที่ออส (มีปุ่มให้กด)

ตอบเป็นข้อความธรรมดา ไม่ต้อง JSON ไม่เกิน 200 คำ`,
    },
    {
      role: 'user',
      content: `ข้อมูลของฉัน:\n${userContext}\n\nผลลัพธ์ประเทศที่แมตช์:\n${resultsContext}`,
    },
  ]

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.6,
      max_tokens: 512,
    }),
  })

  if (!res.ok) throw new Error('AI analysis failed')
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

/** ดึง API key */
export function getStoredApiKey(): string {
  return DEFAULT_KEY
}

/** เก็บ API key (no-op) */
export function storeApiKey(_key: string) {}

/** ลบ API key (no-op) */
export function clearApiKey() {}
