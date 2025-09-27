# Supabase Database Setup

This directory contains SQL files to set up your Integra platform database in Supabase.

## Setup Instructions

Run these SQL files in your Supabase SQL Editor in the following order:

### 1. Create Tables
```sql
-- Run: 01-create-tables.sql
```
Creates the main tables:
- `users` - User profiles with wallet authentication
- `properties` - Property listings with tokenization details
- `property_ownerships` - Junction table for shared property ownership

### 2. Create Indexes
```sql
-- Run: 02-create-indexes.sql
```
Creates database indexes for optimal query performance.

### 3. Create Functions & Triggers
```sql
-- Run: 03-create-functions-triggers.sql
```
Sets up:
- Automatic `updated_at` timestamp updates
- Automatic share availability tracking
- Foreign key constraints

### 4. Setup Row Level Security
```sql
-- Run: 04-setup-rls.sql
```
Enables RLS with permissive policies (security handled at API level).

## Environment Variables

Don't forget to set up your environment variables in `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Database Schema Overview

### Users Table
- Wallet-based authentication
- KYC status tracking
- Investment preferences
- Social links and notifications

### Properties Table
- Property details (location, price, type, etc.)
- Share tokenization (total_shares, available_shares)
- Owner wallet address reference
- Property metadata (images, amenities, coordinates)

### Property Ownerships Table
- Many-to-many relationship between users and properties
- Share ownership tracking
- Purchase history and pricing
- Automatic share availability updates

## Key Features

✅ **Wallet-Based Authentication** - No traditional login required
✅ **Share Tokenization** - Properties divided into purchasable shares
✅ **Automatic Share Tracking** - Available shares update automatically
✅ **Flexible Ownership** - Users can own shares in multiple properties
✅ **API-First Design** - All operations through REST APIs
✅ **Performance Optimized** - Proper indexing for fast queries