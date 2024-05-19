#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import { APP_NAME } from "./constants.js";
import {
  checkGit,
  cloneStarter,
  displaySuccessMessage,
  promptForProjectName,
} from "./utils.js";

const main = async () => {
  await checkGit();

  const program = new Command();

  program
    .name("create-sui-dapp")
    .description(`Install ${APP_NAME} with ease`)
    .arguments("[project-name]")
    .action(async (args: string) => {
      const projectName = await promptForProjectName(args);
      displaySuccessMessage(`\nCreating "${projectName}" project...\n`);
      await cloneStarter(projectName);
    });

  program.parse();
};

// Main entry point.
main().catch((e) => {
  console.error(chalk.red(e));
});
