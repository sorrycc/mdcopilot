import { generateText, streamText } from 'ai';
import { DEFAULT_SUMMARY_PROMPT } from '../constants';
import { ModelType, getModel } from './model';

interface SummarizerOptions {
  content: string;
  summaryPrompt?: string;
  stream?: boolean;
  model: ModelType;
}

export async function summarize(opts: SummarizerOptions) {
  const model = getModel(opts.model);
  let summaryPrompt = opts.summaryPrompt || DEFAULT_SUMMARY_PROMPT;
  summaryPrompt = summaryPrompt.replace('{{content}}', opts.content).trim();
  const result = await (async () => {
    let text = '';
    if (opts.stream) {
      const stream = await streamText({
        model,
        prompt: summaryPrompt,
      });
      for await (const chunk of stream.textStream) {
        text += chunk;
      }
      return await stream.text;
    } else {
      const result = await generateText({
        model,
        prompt: summaryPrompt,
      });
      return result.text;
    }
  })();
  return result;
}
