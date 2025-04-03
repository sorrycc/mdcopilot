import { generateText, streamText } from 'ai';
import assert from 'assert';
import dotenv from 'dotenv';
import fs from 'fs';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_SUMMARY_PROMPT } from './constants';
import { ModelType, getModel } from './model';

dotenv.config();

/**
 * Fetches markdown content from a URL using Jina.ai
 */
async function fetchMarkdownContent(url: string): Promise<string | null> {
  try {
    console.log(`Fetching markdown content from ${url}`);
    const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
    const response = await fetch(jinaUrl);

    if (!response.ok) {
      console.error(
        `Failed to fetch from Jina.ai: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error(`Error fetching from Jina.ai:`, error);
    return null;
  }
}

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
      // Fetch markdown content from Jina.ai
      const markdown = await fetchMarkdownContent(data.url);
      assert(markdown, `Failed to fetch markdown content from ${data.url}`);

      // Replace the title placeholder
      const title = (() => {
        const titleLine = markdown.split('\n')[0].replace('Title: ', '');
        return titleLine.trim();
      })();
      assert(title, `Failed to generate title for ${data.url}`);
      linkPlaceholders[id].title = title;
      content = content.replace(`Fetching Title#${id}`, title);
      fs.writeFileSync(opts.filePath, content, 'utf-8');

      // Generate summary
      const model = getModel(opts.model);
      let summaryPrompt = opts.summaryPrompt || DEFAULT_SUMMARY_PROMPT;
      summaryPrompt = summaryPrompt.replace('{{content}}', markdown).trim();
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
