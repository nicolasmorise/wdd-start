// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController.js")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
// Process the registration data
router.post("/register", regValidate.registationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount))
// Process the login attempt
router.post(
  "/login",
  (req, res) => {
    res.status(200).send('login process')
  }
)

// Process the login attempt
router.post(
  "/register",
  (req, res) => {
    res.status(200).send('login process')
  }
)


module.exports = router