-- INTEGRA PLATFORM - MOCK DATA FOR TESTING
-- Run this AFTER running complete-database-setup.sql
-- This populates the database with realistic test data

-- Insert sample users with the specified wallet addresses
INSERT INTO integra_users (
    id, wallet_address, email, display_name, status, role,
    total_investments, properties_owned, join_date, kyc_status,
    bio, location, investment_preferences, social_links, notifications
) VALUES
(
    'user_001',
    '0xad95fbf311a6ee0221a4bade4ae7defd8ce98ebb',
    'alice@example.com',
    'Alice Johnson',
    'active',
    'investor',
    '2.5',
    2,
    '2024-01-15T10:00:00Z',
    'verified',
    'Real estate investor focused on commercial properties',
    'Mumbai, India',
    '["Commercial", "Residential", "Luxury"]',
    '{"twitter": "@alice_investor", "linkedin": "alice-johnson"}',
    '{"email": true, "sms": true, "push": true}'
),
(
    'user_002',
    '0xcfce8584ec3e5b552bfc3e78d8f9fa69a2671dc1',
    'bob@example.com',
    'Bob Smith',
    'active',
    'investor',
    '1.8',
    1,
    '2024-02-01T14:30:00Z',
    'verified',
    'Tech entrepreneur investing in real estate',
    'Delhi, India',
    '["Luxury", "Office", "Residential"]',
    '{"twitter": "@bob_tech", "website": "bobsmith.dev"}',
    '{"email": true, "sms": false, "push": true}'
),
(
    'user_003',
    '0x4c4267c2c7cfd74550f8c58fadaf34ca73fa7f0',
    'charlie@example.com',
    'Charlie Brown',
    'active',
    'user',
    '0.5',
    0,
    '2024-03-10T09:15:00Z',
    'pending',
    'New to crypto and real estate investing',
    'Bangalore, India',
    '["Residential"]',
    '{}',
    '{"email": true, "sms": false, "push": false}'
);

-- Insert sample properties
INSERT INTO integra_properties (
    id, title, description, location, price, total_shares, available_shares,
    image, images, tags, roi, property_type, owner_address, status,
    monthly_income, total_area, bedrooms, bathrooms, year_built, amenities, coordinates
) VALUES
(
    'prop_001',
    'Luxury Apartments in Bandra',
    'Premium residential complex with modern amenities in the heart of Mumbai',
    'Bandra West, Mumbai',
    '15.5',
    1000,
    650,
    'https://example.com/bandra-apartment.jpg',
    '["https://example.com/bandra-1.jpg", "https://example.com/bandra-2.jpg"]',
    '["Luxury", "Prime Location", "Modern"]',
    '8.5',
    'Luxury',
    '0xad95fbf311a6ee0221a4bade4ae7defd8ce98ebb',
    'active',
    '1.2',
    1200,
    3,
    2,
    2022,
    '["Swimming Pool", "Gym", "Security", "Parking"]',
    '{"lat": 19.0596, "lng": 72.8295}'
),
(
    'prop_002',
    'Commercial Office Space in Connaught Place',
    'Grade A office space in prime business district of Delhi',
    'Connaught Place, New Delhi',
    '25.0',
    2000,
    1200,
    'https://example.com/cp-office.jpg',
    '["https://example.com/cp-1.jpg", "https://example.com/cp-2.jpg"]',
    '["Commercial", "Prime Location", "Grade A"]',
    '12.0',
    'Office',
    '0xad95fbf311a6ee0221a4bade4ae7defd8ce98ebb',
    'active',
    '2.8',
    2500,
    null,
    null,
    2021,
    '["AC", "Elevator", "Security", "Parking", "Conference Rooms"]',
    '{"lat": 28.6315, "lng": 77.2167}'
),
(
    'prop_003',
    'Tech Park Villa in Whitefield',
    'Modern villa near major tech companies in Bangalore',
    'Whitefield, Bangalore',
    '8.2',
    500,
    300,
    'https://example.com/whitefield-villa.jpg',
    '["https://example.com/villa-1.jpg", "https://example.com/villa-2.jpg"]',
    '["Residential", "Tech Hub", "Villa"]',
    '6.8',
    'Residential',
    '0xcfce8584ec3e5b552bfc3e78d8f9fa69a2671dc1',
    'active',
    '0.6',
    1800,
    4,
    3,
    2023,
    '["Garden", "Parking", "Solar Panels", "Study Room"]',
    '{"lat": 12.9698, "lng": 77.7500}'
);

-- Insert sample property ownerships showing realistic investment patterns
INSERT INTO integra_property_ownerships (
    user_wallet_address, property_id, shares_owned, purchase_price, purchase_date
) VALUES
-- Alice owns shares in her own properties + invested in Bob's property
('0xad95fbf311a6ee0221a4bade4ae7defd8ce98ebb', 'prop_001', 350, '5.425', '2024-01-15T10:30:00Z'),
('0xad95fbf311a6ee0221a4bade4ae7defd8ce98ebb', 'prop_002', 800, '10.0', '2024-01-20T15:45:00Z'),
('0xad95fbf311a6ee0221a4bade4ae7defd8ce98ebb', 'prop_003', 100, '1.64', '2024-03-15T11:20:00Z'),

-- Bob invested in Alice's luxury apartment and owns his villa
('0xcfce8584ec3e5b552bfc3e78d8f9fa69a2671dc1', 'prop_001', 200, '3.1', '2024-02-05T12:00:00Z'),
('0xcfce8584ec3e5b552bfc3e78d8f9fa69a2671dc1', 'prop_003', 100, '1.64', '2024-03-10T14:30:00Z'),

-- Charlie made a small investment in the villa
('0x4c4267c2c7cfd74550f8c58fadaf34ca73fa7f0', 'prop_003', 100, '1.64', '2024-03-12T16:45:00Z');

-- Verification and summary queries
SELECT 'Mock data inserted successfully!' as status;

-- Show users and their investment summary
SELECT
    u.display_name as "Investor Name",
    u.wallet_address as "Wallet Address",
    u.total_investments || ' ETH' as "Total Invested",
    u.properties_owned as "Properties",
    u.status as "Status",
    u.kyc_status as "KYC Status"
FROM integra_users u
ORDER BY u.display_name;

-- Show properties and their details
SELECT
    p.title as "Property",
    p.location as "Location",
    p.price || ' ETH' as "Total Value",
    p.available_shares || '/' || p.total_shares as "Available/Total Shares",
    p.roi || '%' as "ROI",
    p.property_type as "Type",
    p.status as "Status"
FROM integra_properties p
ORDER BY p.title;

-- Show detailed ownership distribution
SELECT
    u.display_name as "Investor",
    p.title as "Property",
    po.shares_owned as "Shares Owned",
    po.purchase_price || ' ETH' as "Amount Invested",
    ROUND((po.shares_owned::decimal / p.total_shares::decimal * 100), 2) || '%' as "Ownership %",
    po.purchase_date::date as "Purchase Date"
FROM integra_property_ownerships po
JOIN integra_users u ON po.user_wallet_address = u.wallet_address
JOIN integra_properties p ON po.property_id = p.id
ORDER BY p.title, po.shares_owned DESC;

-- Summary statistics
SELECT
    'Platform Summary' as "Metric Type",
    COUNT(DISTINCT u.id) as "Total Users",
    COUNT(DISTINCT p.id) as "Total Properties",
    SUM(p.price::decimal) || ' ETH' as "Total Property Value",
    COUNT(DISTINCT po.id) as "Total Investments"
FROM integra_users u
CROSS JOIN integra_properties p
CROSS JOIN integra_property_ownerships po;

-- Data inserted successfully!
-- You now have:
-- - 3 users with your specified wallet addresses
-- - 3 diverse properties (luxury apartment, office space, villa)
-- - 6 ownership records showing realistic investment patterns
-- - Proper share distribution and availability tracking
-- Your APIs should now return this test data!