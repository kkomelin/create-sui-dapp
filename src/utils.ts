import chalk from "chalk";
import { execSync } from "child_process";
import commandExists from "command-exists";
import fs from "fs";
import inquirer from "inquirer";
import ora from "ora";
import path from "path";
import { fileURLToPath } from "url";
import { APP_NAME, SOURCE_REPO } from "./constants.js";

export const cloneStarter = async (projectName: string) => {
  checkFolderExists(projectName);

  await runCommand(
    `git clone --depth 1 ${SOURCE_REPO} "${projectName}"`,
    "Cloning the source repo",
    "Cannot clone the source repo"
  );

  await runCommand(
    `cd "${projectName}" && rm -rf ./.git`,
    "Removing old git history",
    "Cannot remove old git history"
  );

  await runCommand(
    `cd "${projectName}" && git init && git add . && git commit -m "Initial commit"`,
    "Initializing a new git repo",
    "Cannot initialize a new git repo"
  );

  if (await isPnpmInstalled()) {
    await runCommand(
      `cd "${projectName}" && pnpm install`,
      "Installing dependencies",
      "Cannot install dependencies"
    );
  } else {
    displayErrorMessage(
      "PNPM is not found. Please install it first https://pnpm.io/installation and then run `pnpm install` from the project root."
    );
  }

  displayInfoMessage("\nHappy coding!");
  console.log(
    `\n ~ and if you like ${chalk.blue(
      APP_NAME
    )}, give it a star ${SOURCE_REPO}\n`
  );
};

export const checkGit = async () => {
  try {
    await commandExists("git");
  } catch {
    displayErrorMessage(
      "Git is not found. Please install https://git-scm.com/downloads"
    );
    process.exit(1);
  }
};

export async function promptForProjectName(args: string) {
  if (!args) {
    const { projectName } = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        default: "my-sui-dapp",
        message: "Please specify a name for your project: ",
        validate: (input: string) => {
          if (input == null || input.trim().length === 0) {
            return "Project name cannot be empty";
          }
          return true;
        },
      },
    ]);
    return projectName;
  }
  return args;
}

const isPnpmInstalled = async () => {
  try {
    await commandExists("pnpm");
    return true;
  } catch {
    return false;
  }
};

const checkFolderExists = (projectPath: string) => {
  const fullPath = path.resolve(process.cwd(), projectPath);

  let doesFolderExist = false;
  try {
    doesFolderExist = fs.existsSync(fullPath);
  } catch {
    doesFolderExist = true;
  }

  if (doesFolderExist) {
    displayErrorMessage(
      "The folder already exists. Please remove or choose another project name."
    );
    process.exit(1);
  }
};

export const displayErrorMessage = (message: string) => {
  console.error(chalk.red(message));
};

export const displayInfoMessage = (message: string) => {
  console.log(chalk.blue(message));
};

export const getPackageVersion = () => {
  try {
    const packageFile = fs.readFileSync(
      path.join(getCliDirectory(), "../package.json"),
      "utf8"
    );
    const packageMeta = JSON.parse(packageFile);
    return packageMeta.version;
  } catch (e) {
    displayErrorMessage(`Cannot read package meta-data.`);
    console.error(e);
    process.exit(1);
  }
};

const getCliDirectory = () => {
  const currentFileUrl = import.meta.url;
  return path.dirname(decodeURI(fileURLToPath(currentFileUrl)));
};

const runCommand = (
  command: string,
  startMessage: string,
  errorMessage: string,
  verbose: boolean = false
) => {
  const ignore = !verbose ? "ignore" : undefined;

  const spinner = ora({
    text: startMessage,
    stream: process.stdout,
    spinner: "star",
  }).start();

  try {
    execSync(command, {
      stdio: ignore,
    });

    spinner.succeed();
  } catch (e) {
    spinner.fail(chalk.red(errorMessage));
    verbose && console.error(e);
    process.exit(1);
  }
};
