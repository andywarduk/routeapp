import { Response } from "express"

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

  errorResponse: (res: Response, err: Error | any) => {
    let code = 500

    if (process.env.NODE_ENV != 'production') {
      console.log(err)
    } else {
      console.log(err.toString())
    }

    if (err.response && err.response.status) {
      code = err.response.status
    }

    res.status(code).json({
      ok: false,
      message: err.toString()
    })
  }

}