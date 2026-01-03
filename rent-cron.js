const mysql = require('mysql2/promise');
const cron = require('node-cron');
const dayjs = require('dayjs');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_user',
  password: 'your_password',
  database: 'goyal_app'
});

async function generateRentRecords() {
  try {
    const [tenants] = await pool.query(`SELECT id, monthly_rent FROM tenants WHERE is_active = 1`);

    const currentMonth = dayjs().format('YYYY-MM');
    const dueDate = dayjs().startOf('month').format('YYYY-MM-DD');

    for (const tenant of tenants) {
      const [existing] = await pool.query(
        `SELECT id FROM rent_records WHERE tenant_id = ? AND DATE_FORMAT(due_date, '%Y-%m') = ?`,
        [tenant.id, currentMonth]
      );

      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO rent_records (tenant_id, amount, due_date, status)
           VALUES (?, ?, ?, 'pending')`,
          [tenant.id, tenant.monthly_rent, dueDate]
        );
        console.log(` Rent created for tenant ${tenant.id}`);
      } else {
        console.log(` Already exists for tenant ${tenant.id}`);
      }
    }
  } catch (err) {
    console.error(' Error generating rent records:', err);
  }
}

cron.schedule('0 0 1 * *', () => {
  console.log(' Running monthly rent generation...');
  generateRentRecords();
});

if (require.main === module) {
  generateRentRecords().then(() => {
    console.log(' Manual generation complete');
    process.exit(0);
  });
}
