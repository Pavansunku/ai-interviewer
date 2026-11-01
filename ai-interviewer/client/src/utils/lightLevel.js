// Tells whether the camera picture is too dark (covered lens, lights off, backlit room).

export const DARK_LUMA = 35 // average brightness out of 255 below which the picture counts as dark

// Average brightness of RGBA pixel data (as returned by canvas getImageData().data)
export function averageLuma(data) {
  const pixels = data.length / 4
  if (!pixels) return 255
  let sum = 0
  for (let i = 0; i < data.length; i += 4) {
    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }
  return sum / pixels
}

// Needs 3 dark readings in a row to flag "dark" and 2 bright ones to clear it,
// so a blink or a passing shadow doesn't flicker the warning.
export function stepLight(state, luma) {
  const dark = luma < DARK_LUMA
  const low = dark ? state.low + 1 : 0
  const high = dark ? 0 : state.high + 1
  let level = state.level
  if (low >= 3) level = 'dark'
  else if (high >= 2) level = 'ok'
  return { low, high, level }
}
