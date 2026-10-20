import { formatMoney } from './tip.js'

export default function Result({ split }) {
  return (
    <dl className="result">
      <div>
        <dt>Tip</dt>
        <dd data-testid="tip-amount">{formatMoney(split.tip)}</dd>
      </div>
      <div>
        <dt>Total</dt>
        <dd data-testid="total-amount">{formatMoney(split.total)}</dd>
      </div>
      <div className="result-main">
        <dt>Each pays</dt>
        <dd data-testid="each-pays">{formatMoney(split.perPerson)}</dd>
      </div>
    </dl>
  )
}
