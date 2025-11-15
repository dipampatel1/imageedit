-- User Usage Tracking Table
CREATE TABLE IF NOT EXISTS user_usage (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL DEFAULT 'free', -- 'free', 'starter', 'pro', 'business'
    user_level VARCHAR(50) NOT NULL DEFAULT 'user', -- 'user' or 'admin'
    images_generated INTEGER NOT NULL DEFAULT 0,
    current_period_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    current_period_end TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 month'),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Image History Table
CREATE TABLE IF NOT EXISTS image_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    image_id VARCHAR(255) NOT NULL,
    base64_data TEXT NOT NULL,
    mime_type VARCHAR(50) NOT NULL DEFAULT 'image/png',
    original_name VARCHAR(255),
    prompt TEXT,
    mode VARCHAR(50), -- 'edit' or 'generate'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_usage(user_id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_email ON user_usage(email);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_level ON user_usage(user_level);
CREATE INDEX IF NOT EXISTS idx_image_history_user_id ON image_history(user_id);
CREATE INDEX IF NOT EXISTS idx_image_history_created_at ON image_history(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON user_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

