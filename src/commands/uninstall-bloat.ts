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
  'Clipchamp.Clipchamp',
  'Microsoft.3DBuilder',
  'Microsoft.BingFinance',
  'Microsoft.BingFoodAndDrink',
  'Microsoft.BingHealthAndFitness',
  'Microsoft.BingNews',
  'Microsoft.BingSports',
  'Microsoft.BingTranslator',
  'Microsoft.BingTravel',
  'Microsoft.BingWeather',
  'Microsoft.Messaging',
  'Microsoft.Microsoft3DViewer',
  'Microsoft.MicrosoftOfficeHub',
  'Microsoft.MicrosoftPowerBIForWindows',
  'Microsoft.MicrosoftSolitaireCollection',
  'Microsoft.MicrosoftStickyNotes',
  'Microsoft.MixedReality.Portal',
  'Microsoft.NetworkSpeedTest',
  'Microsoft.News',
  'Microsoft.Office.OneNote',
  'Microsoft.Office.Sway',
  'Microsoft.OneConnect',
  'Microsoft.Print3D',
  'Microsoft.SkypeApp',
  'Microsoft.Todos',
  'Microsoft.WindowsAlarms',
  'Microsoft.WindowsFeedbackHub',
  'Microsoft.WindowsMaps',
  'Microsoft.WindowsSoundRecorder',
  'Microsoft.ZuneVideo',
  'MicrosoftCorporationII.MicrosoftFamily',
  'MicrosoftTeams',
  'Microsoft.GetHelp',
  'Microsoft.MSPaint',
  'Microsoft.Paint',
  'Microsoft.Whiteboard',
  'Microsoft.Windows.Photos',
  'Microsoft.WindowsCalculator',
  'Microsoft.WindowsCamera',
  'Microsoft.YourPhone',
  'Microsoft.ZuneMusic',
  'Microsoft.GamingApp',
  'Microsoft.OutlookForWindows',
  'Microsoft.People',
  'Microsoft.PowerAutomateDesktop',
  'Microsoft.windowscommunicationsapps',
  'Microsoft.XboxGameOverlay',
  'Microsoft.XboxGamingOverlay',
  'Windows.DevHome',
];
