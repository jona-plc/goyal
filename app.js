require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const pool = require('./db'); 
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', './views');

 app.use((req, res, next) => {
  if (req.session.isAdmin) {
    res.locals.user = { name: 'Admin', role: 'admin' };
  } else if (req.session.tenantId) {
    res.locals.user = { id: req.session.tenantId, name: req.session.username, role: 'tenant' };
  } else {
    res.locals.user = null;
  }
  next();
});

 app.use(async (req, res, next) => {
  if (req.session.tenantId) {
    try {
      await pool.query('UPDATE tenants SET last_active = NOW() WHERE id = ?', [req.session.tenantId]);
    } catch (err) {
      console.error('Failed to update last_active:', err);
    }
  }
  next();
});



 function isAdmin(req, res, next) {
  if (!req.session.isAdmin) return res.redirect('/');
  next();
}

function isTenant(req, res, next) {
  if (!req.session.tenantId) return res.redirect('/');
  next();
}



app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

 app.post('/', async (req, res) => {
  const { username, password } = req.body;

  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

   if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    req.session.username = ADMIN_USERNAME;
    return res.redirect('/admin/dashboard');
  }

   try {
    const [rows] = await pool.query('SELECT * FROM tenants WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.render('login', { error: 'Invalid username or password' });
    }

    const tenant = rows[0];
    if (!tenant.is_active) {
      return res.render('login', { error: 'Account is not active' });
    }

    const match = await bcrypt.compare(password, tenant.password);
    if (!match) {
      return res.render('login', { error: 'Invalid username or password' });
    }

     await pool.query('UPDATE tenants SET last_login = NOW(), last_active = NOW() WHERE id = ?', [tenant.id]);

    req.session.tenantId = tenant.id;
    req.session.username = tenant.username;

    return res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    return res.render('login', { error: 'Something went wrong' });
  }
});

 app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect('/');
  });
});

// Log a page visit
app.get('/', async (req, res) => {
  const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const user_agent = req.headers['user-agent'];

  try {
    const [result] = await pool.query(
      `INSERT INTO visitors (type, ip_address, user_agent, created_at)
       VALUES ('visit', ?, ?, NOW())`,
      [ip_address, user_agent]
    );

    const visitor = {
      id: result.insertId,
      type: 'visit',
      ip_address,
      user_agent,
      created_at: new Date()
    };

    io.emit('newVisitor', visitor);  
  } catch (err) {
    console.error('Failed to log visitor:', err);
  }

  res.render('index', { error: null });
});

// Route to render admin visitors page
app.get("/admin/visitors", async (req, res) => {
  try {
    // Fetch inquiries from MySQL
    const [rows] = await pool.query(
      "SELECT * FROM visitors WHERE type = 'inquiry' ORDER BY id DESC"
    );
    
    // Render the EJS template and pass the data
    res.render("admin/visitors", { visitors: rows });
  } catch (err) {
    console.error("Error loading inquiries:", err);
    res.status(500).send("Failed to load visitor data");
  }
});

// API endpoint for frontend pagination
app.get("/api/inquiries", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM visitors WHERE type = 'inquiry' ORDER BY id DESC"
    );
    res.json(rows); // returns JSON for JS pagination
  } catch (err) {
    console.error("Failed to fetch inquiries:", err);
    res.status(500).json({ error: err.message });
  }
});



app.get('/admin/dashboard', isAdmin, async (req, res) => {
  try {
     const [[totalResult]] = await pool.query('SELECT COUNT(*) AS totalCount FROM tenants');

     const [[activeResult]] = await pool.query(`
      SELECT COUNT(*) AS activeCount 
      FROM tenants 
      WHERE last_active > (NOW() - INTERVAL 10 MINUTE) AND is_active = 1
    `);
 const [[monthlyIncomeResult]] = await pool.query(`
  SELECT IFNULL(SUM(amount), 0) AS monthlyIncome
  FROM payments
  WHERE status = 'paid'
    AND MONTH(payment_date) = MONTH(CURDATE())
    AND YEAR(payment_date) = YEAR(CURDATE())
`);

 const [[totalIncomeResult]] = await pool.query(`
  SELECT IFNULL(SUM(amount), 0) AS totalIncome
  FROM payments
  WHERE status = 'paid'
`);


      const [recentPayments] = await pool.query(`
      SELECT 
        p.amount, 
        p.payment_date, 
        CONCAT(t.first_name, ' ', t.last_name) AS tenant_name,
        p.payment_method
      FROM payments p
      JOIN tenants t ON p.tenant_id = t.id
      WHERE p.status = 'paid'
      ORDER BY p.payment_date DESC
      LIMIT 7
    `);
const [trendRows] = await pool.query(`
  SELECT DATE_FORMAT(payment_date, '%Y-%m') AS month, SUM(amount) AS total
  FROM payments
  WHERE status = 'paid'
    AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
  GROUP BY month
  ORDER BY month
`);


     let labels = trendRows.map(r => {
      const [year, month] = r.month.split("-");
      return new Date(year, month - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
    });

    let data = trendRows.map(r => r.total);

     const now = new Date();
    const currentMonthLabel = now.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!labels.includes(currentMonthLabel)) {
      labels.push(currentMonthLabel);
      data.push(0);
    }

     res.render('admin/dashboard', {
      username: req.session.username,
      totalTenants: totalResult.totalCount,
      activeUsers: activeResult.activeCount,
      monthlyIncome: monthlyIncomeResult.monthlyIncome,
      totalIncome: totalIncomeResult.totalIncome,
      incomeChartLabels: JSON.stringify(labels),
      incomeChartData: JSON.stringify(data),
      recentPayments
    });

  } catch (err) {
    console.error('Error loading dashboard:', err);
    res.render('admin/dashboard', {
      username: req.session.username,
      totalTenants: 0,
      activeUsers: 0,
      monthlyIncome: 0,
      totalIncome: 0,
      incomeChartLabels: JSON.stringify([]),
      incomeChartData: JSON.stringify([]),
      recentPayments: []
    });
  }
});
app.get('/admin/financial-analytics', isAdmin, async (req, res) => {
  const selectedYear = parseInt(req.query.year) || new Date().getFullYear();
  
  const availableYears = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 5; y--) {
    availableYears.push(y);
  }

  try {
     const [incomeRows] = await pool.query(`
      SELECT MONTH(payment_date) AS month, SUM(amount) AS total_income
      FROM payments
      WHERE status = 'paid' AND YEAR(payment_date) = ?
      GROUP BY month
      ORDER BY month
    `, [selectedYear]);

    const monthlyIncome = Array(12).fill(0);
    incomeRows.forEach(row => {
      monthlyIncome[row.month - 1] = Number(row.total_income);
    });

    const totalIncome = monthlyIncome.reduce((a, b) => a + b, 0);

     const [incomePerRoomRows] = await pool.query(`
      SELECT 
        r.room_number,
        SUM(p.amount) AS income
      FROM payments p
      JOIN tenants t ON p.tenant_id = t.id
      JOIN rooms r ON t.room_id = r.id
      WHERE p.status = 'paid' AND YEAR(p.payment_date) = ?
      GROUP BY r.id
    `, [selectedYear]);

    const incomeRoomLabels = incomePerRoomRows.map(row => `Room ${row.room_number}`);
    const incomeRoomData = incomePerRoomRows.map(row => Number(row.income));

     res.render('admin/financial-analytics', {
      selectedYear,
      availableYears,
      totalIncome,
      monthlyIncome,
      incomeRoomLabels,
      incomeRoomData,
      page: 'financial-analytics'  
    });

  } catch (error) {
    console.error('Error loading financial analytics:', error);
    res.status(500).send('Server error');
  }
});


app.get('/api/financial-analytics', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();

    const [incomeRows] = await pool.query(`
      SELECT MONTH(payment_date) AS month, SUM(amount) AS total_income
      FROM payments
      WHERE status = 'paid' AND YEAR(payment_date) = ?
      GROUP BY month
      ORDER BY month
    `, [year]);

    const monthlyIncome = Array(12).fill(0);
    incomeRows.forEach(row => {
      monthlyIncome[row.month - 1] = Number(row.total_income);
    });

    const totalIncome = monthlyIncome.reduce((a, b) => a + b, 0);

    res.json({ year: Number(year), monthlyIncome, totalIncome });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});



app.get('/admin/add-rooms', async (req, res) => {
  try {
    const status = req.query.status; 

    const [rooms] = await pool.query(`
      SELECT 
        r.*, 
        COUNT(t.id) AS tenant_count
      FROM rooms r
      LEFT JOIN tenants t ON t.room_id = r.id
      GROUP BY r.id
      ORDER BY r.room_number
    `);

    for (const room of rooms) {
      const newStatus = room.tenant_count >= room.capacity ? 'Occupied' : 'Available';
      if (room.status !== newStatus) {
        await pool.query('UPDATE rooms SET status = ? WHERE id = ?', [newStatus, room.id]);
        room.status = newStatus;
      }
    }

    res.render('admin/add-room', { rooms, status });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.post('/admin/add-rooms', async (req, res) => {
  try {
    let { room_number, type, capacity } = req.body;
    capacity = parseInt(capacity);

    const status = capacity > 0 ? 'Available' : 'Maintenance'; 

    const [result] = await pool.query(
      'INSERT INTO rooms (room_number, type, capacity, status) VALUES (?, ?, ?, ?)',
      [room_number, type, capacity, status]
    );

    const newNotification = {
      heading: `New Room Added: ${room_number}`,
      content: `Room ${room_number} is now ${status}`,
      date: new Date(),
      type: 'Room Update'
    };
    io.of('/tenant').emit('newNotification', newNotification);

    res.redirect('/admin/add-rooms?status=added');
  } catch (error) {
    console.error(error);
    res.redirect('/admin/add-rooms?status=error');
  }
});
app.post('/admin/add-rooms/:id/update', async (req, res) => {
  const { id } = req.params;
  try {
    let { room_number, type, capacity } = req.body;
    capacity = parseInt(capacity);

    await pool.query(
      'UPDATE rooms SET room_number = ?, type = ?, capacity = ? WHERE id = ?',
      [room_number, type, capacity, id]
    );

    const [[{ tenant_count }]] = await pool.query(
      'SELECT COUNT(*) AS tenant_count FROM tenants WHERE room_id = ?',
      [id]
    );

    let status;
    if (capacity === 0) {
      status = 'Maintenance';
    } else {
      status = tenant_count >= capacity ? 'Occupied' : 'Available';
    }

    await pool.query('UPDATE rooms SET status = ? WHERE id = ?', [status, id]);

    console.log(`✅ Room ${room_number} updated successfully.`);
    res.redirect('/admin/add-rooms?status=updated');
  } catch (error) {
    console.error('❌ Error updating room:', error);
    res.redirect('/admin/add-rooms?status=error');
  }
});
app.post('/admin/add-rooms/:id/delete', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM beds WHERE room_id = ?', [id]); 
    await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
    res.redirect('/admin/add-rooms?status=deleted');
  } catch (error) {
    console.error(error);
    res.redirect('/admin/add-rooms?status=error');
  }
});


app.get("/admin/api/available-beds", async (req, res) => {
  try {
    const [rooms] = await pool.query(`
      SELECT r.id AS room_id, r.room_number
      FROM rooms r
      ORDER BY r.room_number
    `);

    const [beds] = await pool.query(`
      SELECT b.id AS bed_id, b.room_id, b.bed_number, b.bed_position
      FROM beds b
      WHERE b.status = 'Available'
      ORDER BY b.room_id, b.bed_number
    `);

    const roomMap = {};
    rooms.forEach(room => {
      roomMap[room.room_id] = {
        room_id: room.room_id,
        room_number: room.room_number,
        beds: []
      };
    });

    beds.forEach(bed => {
      if (roomMap[bed.room_id]) {
        roomMap[bed.room_id].beds.push({
          bed_id: bed.bed_id,
          bed_number: bed.bed_number,
          bed_position: bed.bed_position
        });
      }
    });

    res.json(Object.values(roomMap));
  } catch (err) {
    console.error("❌ Error fetching rooms and beds:", err);
    res.status(500).json({ error: "Server error fetching rooms and beds" });
  }
});


const PDFDocument = require('pdfkit');

app.get('/admin/generate-receipt/:paymentId', async (req, res) => {
  const paymentId = req.params.paymentId;

  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id AS payment_id,
        COALESCE(t.username, p.tenant_name) AS tenant_name,
        p.amount,
        DATE_FORMAT(p.payment_date, '%Y-%m-%d %H:%i:%s') AS payment_date,
        p.status,
        p.payment_method
      FROM payments p
      LEFT JOIN tenants t ON p.tenant_id = t.id
      WHERE p.id = ?
    `, [paymentId]);

    if (rows.length === 0) {
      return res.status(404).send('Payment not found');
    }

    const payment = rows[0];

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Disposition', `attachment; filename=receipt-${payment.payment_id}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    doc
      .font('Helvetica-Bold')
      .fontSize(22)
      .text('GOYAL BOARDING HOUSE', { align: 'center' });

    doc
      .moveDown(0.2)
      .fontSize(18)
      .text('PROOF OF PAYMENT', { align: 'center' });

    doc.moveDown(1);

    doc
      .font('Helvetica')
      .fontSize(14)
      .text(`Receipt ID: ${payment.payment_id}`)
      .moveDown(0.3)
      .text(`Tenant: ${payment.tenant_name}`)
      .moveDown(0.3)
      .text(`Amount Paid: ₱${Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
      .moveDown(0.3)
      .text(`Payment Date: ${payment.payment_date}`)
      .moveDown(0.3)
      .text(`Status: ${payment.status}`)
      .moveDown(0.3)
      .text(`Payment Method: ${payment.payment_method || 'N/A'}`);

    doc.moveDown(2);

    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text('Thank you for your payment!', { align: 'center' });

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating receipt');
  }
});

app.get("/admin/payments", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        t.username AS tenant_name,
        p.amount,
        DATE_FORMAT(p.payment_date, '%Y-%m-%d %H:%i:%s') AS payment_date,
        p.status,
        p.payment_method
      FROM payments p
      JOIN tenants t ON p.tenant_id = t.id
      WHERE p.status = 'paid'
      ORDER BY p.payment_date DESC
    `);

    res.render("admin/admin-payments", { payments: rows });

  } catch (err) {
    console.error("Error loading payments:", err);
    res.status(500).send("Error loading payments");
  }
});

app.get('/api/payment-history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [payments] = await pool.query(`
      SELECT 
        p.id,
        t.username AS tenant_name,
        p.amount,
        p.payment_date,
        p.status
      FROM payments p
      JOIN tenants t ON p.tenant_id = t.id
      WHERE p.status = 'paid'
      ORDER BY p.payment_date DESC
      LIMIT ?
    `, [limit]);

    res.json({ payments });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/api/overdue-tenants', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      WITH RECURSIVE months AS (
        SELECT DATE_FORMAT(start_lease, '%Y-%m-01') AS coverage_month, id AS tenant_id
        FROM tenants
        WHERE start_lease IS NOT NULL
        UNION ALL
        SELECT DATE_ADD(coverage_month, INTERVAL 1 MONTH), tenant_id
        FROM months
        WHERE DATE_ADD(coverage_month, INTERVAL 1 MONTH) <= CURDATE()
      )
      SELECT
        t.id AS tenant_id,
        CONCAT(t.first_name, ' ', t.last_name) AS tenant_name,
        r.room_number,
        t.monthly_rent AS amount,
        COALESCE(p.status, 'Unpaid') AS status,
        DATE_FORMAT(m.coverage_month, '%Y-%m') AS coverage_period,
        DATEDIFF(CURDATE(), DATE_ADD(m.coverage_month, INTERVAL 1 MONTH)) AS overdue_days
      FROM tenants t
      JOIN months m ON m.tenant_id = t.id
      LEFT JOIN beds b ON t.bed_id = b.id
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN payments p
        ON p.tenant_id = t.id
        AND p.coverage_period = DATE_FORMAT(m.coverage_month, '%Y-%m')
      WHERE 
        COALESCE(p.status, 'Unpaid') != 'paid'
        AND DATEDIFF(CURDATE(), DATE_ADD(m.coverage_month, INTERVAL 1 MONTH)) > 0
      ORDER BY t.id, m.coverage_month;
    `);

    res.json({ overdue: rows });
  } catch (err) {
    console.error('Error fetching overdue tenants:', err);
    res.status(500).json({ error: 'Failed to fetch overdue tenants' });
  }
});

 app.get('/api/tenants/unpaid', async (req, res) => {
  const monthFilter = req.query.month;  
  try {
    let query = `
      SELECT 
        t.id,
        t.first_name,
        t.last_name,
        t.next_due_date,
        t.monthly_rent,
        r.room_number
      FROM tenants t
      LEFT JOIN payments p 
        ON t.id = p.tenant_id AND p.status = 'paid' AND MONTH(p.payment_date) = MONTH(CURDATE())
      LEFT JOIN rooms r ON t.room_id = r.id
      WHERE p.id IS NULL
    `;
    
    const params = [];

    if (monthFilter) {
       query += ` AND DATE_FORMAT(t.next_due_date, '%Y-%m') = ?`;
      params.push(monthFilter);
    }

    const [rows] = await pool.query(query, params);

    const formatted = rows.map(t => ({
      tenant_id: t.id,
      tenant_name: `${t.first_name} ${t.last_name}`,
      room_number: t.room_number,
      amount: t.monthly_rent,
      due_date: t.next_due_date,
      status: 'unpaid',
    }));

    res.json(formatted);

  } catch (err) {
    console.error('Error fetching unpaid tenants:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



app.get("/admin/occupants", async (req, res) => {
  try {
    const [results] = await pool.query(`
  SELECT 
    r.id AS room_id, 
    r.room_number, 
    r.type, 
    r.status, 
    r.capacity,
    t.id AS tenant_id, 
    CONCAT(t.first_name, ' ', t.last_name) AS tenant_name, 
    t.avatar_url,
    b.bed_number,
    b.bed_position
  FROM rooms r
  LEFT JOIN tenants t ON r.id = t.room_id AND t.is_active = 1
  LEFT JOIN beds b ON t.bed_id = b.id
  ORDER BY r.room_number, b.bed_number
`);


    const rooms = {};
    results.forEach(row => {
      if (!rooms[row.room_id]) {
        rooms[row.room_id] = {
          room_id: row.room_id,
          room_number: row.room_number,
          type: row.type,
          status: row.status,
          capacity: row.capacity,
          tenants: []
        };
      }

      if (row.tenant_id) {
        rooms[row.room_id].tenants.push({
          tenant_id: row.tenant_id,
          name: row.tenant_name,
          bed_number: row.bed_number,
          bed_position: row.bed_position,
          avatar_url: row.avatar_url
        });
      }
    });

    res.render("admin/occupants", { rooms: Object.values(rooms) });
  } catch (err) {
    console.error("❌ Error fetching occupants:", err.message);
    res.status(500).send("Error fetching occupants");
  }
});

app.get('/admin/occupancy-details/:tenantId', async (req, res) => {
  const tenantId = req.params.tenantId;

  try {
    const [tenantRows] = await pool.query(`
      SELECT 
        t.id,
        t.first_name,
        t.middle_name,
        t.last_name,
        t.contact_number,
        t.email,
        t.age,
        t.guardian_contact_number,
        t.status,
        t.start_lease,
        t.monthly_rent,
        t.deposit,
        t.avatar_url,
        t.next_due_date,
        r.room_number,
        r.type AS room_type,
        r.status AS room_status,
        b.bed_number,
        b.bed_position
      FROM tenants t
      LEFT JOIN rooms r ON t.room_id = r.id
      LEFT JOIN beds b ON t.bed_id = b.id
      WHERE t.id = ?
    `, [tenantId]);

    if (tenantRows.length === 0)
      return res.status(404).send("Tenant not found");

    const tenant = tenantRows[0];

    const [paidPayments] = await pool.query(`
      SELECT id, amount, payment_date, status
      FROM payments
      WHERE tenant_id = ? AND status = 'paid'
      ORDER BY payment_date DESC
    `, [tenantId]);

    const payments = paidPayments.map(p => ({
      id: p.id,
      amount: p.amount,
      payment_date: p.payment_date,
      status: p.status
    }));

    if (tenant.next_due_date) {
      payments.push({
        id: null,
        amount: tenant.monthly_rent,
        due_date: tenant.next_due_date,
        status: "upcoming"
      });
    }

    res.render("admin/occupancy-details", { tenant, payments });
  } catch (err) {
    console.error("❌ Error fetching tenant details:", err);
    res.status(500).send("Server error");
  }
})

app.post('/admin/tenant-update/:id', isAdmin, async (req, res) => {
  const tenantId = req.params.id;
  let {
    first_name, middle_name, last_name, address, age, year_level, contact_number,
    start_lease, next_due_date, room_number, bed, monthly_rent, deposit,
    guardian_first_name, guardian_middle_name, guardian_last_name,
    guardian_contact_number, guardian_address, username, email, password
  } = req.body;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d) ? null : d.toISOString().split('T')[0];
  };

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const formattedStartLease = formatDate(start_lease);
    let finalNextDueDate = formatDate(next_due_date);

    if (!finalNextDueDate && formattedStartLease) {
      const d = new Date(formattedStartLease);
      d.setMonth(d.getMonth() + 1);
      finalNextDueDate = d.toISOString().split('T')[0];
    }

    const parsedAge = parseInt(age) || null;
    const parsedMonthlyRent = parseFloat(monthly_rent) || 0;
    const finalDeposit = parseFloat(deposit) || 0;

    const [[currentTenant]] = await conn.query(
      'SELECT room_id, bed_id FROM tenants WHERE id = ?',
      [tenantId]
    );

    const oldRoomId = currentTenant?.room_id;
    const oldBedId = currentTenant?.bed_id;

    const [[roomData]] = await conn.query(
      'SELECT id FROM rooms WHERE room_number = ?',
      [room_number]
    );

    const room_id = roomData ? roomData.id : oldRoomId;
    const [[bedData]] = await conn.query(
      'SELECT id FROM beds WHERE bed_number = ? AND room_id = ?',
      [bed, room_id]
    );

    const bed_id = bedData ? bedData.id : oldBedId;

    let query = `
      UPDATE tenants SET
        first_name = ?, middle_name = ?, last_name = ?, address = ?, age = ?, year_level = ?, contact_number = ?,
        start_lease = ?, next_due_date = ?, room_id = ?, bed_id = ?, 
        monthly_rent = ?, deposit = ?,
        guardian_first_name = ?, guardian_middle_name = ?, guardian_last_name = ?, guardian_contact_number = ?, guardian_address = ?,
        username = ?, email = ?, updated_at = NOW()
    `;

    const values = [
      first_name, middle_name || null, last_name, address, parsedAge, year_level, contact_number,
      formattedStartLease, finalNextDueDate, room_id, bed_id,
      parsedMonthlyRent, finalDeposit,
      guardian_first_name, guardian_middle_name || null, guardian_last_name, guardian_contact_number, guardian_address,
      username, email
    ];

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = ?`;
      values.push(hashedPassword);
    }

    query += ` WHERE id = ?`;
    values.push(tenantId);

    await conn.query(query, values);

    if (oldBedId && oldBedId !== bed_id) {
      await conn.query(`UPDATE beds SET status = 'Available' WHERE id = ?`, [oldBedId]);
    }

    if (bed_id) {
      await conn.query(`UPDATE beds SET status = 'Occupied' WHERE id = ?`, [bed_id]);
    }

    await conn.query(`
      UPDATE rooms 
      SET status = CASE 
        WHEN (SELECT COUNT(*) FROM beds WHERE room_id = rooms.id AND status = 'Occupied') >= capacity 
        THEN 'Occupied'
        ELSE 'Available'
      END
    `);

    await conn.commit();

    console.log(`✅ Tenant ${tenantId} updated → Room ${room_number}, Bed ${bed}`);
    res.redirect(`/admin/tenant-view/${tenantId}?success=Tenant+updated+successfully`);
  } catch (err) {
    await conn.rollback();
    console.error('❌ Error updating tenant:', err);
    res.redirect(`/admin/tenant-view/${tenantId}?error=Error+updating+tenant`);
  } finally {
    conn.release();
  }
});

app.get('/tenant/notification/json', async (req, res) => {
  try {
    const tenantId = req.session.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Tenant not logged in' });

    const [announcements] = await pool.query(`
      SELECT title AS heading, message AS content, created_at AS date, 'Announcement' AS type
      FROM announcements ORDER BY created_at DESC
    `);

    const [rooms] = await pool.query(`
      SELECT CONCAT('Room ', room_number, ' status updated to ', status) AS heading,
             CONCAT('Room ', room_number, ' is now ', status) AS content,
             updated_at AS date, 'Room Update' AS type
      FROM rooms ORDER BY updated_at DESC
    `);

    const [beds] = await pool.query(`
      SELECT CONCAT('Bed ', bed_number, ' in Room ', room_id, ' updated to ', status) AS heading,
             CONCAT('Bed ', bed_number, ' is now ', status) AS content,
             updated_at AS date, 'Bed Update' AS type
      FROM beds ORDER BY updated_at DESC
    `);

    const [moveouts] = await pool.query(`
      SELECT CONCAT('Move-out request ', status) AS heading,
             CONCAT('Your move-out request for Room ', room_number, ' was ', status) AS content,
             date_requested AS date, 'Move-out' AS type
      FROM move_out_requests
      WHERE tenant_id = ? AND status IN ('Approved', 'Rejected')
      ORDER BY date_requested DESC
    `, [tenantId]);

    const [issues] = await pool.query(`
      SELECT CONCAT('Issue ', status) AS heading,
             CONCAT('Your issue "', issue_type, '" is now ', status) AS content,
             date_reported AS date, 'Issue' AS type
      FROM issues
      WHERE tenant_id = ? AND status IN ('In Progress', 'Resolved')
      ORDER BY date_reported DESC
    `, [tenantId]);

    const [payments] = await pool.query(`
      SELECT CONCAT('Payment Successful — ₱', FORMAT(amount, 2)) AS heading,
             CONCAT('You have successfully paid your rent for ', coverage_period, ' via ', payment_method, '.') AS content,
             payment_date AS date, 'Payment' AS type
      FROM payments
      WHERE tenant_id = ? AND status = 'paid'
      ORDER BY payment_date DESC
    `, [tenantId]);

    const [upcomingDues] = await pool.query(`
      SELECT CONCAT('Upcoming Rent Due on ', DATE_FORMAT(next_due_date, '%b %d, %Y')) AS heading,
             CONCAT('Your rent for Room ', room_number, ' is due on ', DATE_FORMAT(next_due_date, '%b %d, %Y'), '. Please pay on time.') AS content,
             next_due_date AS date, 'Upcoming Due' AS type
      FROM tenants
      WHERE id = ? AND next_due_date >= CURDATE()
    `, [tenantId]);

    let notifications = [
      ...announcements,
      ...rooms,
      ...beds,
      ...moveouts,
      ...issues,
      ...payments,
      ...upcomingDues
    ];

    if (!req.query.all) {
      const now = new Date();
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(now.getDate() - 5);

      notifications = notifications.filter(n => n.date && new Date(n.date) >= fiveDaysAgo);

      let roomCount = 0, bedCount = 0;
      notifications = notifications.filter(n => {
        if (n.type === 'Room Update') return roomCount++ < 3;
        if (n.type === 'Bed Update') return bedCount++ < 3;
        return true;
      });
    }

    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ notifications });

  } catch (err) {
    console.error('Error fetching notifications (JSON):', err);
    res.status(500).json({ error: 'Error loading notifications' });
  }
});

app.get('/tenant/notification', async (req, res) => {
  try {
    const tenantId = req.session.tenantId;
    if (!tenantId) return res.status(401).send('Tenant not logged in');

    const [tenantRows] = await pool.query(
      `SELECT id, first_name, last_name, avatar_url, room_number, next_due_date FROM tenants WHERE id = ?`,
      [tenantId]
    );
    if (tenantRows.length === 0) return res.status(404).send('Tenant not found');
    const tenant = tenantRows[0];

    const [announcements] = await pool.query(`
      SELECT title AS heading, message AS content, created_at AS date, 'Announcement' AS type
      FROM announcements ORDER BY created_at DESC
    `);

    const [rooms] = await pool.query(`
      SELECT CONCAT('Room ', room_number, ' status updated to ', status) AS heading,
             CONCAT('Room ', room_number, ' is now ', status) AS content,
             updated_at AS date, 'Room Update' AS type
      FROM rooms ORDER BY updated_at DESC
    `);

    const [beds] = await pool.query(`
      SELECT CONCAT('Bed ', bed_number, ' in Room ', room_id, ' updated to ', status) AS heading,
             CONCAT('Bed ', bed_number, ' is now ', status) AS content,
             updated_at AS date, 'Bed Update' AS type
      FROM beds ORDER BY updated_at DESC
    `);

    const [moveouts] = await pool.query(`
      SELECT CONCAT('Move-out request ', status) AS heading,
             CONCAT('Your move-out request for Room ', room_number, ' was ', status) AS content,
             date_requested AS date, 'Move-out' AS type
      FROM move_out_requests
      WHERE tenant_id = ? AND status IN ('Approved', 'Rejected')
      ORDER BY date_requested DESC
    `, [tenantId]);

    const [issues] = await pool.query(`
      SELECT CONCAT('Issue ', status) AS heading,
             CONCAT('Your issue "', issue_type, '" is now ', status) AS content,
             date_reported AS date, 'Issue' AS type
      FROM issues
      WHERE tenant_id = ? AND status IN ('In Progress', 'Resolved')
      ORDER BY date_reported DESC
    `, [tenantId]);

    const [payments] = await pool.query(`
      SELECT CONCAT('Payment Successful — ₱', FORMAT(amount, 2)) AS heading,
             CONCAT('You have successfully paid your rent for ', coverage_period, ' via ', payment_method, '.') AS content,
             payment_date AS date, 'Payment' AS type
      FROM payments
      WHERE tenant_id = ? AND status = 'paid'
      ORDER BY payment_date DESC
    `, [tenantId]);

    const [upcomingDues] = await pool.query(`
      SELECT CONCAT('Upcoming Rent Due on ', DATE_FORMAT(next_due_date, '%b %d, %Y')) AS heading,
             CONCAT('Your rent for Room ', room_number, ' is due on ', DATE_FORMAT(next_due_date, '%b %d, %Y'), '. Please pay on time.') AS content,
             next_due_date AS date, 'Upcoming Due' AS type
      FROM tenants
      WHERE id = ? AND next_due_date >= CURDATE()
    `, [tenantId]);

    let notifications = [
      ...announcements,
      ...rooms,
      ...beds,
      ...moveouts,
      ...issues,
      ...payments,
      ...upcomingDues
    ];

    if (!req.query.all) {
      const now = new Date();
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(now.getDate() - 5);

      notifications = notifications.filter(n => n.date && new Date(n.date) >= fiveDaysAgo);

      let roomCount = 0, bedCount = 0;
      notifications = notifications.filter(n => {
        if (n.type === 'Room Update') {
          if (roomCount++ < 3) return true;
          return false;
        }
        if (n.type === 'Bed Update') {
          if (bedCount++ < 3) return true;
          return false;
        }
        return true;
      });
    }

    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    const groupedNotifications = {};
    notifications.forEach(n => {
      const dateKey = new Date(n.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!groupedNotifications[dateKey]) groupedNotifications[dateKey] = [];
      groupedNotifications[dateKey].push(n);
    });

    res.render('tenant/notification', { groupedNotifications, tenantId, tenant });

  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).send('Error loading notifications');
  }
});

app.get('/tenant/move-out', isTenant, async (req, res) => {
  try {
    const [rows] = await pool.query(`
  SELECT 
    t.*, 
    r.room_number 
  FROM tenants t
  LEFT JOIN rooms r ON t.room_id = r.id
  WHERE t.id = ?
`, [req.session.tenantId]);

    res.render('tenant/move-out', { tenant: rows[0], success: req.query.success || null });
  } catch (err) {
    console.error('Error loading move-out form:', err);
    res.redirect('/');
  }
});

app.post('/tenant/move-out', isTenant, async (req, res) => {
  const { reason } = req.body;
  try {
    const [rows] = await pool.query(`
  SELECT r.room_number 
  FROM tenants t
  LEFT JOIN rooms r ON t.room_id = r.id
  WHERE t.id = ?
`, [req.session.tenantId]);

const roomNumber = rows.length > 0 ? rows[0].room_number : null;


    await pool.query(
      'INSERT INTO move_out_requests (tenant_id, room_number, reason) VALUES (?, ?, ?)',
      [req.session.tenantId, roomNumber, reason]
    );
    res.redirect('/tenant/move-out?success=Move-out+request+submitted');
  } catch (err) {
    console.error('Error submitting move-out request:', err);
    res.redirect('/tenant/move-out?success=Error+submitting+request');
  }
});
app.get('/admin/move-out-requests', isAdmin, async (req, res) => {
  try {
    const [requests] = await pool.query(`
      SELECT m.id, t.first_name, t.last_name, m.room_number, m.reason, m.date_requested, m.status
      FROM move_out_requests m
      JOIN tenants t ON m.tenant_id = t.id
      ORDER BY m.date_requested DESC
    `);

    requests.forEach(reqItem => {
      if (reqItem.status === 'Approved' || reqItem.status === 'Rejected') {
        const newNotification = {
          heading: `Move-out request ${reqItem.status}`,
          content: `Your move-out request for Room ${reqItem.room_number} was ${reqItem.status}`,
          date: new Date(reqItem.date_requested),
          type: 'Move-out'
        };
        io.of('/tenant').emit('newNotification', newNotification);
      }
    });

    res.render('admin/move-out-requests', { requests });
  } catch (err) {
    console.error('Error fetching move-out requests:', err);
    res.render('admin/move-out-requests', { requests: [] });
  }
});

app.get('/admin/announcements', async (req, res) => {
  try {
    const [announcements] = await pool.query(
      "SELECT * FROM announcements ORDER BY created_at DESC"
    );
    res.render('admin/admin_announcements', { announcements });
  } catch (err) {
    console.error("Error fetching announcements:", err);
    res.status(500).send("Error fetching announcements");
  }
});

app.post("/admin/announcements/create", async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).send("Title and message are required");
    }

    const [result] = await pool.query(
      "INSERT INTO announcements (title, message, created_at) VALUES (?, ?, NOW())",
      [title, message]
    );

    const newNotification = {
      heading: title,
      content: message,
      date: new Date(),
      type: 'Announcement'
    };

    io.of('/tenant').emit('newNotification', newNotification);

    res.redirect("/admin/announcements");
  } catch (err) {
    console.error("Error creating announcement", err);
    res.status(500).send("Error creating announcement");
  }
});

app.put('/admin/announcements/edit/:id', async (req, res) => {
  try {
    const { title, message } = req.body || {};
    const id = req.params.id;

    if (!title || !message) {
      return res.json({ success: false, error: "Title and message are required." });
    }

    await pool.query(
      "UPDATE announcements SET title = ?, message = ? WHERE id = ?",
      [title, message, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating announcement", err);
    res.json({ success: false, error: err.message });
  }
});



app.delete("/admin/announcements/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM announcements WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.json({ success: false, error: "Announcement not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting announcement", err);
    res.json({ success: false, error: "Error deleting announcement" });
  }
});
app.get('/admin/create-tenant', isAdmin, async (req, res) => {
  try {
    const [tenants] = await pool.query(
      'SELECT id, username, email, is_active, created_at, first_name, last_name FROM tenants ORDER BY created_at DESC'
    );
    const { status, message } = req.query;
    res.render('admin/create-tenant', { status, message, tenants });
  } catch (err) {
    console.error('❌ Error loading tenants:', err);
    res.render('admin/create-tenant', { status: 'failed', message: 'Failed to load tenants', tenants: [] });
  }
});

app.post('/admin/create-tenant', isAdmin, async (req, res) => {
  try {
    const {
      first_name, middle_name, last_name, address, age, year_level, contact_number,
      start_lease, room_number, bed, deposit, monthly_rent,
      guardian_first_name, guardian_middle_name, guardian_last_name,
      guardian_contact_number, guardian_address,
      username, email, password
    } = req.body;

    if (
      !first_name || !last_name || !address || !age || !contact_number ||
      !start_lease || !room_number || !bed || monthly_rent === undefined ||
      !guardian_first_name || !guardian_last_name || !guardian_contact_number ||
      !guardian_address || !username || !email || !password
    ) {
      return res.redirect('/admin/create-tenant?status=failed&message=All+fields+are+required');
    }

    const [existing] = await pool.query(
      'SELECT * FROM tenants WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      return res.redirect('/admin/create-tenant?status=failed&message=Username+or+email+already+exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const startLeaseDate = new Date(start_lease);
    const nextDueDate = new Date(startLeaseDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    const nextDueDateFormatted = nextDueDate.toISOString().split('T')[0];

    const ageValue = parseInt(age);
    const depositValue = parseFloat(deposit) || 0;
    const monthlyRentValue = parseFloat(monthly_rent);

    await pool.query(
      `INSERT INTO tenants 
        (
          first_name, middle_name, last_name, address, age, year_level, contact_number,
          start_lease, next_due_date, room_id, bed_id, room_number, bed,
          monthly_rent, deposit,
          guardian_first_name, guardian_middle_name, guardian_last_name, guardian_contact_number, guardian_address,
          username, email, password, is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name, middle_name || null, last_name, address, ageValue,
        year_level || null, contact_number, start_lease, nextDueDateFormatted,
        room_number, bed, room_number, bed,
        monthlyRentValue, depositValue,
        guardian_first_name, guardian_middle_name || null, guardian_last_name,
        guardian_contact_number, guardian_address,
        username, email, hashedPassword,
        1 
      ]
    );

    await pool.query('UPDATE beds SET status = "Occupied" WHERE id = ?', [parseInt(bed)]);

    const [[{ occupied_count }]] = await pool.query(
      `SELECT COUNT(*) AS occupied_count FROM beds WHERE room_id = ? AND status = 'Occupied'`,
      [room_number]
    );

    const [[{ capacity }]] = await pool.query(
      `SELECT capacity FROM rooms WHERE id = ?`,
      [room_number]
    );

    if (occupied_count >= capacity) {
      await pool.query(`UPDATE rooms SET status = 'Occupied' WHERE id = ?`, [room_number]);
    }

    return res.redirect('/admin/create-tenant?status=success&message=Tenant+created+successfully');

  } catch (err) {
    console.error('❌ DB Error:', err);
    return res.redirect('/admin/create-tenant?status=failed&message=Error+creating+tenant');
  }
});


app.get('/admin/tenant-information', isAdmin, async (req, res) => {
  try {
    const [tenants] = await pool.query('SELECT * FROM tenants WHERE is_active = 1 ORDER BY last_name ASC');
    const [archivedTenants] = await pool.query('SELECT * FROM tenants WHERE is_active = 0 ORDER BY last_name ASC');

    res.render('admin/tenant-information', {
      tenants,
      archivedTenants,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error('Error loading tenant information:', err);
    res.render('admin/tenant-information', {
      tenants: [],
      archivedTenants: [],
      success: null,
      error: 'Failed to load tenants.'
    });
  }
});

app.post('/admin/tenant-ban/:id', isAdmin, async (req, res) => {
  try {
    const tenantId = req.params.id;
    await pool.query('UPDATE tenants SET is_active = 0 WHERE id = ?', [tenantId]);

    res.redirect('/admin/tenant-information?success=Tenant+has+been+banned');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/tenant-information?error=Failed+to+ban+tenant');
  }
});
app.post('/admin/tenant-restore/:id', isAdmin, async (req, res) => {
  try {
    const tenantId = req.params.id;
    await pool.query('UPDATE tenants SET is_active = 1 WHERE id = ?', [tenantId]);

    res.redirect('/admin/tenant-information?success=Tenant+restored+successfully');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/tenant-information?error=Failed+to+restore+tenant');
  }
});

app.get('/admin/tenant-view/:id', isAdmin, async (req, res) => {
  try {
    const tenantId = req.params.id;
    const [tenant] = await pool.query('SELECT * FROM tenants WHERE id = ?', [tenantId]);

    if (tenant.length === 0) {
      return res.redirect('/admin/tenant-information?error=Tenant+not+found');
    }

    res.render('admin/tenant-detail', {
      tenant: tenant[0],
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error('Error loading tenant detail:', err);
    res.redirect('/admin/tenant-information?error=Error+loading+tenant+details');
  }
});


app.post('/admin/tenant-delete/:id', isAdmin, async (req, res) => {
  const tenantId = req.params.id;

  try {
    const [result] = await pool.query('DELETE FROM tenants WHERE id = ?', [tenantId]);

    if (result.affectedRows > 0) {
      return res.redirect('/admin/tenant-information?success=Tenant+deleted+successfully');
    } else {
      return res.redirect('/admin/tenant-information?error=Tenant+not+found');
    }
  } catch (err) {
    console.error('Error deleting tenant:', err);
    return res.redirect('/admin/tenant-information?error=Could+not+delete+tenant');
  }
});

app.get('/admin/issue-tracking', isAdmin, async (req, res) => {
  try {
    const limit = 10; 
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
const [issues] = await pool.query(`
  SELECT 
    i.*, 
    t.first_name, 
    t.last_name, 
    r.room_number
  FROM issues i
  LEFT JOIN tenants t ON i.tenant_id = t.id
  LEFT JOIN rooms r ON t.room_id = r.id
  ORDER BY i.date_reported DESC
  LIMIT ? OFFSET ?
`, [limit, offset]);


    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM issues`);
    const totalPages = Math.ceil(total / limit);

    res.render('admin/issue-tracking', {
      issues,
      currentPage: page,
      totalPages
    });

  } catch (err) {
    console.error('Error fetching issues:', err);
    res.render('admin/issue-tracking', { issues: [], currentPage: 1, totalPages: 1 });
  }
});

app.post('/admin/issue-tracking/:id/status', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, currentPage } = req.body;

  const validStatuses = ['Pending', 'In Progress', 'Resolved'];
  if (!validStatuses.includes(status)) {
    return res.status(400).send('Invalid status value.');
  }

  try {
    let dateResolved = null;
    if (status === 'Resolved') dateResolved = new Date();

    await pool.query(`
      UPDATE issues
      SET status = ?, date_resolved = ?
      WHERE id = ?
    `, [status, dateResolved, id]);

    const [[issue]] = await pool.query(
      'SELECT tenant_id, issue_type FROM issues WHERE id = ?',
      [id]
    );

    if (issue && issue.tenant_id) {
      const newNotification = {
        heading: `Issue ${status}`,
        content: `Your issue "${issue.issue_type}" is now ${status}`,
        date: new Date(),
        type: 'Issue'
      };

      io.of('/tenant').to(`tenant_${issue.tenant_id}`).emit('newNotification', newNotification);
    }

    const redirectPage = currentPage ? `/admin/issue-tracking?page=${currentPage}` : '/admin/issue-tracking';
    res.redirect(redirectPage);
  } catch (err) {
    console.error(err);
    res.redirect('/admin/issue-tracking');
  }
});

app.get('/tenant/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect('/');
  });
});


app.get('/set-overdue', isTenant, async (req, res) => {
  try {
    await pool.query('UPDATE tenants SET next_due_date = CURDATE() - INTERVAL 5 DAY WHERE id = ?', [19]);
    res.send('Due date set 5 days ago (overdue) for tenant 19');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

app.get('/tenant/history', isTenant, async (req, res) => {
  const tenantId = req.session.tenantId;

  try {
    if (req.query.paidId) { 
      const paidId = req.query.paidId;

      await pool.query(
        `UPDATE payments 
         SET status = 'paid', payment_date = NOW() 
         WHERE id = ? AND tenant_id = ? AND status = 'pending'`,
        [paidId, tenantId]
      );
    }

    const [tenantResult] = await pool.query(
      `SELECT id, username, first_name, avatar_url, room_number 
       FROM tenants 
       WHERE id = ?`,
      [tenantId]
    );
    const tenant = tenantResult[0];

    const [payments] = await pool.query(
      `SELECT id, payment_date, amount, status 
       FROM payments 
       WHERE tenant_id = ? AND status = 'paid'
       ORDER BY payment_date DESC`,
      [tenantId]
    );

    res.render('tenant/history', { tenant, payments });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/tenant/:tenantId/transactions', isTenant, async (req, res) => {
  const tenantId = req.params.tenantId;

  try {
    const [tenantResult] = await pool.query(
      `SELECT id, username, first_name, avatar_url, room_number 
       FROM tenants 
       WHERE id = ?`,
      [tenantId]
    );
    const tenant = tenantResult[0];

    const [payments] = await pool.query(
      `SELECT payment_date, amount, payment_method, xendit_invoice_id, coverage_period 
       FROM payments 
       WHERE tenant_id = ? AND status = 'paid'
       ORDER BY payment_date DESC`,
      [tenantId]
    );

    res.render('tenant/all_transactions', { tenant, payments });
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    res.status(500).send('Internal Server Error');
  }
});



const avatarStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + Date.now() + ext);
  }
});

const upload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function(req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const issueStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads'); 
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'issue-' + Date.now() + ext);
  }
});

const uploadIssue = multer({
  storage: issueStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function(req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});
app.get('/tenant/profile', async (req, res) => {
  try {
    const tenantId = req.session.tenantId;
    if (!tenantId) return res.redirect('/login'); 

    const [rows] = await pool.query(`
      SELECT 
        t.id,
        t.first_name,
        t.middle_name,
        t.last_name,
        t.address,
        t.age,
        t.year_level,
        t.contact_number,
        t.start_lease,
        t.monthly_rent,
        t.next_due_date,
        t.status,
        t.guardian_first_name,
        t.guardian_middle_name,
        t.guardian_last_name,
        t.guardian_contact_number,
        t.guardian_address,
        t.avatar_url,
        b.bed_number,
        b.bed_position,
        r.room_number
      FROM tenants t
      LEFT JOIN beds b ON t.bed_id = b.id
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE t.id = ?
    `, [tenantId]);

    if (rows.length === 0) return res.status(404).send('Tenant not found');

    const tenant = rows[0];

    tenant.start_lease_formatted = tenant.start_lease ? tenant.start_lease.toISOString().slice(0, 10) : null;
    tenant.next_due_date_formatted = tenant.next_due_date ? tenant.next_due_date.toISOString().slice(0, 10) : null;

    res.render('tenant/tenant-profile', { tenant });
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).send('Server error');
  }
});

app.post('/tenant/profile/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const filename = req.file.filename;

    await pool.query('UPDATE tenants SET avatar_url = ? WHERE id = ?', [filename, req.session.tenantId]);

    res.redirect('/tenant/profile');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error uploading avatar');
  }
});
app.get('/tenant/report-issue', isTenant, async (req, res) => {
  try {
    const tenantId = req.session.tenantId;

    const [tenantData] = await pool.query(`
      SELECT 
        t.id, t.first_name, t.username, t.avatar_url,
        r.room_number
      FROM tenants t
      LEFT JOIN beds b ON t.bed_id = b.id
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE t.id = ?
    `, [tenantId]);

    const tenant = tenantData[0];

    res.render('tenant/report-issue', { tenant, success: req.query.success });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading form');
  }
});

app.post('/tenant/report-issue', isTenant, upload.single('issue_image'), async (req, res) => {
  try {
    const { issue_type, description } = req.body;
    const tenantId = req.session.tenantId;

    const [rows] = await pool.query(`
      SELECT
        t.first_name,
        CAST(SUBSTRING_INDEX(r.room_number, 'RM', -1) AS UNSIGNED) AS room_number
      FROM tenants t
      LEFT JOIN beds b ON t.bed_id = b.id
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE t.id = ?
    `, [tenantId]);

    const tenantName = rows[0]?.first_name || 'Unknown Tenant';
    const roomNumber = rows[0]?.room_number || null;

    const issueImage = req.file ? '/uploads/' + req.file.filename : null;

    await pool.query(`
      INSERT INTO issues 
        (tenant_id, tenant_name, room_number, issue_type, description, image_url, status, date_reported)
      VALUES (?, ?, ?, ?, ?, ?, 'Pending', NOW())
    `, [tenantId, tenantName, roomNumber, issue_type, description, issueImage]);

    res.redirect('/tenant/report-issue?success=Issue reported successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error reporting issue');
  }
});


const { Xendit } = require('xendit-node');
const { Pool } = require('pg');

const x = new Xendit({
  secretKey: 'xnd_development_cCsfvGIhtFOzbrRYPw7G1WDqjgHS6FNbbG36RNOw3G1GpJAq6gdSBfgFMxOMm',
});
const invoice = x.Invoice;

app.get('/dashboard', isTenant, async (req, res) => {
  try {
    const [tenantRows] = await pool.query(`
      SELECT tenants.*, beds.bed_number, beds.bed_position, beds.room_id AS room_number
      FROM tenants
      LEFT JOIN beds ON tenants.bed_id = beds.id
      LEFT JOIN rooms ON beds.room_id = rooms.id
      WHERE tenants.id = ?
    `, [req.session.tenantId]);

    if (!tenantRows.length) return res.redirect('/');

    const tenant = tenantRows[0];
    const monthlyRent = Number(tenant.monthly_rent) || 0;
    const moveInDate = new Date(tenant.start_lease || tenant.created_at || new Date());
    const now = new Date();

    const [lastPaymentRow] = await pool.query(
      'SELECT MAX(coverage_period) AS last_paid_month FROM payments WHERE tenant_id = ?',
      [tenant.id]
    );

    const lastMonthStr = lastPaymentRow[0]?.last_paid_month; 
    if (lastMonthStr) {
      const [year, month] = lastMonthStr.split('-').map(Number);
      const nextDate = new Date(year, month, 1); 
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const nextMonth = `${yyyy}-${mm}`;

      const [existing] = await pool.query(
        'SELECT * FROM payments WHERE tenant_id = ? AND coverage_period = ?',
        [tenant.id, nextMonth]
      );

      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO payments (tenant_id, tenant_name, amount, status, coverage_period)
           VALUES (?, ?, ?, 'unpaid', ?)`,

          [tenant.id, tenant.first_name + ' ' + tenant.last_name, tenant.monthly_rent, nextMonth]
        );
      }
    }

    const [allPayments] = await pool.query(`
      SELECT amount, coverage_period, status, payment_date 
      FROM payments 
      WHERE tenant_id = ?
    `, [req.session.tenantId]);

    function generatePaymentStatus(moveInDate, monthlyRent, allPayments) {
      const now = new Date();
      const paymentStatusByMonth = [];
      let previousPayable = 0;
      let currentPayable = 0;

      let currentMonth = new Date(moveInDate.getFullYear(), moveInDate.getMonth(), 1);
      const endMonth = new Date(now.getFullYear(), now.getMonth(), 1); 

      while (currentMonth <= endMonth) {
        const monthKey = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
        const monthYearStr = currentMonth.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });

        const paymentForMonth = allPayments.find(p => p.coverage_period === monthKey && p.status === 'paid');

        paymentStatusByMonth.push({
          monthYear: monthYearStr,
          amountPaid: paymentForMonth ? paymentForMonth.amount : 0,
          status: paymentForMonth ? 'Paid' : 'Unpaid',
          monthKey
        });

        if (!paymentForMonth) {
          if (
            currentMonth.getFullYear() < now.getFullYear() ||
            (currentMonth.getFullYear() === now.getFullYear() && currentMonth.getMonth() < now.getMonth())
          ) {
            previousPayable += monthlyRent;
          } else if (
            currentMonth.getFullYear() === now.getFullYear() &&
            currentMonth.getMonth() === now.getMonth()
          ) {
            currentPayable = monthlyRent;
          }
        }

        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }

      return { paymentStatusByMonth, previousPayable, currentPayable };
    }

    const { paymentStatusByMonth, previousPayable, currentPayable } = generatePaymentStatus(moveInDate, monthlyRent, allPayments);

    const paymentHistory = allPayments
      .filter(p => p.status === 'paid')
      .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
      .slice(0, 8);

    let daysUntilDue = null;
    if (tenant.next_due_date) {
      const dueDate = new Date(tenant.next_due_date);
      daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    }

    tenant.previous_payable = previousPayable;
    tenant.current_payable = currentPayable;
    tenant.total_payable = previousPayable + currentPayable;
    tenant.payment_history = paymentHistory;
    tenant.paymentStatusByMonth = paymentStatusByMonth;
    tenant.days_until_due = daysUntilDue;

    const hasUnpaid = paymentStatusByMonth.some(p => p.status === 'Unpaid');
    tenant.payment_status = hasUnpaid ? 'Unpaid' : 'Paid';

    res.render('tenant/dashboard', { tenant });

  } catch (err) {
    console.error('Dashboard error:', err);
    res.redirect('/');
  }
});

app.get('/tenant/pay-now', isTenant, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT monthly_rent, next_due_date, first_name, last_name FROM tenants WHERE id = ?',
      [req.session.tenantId]
    );
    if (!rows[0]) return res.redirect('/dashboard');

    const tenant = rows[0];
    const transactionId = 'INV' + Math.floor(Math.random() * 1e6).toString().padStart(6, '0');
    const paymentDate = new Date().toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    const now = new Date();
    tenant.next_due_month = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

    res.render('tenant/pay-now', {
      tenant,
      transactionId,
      paymentDate,
      amount: tenant.monthly_rent,
      paymentUrl: null,
    });
  } catch (err) {
    console.error('Error loading pay now:', err);
    res.redirect('/dashboard');
  }
});

app.post('/tenant/pay-now/process', isTenant, async (req, res) => {
  try {
    const tenantId = req.session.tenantId;
    const { month, method = 'GCash' } = req.body;

    const [paidPayment] = await pool.query(
      'SELECT * FROM payments WHERE tenant_id = ? AND coverage_period = ? AND status = "paid"',
      [tenantId, month]
    );
    if (paidPayment.length > 0) return res.status(400).send("You have already paid for this month!");

    const [rows] = await pool.query(
      'SELECT monthly_rent, first_name, last_name FROM tenants WHERE id = ?',
      [tenantId]
    );
    if (!rows[0]) return res.status(404).send('Tenant not found');

    const amount = rows[0].monthly_rent;
    const tenantName = `${rows[0].first_name} ${rows[0].last_name}`;

  const params = {
  externalId: `rent-${tenantId}-${month}-${Date.now()}`,
  amount,
  payerEmail: req.session.tenantEmail || 'example@email.com',
  description: `Rent Payment (${method})`,
  successRedirectUrl: 'https://www.goyalboardinghouse.xyz/tenant/pay-now/success',
  failureRedirectUrl: 'https://www.goyalboardinghouse.xyz/tenant/pay-now/failure',
  invoiceDuration: 86400,
  shouldSendEmail: false,
  currency: 'PHP',
  paymentMethods: ['GCASH'],
};


    const inv = await invoice.createInvoice({ data: params });
    if (!inv.invoiceUrl) return res.status(500).send('Failed to create payment invoice.');

    await pool.query(
      `INSERT INTO payments 
       (tenant_id, tenant_name, amount, payment_date, status, payment_method, xendit_invoice_id, transaction_ref_url, coverage_period)
       VALUES (?, ?, ?, NOW(), 'pending', ?, ?, ?, ?)`,
      [tenantId, tenantName, amount, method, inv.id, inv.invoiceUrl, month]
    );

    res.redirect(inv.invoiceUrl);
  } catch (err) {
    console.error('Payment process error:', err);
    res.status(500).send('Failed to initiate payment.');
  }
});

app.get('/tenant/pay-now/success', isTenant, async (req, res) => {
  try {
    const tenantId = req.session.tenantId;

    const [pendingPayments] = await pool.query(
      'SELECT * FROM payments WHERE tenant_id = ? AND status = "pending" ORDER BY payment_date DESC LIMIT 1',
      [tenantId]
    );
    if (!pendingPayments[0]) return res.redirect('/dashboard');

    const payment = pendingPayments[0];

    await pool.query(
      `UPDATE payments 
       SET status = 'paid', payment_date = NOW() 
       WHERE id = ?`,
      [payment.id]
    );

    const [tenantRows] = await pool.query(
      'SELECT next_due_date FROM tenants WHERE id = ?',
      [tenantId]
    );
    if (!tenantRows[0]) return res.redirect('/dashboard');

    const tenant = tenantRows[0];
    const paymentMonth = new Date(payment.coverage_period + '-01'); 
    const nextDueDate = tenant.next_due_date ? new Date(tenant.next_due_date) : null;

    if (
      nextDueDate &&
      paymentMonth.getFullYear() === nextDueDate.getFullYear() &&
      paymentMonth.getMonth() === nextDueDate.getMonth()
    ) {
      await pool.query(
        'UPDATE tenants SET next_due_date = DATE_ADD(next_due_date, INTERVAL 1 MONTH), payment_status = "Paid" WHERE id = ?',
        [tenantId]
      );
    }

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error processing payment success:', err);
    res.send('Payment was successful, but an error occurred updating your status.');
  }
});


app.post('/xendit/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const rawBody = req.body.toString();
    const event = JSON.parse(rawBody);

    if (!event.status || event.status.toUpperCase() !== 'PAID') {
      console.log(`ℹ️ Ignored webhook: status=${event.status}`);
      return res.status(200).send('Ignored');
    }

    const match = event.external_id.match(/^rent-(\d+)-(\d{4}-\d{2})-/);
    if (!match) return res.status(400).send('Invalid external_id format');

    const tenantId = parseInt(match[1]);
    const coveragePeriod = match[2]; 
    const paymentMonth = new Date(`${coveragePeriod}-01`);

    const [paymentRows] = await pool.query(
      'SELECT * FROM payments WHERE tenant_id = ? AND coverage_period = ? LIMIT 1',
      [tenantId, coveragePeriod]
    );
    if (paymentRows.length === 0) return res.status(404).send('No matching payment record found');

    const payment = paymentRows[0];

    await pool.query(
      `UPDATE payments
       SET status = 'paid',
           amount = ?,
           payment_method = ?,
           payment_date = NOW(),
           transaction_ref_url = ?,
           xendit_invoice_id = ?
       WHERE id = ?`,
      [
        event.amount,
        event.payment_method || 'GCash',
        event.invoice_url || payment.transaction_ref_url,
        event.id,
        payment.id,
      ]
    );

    const [tenantRows] = await pool.query(
      'SELECT next_due_date FROM tenants WHERE id = ?',
      [tenantId]
    );

    if (tenantRows.length > 0) {
      const tenant = tenantRows[0];
      const nextDueDate = tenant.next_due_date ? new Date(tenant.next_due_date) : null;

      if (nextDueDate && paymentMonth.getTime() === new Date(nextDueDate.getFullYear(), nextDueDate.getMonth(), 1).getTime()) {
        await pool.query(
          'UPDATE tenants SET next_due_date = DATE_ADD(next_due_date, INTERVAL 1 MONTH), payment_status = "Paid" WHERE id = ?',
          [tenantId]
        );
      }
    }

    console.log(`✅ Tenant ${tenantId} payment for ${coveragePeriod} marked as PAID`);
    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Webhook error:', err);
    res.status(500).send('Webhook failed');
  }
});



const tenantSockets = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinTenantRoom', (tenantId) => {
    socket.join(`tenant_${tenantId}`);
    tenantSockets.set(tenantId, socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.post('/admin/move-out-approve/:id', async (req, res) => {
  try {
    const requestId = req.params.id;

    const [rows] = await pool.query('SELECT * FROM move_out_requests WHERE id = ?', [requestId]);
    if (rows.length === 0) {
      return res.status(404).send('Request not found');
    }

    const moveOutRequest = rows[0];
    const tenantId = moveOutRequest.tenant_id;

    await pool.query('UPDATE move_out_requests SET status = ? WHERE id = ?', ['Approved', requestId]);

    const newNotification = {
      heading: `Move-out Request Approved`,
      content: `Your move-out request for Room ${moveOutRequest.room_number} has been APPROVED!`,
      date: new Date(),
      type: 'Move-out'
    };
    io.to(`tenant_${tenantId}`).emit('newNotification', newNotification);

    res.redirect('/admin/move-out-requests');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/admin/move-out-reject/:id', async (req, res) => {
  try {
    const requestId = req.params.id;

    const [rows] = await pool.query('SELECT * FROM move_out_requests WHERE id = ?', [requestId]);
    if (rows.length === 0) {
      return res.status(404).send('Request not found');
    }

    const moveOutRequest = rows[0];
    const tenantId = moveOutRequest.tenant_id;

    await pool.query('UPDATE move_out_requests SET status = ? WHERE id = ?', ['Rejected', requestId]);

    const newNotification = {
      heading: `Move-out Request Rejected`,
      content: `Your move-out request for Room ${moveOutRequest.room_number} has been REJECTED.`,
      date: new Date(),
      type: 'Move-out'
    };
    io.to(`tenant_${tenantId}`).emit('newNotification', newNotification);

    res.redirect('/admin/move-out-requests');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
const onlineUsers = {}; 

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  socket.on('register', ({ userId, role }) => {
    onlineUsers[userId] = socket.id;
    console.log(`User registered: ${userId} as ${role}`);
  });

  socket.on('sendMessage', async ({ senderId, receiverId, message, senderRole }) => {
    console.log(`Message from ${senderRole} ${senderId} to ${receiverId}: ${message}`);

    await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, sender_role, message, created_at) VALUES (?, ?, ?, ?, NOW())',
      [senderId, receiverId, senderRole, message]
    );

    if (onlineUsers[receiverId]) {
      io.to(onlineUsers[receiverId]).emit('receiveMessage', {
        senderId,
        message,
        senderRole,
        createdAt: new Date().toLocaleString()
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected', socket.id);
    for (const [userId, sockId] of Object.entries(onlineUsers)) {
      if (sockId === socket.id) delete onlineUsers[userId];
    }
  });
});
app.get('/admin/messaging', isAdmin, async (req, res) => {
  try {
    const [tenants] = await pool.query(
      `SELECT id, first_name, last_name, room_number, avatar_url
       FROM tenants 
       WHERE archived = 0`
    );
    res.render('admin/admin-messaging', { tenants });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/admin/chat-history/:tenantId', isAdmin, async (req, res) => {
  const tenantId = req.params.tenantId;
  try {
    const [messages] = await pool.query(
      `SELECT 
         id,
         sender_id,
         receiver_id,
         message,
         created_at,
         CASE WHEN sender_id = 0 THEN 'admin' ELSE 'tenant' END AS sender_role
       FROM messages
       WHERE (sender_id = ? AND receiver_id = 0)
          OR (sender_id = 0 AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [tenantId, tenantId]
    );

    const [tenant] = await pool.query(
      'SELECT avatar_url FROM tenants WHERE id = ?',
      [tenantId]
    );

    res.json({
      messages,
      tenantAvatar: tenant.length && tenant[0].avatar_url ? tenant[0].avatar_url : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


app.get('/tenant/messaging', isTenant, async (req, res) => {
   if (!req.session.tenantId) return res.redirect('/login');
  const tenantId = req.session.tenantId;

  try {
    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, room_number, avatar_url
       FROM tenants
       WHERE id = ?`,
      [tenantId]
    );


    if (rows.length === 0) return res.redirect('/login');
    const tenant = rows[0];

    res.render('tenant/tenant-messaging', {
      tenant, 
      user: { id: tenant.id }, 
    });

  } catch (err) {
    console.error('Error loading tenant messaging page:', err);
    res.status(500).send('Server error');
  }
});
app.get('/tenant/chat-history', isTenant, async (req, res) => {
   const tenantId = req.session.tenantId;

  try {
    const [rows] = await pool.query(
      `SELECT 
         id,
         sender_id,
         receiver_id,
         message,
         created_at,
         CASE 
           WHEN sender_id = ? THEN 'tenant' 
           ELSE 'admin' 
         END AS sender_role
       FROM messages
       WHERE (sender_id = ? AND receiver_id = 0)
          OR (sender_id = 0 AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [tenantId, tenantId, tenantId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).send('Server error');
  }
});



(async () => {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('Database connected successfully!');
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
})();

const PORT = 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
