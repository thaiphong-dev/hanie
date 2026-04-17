-- SQL Patches for Phase 6 Admin Panel Enhancements

-- 1. Staff Profiles & Roles
-- (Ensure role constraint allows 'staff')
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
-- ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'customer', 'staff'));

-- 2. Staff Profile Tracking
CREATE TABLE IF NOT EXISTS staff_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    commission_pct NUMERIC(5,2) DEFAULT 10.00,
    is_active BOOLEAN DEFAULT true,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Staff Assignment in Orders
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES users(id);

-- 4. Staff Assignment in Bookings
-- ALTER TABLE bookings ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES users(id);

-- 5. Commission History View / Table (Optional, can be calculated on fly)
-- For now, we calculate on the fly from orders where staff_id = X
