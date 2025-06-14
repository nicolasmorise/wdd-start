const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()



/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  console.log(data)
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

Util.buildVehicleDetail = function (data, flashMessages = {}) {
  let detail = ''

  if (data) {
    detail += '<section class="vehicle-detail">'
    detail += `<img src="${data.inv_image}" alt="Image of ${data.inv_make} ${data.inv_model}" class="vehicle-img" />`
    detail += '<div class="vehicle-info">'
    detail += `<h2>$${new Intl.NumberFormat('en-US').format(data.inv_price)}</h2>`
    detail += `<p>${data.inv_description}</p>`
    detail += '<ul>'
    detail += `<li><strong>Make:</strong> ${data.inv_make}</li>`
    detail += `<li><strong>Model:</strong> ${data.inv_model}</li>`
    detail += `<li><strong>Year:</strong> ${data.inv_year}</li>`
    detail += `<li><strong>Miles:</strong> ${new Intl.NumberFormat('en-US').format(data.inv_miles)}</li>`
    detail += '</ul>'

    // Flash messages
    if (flashMessages.success) {
      detail += `<div class="flash success">${flashMessages.success}</div>`
    }
    if (flashMessages.error) {
      detail += `<div class="flash error">${flashMessages.error}</div>`
    }

    // Booking form
    if (data.sessionLoggedIn) {
      detail += `
        <form class="appointment-form" action="/appointments/book/${data.inv_id}" method="post">
          <label for="date">Choose Date & Time:</label>
          <input type="datetime-local" id="date" name="date" required>
          <button type="submit">Book Appointment</button>
        </form>
      `
    } else {
      detail += `<p><a href="/account/login">Log in</a> to book an appointment.</p>`
    }

    detail += '</div></section>'
  }

  return detail
}


Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"

  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected"
    }
    classificationList += `>${row.classification_name}</option>`
  })

  classificationList += "</select>"
  return classificationList
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

 /* ****************************************
* Middleware to check Employee/Admin access
**************************************** */
Util.checkEmployeeOrAdmin = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("error", "Session expired. Please log in again.")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }

        // Check account type
        if (accountData.account_type !== "Employee" && accountData.account_type !== "Admin") {
          req.flash("error", "You must be an Employee or Admin to access this page.")
          return res.redirect("/account/login")
        }

        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    req.flash("error", "Please log in to access this page.")
    res.redirect("/account/login")
  }
}

module.exports = Util