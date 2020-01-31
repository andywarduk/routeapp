// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
import { IUser } from "../models/users"

export {}

declare global {
  namespace Express {
      interface User extends IUser {
      }
  }
}