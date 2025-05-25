const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build individual vehicle detail page
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const inv_id = req.params.invId
  const item = await invModel.getInventoryById(inv_id)
  const nav = await utilities.getNav()
  const title = `${item.inv_year} ${item.inv_make} ${item.inv_model}`
  const detail = utilities.buildVehicleDetail(item)

  res.render("./inventory/detail", {
    title,
    nav,
    detail
  })
}



module.exports = invCont