-- Добавление уникального ограничения для chat_id
ALTER TABLE t_p55547046_creative_ai_hub.chat_history 
ADD CONSTRAINT unique_chat_id UNIQUE (chat_id);
