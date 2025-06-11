const utilities = require('../utilities')
const accountModel = require('../models/account-model')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    account_email: ''
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver account view view
* *************************************** */
async function buildAccount(req, res, next) {
  let nav = await utilities.getNav()

  const accountData = res.locals.accountData

  res.render("account/account", {
    title: "Account",
    nav,
    accountData,
    errors: null, 
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )



  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      account_email,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      // Remove password before creating token
      const accountDataForToken = { ...accountData }
      delete accountDataForToken.account_password
      
      // Create JWT token
      const accessToken = jwt.sign(accountDataForToken, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      
      // Set cookie
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      
      // Set res.locals for use in views
      res.locals.loggedin = true
      res.locals.accountData = accountDataForToken
      
      return res.redirect("/account")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Check login status on every request
* *************************************** */
async function checkLoginStatus(req, res, next) {
  const token = req.cookies.jwt;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      res.locals.loggedin = true;
      res.locals.accountData = decoded;
    } catch (error) {
      // Token is invalid or expired
      res.clearCookie('jwt');
    }
  }
  next();
}

// Display update form
async function buildUpdateView(req, res) {
  let nav = await utilities.getNav();
  const accountId = req.params.accountId;
  
  // Fetch current account data
  const accountData = await accountModel.getAccountById(accountId);
  
  res.render("account/update", {
    title: "Update Account",
    nav,
    accountData,
    errors: null,
  });
}


// Process account updates
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  
  // Update logic (validate, then save to DB)
  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  );
  
  if (updateResult) {
    req.flash("success", "Account updated successfully.");
    res.redirect("/account");
  } else {
    req.flash("error", "Failed to update account.");
    res.redirect(`/account/update/${account_id}`);
  }
}

// Process password update
async function updatePassword(req, res) {
  const { account_id, account_password } = req.body;
  
  // Hash new password
  const hashedPassword = await bcrypt.hash(account_password, 10);
  
  const updateResult = await accountModel.updatePassword(account_id, hashedPassword);
  
  if (updateResult) {
    req.flash("success", "Password updated successfully");
    res.redirect("/account");
  } else {
    req.flash("error", "Failed to update password");
    res.redirect(`/account/update/${account_id}`);
  }
}

async function logout(req, res) {
  try {
    // 1. Store flash message BEFORE destroying session
    req.flash('success', 'You have been successfully logged out.');

    // 2. Clear the JWT cookie (if using JWT)
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    // 3. Destroy session (async operation)
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        req.flash('error', 'Logout failed. Please try again.');
        return res.redirect('/account');
      }

      // 4. Clear local variables
      res.locals.loggedin = false;
      res.locals.accountData = null;

      // 5. Redirect (flash message was already set)
      res.redirect('/');
    });
  } catch (error) {
    console.error('Logout error:', error);
    req.flash('error', 'Logout failed. Please try again.');
    res.redirect('/account');
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, buildAccount, accountLogin, checkLoginStatus, buildUpdateView, updateAccount, updatePassword, logout }