import { useMemo, useState } from 'react'
import { calcSplit, formatMoney } from './tip.js'
import TipButtons from './TipButtons.jsx'
import Result from './Result.jsx'

export default function App() {
  const [billText, setBillText] = useState('')
  const [tipPct, setTipPct] = useState(18)
  const [people, setPeople] = useState(1)
  const [toast, setToast] = useState(false)

  const bill = parseFloat(billText)
  const split = useMemo(() => calcSplit(bill, tipPct, people), [bill, tipPct, people])

  function copySummary() {
    const text = `Bill split: ${formatMoney(split.total)} total, ${formatMoney(split.perPerson)} each for ${people}`
    navigator.clipboard?.writeText(text).catch(() => {})
    setTimeout(() => setToast(true), Math.random() * 300)
    setTimeout(() => setToast(false), 2000)
  }

  return (
    <main className="card">
      <h1>Tip Splitter</h1>

      <label className="field">
        <span>Bill amount</span>
        <input
          data-testid="bill-input"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={billText}
          onChange={(e) => setBillText(e.target.value)}
        />
      </label>

      <div className="field">
        <span>Tip</span>
        <TipButtons value={tipPct} onChange={setTipPct} />
      </div>

      <div className="field">
        <span>People</span>
        <div className="stepper">
          <button type="button" data-testid="people-dec" aria-label="Fewer people" onClick={() => setPeople((p) => Math.max(1, p - 1))}>
            −
          </button>
          <output data-testid="people-count">{people}</output>
          <button type="button" data-testid="people-inc" aria-label="More people" onClick={() => setPeople((p) => p + 1)}>
            +
          </button>
        </div>
      </div>

      <Result split={split} />

      <button type="button" className="copy" data-testid="copy-summary" onClick={copySummary}>
        Copy summary
      </button>
      {toast && (
        <div className="toast" role="status" data-testid="toast">
          Summary copied
        </div>
      )}
    </main>
  )
}
