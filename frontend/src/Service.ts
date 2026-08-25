import { AxiosResponse } from 'axios'

interface IApiSuccessResponse<T> {
  ok: true
  data: T
}

interface IApiFailureResponse {
  ok: false
  data: Error
}

export type ServiceResponse<T> = IApiSuccessResponse<T> | IApiFailureResponse

export const buildResponse = <T>(res: AxiosResponse<T>): IApiSuccessResponse<T> => {
  return {
    ok: true,
    data: res.data
  }
}

/** Catch clauses are typed `unknown`, so normalise whatever was thrown into an Error. */
export const toError = (err: unknown): Error => {
  if (err instanceof Error) return err
  return new Error(String(err))
}

export const buildErrorResponse = (err: unknown): IApiFailureResponse => {
  return {
    ok: false,
    data: toError(err)
  }
}
