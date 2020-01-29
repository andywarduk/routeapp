module.exports = {

  msgResponse: (res, message) => {
    res.json({
      ok: true,
      message
    })
  },

  errorResponse: (res, err) => {
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