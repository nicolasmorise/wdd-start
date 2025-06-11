// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidation = require("../utilities/inventory-validation")

// Route to build inventory by classification view (PUBLIC)
router.get("/type/:classificationId", 
  utilities.handleErrors(invController.buildByClassificationId)
)

// Route for vehicle detail view (PUBLIC)
router.get("/detail/:invId", 
  utilities.handleErrors(invController.buildDetailView)
)

// Inventory Management View (PROTECTED - Employee/Admin only)
router.get("/", 
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildManagementView)
)

// Add Classification View (PROTECTED)
router.get("/add-classification", 
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassification)
)

// Add Inventory View (PROTECTED)
router.get("/add-inventory", 
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddInventory)
)

// Edit Inventory View (PROTECTED)
router.get("/edit/:inv_id", 
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.editInventoryView)
)

// Delete Inventory View (PROTECTED)
router.get("/delete/:inv_id", 
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.DeleteInventoryView)
)

// Get Inventory JSON (PROTECTED - typically used by management views)
router.get("/getInventory/:classification_id", 
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.getInventoryJSON)
)

// POST Routes (all protected)
router.post("/update/", 
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.updateInventory)
)

router.post("/delete/", 
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventory)
)

router.post("/add-classification", 
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.addClassification)
)

router.post(
  "/add-inventory",
  utilities.checkEmployeeOrAdmin,        // Authorization check
  invValidation.addInventoryRules(),     // Validation rules
  invValidation.checkInventoryData,      // Check for errors
  utilities.handleErrors(invController.addInventory) // Run if validation passes
)

module.exports = router