const express = require("express")
const router = express.Router()
const appointmentController = require("../controllers/appointmentController")
const utilities = require("../utilities")

// Handle booking submission
router.post("/book/:inv_id", utilities.checkLogin, appointmentController.bookAppointment)

router.get("/", appointmentController.viewAppointments)

router.post("/update-status", appointmentController.updateStatus)

module.exports = router
