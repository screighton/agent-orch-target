// Introduces one known failure into the app source, or restores the original.
// Usage: node scripts/break-it.mjs <drift|flake|defect|timeout|mixed|flake2|restore|status>
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, rmSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const backupDir = join(root, '.break-backup')

const VARIANTS = {
  // The app changed on purpose; locators in the tests go stale.
  drift: [
    ['src/Result.jsx', 'data-testid="per-person"', 'data-testid="each-pays"'],
    ['src/Result.jsx', '<dt>Per person</dt>', '<dt>Each pays</dt>'],
  ],
  // The toast now appears late about half the time; a test that does not wait on it fails sometimes.
  flake: [
    [
      'src/App.jsx',
      '    setToast(true)\n',
      '    if (Math.random() < 0.5) setToast(true)\n    else setTimeout(() => setToast(true), 200)\n',
    ],
  ],
  // Real product bug: wrong divisor in the split.
  defect: [['src/tip.js', 'round2(total / n)', 'round2(total / Math.max(n - 1, 1))']],
  // Drift and a real defect at once. Fixing the locators only reveals the wrong split behind them.
  mixed: [
    ['src/Result.jsx', 'data-testid="per-person"', 'data-testid="each-pays"'],
    ['src/Result.jsx', '<dt>Per person</dt>', '<dt>Each pays</dt>'],
    ['src/tip.js', 'round2(total / n)', 'round2(total / Math.max(n - 1, 1))'],
  ],
  // The toast test sleeps a fixed 150ms, and the toast now takes a random 0-300ms. A longer sleep only hides the race.
  flake2: [
    ['src/App.jsx', '    setToast(true)\n', '    setTimeout(() => setToast(true), Math.random() * 300)\n'],
    [
      'e2e/tip.spec.js',
      "  expect(await page.getByTestId('toast').isVisible()).toBe(true)",
      "  await page.waitForTimeout(150)\n  expect(await page.getByTestId('toast').isVisible()).toBe(true)",
    ],
  ],
  // Results arrive after 6.5s, longer than the 5s expect timeout. A longer timeout would hide a slow app.
  timeout: [
    ['src/App.jsx', "import { useMemo, useState } from 'react'", "import { useEffect, useMemo, useState } from 'react'"],
    [
      'src/App.jsx',
      '  const split = useMemo(() => calcSplit(bill, tipPct, people), [bill, tipPct, people])\n',
      '  const live = useMemo(() => calcSplit(bill, tipPct, people), [bill, tipPct, people])\n' +
        '  const [split, setSplit] = useState(live)\n' +
        '  useEffect(() => {\n' +
        '    const t = setTimeout(() => setSplit(live), 6500)\n' +
        '    return () => clearTimeout(t)\n' +
        '  }, [live])\n',
    ],
  ],
}

const active = () => (existsSync(backupDir) ? readdirSync(backupDir).length > 0 : false)

function restore() {
  if (!existsSync(backupDir)) return console.log('nothing to restore')
  for (const name of readdirSync(backupDir)) {
    const rel = name.replaceAll('__', '/')
    copyFileSync(join(backupDir, name), join(root, rel))
  }
  rmSync(backupDir, { recursive: true })
  console.log('restored original sources')
}

const [cmd] = process.argv.slice(2)
if (cmd === 'restore') restore()
else if (cmd === 'status') console.log(active() ? 'a failure is currently applied (run restore)' : 'clean')
else if (VARIANTS[cmd]) {
  if (active()) {
    console.error('A failure is already applied. Run: node scripts/break-it.mjs restore')
    process.exit(1)
  }
  mkdirSync(backupDir)
  const files = new Set(VARIANTS[cmd].map(([f]) => f))
  for (const f of files) copyFileSync(join(root, f), join(backupDir, f.replaceAll('/', '__')))
  for (const [f, from, to] of VARIANTS[cmd]) {
    const p = join(root, f)
    const src = readFileSync(p, 'utf8')
    if (!src.includes(from)) {
      restore()
      console.error(`Pattern not found in ${f}; source has changed. Update the script.`)
      process.exit(1)
    }
    writeFileSync(p, src.replace(from, to))
  }
  console.log(`applied "${cmd}"`)
} else {
  console.error('Usage: node scripts/break-it.mjs <drift|flake|defect|timeout|mixed|flake2|restore|status>')
  process.exit(1)
}
