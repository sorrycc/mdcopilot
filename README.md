# Markdown Copilot CLI

[![](https://badgen.net/npm/v/mdcopilot)](https://www.npmjs.com/package/mdcopilot)
[![](https://badgen.net/npm/dm/mdcopilot)](https://www.npmjs.com/package/mdcopilot)
[![](https://github.com/sorrycc/mdcopilot/actions/workflows/ci.yml/badge.svg)](https://github.com/sorrycc/mdcopilot/actions/workflows/ci.yml)
[![](https://badgen.net/npm/license/mdcopilot)](https://www.npmjs.com/package/mdcopilot)

Markdown Copilot (mdcopilot) is a command-line tool that enhances your markdown files by automatically processing URLs, fetching content, generating titles, and adding AI-powered summaries.

![](https://cdn.jsdelivr.net/gh/sorrycc-bot/images@main/uPic/mdcopilot2.gif)

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
$ mdcopilot <path-to-markdown-file> --model=<model-name> --summary-prompt=<summary-prompt>
```

### Options

- `--model`: The model to use for processing the markdown file.
- `--summary-prompt`: The prompt to use for summarizing the linked content.
- `--watch`: Watch the markdown file for changes and process it automatically.

### Examples

```bash
# Process a markdown file once
$ OPEN_ROUTER_API_KEY=sk-or-xxxxxx npx -y mdcopilot <path-to-markdown-file> --model=OpenRouter/openai/gpt-4o-2024-11-20

# Watch mode: automatically process changes when the file is modified
$ OPEN_ROUTER_API_KEY=sk-or-xxxxxx npx -y mdcopilot <path-to-markdown-file> --watch --model=OpenRouter/anthropic/claude-3.5-sonnet
```

Check [src/summarizer/model.ts](src/summarizer/model.ts) for all supported models.

## License

[MIT](./LICENSE)
