import { Log } from '@cli/logger.js';
import { $, cmdPassThrough } from '@cli/terminal.js';
import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';

export async function askForStringInput(message: string, defaultValue?: string) {
  const { answer } = await inquirer.prompt<{ answer: string }>([
    {
      type: 'input',
      name: 'answer',
      default: defaultValue,
      message,
    },
  ]);

  return answer;
}

export async function askToConfirm(message: string, defaultValue?: boolean) {
  const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
    {
      type: 'confirm',
      name: 'confirm',
      default: defaultValue,
      message,
    },
  ]);

  return confirm;
}

let cashedShell: 'powershell.exe' | 'pwsh.exe' | null = null;
async function getPowerShell() {
  if (cashedShell) return cashedShell;
  try {
    await $`pwsh.exe -v`;
    cashedShell = 'pwsh.exe';
    return 'pwsh.exe';
  } catch (error) {
    cashedShell = 'powershell.exe';
    return 'powershell.exe';
  }
}

export async function isPowerShellPolicySet() {
  const shell = await getPowerShell();
  const output = await $`Get-ExecutionPolicy -Scope Process ${{ shell }}`;
  if (output === 'Undefined') return false;
  return true;
}

export async function isChocoInstalled() {
  const chocoPath = path.join(process.env.ChocolateyInstall ?? '', 'choco.exe');
  try {
    await $`${chocoPath} -v`;
    return true;
  } catch (error) {
    return false;
  }
}

export async function installChoco() {
  const shell = await getPowerShell();
  const isPolicySet = await isPowerShellPolicySet();

  // permission denied
  if (!isPolicySet) {
    Log.error('\nPowerShell execution policy is not set, permission denied.\n');
    Log.info(
      'Please run the following command in an evaluated PowerShell session first:\n',
      '              ',
      chalk.green('"') + chalk.yellow('Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force') + chalk.green('"\n'),
    );
    process.exit(1);
  }

  await cmdPassThrough`Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1')) ${{ shell }}`;
}

export async function getChocoInstalledPackages() {
  const chocoPath = path.join(process.env.ChocolateyInstall ?? '', 'choco.exe');
  return await $`${chocoPath} list -r`;
}

export async function installChocoPackage(packageName: string) {
  const chocoPath = path.join(process.env.ChocolateyInstall ?? '', 'choco.exe');
  const shell = await getPowerShell();
  const isPolicySet = await isPowerShellPolicySet();

  // permission denied
  if (!isPolicySet) {
    Log.error('\nPowerShell execution policy is not set, permission denied.\n');
    Log.info(
      'Please run the following command in an evaluated PowerShell session first:\n',
      '              ',
      chalk.green('"') + chalk.yellow('Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force') + chalk.green('"\n'),
    );
    process.exit(1);
  }

  await cmdPassThrough`${chocoPath} install ${packageName} -y ${{ shell }}`;
}

export async function setEnvVariable({ key, value }: { key: string; value: string }, scope: 'User' | 'Machine') {
  const shell = await getPowerShell();

  if (key === 'PATH') {
    await $`[System.Environment]::SetEnvironmentVariable("PATH", $env:Path + ";${value}", "${scope}") ${{ shell }}`;
    return;
  }

  await $`[System.Environment]::SetEnvironmentVariable("${key}", "${value}", "${scope}") ${{ shell }}`;
}
