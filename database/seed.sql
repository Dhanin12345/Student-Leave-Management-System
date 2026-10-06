-- ============================================================================
-- STUDENT LEAVE MANAGEMENT SYSTEM - DATABASE SEED DATA (SQL DML)
-- Initial sample data for testing and demonstration
-- ============================================================================

-- 1. DEPARTMENTS SEED
INSERT INTO departments (id, name, code, description) VALUES
(1, 'Computer Science', 'CSE', 'Department of Computer Science & Engineering'),
(2, 'Electronics', 'ECE', 'Department of Electronics & Communication'),
(3, 'Mechanical', 'MECH', 'Department of Mechanical Engineering'),
(4, 'Civil', 'CIVIL', 'Department of Civil Engineering');

-- 2. CLASSES SEED
INSERT INTO classes (id, department_id, name, section, batch_year) VALUES
(1, 1, 'CSE - 3rd Year', 'A', '2023-2027'),
(2, 1, 'CSE - 3rd Year', 'B', '2023-2027'),
(3, 1, 'CSE - 4th Year', 'A', '2022-2026'),
(4, 1, 'CSE - 2nd Year', 'A', '2024-2028'),
(5, 2, 'ECE - 3rd Year', 'A', '2023-2027'),
(6, 2, 'ECE - 4th Year', 'A', '2022-2026'),
(7, 3, 'MECH - 3rd Year', 'A', '2023-2027'),
(8, 4, 'CIVIL - 3rd Year', 'A', '2023-2027');

-- 3. ADMINS SEED
-- Default password: password123 (hashed with bcrypt: $2a$10$wN35rZcM1s.qjQf27x5nEu1Yg0/2O75O6m8Zg5V1rL0kK0mN3rP2i)
INSERT INTO admins (id, name, email, password_hash, avatar) VALUES
(1, 'Dhanin T', 'admin@college.edu', '$2a$10$wN35rZcM1s.qjQf27x5nEu1Yg0/2O75O6m8Zg5V1rL0kK0mN3rP2i', 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminDhanin');

-- 4. FACULTY SEED
INSERT INTO faculty (id, name, email, password_hash, department_id, phone, designation, avatar) VALUES
(1, 'Dr. Robert Vance', 'robert.vance@college.edu', '$2a$10$wN35rZcM1s.qjQf27x5nEu1Yg0/2O75O6m8Zg5V1rL0kK0mN3rP2i', 1, '+1 555-0101', 'Professor & Head of Department', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert'),
(2, 'Prof. Sarah Jenkins', 'faculty@college.edu', '$2a$10$wN35rZcM1s.qjQf27x5nEu1Yg0/2O75O6m8Zg5V1rL0kK0mN3rP2i', 1, '+1 555-0102', 'Associate Professor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),
(3, 'Dr. Michael Chang', 'michael.chang@college.edu', '$2a$10$wN35rZcM1s.qjQf27x5nEu1Yg0/2O75O6m8Zg5V1rL0kK0mN3rP2i', 2, '+1 555-0103', 'Professor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'),
(4, 'Prof. Emily Watson', 'emily.watson@college.edu', '$2a$10$wN35rZcM1s.qjQf27x5nEu1Yg0/2O75O6m8Zg5V1rL0kK0mN3rP2i', 3, '+1 555-0104', 'Assistant Professor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily');

-- 5. STUDENTS SEED
INSERT INTO students (id, name, register_no, email, password_hash, department_id, class_id, advisor_id, phone, avatar) VALUES
(1, 'Alex Morgan', 'CS2023001', 'student@college.edu', '$2a$10$wN35rZcM1s.qjQf27x5nEu1Yg0/2O75O6m8Zg5V1rL0kK0mN3rP2i', 1, 1, 2, '+1 555-0201', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'),
(2, 'Jessica Chen', 'CS2023002', 'jessica.chen@college.edu', '$2a$10$wN35rZcM1s.qjQf27x5nEu1Yg0/2O75O6m8Zg5V1rL0kK0mN3rP2i', 1, 1, 2, '+1 555-0202', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica'),
(3, 'David Miller', 'CS2023003', 'david.miller@college.edu', '$2a$10$wN35rZcM1s.qjQf27x5nEu1Yg0/2O75O6m8Zg5V1rL0kK0mN3rP2i', 1, 2, 1, '+1 555-0203', 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'),
(4, 'Sophia Martinez', 'EC2023001', 'sophia.martinez@college.edu', '$2a$10$wN35rZcM1s.qjQf27x5nEu1Yg0/2O75O6m8Zg5V1rL0kK0mN3rP2i', 2, 5, 3, '+1 555-0204', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia'),
(5, 'James Wilson', 'ME2023001', 'james.wilson@college.edu', '$2a$10$wN35rZcM1s.qjQf27x5nEu1Yg0/2O75O6m8Zg5V1rL0kK0mN3rP2i', 3, 7, 4, '+1 555-0205', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James');

-- 6. LEAVE TYPES SEED
INSERT INTO leave_types (id, name, code, max_days_per_year, requires_document, description) VALUES
(1, 'Sick Leave', 'SICK', 15, TRUE, 'Leave due to illness or medical reasons'),
(2, 'Casual Leave', 'CASUAL', 5, FALSE, 'Casual leave for personal work'),
(3, 'Emergency Leave', 'EMERGENCY', 7, TRUE, 'Emergency leave for family emergencies'),
(4, 'Academic Leave', 'ACADEMIC', 10, FALSE, 'Leave for academic events, conferences, competitions');

-- 7. LEAVE REQUESTS SEED
INSERT INTO leave_requests (id, student_id, leave_type_id, start_date, end_date, total_days, reason, document_url, status, applied_at, remarks, reviewed_by, reviewed_at) VALUES
(1, 1, 1, '2026-08-12', '2026-08-14', 3, 'High fever and doctor advised 3 days complete rest.', 'medical_certificate_alex.pdf', 'Pending', '2026-08-10 08:30:00', NULL, NULL, NULL),
(2, 2, 2, '2026-08-05', '2026-08-06', 2, 'Attending elder sister''s wedding ceremony.', NULL, 'Approved', '2026-08-01 10:15:00', 'Approved. Make up for missed classes upon return.', 2, '2026-08-02 14:20:00'),
(3, 3, 4, '2026-08-15', '2026-08-17', 3, 'Representing college at Inter-College Hackathon 2026.', 'hackathon_invite.pdf', 'Approved', '2026-08-04 09:00:00', 'All the best for the competition!', 1, '2026-08-04 11:30:00'),
(4, 4, 1, '2026-07-20', '2026-07-22', 3, 'Severe dental infection.', 'doctor_note.pdf', 'Rejected', '2026-07-18 16:45:00', 'Medical document submitted was unreadable. Please resubmit.', 3, '2026-07-19 09:10:00'),
(5, 5, 3, '2026-08-18', '2026-08-19', 2, 'Family emergency traveling out of town.', NULL, 'Pending', '2026-08-09 11:20:00', NULL, NULL, NULL);

-- 8. NOTIFICATIONS SEED
INSERT INTO notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES
(1, 1, 'student', 'Leave Request Submitted', 'Your Sick Leave application (#1) for 3 days has been submitted successfully.', 'info', TRUE, '2026-08-10 08:30:00'),
(2, 2, 'student', 'Leave Request Approved', 'Your Casual Leave application for 2 days has been approved by Prof. Sarah Jenkins.', 'success', FALSE, '2026-08-02 14:20:00'),
(3, 2, 'faculty', 'New Leave Request', 'Alex Morgan has submitted a new Sick Leave application for 3 days.', 'info', FALSE, '2026-08-10 08:30:00'),
(4, 1, 'admin', 'System Alert', 'New student leave applications pending review: 2 requests.', 'warning', FALSE, '2026-08-10 09:00:00');
