import express from 'express';
import { getHealthProfile, upsertHealthProfile, deleteHealthProfile } from '../controllers/parentController.js';
import { authenticateToken, verifyRole } from '../middleware/authenticateToken.js';

const router = express.Router();

// Health Profile routes
router.get('/health-profile/:studentId', authenticateToken, verifyRole(['PARENT']), getHealthProfile);
router.put('/health-profile/:studentId', authenticateToken, verifyRole(['PARENT']), upsertHealthProfile);
router.delete('/health-profile/:studentId', authenticateToken, verifyRole(['PARENT']), deleteHealthProfile);

export default router; 