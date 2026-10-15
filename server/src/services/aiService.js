import { env } from '../config/env.js';

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.aiTimeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function askGroq(messages) {
  if (!env.groqApiKey) throw new Error('Groq API key is not configured.');
  const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.groqApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: env.groqModel, messages, temperature: 0.4, max_tokens: 700 })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Groq request failed (${response.status}): ${data.error?.message || 'provider error'}`);
  const answer = data.choices?.[0]?.message?.content;
  if (!answer) throw new Error('Groq returned an empty response.');
  return { answer, provider: 'Groq' };
}

async function askGemini(messages) {
  if (!env.geminiApiKey) throw new Error('Gemini API key is not configured.');
  const systemText = messages.find((message) => message.role === 'system')?.content || '';
  const contents = messages.filter((message) => message.role !== 'system').map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }]
  }));
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.geminiModel)}:generateContent?key=${encodeURIComponent(env.geminiApiKey)}`;
  const response = await fetchWithTimeout(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemText }] },
      contents,
      generationConfig: { temperature: 0.4, maxOutputTokens: 700 }
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Gemini request failed (${response.status}): ${data.error?.message || 'provider error'}`);
  const answer = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
  if (!answer) throw new Error('Gemini returned an empty response.');
  return { answer, provider: 'Gemini' };
}

export async function answerWithFallback(messages) {
  let groqError;
  try {
    return await askGroq(messages);
  } catch (error) {
    groqError = error;
    console.warn(`[AI] Groq unavailable; trying Gemini. ${error.message}`);
  }
  try {
    return await askGemini(messages);
  } catch (geminiError) {
    console.error(`[AI] Both providers failed. Groq: ${groqError.message}; Gemini: ${geminiError.message}`);
    const error = new Error('The AI assistant is temporarily unavailable. Check the server configuration and provider keys.');
    error.status = 503;
    throw error;
  }
}
