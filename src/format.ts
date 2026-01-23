import type { Region } from './histogram'

/**
 * Formats a set of diffs into a string.
 *
 * @example
 *
 * ```js
 * import { histogramDiff, formatDiff } from 'histogram-diff'
 *
 * const fileA = ['a', 'b', 'c', 'd]
 * const fileB = ['a', 'b', 'd', 'e']
 * const diffs = histogramDiff(fileA, fileB)
 * console.log(formatDiff(fileA, fileB, diffs))
 * // Output:
 * //   a
 * //   b
 * // - c
 * //   d
 * // + e
 * ```
 */
export function formatDiff<T = string>(
  fileA: T[],
  fileB: T[],
  diffs: Region[],
): string {
  let a = 0
  let b = 0
  let d = 0
  const chunks: Array<
    [updated: boolean, aLo: number, aHi: number, bLo: number, bHi: number]
  > = []

  // Process all diffs
  while (d < diffs.length) {
    const [aLo, aHi, bLo, bHi] = diffs[d]

    // Add unchanged content before this diff
    if (a < aLo || b < bLo) {
      chunks.push([false, a, aLo, b, bLo])
      a = aLo
      b = bLo
    }

    // Add the diff
    chunks.push([true, aLo, aHi, bLo, bHi])
    a = aHi
    b = bHi
    d++
  }

  // Add any remaining unchanged content
  if (a < fileA.length || b < fileB.length) {
    chunks.push([false, a, fileA.length, b, fileB.length])
  }

  const lines: string[] = []
  for (const [updated, aLo, aHi, bLo, bHi] of chunks) {
    if (updated) {
      for (let i = aLo; i < aHi; i++) {
        lines.push(`- ${fileA[i]}`)
      }
      for (let i = bLo; i < bHi; i++) {
        lines.push(`+ ${fileB[i]}`)
      }
    } else {
      for (let i = aLo; i < aHi; i++) {
        lines.push(`  ${fileA[i]}`)
      }
    }
  }
  return lines.join('\n')
}
