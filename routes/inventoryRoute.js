// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Rota para a página de detalhes
router.get("/detail/:invId", invController.buildDetailView)

module.exports = router;

