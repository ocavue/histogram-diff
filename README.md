# histogram-diff

[![NPM version](https://img.shields.io/npm/v/histogram-diff?color=a1b858&label=)](https://www.npmjs.com/package/histogram-diff)

A TypeScript implementation of the [histogram diff algorithm](https://git-scm.com/docs/diff-options/2.6.7#Documentation/diff-options.txt---histogram).

## Installation

```bash
npm install histogram-diff
```

## Usage

```ts
import { histogramDiff, formatDiff } from 'histogram-diff'

const fileA = ['a', 'b', 'c', 'd']
const fileB = ['a', 'b', 'd', 'e']

const diffs = histogramDiff(fileA, fileB)
console.log(formatDiff(fileA, fileB, diffs))
// Output:
//   a
//   b
// - c
//   d
// + e
```

### Real-world example

```ts
import { histogramDiff, formatDiff } from 'histogram-diff'

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
console.log(formatDiff(fileA, fileB, diffs))
// Output:
//   function add(a, b) {
// -   console.log(a, b)
// +   if (typeof a !== "number" || typeof b !== "number") {
// +     throw new Error("a and b must be numbers")
// +   }
//     const sum = a + b
//     return sum
//   }
```

## API

### `histogramDiff<T = string>(fileA: T[], fileB: T[]): Region[]`

Compares two arrays and returns a list of regions that are different.

- `fileA` - The first array (original)
- `fileB` - The second array (modified)
- Returns an array of `Region` tuples representing the differences

### `formatDiff(fileA: string[], fileB: string[], diffs: Region[]): string`

Formats the diff output into a human-readable string with `+` and `-` markers.

- `fileA` - The first array (original)
- `fileB` - The second array (modified)
- `diffs` - The diff regions from `histogramDiff`
- Returns a formatted string

### `Region`

A tuple type representing a diff region: `[aLo, aHi, bLo, bHi]`

- `aLo` - Start index in `fileA` (inclusive)
- `aHi` - End index in `fileA` (exclusive)
- `bLo` - Start index in `fileB` (inclusive)
- `bHi` - End index in `fileB` (exclusive)

## License

MIT
