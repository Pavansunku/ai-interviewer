/**
 * Split text into sentence-sized chunks of at most `maxLen` characters.
 * Used by both voices: the browser voice (Chrome cuts off long utterances
 * after ~15s) and Groq Orpheus (200 characters per request).
 * A sentence longer than `maxLen` is wrapped at word boundaries; no text is dropped.
 */
export function splitIntoChunks(text, maxLen = 200) {
  // Split on sentence-ending punctuation followed by whitespace
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || [text]
  const chunks = []
  let current = ''

  const pushWrapped = (sentence) => {
    let line = ''
    for (const word of sentence.split(/\s+/).filter(Boolean)) {
      // A single word longer than maxLen (e.g. a URL) is cut into maxLen-sized pieces
      for (let start = 0; start < word.length; start += maxLen) {
        const piece = word.slice(start, start + maxLen)
        if (line && (line + ' ' + piece).length > maxLen) {
          chunks.push(line)
          line = piece
        } else {
          line = line ? `${line} ${piece}` : piece
        }
      }
    }
    return line
  }

  for (const s of sentences) {
    if ((current + s).length > maxLen) {
      if (current.trim()) chunks.push(current.trim())
      current = s.trim().length > maxLen ? pushWrapped(s) + ' ' : s
    } else {
      current += s
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks.length > 0 ? chunks : [text]
}
