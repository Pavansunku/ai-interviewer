// Keeps a floating box fully inside the viewport (with a small margin) while it is dragged.
export function clampPosition({ x, y, width, height, viewportWidth, viewportHeight, margin = 8 }) {
  const maxX = Math.max(margin, viewportWidth - width - margin)
  const maxY = Math.max(margin, viewportHeight - height - margin)
  return {
    x: Math.min(Math.max(x, margin), maxX),
    y: Math.min(Math.max(y, margin), maxY),
  }
}
