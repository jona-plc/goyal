CREATE TABLE payments (
    id INT(11) NOT NULL AUTO_INCREMENT,
    tenant_id INT(11) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'paid',
    payment_method VARCHAR(100),
    xendit_invoice_id VARCHAR(100),
    transaction_ref_url VARCHAR(255),
    coverage_period VARCHAR(50),
    tenant_name VARCHAR(150),
    PRIMARY KEY (id),
    INDEX idx_tenant_id (tenant_id)
);

CREATE TABLE beds (
    id INT(11) NOT NULL AUTO_INCREMENT,
    room_id INT(11) NOT NULL,
    bed_number INT(11) NOT NULL,
    status ENUM('Available','Occupied','Maintenance') NOT NULL DEFAULT 'Available',
    bed_position VARCHAR(10),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_room_id (room_id)
);

CREATE TABLE rooms (
    id INT(11) NOT NULL AUTO_INCREMENT,
    room_number VARCHAR(10) UNIQUE,
    type ENUM('Single','Double','Double Deck'),
    status ENUM('Available','Occupied','Maintenance') DEFAULT 'Available',
    capacity INT(11) DEFAULT 4,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE announcements (
    id INT(11) NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE issues (
    id INT(11) NOT NULL AUTO_INCREMENT,
    tenant_id INT(11),
    room_number VARCHAR(10),
    issue_type VARCHAR(100),
    description TEXT,
    status ENUM('Pending','In Progress','Resolved') DEFAULT 'Pending',
    date_reported DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_resolved DATETIME,
    image_url VARCHAR(255),
    tenant_name VARCHAR(255),
    PRIMARY KEY (id),
    INDEX idx_tenant_id (tenant_id)
);

CREATE TABLE messages (
    id INT(11) NOT NULL AUTO_INCREMENT,
    sender_id INT(11) NOT NULL,
    receiver_id INT(11) NOT NULL,
    sender_role ENUM('tenant','admin') NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE notifications (
    id INT(11) NOT NULL AUTO_INCREMENT,
    tenant_id INT(11),
    type VARCHAR(50) NOT NULL,
    reference_id INT(11) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE tenants (
    id INT(11) NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    address TEXT,
    age INT(11),
    year_level VARCHAR(20),
    contact_number VARCHAR(20),
    start_lease DATE,
    monthly_rent DECIMAL(10,2),
    next_due_date DATE,
    status VARCHAR(20) DEFAULT 'Active',
    guardian_first_name VARCHAR(50),
    guardian_middle_name VARCHAR(50),
    guardian_last_name VARCHAR(50),
    guardian_contact_number VARCHAR(20),
    guardian_address TEXT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    last_login DATETIME,
    last_active DATETIME,
    due_date DATE,
    payment_status VARCHAR(20) DEFAULT 'Unpaid',
    avatar_url VARCHAR(255),
    room_id INT(11),
    rents_full_room TINYINT(1) DEFAULT 0,
    archived TINYINT(1) DEFAULT 0,
    bed_id INT(11),
    room_number INT(11),
    bed VARCHAR(50),
    deposit DECIMAL(10,2) DEFAULT 0.00,
    is_student TINYINT(1) DEFAULT 0,
    school_name VARCHAR(100),
    work_place VARCHAR(100),
    work_position VARCHAR(50),
    bed_position VARCHAR(50),
    PRIMARY KEY (id)
);
