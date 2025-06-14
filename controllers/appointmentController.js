const appointmentModel = require("../models/appointmentModel")
const utilities = require("../utilities") // ✅ Add this line

async function bookAppointment(req, res) {
  const { date } = req.body
  const { inv_id } = req.params
  const account_id = req.session.accountId // guaranteed to exist here thanks to checkLogin middleware
  const status = "Pending"

  if (!date || date.trim() === "") {
    req.flash("error", "Date and time are required.")
    return res.redirect(`/inv/detail/${inv_id}`)
  }

  try {
    await appointmentModel.createAppointment(account_id, inv_id, date, status)
    req.flash("success", "Appointment request submitted successfully.")
    console.log("Booking appointment for account ID:", req.session.accountId);
    res.redirect(`/inv/detail/${inv_id}`)
  } catch (error) {
    console.error("Error booking appointment:", error)
    req.flash("error", "Something went wrong. Please try again.")
    res.redirect(`/inv/detail/${inv_id}`)
  }
}

async function viewAppointments(req, res) {
  const appointments = await appointmentModel.getAllAppointments()
  res.render("appointments/admin", {
    appointments,
    title: "Appointments",
    nav: await utilities.getNav()
  })
}

// Admin: Update status
async function updateStatus(req, res) {
  const { appointment_id, status } = req.body
  await appointmentModel.updateAppointmentStatus(appointment_id, status)
  res.redirect("/appointments")
}

module.exports = {bookAppointment, viewAppointments, updateStatus}