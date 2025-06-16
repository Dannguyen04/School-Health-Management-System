const Medicine = require('../models/Medicine');
const Student = require('../models/Student');
const User = require('../models/User');
const { Op } = require('sequelize');

// Submit new medicine
exports.submitMedicine = async (req, res) => {
  try {
    const {
      studentId,
      medicineName,
      dosage,
      frequency,
      startDate,
      endDate,
      administrationTimes,
      specialInstructions,
      allergies,
    } = req.body;

    const medicine = await Medicine.create({
      studentId,
      medicineName,
      dosage,
      frequency,
      startDate,
      endDate,
      administrationTimes,
      specialInstructions,
      allergies,
    });

    res.status(201).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all medicines for a student
exports.getStudentMedicines = async (req, res) => {
  try {
    const { studentId } = req.params;
    const medicines = await Medicine.findAll({
      where: { studentId },
      include: [
        {
          model: User,
          as: 'administeredByUser',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: medicines,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all pending medicines for school nurse
exports.getPendingMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: Student,
          attributes: ['id', 'name', 'class'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: medicines,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Administer medicine
exports.administerMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { administeredBy, administrationNotes } = req.body;

    const medicine = await Medicine.findByPk(id);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        error: 'Medicine not found',
      });
    }

    if (medicine.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Medicine is not in pending status',
      });
    }

    await medicine.update({
      status: 'completed',
      administeredBy,
      administrationNotes,
    });

    res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Reject medicine
exports.rejectMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const medicine = await Medicine.findByPk(id);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        error: 'Medicine not found',
      });
    }

    if (medicine.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Medicine is not in pending status',
      });
    }

    await medicine.update({
      status: 'rejected',
      administrationNotes: rejectionReason,
    });

    res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get medicine statistics
exports.getMedicineStatistics = async (req, res) => {
  try {
    const totalMedicines = await Medicine.count();
    const pendingMedicines = await Medicine.count({ where: { status: 'pending' } });
    const completedMedicines = await Medicine.count({ where: { status: 'completed' } });
    const rejectedMedicines = await Medicine.count({ where: { status: 'rejected' } });

    const todayMedicines = await Medicine.count({
      where: {
        createdAt: {
          [Op.gte]: new Date().setHours(0, 0, 0, 0),
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalMedicines,
        pending: pendingMedicines,
        completed: completedMedicines,
        rejected: rejectedMedicines,
        today: todayMedicines,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}; 