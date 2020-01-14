export const buildResponse = (res) => {
  return {
    ok: true,
    data: res.data
  }
}

export const buildErrorResponse = (err) => {
  return {
    ok: false,
    data: err
  }  
}
