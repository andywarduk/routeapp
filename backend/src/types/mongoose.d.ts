declare module "mongoose" {
  interface QueryFindOneAndUpdateOptions {
    overwrite: true
  }
}
