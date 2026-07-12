require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { query } = require('../src/config/database');

async function updateEmails() {
  const real = 'jnvtab3@gmail.com';

  // Get all users
  const users = await query('SELECT id, name, role, email FROM users ORDER BY id');

  // Update each user with a temp unique email first, then set the real one
  // This avoids the unique constraint when multiple rows share the same target email
  for (const u of users.rows) {
    const tempEmail = `user_${u.id}_transitops@tmp.local`;
    await query('UPDATE users SET email = $1 WHERE id = $2', [tempEmail, u.id]);
  }

  // Now all emails are unique temps — set all to the real email
  // Since they're all unique at this point, we set them one by one
  for (const u of users.rows) {
    const alias = `jnvtab3+user${u.id}@gmail.com`;
    await query('UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2', [alias, u.id]);
    console.log(`  id=${u.id} ${u.role.padEnd(20)} -> ${alias}`);
  }

  const res = await query('SELECT id, name, role, email FROM users ORDER BY id');
  console.log('\nFinal state:');
  res.rows.forEach(u => console.log(' ', u.id, u.role.padEnd(20), u.email));
  process.exit(0);
}

updateEmails().catch(e => { console.error(e.message); process.exit(1); });
