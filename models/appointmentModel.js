const pool = require("../database") // adjust path as needed

// Create a new appointment
async function createAppointment(account_id, inv_id, date, status) {
  const sql = `INSERT INTO appointments (account_id, inv_id, date, status)
               VALUES ($1, $2, $3, $4) RETURNING *`
  const data = await pool.query(sql, [account_id, inv_id, date, status])
  return data.rows[0]
}


async function getAllAppointments() {
  try {
    const data = await pool.query(`
      SELECT 
        a.appointment_id,
        a.date,
        a.status,
        a.inv_id,
        a.account_id,
        acc.account_firstname AS first_name,
        acc.account_lastname AS last_name,
        inv.inv_make,
        inv.inv_model,
        inv.inv_year
      FROM appointments a
      JOIN account acc ON a.account_id = acc.account_id
      JOIN inventory inv ON a.inv_id = inv.inv_id
      ORDER BY a.date DESC
    `)
    return data.rows
  } catch (error) {
    console.error("getAllAppointments error:", error)
    throw error
  }
}


// Update status
async function updateAppointmentStatus(id, status) {
  const sql = `UPDATE appointments SET status = $1 WHERE appointment_id = $2 RETURNING *`
  const data = await pool.query(sql, [status, id])
  return data.rows[0]
}


module.exports = {createAppointment, getAllAppointments, updateAppointmentStatus}