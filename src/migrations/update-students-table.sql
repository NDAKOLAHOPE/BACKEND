-- Migration: Update Students Table with New Fields
-- Description: Add new columns to students table for enhanced profile management

ALTER TABLE students ADD COLUMN IF NOT EXISTS gender VARCHAR(20) NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500) NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS email VARCHAR(100) NULL UNIQUE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS city VARCHAR(100) NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20) NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS country VARCHAR(100) NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS nationality VARCHAR(100) NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100) NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20) NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS medical_info TEXT NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS student_id_number VARCHAR(50) NULL UNIQUE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_gender ON students(gender);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_class_name ON students(class);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- Add check constraint for status (PostgreSQL)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_students_status'
    ) THEN
        ALTER TABLE students ADD CONSTRAINT chk_students_status 
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED', 'TRANSFERRED'));
    END IF;
END $$;

-- Add check constraint for gender
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_students_gender'
    ) THEN
        ALTER TABLE students ADD CONSTRAINT chk_students_gender 
        CHECK (gender IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY') OR gender IS NULL);
    END IF;
END $$;
