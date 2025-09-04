-- Tools table
CREATE TABLE IF NOT EXISTS tools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    website_url TEXT NOT NULL,
    image_url TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    pricing_model TEXT,
    rating NUMERIC(2,1) DEFAULT 0,
    views INT DEFAULT 0,
    badge TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submitted tools table
CREATE TABLE IF NOT EXISTS submitted_tools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    website_url TEXT NOT NULL,
    image_url TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    your_name TEXT,
    your_email TEXT,
    status TEXT DEFAULT 'pending',
    submission_date TIMESTAMPTZ DEFAULT NOW()
);

-- Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
); 