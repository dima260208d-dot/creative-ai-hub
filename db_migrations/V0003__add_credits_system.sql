-- Добавляем систему кредитов для пользователей
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INT DEFAULT 0;

-- Добавляем поле для результата AI-генерации в заказы
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ai_result TEXT;

-- Создаем индекс для быстрого поиска заказов пользователя
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);