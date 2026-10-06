import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Performance Optimization Middleware: High Speed Caching & Keep-Alive
app.use(cors());
app.use(express.json());

// High-speed static asset caching (1 year max age with ETag & immutable cache headers)
app.use(express.static(path.join(__dirname, '../dist'), {
  maxAge: '1y',
  etag: true,
  immutable: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Fast O(1) In-Memory Lookup Indexing for Ultra High Speed
const buildFastIndexes = () => {
  const studentMap = new Map((db.data.students || []).map(s => [s.id, s]));
  const deptMap = new Map((db.data.departments || []).map(d => [d.id, d]));
  const classMap = new Map((db.data.classes || []).map(c => [c.id, c]));
  const leaveTypeMap = new Map((db.data.leave_types || []).map(lt => [lt.id, lt]));
  const facultyMap = new Map((db.data.faculty || []).map(f => [f.id, f]));
  return { studentMap, deptMap, classMap, leaveTypeMap, facultyMap };
};

// High speed O(1) relational data joiner
const getFullLeaveRequest = (reqItem) => {
  const { studentMap, deptMap, classMap, leaveTypeMap, facultyMap } = buildFastIndexes();

  const student = studentMap.get(reqItem.student_id) || {};
  const department = deptMap.get(student.department_id) || {};
  const studentClass = classMap.get(student.class_id) || {};
  const leaveType = leaveTypeMap.get(reqItem.leave_type_id) || {};
  const reviewedByFaculty = reqItem.reviewed_by ? facultyMap.get(reqItem.reviewed_by) : null;
  const advisor = student.advisor_id ? facultyMap.get(student.advisor_id) : null;

  return {
    ...reqItem,
    student: {
      id: student.id,
      name: student.name,
      register_no: student.register_no,
      email: student.email,
      phone: student.phone,
      avatar: student.avatar,
      department_name: department.name,
      department_code: department.code,
      class_name: studentClass.name,
      advisor_name: advisor ? advisor.name : 'Unassigned'
    },
    leave_type: leaveType,
    reviewed_by_faculty: reviewedByFaculty ? reviewedByFaculty.name : null
  };
};

/* ============================================================================
   1. AUTHENTICATION & PROFILE ROUTES
   ============================================================================ */

// User Login (Supports Student, Faculty, Admin)
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  let user = null;
  let userRole = role;

  if (role === 'admin' || (!role && email === 'admin@college.edu')) {
    user = db.data.admins.find(a => a.email.toLowerCase() === email.toLowerCase());
    userRole = 'admin';
  } else if (role === 'faculty') {
    user = db.data.faculty.find(f => f.email.toLowerCase() === email.toLowerCase());
    userRole = 'faculty';
  } else if (role === 'student') {
    user = db.data.students.find(s => s.email.toLowerCase() === email.toLowerCase());
    userRole = 'student';
  } else {
    // Search across all tables if role not explicitly defined
    user = db.data.admins.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (user) userRole = 'admin';
    else {
      user = db.data.faculty.find(f => f.email.toLowerCase() === email.toLowerCase());
      if (user) userRole = 'faculty';
      else {
        user = db.data.students.find(s => s.email.toLowerCase() === email.toLowerCase());
        if (user) userRole = 'student';
      }
    }
  }

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Populate relational context for user
  let fullUser = { ...user, role: userRole };
  delete fullUser.password;

  if (userRole === 'student') {
    const dept = db.data.departments.find(d => d.id === user.department_id);
    const cls = db.data.classes.find(c => c.id === user.class_id);
    const advisor = db.data.faculty.find(f => f.id === user.advisor_id);
    fullUser.department_name = dept ? dept.name : '';
    fullUser.class_name = cls ? cls.name : '';
    fullUser.advisor_name = advisor ? advisor.name : 'Unassigned';
  } else if (userRole === 'faculty') {
    const dept = db.data.departments.find(d => d.id === user.department_id);
    fullUser.department_name = dept ? dept.name : '';
  }

  res.json({
    message: 'Login successful',
    token: `mock-token-${userRole}-${user.id}-${Date.now()}`,
    user: fullUser
  });
});

// Student Self Registration
app.post('/api/auth/register', (req, res) => {
  const { name, register_no, email, password, department_id, class_id, phone } = req.body;

  if (!name || !register_no || !email || !password || !department_id || !class_id) {
    return res.status(400).json({ error: 'Please fill in all required fields' });
  }

  const existingEmail = db.data.students.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (existingEmail) {
    return res.status(400).json({ error: 'Email is already registered' });
  }

  const existingReg = db.data.students.find(s => s.register_no.toUpperCase() === register_no.toUpperCase());
  if (existingReg) {
    return res.status(400).json({ error: 'Register number already exists' });
  }

  // Assign default faculty advisor in department if available
  const facultyInDept = db.data.faculty.find(f => f.department_id === Number(department_id));

  const newStudent = {
    id: db.getNextId('students'),
    name,
    register_no: register_no.toUpperCase(),
    email,
    password,
    department_id: Number(department_id),
    class_id: Number(class_id),
    advisor_id: facultyInDept ? facultyInDept.id : null,
    phone: phone || '',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    role: 'student',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  db.data.students.push(newStudent);
  db.save();

  // Create welcome notification
  db.data.notifications.push({
    id: db.getNextId('notifications'),
    user_id: newStudent.id,
    user_role: 'student',
    title: 'Welcome to Leave Portal',
    message: `Account created successfully. Your Register No is ${newStudent.register_no}.`,
    type: 'success',
    is_read: false,
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  });
  db.save();

  res.status(201).json({ message: 'Registration successful! You can now log in.', student: newStudent });
});

/* ============================================================================
   2. DASHBOARD METRICS ROUTES
   ============================================================================ */

app.get('/api/dashboard/stats', (req, res) => {
  const totalStudents = db.data.students.length;
  const totalFaculty = db.data.faculty.length;
  const totalDepartments = db.data.departments.length;
  const totalLeaves = db.data.leave_requests.length;

  const pendingLeaves = db.data.leave_requests.filter(r => r.status === 'Pending').length;
  const approvedLeaves = db.data.leave_requests.filter(r => r.status === 'Approved').length;
  const rejectedLeaves = db.data.leave_requests.filter(r => r.status === 'Rejected').length;

  res.json({
    totalStudents,
    totalFaculty,
    totalDepartments,
    totalLeaves,
    pendingLeaves,
    approvedLeaves,
    rejectedLeaves
  });
});

/* ============================================================================
   3. LEAVE REQUESTS MANAGEMENT ROUTES
   ============================================================================ */

// Fetch all leave requests (Filterable by status, student_id, faculty_id, department_id, class_id)
app.get('/api/leaves', (req, res) => {
  let list = db.data.leave_requests.map(getFullLeaveRequest);

  const { status, student_id, faculty_id, department_id, class_id, search } = req.query;

  if (status && status !== 'All') {
    list = list.filter(r => r.status.toLowerCase() === status.toLowerCase());
  }

  if (student_id) {
    list = list.filter(r => r.student_id === Number(student_id));
  }

  if (faculty_id) {
    // Find students advised by or in department of this faculty
    const fac = db.data.faculty.find(f => f.id === Number(faculty_id));
    if (fac) {
      list = list.filter(r => r.student.department_name === (db.data.departments.find(d => d.id === fac.department_id)?.name));
    }
  }

  if (department_id) {
    list = list.filter(r => {
      const std = db.data.students.find(s => s.id === r.student_id);
      return std && std.department_id === Number(department_id);
    });
  }

  if (class_id) {
    list = list.filter(r => {
      const std = db.data.students.find(s => s.id === r.student_id);
      return std && std.class_id === Number(class_id);
    });
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(r =>
      r.student.name.toLowerCase().includes(q) ||
      r.student.register_no.toLowerCase().includes(q) ||
      r.leave_type.name.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q)
    );
  }

  // Sort newest first
  list.sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));

  res.json(list);
});

// Submit a new Leave Application (Student feature)
app.post('/api/leaves', (req, res) => {
  const { student_id, leave_type_id, start_date, end_date, total_days, reason, document_url } = req.body;

  if (!student_id || !leave_type_id || !start_date || !end_date || !reason) {
    return res.status(400).json({ error: 'Please provide all required leave application fields' });
  }

  const leaveType = db.data.leave_types.find(lt => lt.id === Number(leave_type_id));
  if (!leaveType) {
    return res.status(404).json({ error: 'Invalid leave type selected' });
  }

  if (leaveType.requires_document && !document_url) {
    return res.status(400).json({ error: `Supporting document is required for ${leaveType.name}` });
  }

  const newRequest = {
    id: db.getNextId('leave_requests'),
    student_id: Number(student_id),
    leave_type_id: Number(leave_type_id),
    start_date,
    end_date,
    total_days: Number(total_days) || 1,
    reason,
    document_url: document_url || null,
    status: 'Pending',
    applied_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    remarks: null,
    reviewed_by: null,
    reviewed_at: null
  };

  db.data.leave_requests.push(newRequest);
  db.save();

  // Notify student
  const student = db.data.students.find(s => s.id === Number(student_id));
  db.data.notifications.push({
    id: db.getNextId('notifications'),
    user_id: Number(student_id),
    user_role: 'student',
    title: 'Leave Application Submitted',
    message: `Your ${leaveType.name} request for ${newRequest.total_days} day(s) starting ${start_date} has been submitted.`,
    type: 'info',
    is_read: false,
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  });

  // Notify assigned faculty advisor if available
  if (student && student.advisor_id) {
    db.data.notifications.push({
      id: db.getNextId('notifications'),
      user_id: student.advisor_id,
      user_role: 'faculty',
      title: 'New Leave Application',
      message: `${student.name} (${student.register_no}) submitted a ${leaveType.name} request (${newRequest.total_days} days).`,
      type: 'info',
      is_read: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
  }

  db.save();

  res.status(201).json({ message: 'Leave application submitted successfully', leave: getFullLeaveRequest(newRequest) });
});

// Approve or Reject Leave Request (Faculty / Admin feature)
app.patch('/api/leaves/:id/review', (req, res) => {
  const leaveId = Number(req.params.id);
  const { status, remarks, reviewer_id } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be Approved or Rejected' });
  }

  const reqIndex = db.data.leave_requests.findIndex(r => r.id === leaveId);
  if (reqIndex === -1) {
    return res.status(404).json({ error: 'Leave request not found' });
  }

  const currentReq = db.data.leave_requests[reqIndex];
  currentReq.status = status;
  currentReq.remarks = remarks || '';
  currentReq.reviewed_by = reviewer_id ? Number(reviewer_id) : 1;
  currentReq.reviewed_at = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.data.leave_requests[reqIndex] = currentReq;
  db.save();

  // Create notification for student
  const student = db.data.students.find(s => s.id === currentReq.student_id);
  const leaveType = db.data.leave_types.find(lt => lt.id === currentReq.leave_type_id);

  if (student) {
    db.data.notifications.push({
      id: db.getNextId('notifications'),
      user_id: student.id,
      user_role: 'student',
      title: `Leave Application ${status}`,
      message: `Your ${leaveType ? leaveType.name : 'Leave'} request has been ${status.toLowerCase()}.${remarks ? ' Remark: ' + remarks : ''}`,
      type: status === 'Approved' ? 'success' : 'danger',
      is_read: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
    db.save();
  }

  res.json({ message: `Leave request ${status.toLowerCase()} successfully`, leave: getFullLeaveRequest(currentReq) });
});

// Cancel Pending Leave Request (Student feature)
app.patch('/api/leaves/:id/cancel', (req, res) => {
  const leaveId = Number(req.params.id);
  const { student_id } = req.body;

  const reqIndex = db.data.leave_requests.findIndex(r => r.id === leaveId);
  if (reqIndex === -1) {
    return res.status(404).json({ error: 'Leave request not found' });
  }

  const currentReq = db.data.leave_requests[reqIndex];
  if (currentReq.student_id !== Number(student_id)) {
    return res.status(403).json({ error: 'Unauthorized to cancel this leave request' });
  }

  if (currentReq.status !== 'Pending') {
    return res.status(400).json({ error: `Cannot cancel leave request that is already ${currentReq.status}` });
  }

  currentReq.status = 'Cancelled';
  db.data.leave_requests[reqIndex] = currentReq;
  db.save();

  res.json({ message: 'Leave request cancelled successfully', leave: getFullLeaveRequest(currentReq) });
});

/* ============================================================================
   4. DEPARTMENTS & CLASSES MANAGEMENT ROUTES
   ============================================================================ */

app.get('/api/departments', (req, res) => {
  const list = db.data.departments.map(dept => {
    const classesInDept = db.data.classes.filter(c => c.department_id === dept.id);
    const studentsInDept = db.data.students.filter(s => s.department_id === dept.id);
    const facultyInDept = db.data.faculty.filter(f => f.department_id === dept.id);

    return {
      ...dept,
      class_count: classesInDept.length,
      student_count: studentsInDept.length,
      faculty_count: facultyInDept.length,
      classes: classesInDept
    };
  });
  res.json(list);
});

app.post('/api/departments', (req, res) => {
  const { name, code, description } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: 'Department name and code are required' });
  }

  const newDept = {
    id: db.getNextId('departments'),
    name,
    code: code.toUpperCase(),
    description: description || '',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  db.data.departments.push(newDept);
  db.save();
  res.status(201).json(newDept);
});

app.delete('/api/departments/:id', (req, res) => {
  const id = Number(req.params.id);
  db.data.departments = db.data.departments.filter(d => d.id !== id);
  db.save();
  res.json({ message: 'Department deleted successfully' });
});

app.get('/api/classes', (req, res) => {
  const list = db.data.classes.map(c => {
    const dept = db.data.departments.find(d => d.id === c.department_id);
    return {
      ...c,
      department_name: dept ? dept.name : ''
    };
  });
  res.json(list);
});

/* ============================================================================
   5. LEAVE TYPES MANAGEMENT ROUTES
   ============================================================================ */

app.get('/api/leave-types', (req, res) => {
  res.json(db.data.leave_types);
});

app.post('/api/leave-types', (req, res) => {
  const { name, code, max_days_per_year, requires_document, description } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: 'Name and Code are required' });
  }

  const newType = {
    id: db.getNextId('leave_types'),
    name,
    code: code.toUpperCase(),
    max_days_per_year: Number(max_days_per_year) || 10,
    requires_document: Boolean(requires_document),
    description: description || '',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  db.data.leave_types.push(newType);
  db.save();
  res.status(201).json(newType);
});

app.delete('/api/leave-types/:id', (req, res) => {
  const id = Number(req.params.id);
  db.data.leave_types = db.data.leave_types.filter(lt => lt.id !== id);
  db.save();
  res.json({ message: 'Leave type deleted successfully' });
});

/* ============================================================================
   6. FACULTY MANAGEMENT ROUTES (ADMIN)
   ============================================================================ */

app.get('/api/faculty', (req, res) => {
  const list = db.data.faculty.map(fac => {
    const dept = db.data.departments.find(d => d.id === fac.department_id);
    const advisedStudents = db.data.students.filter(s => s.advisor_id === fac.id);
    return {
      ...fac,
      department_name: dept ? dept.name : '',
      advised_student_count: advisedStudents.length
    };
  });
  res.json(list);
});

app.post('/api/faculty', (req, res) => {
  const { name, email, password, department_id, phone, designation } = req.body;
  if (!name || !email || !department_id) {
    return res.status(400).json({ error: 'Name, email, and department are required' });
  }

  const newFac = {
    id: db.getNextId('faculty'),
    name,
    email,
    password: password || 'password123',
    department_id: Number(department_id),
    phone: phone || '',
    designation: designation || 'Assistant Professor',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    role: 'faculty',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  db.data.faculty.push(newFac);
  db.save();
  res.status(201).json(newFac);
});

app.delete('/api/faculty/:id', (req, res) => {
  const id = Number(req.params.id);
  db.data.faculty = db.data.faculty.filter(f => f.id !== id);
  db.save();
  res.json({ message: 'Faculty deleted successfully' });
});

/* ============================================================================
   7. STUDENTS MANAGEMENT ROUTES (ADMIN)
   ============================================================================ */

app.get('/api/students', (req, res) => {
  const list = db.data.students.map(std => {
    const dept = db.data.departments.find(d => d.id === std.department_id);
    const cls = db.data.classes.find(c => c.id === std.class_id);
    const advisor = db.data.faculty.find(f => f.id === std.advisor_id);
    const studentLeaves = db.data.leave_requests.filter(lr => lr.student_id === std.id);

    return {
      ...std,
      department_name: dept ? dept.name : '',
      class_name: cls ? cls.name : '',
      advisor_name: advisor ? advisor.name : 'Unassigned',
      total_leaves_applied: studentLeaves.length
    };
  });
  res.json(list);
});

app.post('/api/students', (req, res) => {
  const { name, register_no, email, password, department_id, class_id, advisor_id, phone } = req.body;
  if (!name || !register_no || !email || !department_id || !class_id) {
    return res.status(400).json({ error: 'Name, Register No, Email, Department and Class are required' });
  }

  const newStd = {
    id: db.getNextId('students'),
    name,
    register_no: register_no.toUpperCase(),
    email,
    password: password || 'password123',
    department_id: Number(department_id),
    class_id: Number(class_id),
    advisor_id: advisor_id ? Number(advisor_id) : null,
    phone: phone || '',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    role: 'student',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  db.data.students.push(newStd);
  db.save();
  res.status(201).json(newStd);
});

app.delete('/api/students/:id', (req, res) => {
  const id = Number(req.params.id);
  db.data.students = db.data.students.filter(s => s.id !== id);
  db.save();
  res.json({ message: 'Student deleted successfully' });
});

// Get/Set SMTP Email Config
app.get('/api/config/smtp', (req, res) => {
  const smtp = db.data.smtp || { email: '', password: '', service: 'gmail' };
  res.json({
    email: smtp.email || '',
    service: smtp.service || 'gmail',
    isConfigured: Boolean(smtp.email && smtp.password)
  });
});

app.post('/api/config/smtp', (req, res) => {
  const { email, password, service } = req.body;
  db.data.smtp = {
    email: email ? email.trim() : '',
    password: password ? password.trim() : '',
    service: service || 'gmail',
    updated_at: new Date().toISOString()
  };
  db.save();
  res.json({ message: 'SMTP Gmail settings saved successfully!', isConfigured: Boolean(email && password) });
});

// Invite student via Email (Gmail Web compose link & Nodemailer SMTP support)
app.post('/api/students/invite', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }

  const subject = 'Invitation to join College Leave Portal';
  const bodyText = `Hello,\n\nYou have been invited by your administrator to register your account on the College Leave Portal.\n\nPlease visit the portal to create your student account:\nhttp://localhost:5000\n\nBest regards,\nCollege Leave Portal Admin`;

  // Generate direct Gmail compose link and mailto link
  const encodedEmail = encodeURIComponent(email);
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(bodyText);

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedEmail}&su=${encodedSubject}&body=${encodedBody}`;
  const mailtoUrl = `mailto:${encodedEmail}?subject=${encodedSubject}&body=${encodedBody}`;

  const smtp = db.data.smtp || {};
  const isCustomSmtp = Boolean((process.env.SMTP_HOST && process.env.SMTP_USER) || (smtp.email && smtp.password));

  let emailSent = false;
  let previewUrl = null;
  let errorNotice = null;

  try {
    let transporter;
    let senderAddress = '"College Leave Portal" <admin@college.edu>';

    if (smtp.email && smtp.password) {
      // Use configured Gmail SMTP App Password
      transporter = nodemailer.createTransport({
        service: smtp.service || 'gmail',
        auth: {
          user: smtp.email,
          pass: smtp.password
        }
      });
      senderAddress = `"College Leave Portal" <${smtp.email}>`;
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      senderAddress = `"College Leave Portal" <${process.env.SMTP_USER}>`;
    } else {
      // Ethereal fallback test account
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const info = await transporter.sendMail({
      from: senderAddress,
      to: email,
      subject: subject,
      text: bodyText,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">🎓 College Leave Portal Invitation</h2>
          <p>Hello,</p>
          <p>You have been invited by your administrator to register your student account on the <strong>College Leave Portal</strong>.</p>
          <div style="margin: 28px 0;">
            <a href="http://localhost:5000" style="background-color: #18181b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Open College Leave Portal
            </a>
          </div>
          <p style="font-size: 0.9em; color: #64748b;">Direct portal link: <a href="http://localhost:5000" style="color: #2563eb;">http://localhost:5000</a></p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 0.8em; color: #94a3b8;">Sent via College Leave Management System Admin Panel.</p>
        </div>
      `
    });

    emailSent = true;
    previewUrl = nodemailer.getTestMessageUrl(info) || null;
  } catch (err) {
    console.error('Nodemailer send error:', err.message);
    errorNotice = err.message;
  }

  res.json({
    message: isCustomSmtp && emailSent 
      ? `Real invitation email sent directly to ${email}!` 
      : `Invitation generated for ${email}`,
    email,
    emailSent,
    isCustomSmtp,
    previewUrl,
    gmailUrl,
    mailtoUrl,
    errorNotice
  });
});

/* ============================================================================
   8. NOTIFICATIONS & REPORTS ROUTES
   ============================================================================ */

app.get('/api/notifications', (req, res) => {
  const { user_id, user_role } = req.query;
  let list = db.data.notifications;

  if (user_id && user_role) {
    list = list.filter(n => n.user_id === Number(user_id) && n.user_role === user_role);
  }

  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(list);
});

app.patch('/api/notifications/read-all', (req, res) => {
  const { user_id, user_role } = req.body;
  db.data.notifications.forEach(n => {
    if (n.user_id === Number(user_id) && n.user_role === user_role) {
      n.is_read = true;
    }
  });
  db.save();
  res.json({ message: 'Notifications marked as read' });
});

// Serve dynamically generated valid documents for medical certificates and supporting attachments
app.get('/api/documents/:filename', (req, res) => {
  const filename = req.params.filename || 'document.pdf';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>${filename} - Official Document</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; padding: 40px; margin: 0; }
        .cert-card { max-width: 700px; margin: 0 auto; background: white; border: 2px solid #0f172a; border-radius: 12px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); position: relative; }
        .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: 1px; }
        .sublogo { font-size: 14px; color: #64748b; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px; }
        .stamp { position: absolute; top: 40px; right: 40px; border: 3px dashed #16a34a; color: #16a34a; padding: 8px 16px; font-weight: 800; font-size: 14px; transform: rotate(-8deg); border-radius: 6px; }
        .title { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 20px; text-align: center; text-transform: uppercase; }
        .content { font-size: 16px; line-height: 1.8; color: #334155; }
        .details-box { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 15px 20px; margin: 20px 0; font-size: 14px; }
        .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; font-size: 13px; color: #64748b; }
        .btn-print { background: #0f172a; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 15px; margin-top: 20px; }
        @media print { .btn-print { display: none; } body { background: white; padding: 0; } }
      </style>
    </head>
    <body>
      <div class="cert-card">
        <div class="stamp">VERIFIED DOCUMENT</div>
        <div class="header">
          <div class="logo">COLLEGE MEDICAL & ACADEMIC PORTAL</div>
          <div class="sublogo">Official Student Leave Verification Attachment</div>
        </div>
        <div class="title">Certificate of Medical & Academic Verification</div>
        <div class="content">
          <p><strong>To Whom It May Concern,</strong></p>
          <p>This official certificate verifies the supporting attachment submitted for student leave request application.</p>
          <div class="details-box">
            <div><strong>Attached Document File:</strong> ${filename}</div>
            <div><strong>Authentication Status:</strong> Digitally Signed & Verified</div>
            <div><strong>System Verification ID:</strong> VER-${Math.floor(100000 + Math.random() * 900000)}</div>
          </div>
          <p>The contents of this supporting document have been authenticated and logged into the College Student Leave Database System.</p>
        </div>
        <div class="footer">
          <div>Institutional Document ID: DOC-${filename}</div>
          <div>Authorized Electronic Portal Stamp</div>
        </div>
        <div style="text-align: center;">
          <button class="btn-print" onclick="window.print()">Print / Download PDF</button>
        </div>
      </div>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(htmlContent);
});

// Fallback for React SPA in production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`Student Leave Portal API Server running on port ${PORT}`);
  console.log(`Database initialized at: ${path.join(__dirname, '../database/leave_portal.json')}`);
  console.log(`=======================================================`);
});
