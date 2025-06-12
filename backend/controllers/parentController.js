const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getHealthProfile = async (req, res) => {
    try {
        const { studentId } = req.params;
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
            return res.status(404).json({ message: 'Health profile not found or you are not authorized to view it' });
        }

        if (!studentParent.student.healthProfile) {
            return res.status(404).json({ message: 'Health profile not found' });
        }

        res.json(studentParent.student.healthProfile);
    } catch (error) {
        console.error('Error fetching health profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const upsertHealthProfile = async (req, res) => {
    try {
        const { studentId } = req.params;
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
            return res.status(403).json({ message: 'You are not authorized to update this health profile' });
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

        res.json(healthProfile);
    } catch (error) {
        console.error('Error upserting health profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteHealthProfile = async (req, res) => {
    try {
        const { studentId } = req.params;
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
            return res.status(403).json({ message: 'You are not authorized to delete this health profile' });
        }

        await prisma.healthProfile.delete({
            where: { 
                studentId: studentId 
            }
        });

        res.json({ message: 'Health profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting health profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getHealthProfile,
    upsertHealthProfile,
    deleteHealthProfile
}; 