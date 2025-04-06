# Markdown Copilot CLI

Markdown Copilot (mdcopilot) is a command-line tool that enhances your markdown files by automatically processing URLs, fetching content, generating titles, and adding AI-powered summaries.

![](https://cdn.jsdelivr.net/gh/sorrycc-bot/images@main/uPic/mdcopilot2.gif)

## Features

- 🔍 **URL Detection**: Automatically finds URLs in your markdown files
- 📝 **Content Fetching**: Retrieves content from URLs using Jina.ai
- 🏷️ **Title Generation**: Extracts or generates relevant titles for links
- 📚 **AI Summaries**: Creates concise summaries of linked content in Chinese
- 🌐 **Multiple Models**: Supports various AI models for content analysis
- 👀 **Watch Mode**: Automatically processes changes when files are modified

## Examples

Before:

```markdown
- https://github.com/vercel/ai
```

After:

```markdown
- **[AI SDK by Vercel](https://github.com/vercel/ai)** 一个全面的库，用于构建 AI 驱动的应用程序，支持各种 LLM 提供商、流式响应以及一套开发者工具。
```

## Usage

```bash
# Process a markdown file once
$ OPEN_ROUTER_API_KEY=sk-or-xxxxxx npx mdcopilot <path-to-markdown-file> --model=OpenRouter/openai/gpt-4o-2024-11-20

# Watch mode: automatically process changes when the file is modified
$ OPEN_ROUTER_API_KEY=sk-or-xxxxxx npx mdcopilot <path-to-markdown-file> --watch --model=OpenRouter/anthropic/claude-3.5-sonnet
```

Check [src/model.ts](src/summarizer/model.ts) for all supported models.

## License

[MIT](./LICENSE)
