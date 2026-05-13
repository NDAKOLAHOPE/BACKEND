-- Migration: Add Academic System Enhancements
-- Description: Add new entities for academic management (attendance, exams, report cards, enrollments, academic years, classes)

-- 1. Academic Years Table
CREATE TABLE IF NOT EXISTS academic_years (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_academic_years_status ON academic_years(status);
CREATE INDEX idx_academic_years_is_current ON academic_years(is_current);

-- 2. Class Groups Table
CREATE TABLE IF NOT EXISTS class_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    level VARCHAR(50) NOT NULL,
    section VARCHAR(50) NULL,
    academic_year_id INT NOT NULL,
    class_teacher_id INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_class_group_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    CONSTRAINT fk_class_group_teacher FOREIGN KEY (class_teacher_id) REFERENCES students(id) ON DELETE SET NULL
);

CREATE INDEX idx_class_groups_academic_year ON class_groups(academic_year_id);
CREATE INDEX idx_class_groups_level ON class_groups(level);

-- 3. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    class_group_id INT NULL,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    enrollment_type VARCHAR(20) NOT NULL DEFAULT 'NEW',
    tuition_fee NUMERIC(10,2) NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_class_group FOREIGN KEY (class_group_id) REFERENCES class_groups(id) ON DELETE SET NULL,
    CONSTRAINT uniq_student_academic_year UNIQUE (student_id, academic_year_id)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_academic_year ON enrollments(academic_year_id);
CREATE INDEX idx_enrollments_class_group ON enrollments(class_group_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);

-- 4. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    day_of_week VARCHAR(10) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
    attendance_type VARCHAR(20) NOT NULL DEFAULT 'DAILY',
    class_group_id INT NULL,
    check_in_time TIMESTAMP NULL,
    check_out_time TIMESTAMP NULL,
    late_minutes INT NULL DEFAULT 0,
    reason TEXT NULL,
    is_excused BOOLEAN NOT NULL DEFAULT FALSE,
    excuse_document VARCHAR(500) NULL,
    notes TEXT NULL,
    recorded_by INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_class_group FOREIGN KEY (class_group_id) REFERENCES class_groups(id) ON DELETE SET NULL,
    CONSTRAINT fk_attendance_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uniq_student_date_attendance UNIQUE (student_id, date, attendance_type)
);

CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_class_group ON attendance(class_group_id);
CREATE INDEX idx_attendance_status ON attendance(status);

-- 5. Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    subject VARCHAR(100) NOT NULL,
    exam_type VARCHAR(30) NOT NULL,
    class_group_id INT NOT NULL,
    academic_year_id INT NULL,
    exam_date DATE NOT NULL,
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    duration_minutes INT NULL,
    max_score NUMERIC(6,2) NOT NULL DEFAULT 20,
    passing_score NUMERIC(6,2) NULL,
    weight NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    coefficient NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    instructions TEXT NULL,
    materials_allowed TEXT NULL,
    location VARCHAR(200) NULL,
    created_by INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exam_class_group FOREIGN KEY (class_group_id) REFERENCES class_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_exam_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE SET NULL,
    CONSTRAINT fk_exam_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_exams_class_group ON exams(class_group_id);
CREATE INDEX idx_exams_academic_year ON exams(academic_year_id);
CREATE INDEX idx_exams_subject ON exams(subject);
CREATE INDEX idx_exams_exam_date ON exams(exam_date);
CREATE INDEX idx_exams_status ON exams(status);

-- 6. Exam Scores Table
CREATE TABLE IF NOT EXISTS exam_scores (
    id SERIAL PRIMARY KEY,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    score NUMERIC(6,2) NULL,
    max_possible NUMERIC(6,2) NULL,
    percentage NUMERIC(5,2) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_GRADED',
    grade_letter VARCHAR(5) NULL,
    comments TEXT NULL,
    graded_by INT NULL,
    graded_at TIMESTAMP NULL,
    is_absent BOOLEAN NOT NULL DEFAULT FALSE,
    excuse_reason TEXT NULL,
    is_excused BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exam_score_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    CONSTRAINT fk_exam_score_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_exam_score_graded_by FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uniq_exam_student UNIQUE (exam_id, student_id)
);

CREATE INDEX idx_exam_scores_exam ON exam_scores(exam_id);
CREATE INDEX idx_exam_scores_student ON exam_scores(student_id);
CREATE INDEX idx_exam_scores_status ON exam_scores(status);

-- 7. Report Cards Table
CREATE TABLE IF NOT EXISTS report_cards (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    class_group_id INT NULL,
    term VARCHAR(50) NOT NULL,
    total_score NUMERIC(6,2) NOT NULL,
    average NUMERIC(6,2) NOT NULL,
    max_possible NUMERIC(6,2) NOT NULL,
    percentage NUMERIC(5,2) NOT NULL,
    class_rank INT NULL,
    class_size INT NULL,
    attendance_days_present INT NOT NULL DEFAULT 0,
    attendance_days_absent INT NOT NULL DEFAULT 0,
    attendance_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    decision VARCHAR(30) NULL,
    principal_comments TEXT NULL,
    teacher_comments TEXT NULL,
    remarks TEXT NULL,
    published_at TIMESTAMP NULL,
    generated_by INT NULL,
    pdf_url VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_report_card_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_card_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_card_class_group FOREIGN KEY (class_group_id) REFERENCES class_groups(id) ON DELETE SET NULL,
    CONSTRAINT fk_report_card_generated_by FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uniq_student_academic_year_term UNIQUE (student_id, academic_year_id, term)
);

CREATE INDEX idx_report_cards_student ON report_cards(student_id);
CREATE INDEX idx_report_cards_academic_year ON report_cards(academic_year_id);
CREATE INDEX idx_report_cards_term ON report_cards(term);
CREATE INDEX idx_report_cards_status ON report_cards(status);
CREATE INDEX idx_report_cards_decision ON report_cards(decision);
