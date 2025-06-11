// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController.js")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))

router.get("/", utilities.handleErrors(accountController.buildAccount))

// Process the registration data
router.post("/register", regValidate.registationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount))

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLogData,
  utilities.handleErrors(accountController.accountLogin)
)

// Display account update form
router.get(
  "/update/:accountId",
  utilities.checkLogin,  // Ensure user is logged in
  utilities.handleErrors(accountController.buildUpdateView)
);

// Logout route
router.get('/logout', 
  utilities.handleErrors(accountController.logout)
);

// Process account updates
router.post(
  "/update",
  utilities.checkLogin,
  utilities.handleErrors(accountController.updateAccount)
);


router.post("/update-password", 
  utilities.checkLogin,
  utilities.handleErrors(accountController.updatePassword)
);

module.exports = router