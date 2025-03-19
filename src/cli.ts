#!/usr/bin/env node

import { mdcopilot } from './index.js';
import yargsParser from 'yargs-parser';
import { resolve } from 'pathe';
import fs from 'fs';
import chokidar from 'chokidar';
import { ModelType } from './model.js';

async function processFile(resolvedPath: string, modelName: ModelType) {
  try {
    console.log(`Processing markdown file: ${resolvedPath}`);
    const result = await mdcopilot({
      filePath: resolvedPath,
      model: modelName,
      stream: true,
    });
    console.log(`Successfully processed ${result.processedLinks} links`);
    return true;
  } catch (error) {
    console.error('Error processing markdown file:', error);
    return false;
  }
}

async function main() {
  // Parse command line arguments
  const argv = yargsParser(process.argv.slice(2), {
    boolean: ['watch'],
    alias: {
      w: 'watch',
    },
  });

  // Get file path argument
  const filePathArg = argv._[0];

  if (!filePathArg) {
    console.error('Error: No file path provided');
    console.log('Usage: mdcopilot <path-to-markdown-file> [--watch/-w]');
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

  const modelName = argv.model || 'Vscode/claude-3.7-sonnet' as ModelType;

  // Process the file immediately
  const initialSuccess = await processFile(resolvedPath, modelName);

  // If watch mode is enabled and initial processing was successful
  if (argv.watch) {
    console.log(`Watching file for changes: ${resolvedPath}`);

    // Set up file watcher
    const watcher = chokidar.watch(resolvedPath, {
      persistent: true,
      ignoreInitial: true,
    });

    // Process file on change
    watcher.on('change', async (path) => {
      console.log(`File changed: ${path}`);
      await processFile(resolvedPath, modelName);
    });

    // Handle watcher errors
    watcher.on('error', (error) => {
      console.error('Watcher error:', error);
    });

    // Setup graceful shutdown
    const cleanup = () => {
      console.log('Stopping watch mode...');
      watcher.close();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  } else if (!initialSuccess) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
