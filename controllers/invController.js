const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require("express-validator");

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

/* ***************************
 *  Build management page
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  const message = req.flash('notice');
  const nav = await utilities.getNav()
  res.render('inventory/management', {
    title: 'Inventory Management',
    nav,
    message
  });
};

/* ***************************
 *  Build management page
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  const message = req.flash('notice');
  const nav = await utilities.getNav();
  res.render('inventory/add-classification', {
    title: 'Add Classification',
    nav,
    message
  });
};

/* ***************************
 *  Build management page
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  const message = req.flash('notice');
  const nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList()
  res.render('inventory/add-inventory', {
    title: 'Add Inventory',
    nav,
    message,
    classificationList,
  });
};


/* ***************************
 *  Add Classification Function
 * ************************** */

invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body;
  const nav = await utilities.getNav();

  try {
    // Basic validation
    if (!classification_name || classification_name.trim() === "") {
      req.flash("notice", "Classification name is required.");
      return res.status(400).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        message: req.flash("notice"),
      });
    }

    // Allow only alphabetic characters (you can allow spaces if you want)
    const alphaRegex = /^[A-Za-z]+$/;
    if (!alphaRegex.test(classification_name.trim())) {
      req.flash("notice", "Classification name must contain only alphabetic characters.");
      return res.status(400).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        message: req.flash("notice"),
      });
    }

    // Insert classification into the database
    const result = await invModel.addClassification(classification_name.trim());

    if (result) {
      req.flash("notice", "Classification added successfully.");
      res.redirect("/inv");
    } else {
      req.flash("notice", "Failed to add classification.");
      res.status(500).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        message: req.flash("notice"),
      });
    }
  } catch (error) {
    console.error("Error adding classification:", error);
    req.flash("notice", "Server error. Please try again.");
    res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      message: req.flash("notice"),
      errors: null,
    });
  }
};

/* ****************************************
*  Process Add Inventory
* *************************************** */
invCont.addInventory = async function(req, res) {
  let nav = await utilities.getNav();
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const classificationList = await utilities.buildClassificationList(classification_id);
    return res.status(400).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: errors.array(),
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });
  }

  const addResult = await invModel.addInventory({
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  });

  if (addResult) {
    req.flash("notice", `Vehicle "${inv_make} ${inv_model}" added successfully.`);
    res.status(201).redirect("/inv/");
  } else {
    const classificationList = await utilities.buildClassificationList(classification_id);
    req.flash("notice", "Sorry, the vehicle could not be added.");
    res.status(501).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: null,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });
  }
}

module.exports = invCont