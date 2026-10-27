const User = require('../models/User');
const Department = require('../models/Department');
const Subject = require('../models/Subject');
const Syllabus = require('../models/Syllabus');
const SyllabusUnit = require('../models/SyllabusUnit');
const Material = require('../models/Material');
const ModelPaper = require('../models/ModelPaper');
const QuizAttempt = require('../models/QuizAttempt');
const ActivityLog = require('../models/ActivityLog');


exports.getAdminDashboard = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const totalFaculty = await User.countDocuments({ role: 'FACULTY' });
    const totalHODs = await User.countDocuments({ role: 'HOD' });
    const totalDepartments = await Department.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const totalSyllabus = await Syllabus.countDocuments();
    const totalMaterials = await Material.countDocuments();
    const totalModelPapers = await ModelPaper.countDocuments();

    // Chart Data
    const depts = await Department.find();
    
    // Aggregation for students by department
    const studentsByDept = await Promise.all(depts.map(async (dep) => {
      const count = await User.countDocuments({ role: 'STUDENT', department: dep._id });
      return { name: dep.code || dep.name, students: count };
    }));

    // Aggregation for faculty by department
    const facultyByDept = await Promise.all(depts.map(async (dep) => {
      const count = await User.countDocuments({ role: 'FACULTY', department: dep._id });
      return { name: dep.code || dep.name, value: count };
    }));

    // Recent Activities
    const recentActivities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name role');

    res.json({
      success: true,
      data: {
        totalStudents,
        totalFaculty,
        totalHODs,
        totalDepartments,
        totalSubjects,
        totalSyllabus,
        totalMaterials,
        totalModelPapers,
        studentsByDept,
        facultyByDept,
        recentActivities
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHodDashboard = async (req, res) => {
  try {
    let deptId = req.user.department; // This is now an ObjectId

    // If for some reason we need the department doc (e.g. to get its name for display)
    const deptDoc = await Department.findById(deptId);
    const departmentName = deptDoc ? deptDoc.name : String(deptId);

    const facultyCount = await User.countDocuments({ role: 'FACULTY', department: req.user.department });
    const studentCount = await User.countDocuments({ role: 'STUDENT', department: req.user.department });
    const subjectCount = await Subject.countDocuments({ department: deptId });
    const syllabusCount = await Syllabus.countDocuments({ department: deptId });
    const materialCount = await Material.countDocuments({ department: deptId });
    const modelPaperCount = await ModelPaper.countDocuments({ department: deptId });

    // Calculate real syllabus units completion for HOD's department
    const deptSubjects = await Subject.find({ department: deptId }).select('_id');
    const deptSubjectIds = deptSubjects.map(s => s._id);
    const totalUnits = await SyllabusUnit.countDocuments({ subject: { $in: deptSubjectIds } });
    const completedUnits = await SyllabusUnit.countDocuments({ subject: { $in: deptSubjectIds }, status: 'Completed' });
    const completionPercentage = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

    // Recent Activities
    const recentActivities = await ActivityLog.find({ department: deptId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name role');

    res.json({
      success: true,
      data: {
        department: departmentName,
        facultyCount,
        studentCount,
        subjectCount,
        syllabusCount,
        materialCount,
        modelPaperCount,
        totalUnits,
        completedUnits,
        completionPercentage,
        recentActivities
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFacultyDashboard = async (req, res) => {
  try {
    const isHodOrAdmin = req.user.role === 'HOD' || req.user.role === 'ADMIN';
    const subjectFilter = isHodOrAdmin && req.user.department 
      ? { $or: [{ faculty: req.user._id }, { department: req.user.department }] }
      : { faculty: req.user._id };
    
    const mySubjectsCount = await Subject.countDocuments(subjectFilter);
    const materialsCount = await Material.countDocuments(
      isHodOrAdmin && req.user.department 
        ? { $or: [{ uploadedBy: req.user._id }, { department: req.user.department }] }
        : { uploadedBy: req.user._id }
    );
    const modelPapersCount = await ModelPaper.countDocuments(
      isHodOrAdmin && req.user.department 
        ? { $or: [{ uploadedBy: req.user._id }, { department: req.user.department }] }
        : { uploadedBy: req.user._id }
    );
    const completedUnitsCount = await SyllabusUnit.countDocuments(
      isHodOrAdmin && req.user.department
        ? { department: req.user.department, status: 'Completed' }
        : { createdBy: req.user._id, status: 'Completed' }
    );
    const pendingUnitsCount = await SyllabusUnit.countDocuments(
      isHodOrAdmin && req.user.department
        ? { department: req.user.department, status: 'Pending' }
        : { createdBy: req.user._id, status: 'Pending' }
    );

    // Recent Activities
    const deptId = req.user.department;
    const activityFilter = deptId ? { department: deptId } : {};
    const recentActivities = await ActivityLog.find(activityFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name role');

    res.json({
      success: true,
      data: {
        mySubjectsCount,
        materialsCount,
        modelPapersCount,
        completedUnitsCount,
        pendingUnitsCount,
        recentActivities
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentDashboard = async (req, res) => {
  try {
    // Determine relevant content by department/semester
    let deptId = req.user.department; // ObjectId

    const subjectsCount = await Subject.countDocuments({ department: deptId, semester: req.user.semester });
    const materialsCount = await Material.countDocuments({ department: deptId, semester: req.user.semester });
    const quizAttemptsCount = await QuizAttempt.countDocuments({ student: req.user._id });

    // Recent Activities
    const recentActivities = await ActivityLog.find({ department: deptId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name role');

    res.json({
      success: true,
      data: {
        subjectsCount,
        materialsCount,
        quizAttemptsCount,
        recentActivities
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
