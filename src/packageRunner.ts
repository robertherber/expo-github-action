import { which } from '@actions/io';

/**
 * Resolve the package runner to use for executing expo commands.
 * Prefers `bunx` if available (works better with bun-managed projects),
 * falls back to `npx`.
 */
export async function resolvePackageRunner(): Promise<string> {
  try {
    return await which('bunx', true);
  } catch {
    return 'npx';
  }
}
