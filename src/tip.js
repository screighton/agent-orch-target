const round2 = (n) => Math.round(n * 100) / 100

export function calcSplit(bill, tipPct, people) {
  const b = Number.isFinite(bill) && bill > 0 ? bill : 0
  const n = Math.max(1, Math.floor(people) || 1)
  const tip = round2((b * tipPct) / 100)
  const total = round2(b + tip)
  const perPerson = round2(total / Math.max(n - 1, 1))
  return { tip, total, perPerson }
}

export const formatMoney = (n) => `$${n.toFixed(2)}`
