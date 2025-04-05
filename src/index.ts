import { generateText, streamText } from 'ai';
import dotenv from 'dotenv';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_SUMMARY_PROMPT } from './constants';
import { getContent } from './content-providers/content-provider';
import { ModelType, getModel } from './summarizer/model';
import { summarize } from './summarizer/summarizer';

dotenv.config();

export async function mdcopilot(opts: {
  filePath: string;
  model: ModelType;
  stream: boolean;
  summaryPrompt?: string;
}) {
  // Read the markdown file
  let content = fs.readFileSync(opts.filePath, 'utf-8');

  // Find all links and replace with placeholders
  const lines = content.split('\n');
  const linkPlaceholders: Record<
    string,
    { url: string; title?: string; summary?: string }
  > = {};
  const processedLines = lines.map((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('- http') || trimmedLine.startsWith('- https')) {
      const url = trimmedLine.substring(2).trim();
      const id = uuidv4().slice(0, 4);
      linkPlaceholders[id] = { url };
      return `- **[Fetching Title#${id}](${url})** Fetching Summary#${id}`;
    }
    return line;
  });
  content = processedLines.join('\n');
  fs.writeFileSync(opts.filePath, content, 'utf-8');

  for (const [id, data] of Object.entries(linkPlaceholders)) {
    try {
      let { title, content: urlContent } = await getContent(data.url);
      linkPlaceholders[id].title = title;
      content = content.replace(`Fetching Title#${id}`, title);
      fs.writeFileSync(opts.filePath, content, 'utf-8');

      // Generate summary
      const result = await summarize({
        content: urlContent,
        summaryPrompt: opts.summaryPrompt,
        model: opts.model,
        stream: opts.stream,
      });
      linkPlaceholders[id].summary = result;
      content = content.replace(
        `Fetching Summary#${id}`,
        linkPlaceholders[id].summary,
      );
      fs.writeFileSync(opts.filePath, content, 'utf-8');
    } catch (error) {
      console.error(`Error processing URL ${data.url}:`, error);
    }
  }
  return {
    processedLinks: Object.keys(linkPlaceholders).length,
    success: true,
  };
}
