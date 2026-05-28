-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending',
  assignedTo VARCHAR(36),
  timeSpent INT DEFAULT 0 COMMENT 'Time spent in minutes',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completedAt TIMESTAMP NULL COMMENT 'Timestamp when task was completed',
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX idx_status ON tasks(status);
CREATE INDEX idx_assignedTo ON tasks(assignedTo);
CREATE INDEX idx_createdAt ON tasks(createdAt);
