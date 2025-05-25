const errorController = {}

errorController.throwError = (req, res, next) => {
  try {
    throw new Error("Intentional Server Error for testing purposes.")
  } catch (err) {
    err.status = 500
    next(err)
  }
}

module.exports = errorController