/**
 * Mongoose types a toJSON transform's `ret` as the exact document shape, which
 * has no string index signature. These helpers do the narrowing in one place.
 */
export const asRecord = (ret: object): Record<string, unknown> =>
  ret as unknown as Record<string, unknown>

/** Strip mongo bookkeeping fields from JSON output. */
export const stripInternals = <T extends object>(ret: T): T => {
  const out = asRecord(ret)

  delete out._id
  delete out.__v

  return ret
}
