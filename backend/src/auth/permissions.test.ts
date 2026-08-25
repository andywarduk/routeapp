import { describe, it, expect, vi } from 'vitest'
import { Request, Response, NextFunction } from 'express'

import { checkPermission } from './permissions'
import { IPerms } from '../models/userPerms'

const run = (perms: Partial<IPerms> | undefined, required: (keyof IPerms)[]) => {
  const req = { user: perms === undefined ? undefined : { perms } } as unknown as Request

  const res = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis()
  } as unknown as Response & { status: ReturnType<typeof vi.fn>, send: ReturnType<typeof vi.fn> }

  const next = vi.fn() as unknown as NextFunction

  checkPermission(...required)(req, res, next)

  return { res, next, allowed: (next as unknown as ReturnType<typeof vi.fn>).mock.calls.length > 0 }
}

describe('checkPermission', () => {
  it('denies an unauthenticated request', () => {
    const { allowed, res } = run(undefined, ['viewRoutes'])
    expect(allowed).toBe(false)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('denies a user with no permissions', () => {
    expect(run({}, ['viewRoutes']).allowed).toBe(false)
  })

  it('allows a user holding the required permission', () => {
    expect(run({ viewRoutes: true }, ['viewRoutes']).allowed).toBe(true)
  })

  it('denies a user holding only some other permission', () => {
    expect(run({ viewRoutes: true }, ['deleteRoutes']).allowed).toBe(false)
  })

  it('allows admin through any check', () => {
    expect(run({ admin: true }, ['deleteRoutes']).allowed).toBe(true)
  })

  it('allows when any one of several permissions matches', () => {
    expect(run({ deleteRoutes: true }, ['modifyRoutes', 'deleteRoutes']).allowed).toBe(true)
  })

  it('does not treat a false permission as granted', () => {
    expect(run({ viewRoutes: false }, ['viewRoutes']).allowed).toBe(false)
  })
})
