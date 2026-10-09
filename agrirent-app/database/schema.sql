CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash CHAR(64) NOT NULL,
  role ENUM('farmer', 'owner', 'admin') NOT NULL DEFAULT 'farmer',
  verification_status ENUM('NOT_VERIFIED', 'PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'NOT_VERIFIED',
  phone VARCHAR(30),
  location VARCHAR(160),
  avatar VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  token CHAR(64) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE listings (
  id CHAR(36) PRIMARY KEY,
  owner_id CHAR(36) NOT NULL,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  location VARCHAR(160) NOT NULL,
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),
  price_per_day DECIMAL(10, 2) NOT NULL,
  security_deposit DECIMAL(10, 2) NOT NULL DEFAULT 2000.00,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  img VARCHAR(500),
  rating DECIMAL(3, 2) NOT NULL DEFAULT 4.8,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE bookings (
  id CHAR(36) PRIMARY KEY,
  listing_id CHAR(36) NOT NULL,
  farmer_id CHAR(36) NOT NULL,
  owner_id CHAR(36) NOT NULL,
  equipment_name VARCHAR(180) NOT NULL,
  equipment_img VARCHAR(500),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed', 'active') NOT NULL DEFAULT 'pending',
  escrow_status ENUM('held', 'released', 'refunded', 'disputed') NOT NULL DEFAULT 'held',
  daily_rate DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  security_deposit DECIMAL(10, 2) NOT NULL DEFAULT 2000.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id),
  FOREIGN KEY (farmer_id) REFERENCES users(id),
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE payments (
  id CHAR(36) PRIMARY KEY,
  booking_id CHAR(36) NOT NULL,
  status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  amount DECIMAL(10, 2) NOT NULL,
  provider_reference VARCHAR(160),
  payment_method VARCHAR(50) DEFAULT 'UPI',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('booking_created', 'booking_confirmed', 'booking_cancelled', 'payment_success', 'equipment_added', 'booking_received', 'verification_status') NOT NULL,
  read_status BOOLEAN NOT NULL DEFAULT FALSE,
  related_id VARCHAR(64),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);