import { IUser } from "../models/users"

export {}

declare global {
  namespace Express {
      interface User extends IUser {
      }
  }
}