-- Добавляем поля для авторизации и ролей
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer';
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Вставляем директора
INSERT INTO users (email, password_hash, role, name) 
VALUES ('dima260208@bk.ru', 'Sempay666', 'admin', 'Директор')
ON CONFLICT (email) DO NOTHING;

-- Добавляем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);