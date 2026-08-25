import { describe, it, expect } from 'vitest'
import { QueryFilter } from 'mongoose'

import { regExEscape, rangeFilter, buildPartialTextFilter } from './routesRoutes'
import { IRoutes } from '../models/routes'

describe('regExEscape', () => {
  it('leaves ordinary text alone', () => {
    expect(regExEscape('Bath to Bristol')).toBe('Bath to Bristol')
  })

  it('escapes characters that would otherwise be regex syntax', () => {
    for (const ch of ['.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '^', '$', '/']) {
      expect(new RegExp(regExEscape(ch)).test(ch)).toBe(true)
    }
  })

  it('neutralises quantifiers, so user input cannot build a catastrophic pattern', () => {
    const escaped = regExEscape('(a+)+$')
    expect(new RegExp(escaped).test('(a+)+$')).toBe(true)
    expect(new RegExp(escaped).test('aaaaaaaa')).toBe(false)
  })
})

describe('rangeFilter', () => {
  it('returns undefined when neither bound is given', () => {
    expect(rangeFilter(undefined, undefined)).toBeUndefined()
  })

  it('ignores zero bounds, matching the original behaviour', () => {
    expect(rangeFilter(0, 0)).toBeUndefined()
  })

  it('builds a lower bound alone', () => {
    expect(rangeFilter(10, undefined)).toEqual({ $gte: 10 })
  })

  it('builds an upper bound alone', () => {
    expect(rangeFilter(undefined, 20)).toEqual({ $lte: 20 })
  })

  it('combines both bounds into one condition', () => {
    expect(rangeFilter(10, 20)).toEqual({ $gte: 10, $lte: 20 })
  })
})

describe('buildPartialTextFilter', () => {
  it('requires every word to match (AND of per-word alternatives)', () => {
    const filter: QueryFilter<IRoutes> = {}
    buildPartialTextFilter(filter, 'bath bristol')

    expect(filter.$and).toHaveLength(2)
  })

  it('drops empty words produced by repeated spaces', () => {
    const filter: QueryFilter<IRoutes> = {}
    buildPartialTextFilter(filter, '  bath   bristol  ')

    expect(filter.$and).toHaveLength(2)
  })

  it('matches word starts in name and description', () => {
    const filter: QueryFilter<IRoutes> = {}
    buildPartialTextFilter(filter, 'bath')

    const clause = filter.$and?.[0] as { $or: Record<string, RegExp>[] }
    expect(clause.$or).toHaveLength(4)

    const nameStart = clause.$or[0].name
    expect(nameStart.test('Bath loop')).toBe(true)
    expect(nameStart.test('To Bath')).toBe(false)

    const nameMid = clause.$or[1].name
    expect(nameMid.test('To Bath')).toBe(true)
  })

  it('treats regex metacharacters in the search text literally', () => {
    const filter: QueryFilter<IRoutes> = {}
    buildPartialTextFilter(filter, 'a.c')

    const clause = filter.$and?.[0] as { $or: Record<string, RegExp>[] }
    expect(clause.$or[0].name.test('a.c route')).toBe(true)
    expect(clause.$or[0].name.test('abc route')).toBe(false)
  })
})
