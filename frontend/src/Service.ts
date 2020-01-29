import { AxiosResponse, AxiosError } from 'axios'

interface IApiSuccessResponse<T> {
  ok: true,
  data: T
}

interface IApiFailureResponse<T> {
  ok: false
  data: AxiosError<T>
}

export type ServiceResponse<T> = IApiSuccessResponse<T> | IApiFailureResponse<AxiosError<T>>

export const buildResponse = <T>(res: AxiosResponse<T>): IApiSuccessResponse<T> => {
  return {
    ok: true,
    data: res.data
  }
}

export const buildErrorResponse = <T>(err: AxiosError<T>): IApiFailureResponse<T> => {
  return {
    ok: false,
    data: err
  }
}
