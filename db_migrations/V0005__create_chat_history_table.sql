-- Создание таблицы для хранения истории чатов
CREATE TABLE IF NOT EXISTS t_p55547046_creative_ai_hub.chat_history (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    chat_id VARCHAR(100) NOT NULL,
    chat_title VARCHAR(500) NOT NULL,
    service_id INTEGER NOT NULL,
    service_name VARCHAR(200) NOT NULL,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по user_email и chat_id
CREATE INDEX IF NOT EXISTS idx_chat_history_user_email ON t_p55547046_creative_ai_hub.chat_history(user_email);
CREATE INDEX IF NOT EXISTS idx_chat_history_chat_id ON t_p55547046_creative_ai_hub.chat_history(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_updated_at ON t_p55547046_creative_ai_hub.chat_history(updated_at DESC);