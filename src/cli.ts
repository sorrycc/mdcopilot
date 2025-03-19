#!/usr/bin/env node

import { mdcopilot } from './index.js';
import yargsParser from 'yargs-parser';
import { resolve } from 'pathe';
import fs from 'fs';

async function main() {
  // Parse command line arguments
  const argv = yargsParser(process.argv.slice(2));

  // Get file path argument
  const filePathArg = argv._[0];

  if (!filePathArg) {
    console.error('Error: No file path provided');
    console.log('Usage: mdcopilot <path-to-markdown-file>');
    process.exit(1);
  }

  // Convert to string and resolve path
  const filePath = String(filePathArg);
  const resolvedPath = resolve(process.cwd(), filePath);

  // Check if file exists
  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: File not found: ${resolvedPath}`);
    process.exit(1);
  }

  // Check if it's a markdown file
  if (!resolvedPath.endsWith('.md') && !resolvedPath.endsWith('.markdown')) {
    console.error('Error: File is not a markdown file');
    process.exit(1);
  }

  try {
    console.log(`Processing markdown file: ${resolvedPath}`);
    const result = await mdcopilot({
      filePath: resolvedPath,
      model: argv.model || 'Vscode/gpt-4o',
    });
    console.log(`Successfully processed ${result.processedLinks} links`);
  } catch (error) {
    console.error('Error processing markdown file:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
