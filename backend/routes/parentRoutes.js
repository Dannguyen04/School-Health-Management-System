import express from 'express';
import { getMyChildren, getHealthProfile, upsertHealthProfile, deleteHealthProfile, requestMedication, getStudentMedicines } from '../controllers/parentController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

const router = express.Router();

// Route to get all children of a parent
router.get('/my-children', authenticateToken, getMyChildren);

// Routes for health profiles
router.get('/health-profile/:studentId', authenticateToken, getHealthProfile);
router.post('/health-profile/:studentId', authenticateToken, upsertHealthProfile);
router.put('/health-profile/:studentId', authenticateToken, upsertHealthProfile);
router.delete('/health-profile/:studentId', authenticateToken, deleteHealthProfile);

// Route for medication requests
router.post('/request-medication/:studentId', authenticateToken, requestMedication);

// Route to get student medicines
router.get('/students/:studentId/medicines', authenticateToken, getStudentMedicines);

export default router;
