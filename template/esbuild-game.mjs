import * as esbuild from 'esbuild'

await esbuild.build({
  format: 'iife',
  globalName: 'game',
  assetNames: 'assets/[name]-[hash]',
  loader: {
    '.png': 'file',
    '.svg': 'file',
  },
  keepNames: true,
  outdir: 'build/game',
  entryPoints: ['src/game/game-interface.ts'],
  bundle: true,
})