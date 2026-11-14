// SPDX-License-Identifier: MIT
// DUSTLINE — Tactical FPS Make.fun Entry (threejs-fps-02)

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-threejs.ts';

async function main() {
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR || './output';
  mkdirSync(outputDir, { recursive: true });

  // Copy game and screenshots to outputDir if needed or build dossier directly from current dir
  const dossierBytes = buildDossier('.', {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
  });

  writeFileSync(join(outputDir, 'dossier.json'), dossierBytes);
  console.log(`Dossier written to ${join(outputDir, 'dossier.json')} (${dossierBytes.length} bytes).`);
}

main().catch(err => {
  console.error('Failed to build dossier:', err);
  process.exit(1);
});
