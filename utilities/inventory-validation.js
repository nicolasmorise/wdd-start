const { body, validationResult } = require("express-validator")
const utilities = require(".") // assuming it's in the same utilities folder
const validate = {}

validate.addInventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Please provide a make."),

    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Please provide a model."),

    body("inv_year")
      .trim()
      .notEmpty()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Please provide a valid year."),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Please provide a description."),

    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide a path to the image."),

    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide a path to the thumbnail."),

    body("inv_price")
      .trim()
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid price."),

    body("inv_miles")
      .trim()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Please provide the mileage."),

    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Please provide the color."),

    body("classification_id")
      .trim()
      .notEmpty()
      .isInt()
      .withMessage("Please select a classification.")
  ]
}

validate.checkInventoryData = async (req, res, next) => {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  } = req.body

  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
    return
  }
  next()
}

module.exports = validate
