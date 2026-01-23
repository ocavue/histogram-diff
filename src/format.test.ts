import { describe, expect, test } from 'vitest'

import { formatDiff } from './format'
import { histogramDiff } from './histogram'

describe('formatDiff', () => {
  test('real-world example', () => {
    const fileA = [
      'function add(a, b) {',
      '  console.log(a, b)',
      '  const sum = a + b',
      '  return sum',
      '}',
    ]

    const fileB = [
      'function add(a, b) {',
      '  if (typeof a !== "number" || typeof b !== "number") {',
      '    throw new Error("a and b must be numbers")',
      '  }',
      '  const sum = a + b',
      '  return sum',
      '}',
    ]

    const diffs = histogramDiff(fileA, fileB)
    expect(formatDiff(fileA, fileB, diffs)).toMatchInlineSnapshot(`
      "  function add(a, b) {
      -   console.log(a, b)
      +   if (typeof a !== "number" || typeof b !== "number") {
      +     throw new Error("a and b must be numbers")
      +   }
          const sum = a + b
          return sum
        }"
    `)
  })
})
