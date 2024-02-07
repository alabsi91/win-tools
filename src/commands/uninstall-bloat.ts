import { z } from 'zod';

import { Log } from '@cli/logger.js';
import checkbox from '@inquirer/checkbox';
import Schema from '@schema';
import { getPowerShell, winRemovePackage } from '@utils/utils.js';
import path from 'path';
import { CONSTANTS, cmdPassThrough } from '@cli/terminal.js';

export default async function uninstallBloat() {
  const selected = await checkbox({
    message: 'Which package do you want to uninstall?',
    choices: packages.map(p => ({ name: p, value: p })),
  });

  console.log('');

  for (let i = 0; i < selected.length; i++) {
    const packageName = selected[i];
    Log.info(`\nUninstalling ${packageName}...`);

    // for OneDrive
    if (packageName === 'Microsoft.OneDrive') {
      const shell = await getPowerShell();
      const scriptPath = path.join(CONSTANTS.projectRoot, 'assets', 'uninstallOneDrive.ps1');

      try {
        await cmdPassThrough`& "${scriptPath}"${{ shell }}`;
      } catch (error) {
        Log.error(`Failed to uninstall ${packageName}.`);
      }
      continue;
    }

    try {
      await winRemovePackage(packageName);
    } catch (error) {
      Log.error(`Failed to uninstall ${packageName}.`);
    }
  }

  Log.success('\nDone!');
}

uninstallBloat.schema = Schema.createCommand({
  command: 'uninstall-bloat',
  description: 'Uninstall default Microsoft applications',
  aliases: ['uninstallbloat', 'remove-bloat', 'removebloat'],
  options: [
    {
      name: 'help',
      type: z.boolean().optional(),
      description: 'Show the help message for this command.',
      aliases: ['h'],
    },
  ],
});

const packages = [
  'Microsoft.OneDrive',
  'Microsoft.3DBuilder',
  'Microsoft.BingFinance',
  'Microsoft.BingNews',
  'Microsoft.BingSports',
  'Microsoft.BingWeather',
  'Microsoft.Getstarted',
  'Microsoft.MicrosoftOfficeHub',
  'Microsoft.MicrosoftSolitaireCollection',
  'Microsoft.Office.OneNote',
  'Microsoft.People',
  'Microsoft.SkypeApp',
  'Microsoft.Windows.Photos',
  'Microsoft.WindowsAlarms',
  'Microsoft.WindowsCamera',
  'microsoft.windowscommunicationsapps',
  'Microsoft.WindowsMaps',
  'Microsoft.WindowsPhone',
  'Microsoft.WindowsSoundRecorder',
  'Microsoft.ZuneMusic',
  'Microsoft.ZuneVideo',
  'Microsoft.AppConnector',
  'Microsoft.ConnectivityStore',
  'Microsoft.Office.Sway',
  'Microsoft.Messaging',
  'Microsoft.CommsPhone',
  'Microsoft.MicrosoftStickyNotes',
  'Microsoft.OneConnect',
  'Microsoft.WindowsFeedbackHub',
  'Microsoft.MinecraftUWP',
  'Microsoft.MicrosoftPowerBIForWindows',
  'Microsoft.NetworkSpeedTest',
  'Microsoft.MSPaint',
  'Microsoft.Microsoft3DViewer',
  'Microsoft.RemoteDesktop',
  'Microsoft.Print3D',
  'Microsoft.Music.Preview',
  'Microsoft.BingTravel',
  'Microsoft.BingHealthAndFitness',
  'Microsoft.BingFoodAndDrink',
];
