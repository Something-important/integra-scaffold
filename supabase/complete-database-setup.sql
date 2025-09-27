-- INTEGRA PLATFORM - COMPLETE DATABASE SETUP
-- This file creates everything needed and fixes all permission issues
-- Run this entire file in Supabase SQL Editor

-- Drop existing tables for clean setup
DROP TABLE IF EXISTS integra_property_ownerships CASCADE;
DROP TABLE IF EXISTS integra_properties CASCADE;
DROP TABLE IF EXISTS integra_users CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_property_available_shares() CASCADE;

-- Create users table for Integra platform
CREATE TABLE integra_users (
    id TEXT PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    display_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended', 'rejected')),
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'investor')),
    total_investments TEXT NOT NULL DEFAULT '0.0',
    properties_owned INTEGER NOT NULL DEFAULT 0,
    join_date TIMESTAMPTZ NOT NULL,
    last_active TIMESTAMPTZ,
    kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected', 'not_required')),
    profile_image TEXT,
    bio TEXT,
    location TEXT,
    investment_preferences JSONB DEFAULT '[]'::jsonb,
    social_links JSONB DEFAULT '{}'::jsonb,
    notifications JSONB NOT NULL DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create properties table
CREATE TABLE integra_properties (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    price TEXT NOT NULL, -- Total property value in ETH
    total_shares INTEGER NOT NULL,
    available_shares INTEGER NOT NULL,
    image TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    roi TEXT DEFAULT '0',
    property_type TEXT NOT NULL CHECK (property_type IN ('Residential', 'Commercial', 'Industrial', 'Retail', 'Office', 'Luxury')),
    owner_address TEXT NOT NULL, -- Original lister/primary owner wallet address
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'pending', 'draft')),
    monthly_income TEXT,
    total_area INTEGER,
    bedrooms INTEGER,
    bathrooms INTEGER,
    year_built INTEGER,
    amenities JSONB DEFAULT '[]'::jsonb,
    coordinates JSONB, -- {lat: number, lng: number}
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create property_ownerships table (junction table for many-to-many relationship)
CREATE TABLE integra_property_ownerships (
    id SERIAL PRIMARY KEY,
    user_wallet_address TEXT NOT NULL,
    property_id TEXT NOT NULL,
    shares_owned INTEGER NOT NULL CHECK (shares_owned > 0),
    purchase_price TEXT NOT NULL, -- Price paid for these shares in ETH
    purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_wallet_address, property_id) -- One ownership record per user per property
);

-- Create indexes for performance
-- Integra users table indexes
CREATE INDEX idx_integra_users_wallet_address ON integra_users(wallet_address);
CREATE INDEX idx_integra_users_status ON integra_users(status);
CREATE INDEX idx_integra_users_role ON integra_users(role);
CREATE INDEX idx_integra_users_kyc_status ON integra_users(kyc_status);
CREATE INDEX idx_integra_users_join_date ON integra_users(join_date);
CREATE INDEX idx_integra_users_display_name ON integra_users(display_name);
CREATE INDEX idx_integra_users_location ON integra_users(location);

-- Integra properties table indexes
CREATE INDEX idx_integra_properties_owner_address ON integra_properties(owner_address);
CREATE INDEX idx_integra_properties_status ON integra_properties(status);
CREATE INDEX idx_integra_properties_property_type ON integra_properties(property_type);
CREATE INDEX idx_integra_properties_location ON integra_properties(location);
CREATE INDEX idx_integra_properties_price ON integra_properties(price);
CREATE INDEX idx_integra_properties_available_shares ON integra_properties(available_shares);
CREATE INDEX idx_integra_properties_created_at ON integra_properties(created_at);

-- Integra property ownerships table indexes
CREATE INDEX idx_integra_property_ownerships_user ON integra_property_ownerships(user_wallet_address);
CREATE INDEX idx_integra_property_ownerships_property ON integra_property_ownerships(property_id);
CREATE INDEX idx_integra_property_ownerships_purchase_date ON integra_property_ownerships(purchase_date);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at on row updates
CREATE TRIGGER update_integra_users_updated_at
    BEFORE UPDATE ON integra_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integra_properties_updated_at
    BEFORE UPDATE ON integra_properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integra_property_ownerships_updated_at
    BEFORE UPDATE ON integra_property_ownerships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update available shares when ownership changes
CREATE OR REPLACE FUNCTION update_property_available_shares()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Decrease available shares when new ownership is created
        UPDATE integra_properties
        SET available_shares = available_shares - NEW.shares_owned
        WHERE id = NEW.property_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Adjust available shares when ownership is updated
        UPDATE integra_properties
        SET available_shares = available_shares + OLD.shares_owned - NEW.shares_owned
        WHERE id = NEW.property_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Increase available shares when ownership is deleted
        UPDATE integra_properties
        SET available_shares = available_shares + OLD.shares_owned
        WHERE id = OLD.property_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger to automatically update available shares
CREATE TRIGGER update_integra_property_shares_trigger
    AFTER INSERT OR UPDATE OR DELETE ON integra_property_ownerships
    FOR EACH ROW
    EXECUTE FUNCTION update_property_available_shares();

-- Add foreign key constraint for integra_property_ownerships -> integra_properties
ALTER TABLE integra_property_ownerships
ADD CONSTRAINT fk_integra_ownerships_property
FOREIGN KEY (property_id) REFERENCES integra_properties(id) ON DELETE CASCADE;

-- CRITICAL: Grant permissions to all necessary roles
-- This fixes the "permission denied" errors

-- Grant all permissions to service_role (for server-side API calls)
GRANT ALL ON integra_users TO service_role;
GRANT ALL ON integra_properties TO service_role;
GRANT ALL ON integra_property_ownerships TO service_role;
GRANT USAGE ON SEQUENCE integra_property_ownerships_id_seq TO service_role;

-- Grant all permissions to authenticated role
GRANT ALL ON integra_users TO authenticated;
GRANT ALL ON integra_properties TO authenticated;
GRANT ALL ON integra_property_ownerships TO authenticated;
GRANT USAGE ON SEQUENCE integra_property_ownerships_id_seq TO authenticated;

-- Grant all permissions to anon role (for testing purposes)
GRANT ALL ON integra_users TO anon;
GRANT ALL ON integra_properties TO anon;
GRANT ALL ON integra_property_ownerships TO anon;
GRANT USAGE ON SEQUENCE integra_property_ownerships_id_seq TO anon;

-- Add comments for documentation
COMMENT ON TABLE integra_users IS 'Main users table for Integra platform with wallet-based authentication';
COMMENT ON TABLE integra_properties IS 'Properties available for tokenized ownership';
COMMENT ON TABLE integra_property_ownerships IS 'Junction table tracking user ownership shares in properties';

COMMENT ON COLUMN integra_users.wallet_address IS 'Ethereum wallet address (lowercase)';
COMMENT ON COLUMN integra_users.investment_preferences IS 'JSON array of investment preference tags';
COMMENT ON COLUMN integra_users.social_links IS 'JSON object with social media links';
COMMENT ON COLUMN integra_users.notifications IS 'JSON object with notification preferences';

COMMENT ON COLUMN integra_properties.total_shares IS 'Total number of shares this property is divided into';
COMMENT ON COLUMN integra_properties.available_shares IS 'Number of shares still available for purchase';
COMMENT ON COLUMN integra_properties.owner_address IS 'Wallet address of the original property lister';

COMMENT ON COLUMN integra_property_ownerships.shares_owned IS 'Number of shares owned by this user for this property';
COMMENT ON COLUMN integra_property_ownerships.purchase_price IS 'Total price paid for these shares in ETH';

-- Verification queries
SELECT 'Database setup completed successfully!' as status;

-- Show table structure
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('integra_users', 'integra_properties', 'integra_property_ownerships')
ORDER BY table_name, ordinal_position;

-- Show indexes created
SELECT
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE tablename IN ('integra_users', 'integra_properties', 'integra_property_ownerships')
ORDER BY tablename, indexname;

-- SETUP COMPLETE!
-- Your database is now ready with all permissions properly configured.
-- APIs should work without any permission errors.