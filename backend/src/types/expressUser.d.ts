import { IUser } from "../models/users"

export {}

declare global {
  namespace Express {
    // Interface merging is how Express expects req.user to be typed, so the
    // empty body is deliberate here.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends IUser {}
  }
}
