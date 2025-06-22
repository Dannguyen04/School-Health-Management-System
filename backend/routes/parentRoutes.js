import express from 'express';
import { getHealthProfile, upsertHealthProfile, deleteHealthProfile, getChildren } from '../controllers/parentController.js';
import { authenticateToken, verifyRole } from '../middleware/authenticateToken.js';

const router = express.Router();

// Get list of children for parent
router.get('/children', authenticateToken, verifyRole(['PARENT']), getChildren);

// Health Profile routes
router.get('/health-profile/:studentId', authenticateToken, verifyRole(['PARENT']), getHealthProfile);
router.post('/health-profile/:studentId', authenticateToken, verifyRole(['PARENT']), upsertHealthProfile);
router.delete('/health-profile/:studentId', authenticateToken, verifyRole(['PARENT']), deleteHealthProfile);

export default router;
