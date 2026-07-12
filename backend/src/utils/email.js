const nodemailer = require('nodemailer');

// ---------------------------------------------------------------------------
// Transporter — Gmail SMTP via App Password
// ---------------------------------------------------------------------------
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection on startup (non-blocking, just logs)
transporter.verify((err) => {
  if (err) {
    console.error('[SMTP] Connection failed:', err.message);
  } else {
    console.log('[SMTP] Connected — ready to send mail via', process.env.SMTP_USER);
  }
});

// ---------------------------------------------------------------------------
// sendMail — core helper used by all email triggers
// ---------------------------------------------------------------------------
/**
 * @param {object} options
 * @param {string|string[]} options.to       - recipient(s)
 * @param {string}          options.subject  - email subject
 * @param {string}          options.html     - HTML body
 * @returns {Promise<object>}  nodemailer info object
 */
const sendMail = async ({ to, subject, html }) => {
  const info = await transporter.sendMail({
    from: `"TransitOps Platform" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
  console.log(`[SMTP] Sent "${subject}" → ${to} (${info.messageId})`);
  return info;
};

// ---------------------------------------------------------------------------
// Shared layout wrapper — consistent branded header/footer on every email
// ---------------------------------------------------------------------------
const layout = (title, bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wrapper { max-width: 580px; margin: 32px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #1a1a2e; padding: 28px 32px; }
    .header h1 { margin: 0; font-size: 20px; color: #c58b32; letter-spacing: 1px; }
    .header p  { margin: 4px 0 0; font-size: 13px; color: #888; }
    .body { padding: 32px; color: #333; font-size: 14px; line-height: 1.7; }
    .body h2 { margin: 0 0 16px; font-size: 18px; color: #1a1a2e; }
    .info-box { background: #f8f8f9; border-left: 4px solid #c58b32; border-radius: 4px; padding: 16px 20px; margin: 20px 0; }
    .info-box p { margin: 6px 0; font-size: 13px; color: #555; }
    .info-box strong { color: #222; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
    .badge-green  { background: #d4edda; color: #155724; }
    .badge-red    { background: #f8d7da; color: #721c24; }
    .badge-blue   { background: #d1ecf1; color: #0c5460; }
    .badge-orange { background: #fff3cd; color: #856404; }
    .footer { background: #f4f4f5; padding: 20px 32px; font-size: 12px; color: #999; text-align: center; }
    .footer a { color: #c58b32; text-decoration: none; }
    .divider { border: none; border-top: 1px solid #eee; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>TransitOps</h1>
      <p>Smart Transport Operations Platform</p>
    </div>
    <div class="body">
      ${bodyHtml}
    </div>
    <div class="footer">
      This is an automated notification from TransitOps. Do not reply to this email.<br />
      &copy; ${new Date().getFullYear()} TransitOps Platform
    </div>
  </div>
</body>
</html>
`;

// ---------------------------------------------------------------------------
// Email Templates
// ---------------------------------------------------------------------------

/**
 * Welcome email when a new user account is created.
 * @param {object} user   - { name, email, role }
 * @param {string} password - plain-text password (only on creation)
 */
const sendWelcomeEmail = (user, password) =>
  sendMail({
    to: user.email,
    subject: 'Your TransitOps account is ready',
    html: layout('Account Created', `
      <h2>Welcome, ${user.name}</h2>
      <p>Your TransitOps account has been created. Here are your login details:</p>
      <div class="info-box">
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p><strong>Role:</strong> <span class="badge badge-blue">${user.role}</span></p>
      </div>
      <p>Please log in and change your password as soon as possible.</p>
      <hr class="divider" />
      <p style="font-size:12px;color:#999;">If you did not expect this email, please contact your Fleet Manager.</p>
    `),
  });

/**
 * Notify driver when a trip is dispatched and assigned to them.
 * @param {string} driverEmail
 * @param {object} trip   - trip row + vehicle_reg, driver_name, vehicle_name
 * @param {object} vehicle
 * @param {object} driver
 */
const sendTripDispatchedEmail = (driverEmail, trip, vehicle, driver) =>
  sendMail({
    to: driverEmail,
    subject: `Trip Dispatched — ${trip.trip_code}`,
    html: layout('Trip Assigned', `
      <h2>You have been assigned a trip</h2>
      <p>A trip has been dispatched and assigned to you. Please review the details below.</p>
      <div class="info-box">
        <p><strong>Trip Code:</strong> ${trip.trip_code}</p>
        <p><strong>Status:</strong> <span class="badge badge-blue">DISPATCHED</span></p>
        <p><strong>From:</strong> ${trip.source}</p>
        <p><strong>To:</strong> ${trip.destination}</p>
        <p><strong>Cargo Weight:</strong> ${trip.cargo_weight} KG</p>
        <p><strong>Planned Distance:</strong> ${trip.planned_distance} KM</p>
        <p><strong>Vehicle:</strong> ${vehicle.registration_number} — ${vehicle.name}</p>
      </div>
      <p>Log in to the TransitOps portal to acknowledge and manage your trip.</p>
    `),
  });

/**
 * Notify dispatcher/manager when a trip is completed.
 * @param {string} recipientEmail
 * @param {object} trip
 * @param {object} driver
 * @param {object} vehicle
 * @param {number} distanceTravelled
 */
const sendTripCompletedEmail = (recipientEmail, trip, driver, vehicle, distanceTravelled) =>
  sendMail({
    to: recipientEmail,
    subject: `Trip Completed — ${trip.trip_code}`,
    html: layout('Trip Completed', `
      <h2>Trip ${trip.trip_code} has been completed</h2>
      <p>The following trip has been marked as completed and a fuel log has been recorded automatically.</p>
      <div class="info-box">
        <p><strong>Trip Code:</strong> ${trip.trip_code}</p>
        <p><strong>Status:</strong> <span class="badge badge-green">COMPLETED</span></p>
        <p><strong>Route:</strong> ${trip.source} → ${trip.destination}</p>
        <p><strong>Driver:</strong> ${driver.name}</p>
        <p><strong>Vehicle:</strong> ${vehicle.registration_number}</p>
        <p><strong>Distance Travelled:</strong> ${distanceTravelled} KM</p>
        <p><strong>Fuel Consumed:</strong> ${trip.fuel_consumed} L</p>
        <p><strong>Final Odometer:</strong> ${trip.final_odometer} KM</p>
      </div>
      <p>Review the full trip report and fuel log in the TransitOps dashboard.</p>
    `),
  });

/**
 * Notify relevant parties when a trip is cancelled.
 * @param {string} recipientEmail
 * @param {object} trip
 */
const sendTripCancelledEmail = (recipientEmail, trip) =>
  sendMail({
    to: recipientEmail,
    subject: `Trip Cancelled — ${trip.trip_code}`,
    html: layout('Trip Cancelled', `
      <h2>Trip ${trip.trip_code} has been cancelled</h2>
      <p>The following trip has been cancelled. All assigned resources have been released back to available status.</p>
      <div class="info-box">
        <p><strong>Trip Code:</strong> ${trip.trip_code}</p>
        <p><strong>Status:</strong> <span class="badge badge-red">CANCELLED</span></p>
        <p><strong>Route:</strong> ${trip.source} → ${trip.destination}</p>
        <p><strong>Cargo Weight:</strong> ${trip.cargo_weight} KG</p>
      </div>
      <p>Log in to TransitOps to create a new trip if required.</p>
    `),
  });

/**
 * Notify admin/safety officer when a driver is suspended.
 * @param {string} recipientEmail
 * @param {object} driver
 */
const sendDriverSuspendedEmail = (recipientEmail, driver) =>
  sendMail({
    to: recipientEmail,
    subject: `Driver Suspended — ${driver.name}`,
    html: layout('Driver Suspended', `
      <h2>Driver account suspended</h2>
      <p>The following driver has been suspended and will not be available for dispatch until unsuspended.</p>
      <div class="info-box">
        <p><strong>Name:</strong> ${driver.name}</p>
        <p><strong>License No.:</strong> ${driver.license_number}</p>
        <p><strong>Status:</strong> <span class="badge badge-red">SUSPENDED</span></p>
        <p><strong>Safety Score:</strong> ${driver.safety_score}/100</p>
      </div>
      <p>Review the driver profile in TransitOps and take corrective action if necessary.</p>
    `),
  });

/**
 * Notify when a vehicle enters maintenance (IN_SHOP).
 * @param {string} recipientEmail
 * @param {object} vehicle
 * @param {object} maintenance - maintenance log row
 */
const sendMaintenanceStartedEmail = (recipientEmail, vehicle, maintenance) =>
  sendMail({
    to: recipientEmail,
    subject: `Vehicle In Maintenance — ${vehicle.registration_number}`,
    html: layout('Maintenance Started', `
      <h2>Vehicle sent for maintenance</h2>
      <p>A maintenance work order has been opened. The vehicle is now unavailable for dispatch.</p>
      <div class="info-box">
        <p><strong>Vehicle:</strong> ${vehicle.registration_number} — ${vehicle.name}</p>
        <p><strong>Type:</strong> ${maintenance.maintenance_type}</p>
        <p><strong>Description:</strong> ${maintenance.description || 'N/A'}</p>
        <p><strong>Start Date:</strong> ${maintenance.start_date}</p>
        <p><strong>Estimated Cost:</strong> ₹${maintenance.maintenance_cost || 0}</p>
        <p><strong>Status:</strong> <span class="badge badge-orange">IN SHOP</span></p>
      </div>
    `),
  });

/**
 * Notify when maintenance is completed and vehicle is back available.
 * @param {string} recipientEmail
 * @param {object} vehicle
 * @param {object} maintenance
 */
const sendMaintenanceCompletedEmail = (recipientEmail, vehicle, maintenance) =>
  sendMail({
    to: recipientEmail,
    subject: `Maintenance Completed — ${vehicle.registration_number}`,
    html: layout('Maintenance Completed', `
      <h2>Vehicle back in service</h2>
      <p>The maintenance work order has been closed and the vehicle is now available for dispatch.</p>
      <div class="info-box">
        <p><strong>Vehicle:</strong> ${vehicle.registration_number} — ${vehicle.name}</p>
        <p><strong>Type:</strong> ${maintenance.maintenance_type}</p>
        <p><strong>Description:</strong> ${maintenance.description || 'N/A'}</p>
        <p><strong>End Date:</strong> ${maintenance.end_date || 'Today'}</p>
        <p><strong>Total Cost:</strong> ₹${maintenance.maintenance_cost || 0}</p>
        <p><strong>Status:</strong> <span class="badge badge-green">AVAILABLE</span></p>
      </div>
    `),
  });

module.exports = {
  sendMail,
  sendWelcomeEmail,
  sendTripDispatchedEmail,
  sendTripCompletedEmail,
  sendTripCancelledEmail,
  sendDriverSuspendedEmail,
  sendMaintenanceStartedEmail,
  sendMaintenanceCompletedEmail,
};
