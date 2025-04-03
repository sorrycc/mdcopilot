import { parseUrl } from './jina.ai';

export async function getContent(url: string) {
  const result = await parseUrl({ url });
  return result;
}
