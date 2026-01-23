import { Counter } from './counter'

/**
 * A region is a range of file A together with a range of file B, represented by
 * inclusive start and exclusive end indices.
 *
 * [aLo, aHi) and [bLo, bHi) are inclusive start and exclusive end indices for
 * file A and B respectively.
 */
export type Region = [aLo: number, aHi: number, bLo: number, bHi: number]

const MAX_CHAIN_LENGTH = 64


/**
 * Compares two files and returns a list of regions that are different.
 */
export function histogramDiff<T = string>(fileA: T[], fileB: T[]): Region[] {
  const stack: Region[] = [[0, fileA.length, 0, fileB.length]]
  const diffs: Region[] = []
  while (stack.length > 0) {
    const currentRegion: Region = stack.pop()!
    const bestMatch: Region | undefined = findBestMatchingRegionIn(
      fileA,
      fileB,
      currentRegion,
    )
    if (!bestMatch) {
      diffs.push(currentRegion)
    } else {
      const [beforeMatch, afterMatch] = splitRegion(currentRegion, bestMatch)
      // Push afterMatch first, then beforeMatch. Since stack is LIFO, before is processed
      // first. This ensures diffs are output in sorted order (by aLo).
      if (!isRegionEmpty(afterMatch)) {
        stack.push(afterMatch)
      }
      if (!isRegionEmpty(beforeMatch)) {
        stack.push(beforeMatch)
      }
    }
  }
  return diffs
}

function findBestMatchingRegionIn<T>(
  fileA: T[],
  fileB: T[],
  currentRegion: Region,
): Region | undefined {
  const [ALo, AHi, BLo, BHi] = currentRegion

  const aFirstIndexMap = new Map<T, number>()
  const aCounter = new Counter<T>()
  const aNext: number[] = new Array<number>(AHi - ALo).fill(-1)

  for (let a1 = AHi - 1; a1 >= ALo; a1--) {
    const line = fileA[a1]
    const a2 = aFirstIndexMap.get(line)
    if (a2 != null) {
      aNext[a1 - ALo] = a2
    }
    aFirstIndexMap.set(line, a1)
    aCounter.increment(line)
  }

  let bestMatch: Region | undefined
  let bestMatchLength = 0
  let bestLowCount = MAX_CHAIN_LENGTH

  for (let b = BLo; b < BHi;) {
    const lineB = fileB[b]
    const aFirstIndex = aFirstIndexMap.get(lineB)

    if (aFirstIndex === undefined) {
      b++
      continue
    }

    const aCount = aCounter.get(lineB)

    // If count exceeds our best lowcount, skip but mark as having common
    if (aCount > bestLowCount) {
      b++
      continue
    }

    let bNext = b + 1

    // Try all occurrences of this line in A
    let a: number = aFirstIndex
    while (a != -1) {
      let aLo = a
      let bLo = b
      let aHi = a + 1
      let bHi = b + 1
      let regionCount = aCount

      // Expand backwards
      while (aLo > ALo && bLo > BLo && fileA[aLo - 1] === fileB[bLo - 1]) {
        aLo--
        bLo--
        if (regionCount > 1) {
          regionCount = Math.min(regionCount, aCounter.get(fileA[aLo]))
        }
      }

      // Expand forwards
      while (aHi < AHi && bHi < BHi && fileA[aHi] === fileB[bHi]) {
        if (regionCount > 1) {
          regionCount = Math.min(regionCount, aCounter.get(fileA[aHi]))
        }
        aHi++
        bHi++
      }

      if (bHi > bNext) {
        bNext = bHi
      }

      const matchLength = aHi - aLo
      if (matchLength > bestMatchLength || regionCount < bestLowCount) {
        bestMatch = [aLo, aHi, bLo, bHi]
        bestMatchLength = matchLength
        bestLowCount = regionCount
      }

      // Move to next occurrence
      while (a !== -1 && a < aHi) {
        a = aNext[a - ALo]
      }
    }

    b = bNext
  }

  return bestMatch
}

/**
 * Splits a parent region into two regions before and after a match region.
 * The match region should be a subrange of the parent region.
 */
function splitRegion(parent: Region, match: Region): [Region, Region] {
  const [pALo, pAHi, pBLo, pBHi] = parent
  const [mALo, mAHi, mBLo, mBHi] = match
  return [
    [pALo, mALo, pBLo, mBLo], // before
    [mAHi, pAHi, mBHi, pBHi], // after
  ]
}

function isRegionEmpty(region: Region): boolean {
  const [aLo, aHi, bLo, bHi] = region
  return aLo === aHi && bLo === bHi
}
