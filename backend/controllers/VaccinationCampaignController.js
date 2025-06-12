const prisma = require("../prisma");

exports.createCampaign = async (req, res) => {
    try {
        const {
            name,
            description,
            vaccineName,
            targetGrades,
            scheduledDate,
            deadline,
        } = req.body;
        const userId = req.user.id;

        //check role manager
        const user = await prisma.users.findUnique({ where: { id: userId } });
        if (!user || user.role !== "MANAGER") {
            return res.status(403).json({ message: "You are not Manager" });
        }

        const campaign = await prisma.vaccinationCampaign.create({
            data: {
                name,
                description,
                vaccineName,
                targetGrades,
                scheduledDate: new Date(scheduledDate),
                deadline: new Date(deadline),
                createdBy: { connect: { id: userId } },
            },
        });

        res.status(201).json(campaign);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fail to create" });
    }
};
