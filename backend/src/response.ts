import { Response } from "express"

import { isProduction } from "./config"

/** Pull an upstream HTTP status off an axios-style error, if there is one. */
const upstreamStatus = (err: unknown): number | undefined => {
  if (typeof err !== 'object' || err === null) return undefined

  const { response } = err as { response?: { status?: number } }

  return response?.status
}

export default {

  msgResponse: (res: Response, message: string) => {
    res.json({
      ok: true,
      message
    })
  },

  errorMsgResponse: (res: Response, code: number, message: string) => {
    res.status(code).json({
      ok: false,
      message
    })
  },

  errorResponse: (res: Response, err: unknown) => {
    if (isProduction) {
      console.log(String(err))
    } else {
      console.log(err)
    }

    res.status(upstreamStatus(err) ?? 500).json({
      ok: false,
      message: String(err)
    })
  }

}
