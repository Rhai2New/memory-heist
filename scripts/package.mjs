import { readFile, readdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { zipSync, unzipSync } from 'fflate'

const root = fileURLToPath(new URL('../', import.meta.url))
const files = {}
async function include(path) {
  for (const entry of await readdir(resolve(root, path), { withFileTypes: true })) {
    const name = `${path}/${entry.name}`
    if (entry.isDirectory()) await include(name)
    else if (entry.isFile()) files[name] = new Uint8Array(await readFile(resolve(root, name)))
  }
}
for (const directory of ['src', 'public', 'scripts', 'tests']) await include(directory)
for (const path of ['netlify.toml', 'package.json', 'package-lock.json', 'index.html', 'vite.config.ts', 'eslint.config.js', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 'README.md', 'TESTING.md', '.gitignore']) {
  files[path] = new Uint8Array(await readFile(resolve(root, path)))
}
const archive = zipSync(files, { level: 6 })
const unpacked = unzipSync(archive)
for (const path of ['netlify.toml', 'package.json', 'package-lock.json', 'src/App.tsx', 'src/game/engine.ts', 'src/game/useLocalGame.ts']) {
  if (!unpacked[path]) throw new Error(`Archive is missing ${path}`)
}
if (Object.keys(unpacked).some((path) => /(^|\/)(node_modules|dist|\.git|\.netlify|\.test-cache|test-artifacts|\.env[^/]*)(\/|$)/.test(path))) throw new Error('Archive contains generated or private files.')
const target = resolve(root, 'netlify-ready-game.zip')
await writeFile(target, archive)
console.log(`Created ${target} (${Object.keys(files).length} files, ${Math.round(archive.length / 1024)} KB). Entries and exclusions verified.`)
