require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const {
  sendWelcomeEmail,
  sendTripDispatchedEmail,
  sendTripCompletedEmail,
  sendTripCancelledEmail,
  sendDriverSuspendedEmail,
  sendMaintenanceStartedEmail,
  sendMaintenanceCompletedEmail,
} = require('../src/utils/email');

const INBOX = 'jnvtab3@gmail.com';

const demos = [
  // 1. New user account created
  () => sendWelcomeEmail(
    { name: 'kalp', email: INBOX, role: 'FLEET_MANAGER' },
    'Password@123'
  ),

  // 2. Trip dispatched → driver gets notified
  () => sendTripDispatchedEmail(
    INBOX,
    {
      trip_code: 'TRP-116-9823',
      source: 'Mumbai',
      destination: 'Pune',
      cargo_weight: 8000,
      planned_distance: 150,
      status: 'DISPATCHED',
    },
    { registration_number: 'GJ01AA1001', name: 'Heavy Haul Alpha' },
    { name: 'Rajan Mehta' }
  ),

  // 3. Trip completed → managers notified
  () => sendTripCompletedEmail(
    INBOX,
    {
      trip_code: 'TRP-116-9823',
      source: 'Mumbai',
      destination: 'Pune',
      cargo_weight: 8000,
      fuel_consumed: 28,
      final_odometer: 142460,
    },
    { name: 'Rajan Mehta' },
    { registration_number: 'GJ01AA1001' },
    160
  ),

  // 4. Trip cancelled → managers notified
  () => sendTripCancelledEmail(
    INBOX,
    {
      trip_code: 'TRP-117-1042',
      source: 'Delhi',
      destination: 'Jaipur',
      cargo_weight: 6000,
    }
  ),

  // 5. Driver suspended → safety officers + managers notified
  () => sendDriverSuspendedEmail(
    INBOX,
    {
      name: 'Suresh Yadav',
      license_number: 'HR-20210043210',
      safety_score: 45,
    }
  ),

  // 6. Maintenance started → vehicle goes IN_SHOP
  () => sendMaintenanceStartedEmail(
    INBOX,
    { registration_number: 'GJ05II9009', name: 'Flatbed Iota' },
    {
      maintenance_type: 'ENGINE_OVERHAUL',
      description: 'Major engine service — oil change, filter replacement, brake inspection',
      start_date: '2026-07-12',
      maintenance_cost: 28500,
    }
  ),

  // 7. Maintenance completed → vehicle back AVAILABLE
  () => sendMaintenanceCompletedEmail(
    INBOX,
    { registration_number: 'GJ05II9009', name: 'Flatbed Iota' },
    {
      maintenance_type: 'ENGINE_OVERHAUL',
      description: 'Major engine service — oil change, filter replacement, brake inspection',
      end_date: '2026-07-12',
      maintenance_cost: 31200,
    }
  ),
];

const labels = [
  'Welcome — new user account',
  'Trip Dispatched',
  'Trip Completed',
  'Trip Cancelled',
  'Driver Suspended',
  'Maintenance Started (vehicle IN_SHOP)',
  'Maintenance Completed (vehicle AVAILABLE)',
];

(async () => {
  console.log(`\nSending ${demos.length} demo emails to ${INBOX}\n`);
  for (let i = 0; i < demos.length; i++) {
    try {
      const info = await demos[i]();
      console.log(`  [${i + 1}/${demos.length}] ✓ ${labels[i]}  →  ${info.messageId}`);
    } catch (e) {
      console.error(`  [${i + 1}/${demos.length}] ✗ ${labels[i]}  →  ${e.message}`);
    }
    // small delay so Gmail doesn't rate-limit
    await new Promise(r => setTimeout(r, 400));
  }
  console.log('\nAll done. Check your inbox.\n');
  process.exit(0);
})();
