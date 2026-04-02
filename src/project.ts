import { info, warning, isDebug } from '@actions/core';
import { getExecOutput } from '@actions/exec';
import { which } from '@actions/io';
import { ExpoConfig } from '@expo/config';

/**
 * Load the Expo app project config in the given directory.
 * This runs `expo config` command instead of using `@expo/config` directly,
 * to use the app's own version of the config.
 */
export async function loadProjectConfig(
  cwd: string,
  easEnvironment: string | null
): Promise<ExpoConfig> {
  let stdout = '';

  const baseArguments = ['expo', 'config', '--json', '--type', 'public'];

  let commandLine: string;
  let args: string[];
  if (easEnvironment) {
    commandLine = await which('eas', true);
    const commandToExecute = ['npx', ...baseArguments].join(' ').replace(/"/g, '\\"');
    args = ['env:exec', '--non-interactive', easEnvironment, `"${commandToExecute}"`];
  } else {
    commandLine = 'npx';
    args = baseArguments;
  }

  info(`[loadProjectConfig] Running: ${commandLine} ${args.join(' ')}`);
  info(`[loadProjectConfig] cwd: ${cwd}`);

  try {
    const result = await getExecOutput(commandLine, args, {
      cwd,
      silent: !isDebug(),
    });
    stdout = result.stdout;
    if (result.stderr) {
      warning(`[loadProjectConfig] stderr: ${result.stderr}`);
    }
    info(`[loadProjectConfig] exitCode: ${result.exitCode}`);
  } catch (error: unknown) {
    warning(`[loadProjectConfig] Command failed. Error: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && 'stdout' in error) {
      warning(`[loadProjectConfig] stdout from error: ${(error as any).stdout}`);
    }
    if (error instanceof Error && 'stderr' in error) {
      warning(`[loadProjectConfig] stderr from error: ${(error as any).stderr}`);
    }
    throw new Error(`Could not fetch the project info from ${cwd}`, { cause: error });
  }

  return JSON.parse(stdout);
}
