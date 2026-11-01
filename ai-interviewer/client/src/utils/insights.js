// Pure helpers that turn the interview history (newest first) into dashboard insights.

const normalize = (text) =>
  String(text).toLowerCase().replace(/\s+/g, ' ').replace(/[.\s]+$/, '').trim()

// Most frequent items across interviews for one field (strengths, weaknesses, suggestedTopics).
// Counts an item once per interview; ties go to the more recent interview.
export function topItems(history, field, limit = 6) {
  const found = new Map()
  for (const entry of history) {
    const seenInEntry = new Set()
    for (const raw of entry[field] || []) {
      const text = String(raw).trim()
      const key = normalize(text)
      if (!key || seenInEntry.has(key)) continue
      seenInEntry.add(key)
      const existing = found.get(key)
      if (existing) existing.count += 1
      else found.set(key, { text, count: 1, order: found.size })
    }
  }
  return [...found.values()]
    .sort((a, b) => b.count - a.count || a.order - b.order)
    .slice(0, limit)
    .map(({ text, count }) => ({ text, count }))
}

// Average score per role (the interview "topic"), best first.
export function roleStats(history) {
  const byRole = new Map()
  for (const entry of history) {
    const role = entry.role || 'Other'
    const current = byRole.get(role) || { role, total: 0, count: 0 }
    current.total += entry.overallScore || 0
    current.count += 1
    byRole.set(role, current)
  }
  return [...byRole.values()]
    .map(({ role, total, count }) => ({ role, count, avg: Math.round(total / count) }))
    .sort((a, b) => b.avg - a.avg)
}

// The highest-scoring interview; on a tie the most recent one wins.
export function bestInterview(history) {
  let best = null
  for (const entry of history) {
    if (!best || (entry.overallScore || 0) > (best.overallScore || 0)) best = entry
  }
  return best
}
