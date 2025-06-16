const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/auth');

// Parent routes
router.post('/submit', protect, authorize('parent'), medicineController.submitMedicine);
router.get('/student/:studentId', protect, authorize('parent'), medicineController.getStudentMedicines);

// School nurse routes
router.get('/pending', protect, authorize('nurse'), medicineController.getPendingMedicines);
router.post('/:id/administer', protect, authorize('nurse'), medicineController.administerMedicine);
router.post('/:id/reject', protect, authorize('nurse'), medicineController.rejectMedicine);

// Admin routes
router.get('/statistics', protect, authorize('admin'), medicineController.getMedicineStatistics);

module.exports = router; 