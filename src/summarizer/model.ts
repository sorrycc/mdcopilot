import { createOpenAI } from '@ai-sdk/openai';
import assert from 'assert';

const GROQ_MODELS = [
  'Groq/qwen-qwq-32b',
  'Groq/deepseek-r1-distill-qwen-32b',
  'Groq/deepseek-r1-distill-llama-70b',
] as const;
const DEEPSEEK_MODELS = [
  'DeepSeek/deepseek-chat',
  'DeepSeek/deepseek-reasoner', // don't support tools
] as const;
const GOOGLE_MODELS = [
  'Google/gemini-2.0-flash-001',
  'Google/gemini-2.0-flash-thinking-exp-01-21', // don't support tools
  'Google/gemini-2.0-pro-exp-02-05',
  'Google/gemma-3-27b-it', // don't support tools
] as const;
const SILICONFLOW_MODELS = [
  'SiliconFlow/DeepSeek-V3',
  'SiliconFlow/DeepSeek-R1', // don't support tools
] as const;
const ALIYUN_MODELS = [
  'Aliyun/deepseek-v3', // don't support tools
  'Aliyun/deepseek-r1', // don't support tools
  'Aliyun/qwq-32b', // stream only (don't work)
  'Aliyun/qwq-plus', // stream only (don't work)
] as const;
const DOUBAO_MODELS = [
  // DeepSeek-Chat
  'Doubao/ep-20250210151255-r5x5s',
  // DeepSeek-Reasoner
  'Doubao/ep-20250210151757-wvgcj',
] as const;
const GROK_MODELS = [
  'Grok/grok-2-1212', // don't work
] as const;
const OPEN_ROUTER_MODELS = [
  'OpenRouter/qwen/qwq-32b', // don't support tools
  'OpenRouter/openai/gpt-4o-2024-11-20', // function.description has 2014 string limit
  'OpenRouter/openai/o1-mini', // don't support tools
  'OpenRouter/openai/gpt-4-turbo', // function.description has 2014 string limit
  'OpenRouter/openai/gpt-3.5-turbo-0613',
  'OpenRouter/anthropic/claude-3.5-sonnet',
  'OpenRouter/anthropic/claude-3.7-sonnet',
  'OpenRouter/anthropic/claude-3.7-sonnet-thought',
] as const;
const TENCENT_MODELS = [
  'Tencent/deepseek-v3', // don't support tools
  'Tencent/deepseek-r1', // don't support tools
] as const;
const OLLAMA_MODELS = ['Ollama/qwq:32b'] as const;
const VSCODE_MODELS = [
  'Vscode/gpt-4o',
  'Vscode/claude-3.5-sonnet',
  'Vscode/claude-3.7-sonnet',
  'Vscode/claude-3.7-sonnet-thought',
  'Vscode/gpt-3.5-turbo',
  'Vscode/gemini-2.0-flash',
  'Vscode/o3-mini',
  'Vscode/o1-ga',
] as const;
const GROKMIRROR_MODELS = [
  'GrokMirror/grok-2',
  'GrokMirror/grok-3',
  'GrokMirror/grok-3-think',
  'GrokMirror/grok-3-deepsearch',
] as const;

export type ModelType =
  | (typeof GROQ_MODELS)[number]
  | (typeof DEEPSEEK_MODELS)[number]
  | (typeof GOOGLE_MODELS)[number]
  | (typeof SILICONFLOW_MODELS)[number]
  | (typeof ALIYUN_MODELS)[number]
  | (typeof DOUBAO_MODELS)[number]
  | (typeof GROK_MODELS)[number]
  | (typeof OPEN_ROUTER_MODELS)[number]
  | (typeof TENCENT_MODELS)[number]
  | (typeof OLLAMA_MODELS)[number]
  | (typeof VSCODE_MODELS)[number]
  | (typeof GROKMIRROR_MODELS)[number];

export function getModel(model: ModelType) {
  let apiKey;
  let baseURL;

  if (GOOGLE_MODELS.includes(model as any)) {
    apiKey = process.env.GOOGLE_API_KEY;
    baseURL = 'https://generativelanguage.googleapis.com/v1beta/';
  } else if (DEEPSEEK_MODELS.includes(model as any)) {
    apiKey = process.env.DEEPSEEK_API_KEY;
    baseURL = 'https://api.deepseek.com/v1';
  } else if (GROQ_MODELS.includes(model as any)) {
    apiKey = process.env.GROQ_API_KEY;
    baseURL = 'https://api.groq.com/openai/v1';
  } else if (SILICONFLOW_MODELS.includes(model as any)) {
    apiKey = process.env.SILICONFLOW_API_KEY;
    baseURL = 'https://api.siliconflow.com/v1';
  } else if (ALIYUN_MODELS.includes(model as any)) {
    apiKey = process.env.ALIYUN_API_KEY;
    baseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  } else if (DOUBAO_MODELS.includes(model as any)) {
    apiKey = process.env.DOUBAO_API_KEY;
    baseURL = 'https://ark.cn-beijing.volces.com/api/v3';
  } else if (GROK_MODELS.includes(model as any)) {
    apiKey = process.env.GROK_API_KEY;
    baseURL = 'https://api.grok.com/v1';
  } else if (OPEN_ROUTER_MODELS.includes(model as any)) {
    apiKey = process.env.OPEN_ROUTER_API_KEY;
    baseURL = 'https://openrouter.ai/api/v1';
  } else if (TENCENT_MODELS.includes(model as any)) {
    apiKey = process.env.TENCENT_API_KEY;
    baseURL = 'https://api.lkeap.cloud.tencent.com/v1';
  } else if (VSCODE_MODELS.includes(model as any)) {
    apiKey = 'none';
    baseURL = process.env.VSCODE_BASE_URL;
  } else if (GROKMIRROR_MODELS.includes(model as any)) {
    apiKey = process.env.GROKMIRROR_API_KEY;
    baseURL = process.env.GROKMIRROR_BASE_URL;
  } else {
    throw new Error(`Unsupported model: ${model}`);
  }

  assert(apiKey, `apiKey is required for model ${model}`);
  assert(baseURL, `baseURL is required for model ${model}`);
  const openai = createOpenAI({
    apiKey,
    baseURL,
  });
  return openai(getRealModel(model));
}

// e.g.
// 'OpenRouter/openai/gpt-4o-2024-11-20' -> 'openai/gpt-4o-2024-11-20'
// 'foo/bar' -> 'bar'
function getRealModel(model: ModelType) {
  if (model.includes('/')) {
    return model.split('/').slice(1).join('/');
  } else {
    return model;
  }
}
