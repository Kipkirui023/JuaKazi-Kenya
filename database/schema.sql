-- Create database
CREATE DATABASE IF NOT EXISTS juakazi_db;
USE juakazi_db;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_type ENUM('worker', 'employer', 'admin') NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Location
    county VARCHAR(50) NOT NULL,
    sub_county VARCHAR(50),
    ward VARCHAR(50),
    
    -- Worker specific
    skills TEXT,
    experience_years INT DEFAULT 0,
    experience_description TEXT,
    availability ENUM('available', 'busy', 'unavailable') DEFAULT 'available',
    availability_type ENUM('full-time', 'part-time', 'casual') DEFAULT 'casual',
    
    -- Employer specific
    company_name VARCHAR(100),
    company_size VARCHAR(50),
    industry VARCHAR(50),
    
    -- Verification
    phone_verified BOOLEAN DEFAULT FALSE,
    id_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(10),
    verification_expires DATETIME,
    
    -- Ratings
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    
    -- Profile
    profile_image VARCHAR(255),
    bio TEXT,
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_phone (phone),
    INDEX idx_county (county),
    INDEX idx_user_type (user_type),
    INDEX idx_rating (rating DESC),
    INDEX idx_created_at (created_at DESC)
);

-- Jobs table
CREATE TABLE jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    job_type ENUM('full-time', 'part-time', 'casual', 'contract') NOT NULL,
    category ENUM(
        'construction', 'plumbing', 'electrical', 'cleaning',
        'delivery', 'domestic', 'farming', 'security',
        'driving', 'other'
    ) NOT NULL,
    
    -- Location
    county VARCHAR(50) NOT NULL,
    sub_county VARCHAR(50),
    ward VARCHAR(50),
    exact_location VARCHAR(255),
    
    -- Salary
    salary_amount DECIMAL(10,2) NOT NULL,
    salary_currency VARCHAR(3) DEFAULT 'KES',
    salary_period ENUM('hour', 'day', 'week', 'month', 'project') NOT NULL,
    salary_negotiable BOOLEAN DEFAULT FALSE,
    
    -- Duration
    start_date DATE,
    end_date DATE,
    urgent BOOLEAN DEFAULT FALSE,
    
    -- Employer
    employer_id INT NOT NULL,
    company_name VARCHAR(100),
    contact_phone VARCHAR(15),
    contact_whatsapp VARCHAR(15),
    
    -- Status
    status ENUM('open', 'closed', 'filled', 'cancelled') DEFAULT 'open',
    views INT DEFAULT 0,
    applications_count INT DEFAULT 0,
    
    -- Metadata
    featured BOOLEAN DEFAULT FALSE,
    promoted_until DATETIME,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_county (county),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_salary (salary_amount DESC),
    INDEX idx_featured (featured, created_at DESC)
);

-- Skills junction table for jobs
CREATE TABLE job_skills (
    job_id INT NOT NULL,
    skill VARCHAR(50) NOT NULL,
    PRIMARY KEY (job_id, skill),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_skill (skill)
);

-- Applications table
CREATE TABLE applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    worker_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending',
    cover_message TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, worker_id),
    INDEX idx_job_status (job_id, status),
    INDEX idx_worker (worker_id)
);

-- Reviews table
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    reviewer_id INT NOT NULL, -- User giving the review
    reviewee_id INT NOT NULL, -- User receiving the review
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    comment TEXT,
    type ENUM('worker_to_employer', 'employer_to_worker') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (job_id, reviewer_id, reviewee_id),
    INDEX idx_reviewee (reviewee_id),
    INDEX idx_created_at (created_at DESC)
);

-- Messages table
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    job_id INT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
    INDEX idx_conversation (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), created_at DESC),
    INDEX idx_receiver_unread (receiver_id, read)
);

-- SMS logs table
CREATE TABLE sms_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone_number VARCHAR(15) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    provider_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_phone (phone_number),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at DESC)
);

-- Insert sample data
INSERT INTO users (user_type, name, phone, county, skills, password_hash) VALUES
('worker', 'John Kamau', '254712345678', 'Nairobi', 'Plumbing,Electrician', 'hashed_password_123'),
('worker', 'Mary Wanjiku', '254723456789', 'Mombasa', 'Cleaning,Cooking', 'hashed_password_456'),
('employer', 'Jane Muthoni', '254734567890', 'Nairobi', NULL, 'hashed_password_789'),
('employer', 'David Ochieng', '254745678901', 'Kisumu', NULL, 'hashed_password_012');

INSERT INTO jobs (title, description, job_type, category, county, salary_amount, salary_period, employer_id) VALUES
('Plumber Needed Urgently', 'Need experienced plumber to fix leaking pipes in Westlands', 'casual', 'plumbing', 'Nairobi', 3000.00, 'day', 3),
('House Cleaning', 'Weekly house cleaning in Nyali area', 'part-time', 'cleaning', 'Mombasa', 1500.00, 'day', 4),
('Electrician for Wiring', 'House wiring installation in new building', 'contract', 'electrical', 'Nairobi', 25000.00, 'project', 3);