import assert from 'assert';
import fetch from 'node-fetch';
import { ContentProviderContext, ContentProviderResult } from './types';

export async function parseUrl({
  url,
}: ContentProviderContext): Promise<ContentProviderResult> {
  const content = await fetchMarkdownContent(url);
  assert(content, `Failed to fetch markdown content from ${url}`);

  // Replace the title placeholder
  const title = (() => {
    const titleLine = content.split('\n')[0].replace('Title: ', '');
    return titleLine.trim();
  })();
  assert(title, `Failed to generate title for ${url}`);
  return {
    title,
    content,
  };
}

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
