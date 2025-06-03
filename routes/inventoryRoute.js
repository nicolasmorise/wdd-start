// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidation = require("../utilities/inventory-validation");


// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Rota para a página de detalhes
router.get("/detail/:invId", invController.buildDetailView)

router.get('/', invController.buildManagementView);

router.get("/add-classification", invController.buildAddClassification);

router.get('/add-inventory', invController.buildAddInventory)

router.post("/add-classification", invController.addClassification);

router.post(
  "/add-inventory",
  invValidation.addInventoryRules(),      // validation rules
  invValidation.checkInventoryData,      // check for errors
  invController.addInventory             // run if validation passes
);


module.exports = router;

