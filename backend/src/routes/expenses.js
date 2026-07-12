const express = require('express');
const { query } = require('../config/database');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /api/expenses/fuel - List fuel logs
router.get('/fuel', authenticateJWT, async (req, res, next) => {
  try {
    const result = await query(`
      SELECT f.*, v.registration_number as vehicle_reg, v.name as vehicle_name
      FROM fuel_logs f
      LEFT JOIN vehicles v ON f.vehicle_id = v.id
      ORDER BY f.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// POST /api/expenses/fuel - Record a fuel log (FINANCIAL_ANALYST only)
router.post('/fuel', authenticateJWT, authorizeRoles('FINANCIAL_ANALYST'), async (req, res, next) => {
  const { vehicle_id, trip_id, fuel_quantity_liters, fuel_cost, fuel_date, odometer_reading } = req.body;

  if (!vehicle_id || !fuel_quantity_liters || !fuel_cost || !fuel_date || !odometer_reading) {
    return res.status(400).json({ error: 'Required fields: vehicle_id, fuel_quantity_liters, fuel_cost, fuel_date, odometer_reading.' });
  }

  try {
    // Verify vehicle exists
    const vehicleRes = await query('SELECT id FROM vehicles WHERE id = $1', [vehicle_id]);
    if (vehicleRes.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    const insertQuery = `
      INSERT INTO fuel_logs (vehicle_id, trip_id, fuel_quantity_liters, fuel_cost, fuel_date, odometer_reading)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await query(insertQuery, [
      vehicle_id, trip_id || null, fuel_quantity_liters, fuel_cost, fuel_date, odometer_reading
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// GET /api/expenses/operational - List operational expenses
router.get('/operational', authenticateJWT, async (req, res, next) => {
  try {
    const result = await query(`
      SELECT e.*, v.registration_number as vehicle_reg, v.name as vehicle_name
      FROM expenses e
      LEFT JOIN vehicles v ON e.vehicle_id = v.id
      ORDER BY e.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// POST /api/expenses/operational - Record an operational expense (FINANCIAL_ANALYST only)
router.post('/operational', authenticateJWT, authorizeRoles('FINANCIAL_ANALYST'), async (req, res, next) => {
  const { vehicle_id, trip_id, expense_type, description, amount, expense_date } = req.body;

  if (!vehicle_id || !expense_type || !amount || !expense_date) {
    return res.status(400).json({ error: 'Required fields: vehicle_id, expense_type, amount, expense_date.' });
  }

  try {
    // Verify vehicle exists
    const vehicleRes = await query('SELECT id FROM vehicles WHERE id = $1', [vehicle_id]);
    if (vehicleRes.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    const insertQuery = `
      INSERT INTO expenses (vehicle_id, trip_id, expense_type, description, amount, expense_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await query(insertQuery, [
      vehicle_id, trip_id || null, expense_type, description, amount, expense_date
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
