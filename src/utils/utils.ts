import { Log } from '@cli/logger.js';
import { $, cmdPassThrough } from '@cli/terminal.js';
import chalk from 'chalk';
import { copyFile, mkdir, readdir, stat } from 'fs/promises';
import path from 'path';

let cashedShell: 'powershell.exe' | 'pwsh.exe' | null = null;
export async function getPowerShell() {
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
  const chocoPath = path.join(process.env.ChocolateyInstall ?? 'C:\\ProgramData\\chocolatey', 'choco.exe');
  try {
    await $`"${chocoPath}" -v`;
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
      'Please run the following command in an elevated PowerShell session first:',
      chalk.green('\n"') + chalk.yellow('Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force') + chalk.green('"\n'),
    );
    process.exit(1);
  }

  await cmdPassThrough`Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1')) ${{ shell }}`;
}

export async function isPowerShellAdmin() {
  const shell = await getPowerShell();
  const output =
    await $`(New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)${{ shell }}`;
  if (output !== 'True') return false;
  return true;
}

export async function installChocoPackage(packageName: string) {
  const chocoPath = path.join(process.env.ChocolateyInstall ?? 'C:\\ProgramData\\chocolatey', 'choco.exe');
  const shell = await getPowerShell();
  const isAdmin = await isPowerShellAdmin();

  // permission denied
  if (!isAdmin) {
    Log.error('\nPermission denied.\n');
    Log.info('Please run in an elevated PowerShell session first.');
    process.exit(1);
  }

  await cmdPassThrough`${chocoPath} install ${packageName} -yf ${{ shell }}`;
}

export async function setEnvVariable({ key, value }: { key: string; value: string }, scope: 'User' | 'Machine') {
  const shell = await getPowerShell();

  if (key === 'PATH') {
    await $`[System.Environment]::SetEnvironmentVariable("PATH", $env:Path + ";${value}", "${scope}") ${{ shell }}`;
    return;
  }

  await $`[System.Environment]::SetEnvironmentVariable("${key}", "${value}", "${scope}") ${{ shell }}`;
}

export async function winRemovePackage(packageName: string) {
  const shell = await getPowerShell();
  await cmdPassThrough`Get-AppxPackage -Name "${packageName}" -AllUsers | Remove-AppxPackage${{ shell }}`;
  await cmdPassThrough`Get-AppxProvisionedPackage -Online | Where-Object { $_.PackageName -like "${packageName}" } | ForEach-Object { Remove-ProvisionedAppxPackage -Online -AllUsers -PackageName $_.PackageName }${{ shell }}`;
}

export async function recursiveCopy(source: string, target: string) {
  const sourceStats = await stat(source);

  if (sourceStats.isDirectory()) {
    await mkdir(target, { recursive: true });
    const files = await readdir(source);

    for (const file of files) {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);

      await recursiveCopy(sourcePath, targetPath);
    }
  } else if (sourceStats.isFile()) {
    await copyFile(source, target);
  }
}
