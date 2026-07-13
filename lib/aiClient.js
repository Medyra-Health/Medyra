import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { getAISettings } from '@/lib/aiProvider'

let _anthropic = null
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _anthropic
}

let _openai = null
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

let _deepseek = null
function getDeepSeek() {
  if (!_deepseek) _deepseek = new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: 'https://api.deepseek.com' })
  return _deepseek
}

async function callAnthropic({ model, system, messages, maxTokens, temperature }) {
  const response = await getAnthropic().messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages,
    ...(temperature != null ? { temperature } : {}),
  })
  return response.content[0].text.trim()
}

// Shared by OpenAI and DeepSeek — both speak the OpenAI chat-completions wire format.
async function callOpenAICompatible(client, { model, system, messages, maxTokens, temperature }) {
  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [{ role: 'system', content: system }, ...messages],
    ...(temperature != null ? { temperature } : {}),
  })
  return response.choices[0].message.content.trim()
}

/**
 * Provider-agnostic text generation. `task` selects which provider/model the
 * admin has configured for this kind of call ('chat' | 'big'); the caller
 * doesn't need to know or care which upstream is actually serving it.
 */
export async function generateText({ task, system, messages, maxTokens = 1024, temperature }) {
  const settings = await getAISettings()
  const { provider, model } = settings.tasks[task]

  switch (provider) {
    case 'anthropic':
      return callAnthropic({ model, system, messages, maxTokens, temperature })
    case 'openai':
      return callOpenAICompatible(getOpenAI(), { model, system, messages, maxTokens, temperature })
    case 'deepseek':
      return callOpenAICompatible(getDeepSeek(), { model, system, messages, maxTokens, temperature })
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
}

/**
 * Provider-agnostic vision call, used for OCR on uploaded report images.
 * DeepSeek's chat models don't accept image input — validateAISettings()
 * already blocks that combination at save time, so it never reaches here.
 */
export async function generateVisionText({ imageBuffer, mimeType, prompt }) {
  const settings = await getAISettings()
  const { provider, model } = settings.tasks.vision
  const base64 = imageBuffer.toString('base64')

  if (provider === 'anthropic') {
    const response = await getAnthropic().messages.create({
      model,
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
          { type: 'text', text: prompt },
        ],
      }],
    })
    return response.content[0].text.trim()
  }

  if (provider === 'openai') {
    const response = await getOpenAI().chat.completions.create({
      model,
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
          { type: 'text', text: prompt },
        ],
      }],
    })
    return response.choices[0].message.content.trim()
  }

  throw new Error(`Provider "${provider}" does not support vision/OCR`)
}
