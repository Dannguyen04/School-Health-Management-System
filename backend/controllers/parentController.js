import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getHealthProfile = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Check if user has parent profile
        if (!req.user.parentProfile) {
            return res.status(403).json({ 
                success: false, 
                error: 'You must be a parent to access this resource' 
            });
        }

        const parentId = req.user.parentProfile.id;

        // Find student through parent-student relationship
        const studentParent = await prisma.studentParent.findFirst({
            where: {
                parentId: parentId,
                studentId: studentId
            },
            include: {
                student: {
                    include: {
                        healthProfile: true,
                        user: {
                            select: {
                                fullName: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        if (!studentParent) {
            return res.status(404).json({ 
                success: false, 
                error: 'Health profile not found or you are not authorized to view it' 
            });
        }

        if (!studentParent.student.healthProfile) {
            return res.status(404).json({ 
                success: false, 
                error: 'Health profile not found' 
            });
        }

        res.json({
            success: true,
            data: {
                healthProfile: studentParent.student.healthProfile,
                student: {
                    id: studentParent.student.id,
                    fullName: studentParent.student.user.fullName,
                    email: studentParent.student.user.email
                }
            }
        });
    } catch (error) {
        console.error('Error fetching health profile:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
};

export const upsertHealthProfile = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Check if user has parent profile
        if (!req.user.parentProfile) {
            return res.status(403).json({ 
                success: false, 
                error: 'You must be a parent to access this resource' 
            });
        }

        const parentId = req.user.parentProfile.id;
        const {
            allergies,
            chronicDiseases,
            medications,
            treatmentHistory,
            vision,
            hearing,
            height,
            weight,
            notes
        } = req.body;

        const studentParent = await prisma.studentParent.findFirst({
            where: {
                parentId: parentId,
                studentId: studentId
            },
            include: {
                student: true
            }
        });

        if (!studentParent) {
            return res.status(403).json({ 
                success: false, 
                error: 'You are not authorized to update this health profile' 
            });
        }

        const healthProfile = await prisma.healthProfile.upsert({
            where: { 
                studentId: studentId 
            },
            update: {
                allergies,
                chronicDiseases,
                medications,
                treatmentHistory,
                vision,
                hearing,
                height,
                weight,
                notes
            },
            create: {
                studentId: studentId,
                allergies,
                chronicDiseases,
                medications,
                treatmentHistory,
                vision,
                hearing,
                height,
                weight,
                notes
            }
        });

        res.json({
            success: true,
            data: healthProfile,
            message: 'Health profile updated successfully'
        });
    } catch (error) {
        console.error('Error upserting health profile:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
};

export const deleteHealthProfile = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Check if user has parent profile
        if (!req.user.parentProfile) {
            return res.status(403).json({ 
                success: false, 
                error: 'You must be a parent to access this resource' 
            });
        }

        const parentId = req.user.parentProfile.id;

        const studentParent = await prisma.studentParent.findFirst({
            where: {
                parentId: parentId,
                studentId: studentId
            },
            include: {
                student: true
            }
        });

        if (!studentParent) {
            return res.status(403).json({ 
                success: false, 
                error: 'You are not authorized to delete this health profile' 
            });
        }

        await prisma.healthProfile.delete({
            where: { 
                studentId: studentId 
            }
        });

        res.json({ 
            success: true,
            message: 'Health profile deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting health profile:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
}; 