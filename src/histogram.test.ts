import {
  describe,
  expect,
  test,
} from 'vitest'

import { formatDiff } from './format'
import { histogramDiff } from './histogram'

function visualizeDiff(inputA: string | string[], inputB: string | string[]): string {
  const fileA = typeof inputA === 'string' ? inputA.split('') : inputA
  const fileB = typeof inputB === 'string' ? inputB.split('') : inputB

  const diffs = histogramDiff(fileA, fileB)

  const sortedDiffs = diffs.slice().sort((x, y) => x[0] - y[0])
  expect(sortedDiffs).toEqual(diffs)

  return "\n" + formatDiff(fileA, fileB, diffs) + "\n"
}

describe('histogramDiff', () => {
  test('identical', () => {
    expect(visualizeDiff('abc', 'abc')).toMatchInlineSnapshot(`
      "
        a
        b
        c
      "
    `)
  })

  test('replace last', () => {
    expect(visualizeDiff('abc', 'abd')).toMatchInlineSnapshot(`
      "
        a
        b
      - c
      + d
      "
    `)
  })

  test('replace first', () => {
    expect(visualizeDiff('abc', 'xbc')).toMatchInlineSnapshot(`
      "
      - a
      + x
        b
        c
      "
    `)
  })

  test('replace middle', () => {
    expect(visualizeDiff('abc', 'axc')).toMatchInlineSnapshot(`
      "
        a
      - b
      + x
        c
      "
    `)
  })

  test('multiple replacements', () => {
    expect(visualizeDiff('abcde', 'axcye')).toMatchInlineSnapshot(`
      "
        a
      - b
      + x
        c
      - d
      + y
        e
      "
    `)
  })

  test('completely different', () => {
    expect(visualizeDiff('abc', 'xyz')).toMatchInlineSnapshot(`
      "
      - a
      - b
      - c
      + x
      + y
      + z
      "
    `)
  })

  test('insert at middle', () => {
    expect(visualizeDiff('abc', 'abxc')).toMatchInlineSnapshot(`
      "
        a
        b
      + x
        c
      "
    `)
  })

  test('insert at beginning', () => {
    expect(visualizeDiff('abc', 'xabc')).toMatchInlineSnapshot(`
      "
      + x
        a
        b
        c
      "
    `)
  })

  test('insert at end', () => {
    expect(visualizeDiff('abc', 'abcx')).toMatchInlineSnapshot(`
      "
        a
        b
        c
      + x
      "
    `)
  })

  test('delete from middle', () => {
    expect(visualizeDiff('abc', 'ac')).toMatchInlineSnapshot(`
      "
        a
      - b
        c
      "
    `)
  })

  test('delete from beginning', () => {
    expect(visualizeDiff('abc', 'bc')).toMatchInlineSnapshot(`
      "
      - a
        b
        c
      "
    `)
  })

  test('delete from end', () => {
    expect(visualizeDiff('abc', 'ab')).toMatchInlineSnapshot(`
      "
        a
        b
      - c
      "
    `)
  })

  test('repeated lines', () => {
    expect(visualizeDiff('aaab', 'aaxb')).toMatchInlineSnapshot(`
      "
        a
        a
      - a
      + x
        b
      "
    `)
  })

  test('swap adjacent', () => {
    expect(visualizeDiff('abcd', 'acbd')).toMatchInlineSnapshot(`
      "
        a
      - b
        c
      + b
        d
      "
    `)
  })

  test('real code: add line', () => {
    const fileA = [
      'function hello() {',
      '  console.log("hello");',
      '}',
    ]
    const fileB = [
      'function hello() {',
      '  console.log("hello");',
      '  console.log("world");',
      '}',
    ]
    expect(visualizeDiff(fileA, fileB)).toMatchInlineSnapshot(`
      "
        function hello() {
          console.log("hello");
      +   console.log("world");
        }
      "
    `)
  })

  test('real code: modify line', () => {
    const fileA = [
      'function greet(name) {',
      '  return "Hello, " + name;',
      '}',
    ]
    const fileB = [
      'function greet(name) {',
      '  return `Hello, ${name}!`;',
      '}',
    ]
    expect(visualizeDiff(fileA, fileB)).toMatchInlineSnapshot(`
      "
        function greet(name) {
      -   return "Hello, " + name;
      +   return \`Hello, \${name}!\`;
        }
      "
    `)
  })

  // Tests derived from jgit HistogramDiffTest
  // https://github.com/eclipse-jgit/jgit/blob/0b11d931b030472b7c11bedb57fa3e57461f4654/org.eclipse.jgit.test/tst/org/eclipse/jgit/diff/HistogramDiffTest.java

  test('flip blocks', () => {
    expect(visualizeDiff('aRRSSz', 'aSSRRz')).toMatchInlineSnapshot(`
      "
        a
      - R
      - R
        S
        S
      + R
      + R
        z
      "
    `)
  })

  test('insert2', () => {
    expect(visualizeDiff('aRSz', 'aRRSSz')).toMatchInlineSnapshot(`
      "
        a
        R
      + R
      + S
        S
        z
      "
    `)
  })

  test('flip and expand', () => {
    expect(visualizeDiff('aRSz', 'aSSRRz')).toMatchInlineSnapshot(`
      "
        a
      - R
        S
      + S
      + R
      + R
        z
      "
    `)
  })

  test('LCS contains unique', () => {
    expect(visualizeDiff('nqnjrnjsnm', 'AnqnjrnjsnjTnmZ')).toMatchInlineSnapshot(`
      "
      + A
        n
        q
        n
        j
        r
        n
        j
        s
        n
      + j
      + T
      + n
        m
      + Z
      "
    `)
  })

  test('repeated with unique anchors', () => {
    expect(visualizeDiff('RabS', 'QabT')).toMatchInlineSnapshot(`
      "
      - R
      + Q
        a
        b
      - S
      + T
      "
    `)
  })

  test('many repeated elements', () => {
    expect(visualizeDiff('RaaS', 'QaaT')).toMatchInlineSnapshot(`
      "
      - R
      + Q
        a
        a
      - S
      + T
      "
    `)
  })

  test('all same elements', () => {
    expect(visualizeDiff('bbbbb', 'AbCbDbEFbZ')).toMatchInlineSnapshot(`
      "
      + A
        b
      + C
        b
      + D
        b
      + E
      + F
        b
      - b
      + Z
      "
    `)
  })
})
