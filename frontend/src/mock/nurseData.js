// Mock data for Nurse Dashboard and other features
export const dashboardStats = {
  totalStudents: 1200,
  vaccinatedStudents: 850,
  healthCheckups: 450,
  lowStockItems: 5,
  todayAppointments: 12,
  pendingMedications: 8,
};

export const medicalInventory = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    quantity: 500,
    unit: "tablets",
    minStock: 100,
    expiryDate: "2024-12-31",
    category: "Pain Relief",
  },
  {
    id: 2,
    name: "Bandages",
    quantity: 200,
    unit: "pieces",
    minStock: 50,
    expiryDate: "2025-06-30",
    category: "First Aid",
  },
  {
    id: 3,
    name: "Antiseptic Solution",
    quantity: 15,
    unit: "bottles",
    minStock: 20,
    expiryDate: "2024-09-30",
    category: "First Aid",
  },
];

export const campaigns = [
  {
    id: 1,
    title: "Annual Health Checkup 2024",
    type: "health_checkup",
    startDate: "2024-03-15",
    endDate: "2024-03-20",
    status: "upcoming",
    targetClasses: ["Grade 1", "Grade 2", "Grade 3"],
    description: "Annual health checkup for primary school students",
  },
  {
    id: 2,
    title: "Flu Vaccination Drive",
    type: "vaccination",
    startDate: "2024-02-01",
    endDate: "2024-02-15",
    status: "completed",
    targetClasses: ["All Grades"],
    description: "Annual flu vaccination for all students",
  },
];

export const studentTreatments = [
  {
    id: 1,
    studentId: "ST001",
    studentName: "John Doe",
    grade: "Grade 5",
    medication: "Paracetamol 500mg",
    dosage: "1 tablet",
    frequency: "3 times daily",
    startDate: "2024-02-20",
    endDate: "2024-02-25",
    status: "active",
    lastGiven: "2024-02-21 08:30",
  },
  {
    id: 2,
    studentId: "ST002",
    studentName: "Jane Smith",
    grade: "Grade 4",
    medication: "Amoxicillin 250mg",
    dosage: "1 capsule",
    frequency: "2 times daily",
    startDate: "2024-02-19",
    endDate: "2024-02-24",
    status: "active",
    lastGiven: "2024-02-21 09:15",
  },
];

export const vaccinations = [
  {
    id: 1,
    studentId: "ST001",
    studentName: "John Doe",
    grade: "Grade 5",
    vaccineName: "Flu Shot",
    date: "2024-02-15",
    batchNumber: "FLU2024-001",
    status: "completed",
    notes: "No adverse reactions",
  },
  {
    id: 2,
    studentId: "ST002",
    studentName: "Jane Smith",
    grade: "Grade 4",
    vaccineName: "MMR",
    date: "2024-02-10",
    batchNumber: "MMR2024-002",
    status: "completed",
    notes: "Scheduled for booster in 1 month",
  },
];

export const healthCheckups = [
  {
    id: 1,
    studentId: "ST001",
    studentName: "John Doe",
    grade: "Grade 5",
    date: "2024-02-20",
    height: 150,
    weight: 45,
    bmi: 20,
    vision: "20/20",
    bloodPressure: "120/80",
    notes: "Healthy",
  },
  {
    id: 2,
    studentId: "ST002",
    studentName: "Jane Smith",
    grade: "Grade 4",
    date: "2024-02-20",
    height: 145,
    weight: 42,
    bmi: 19.5,
    vision: "20/25",
    bloodPressure: "118/75",
    notes: "Slight myopia detected",
  },
];

export const confirmedMedicines = [
  {
    id: 1,
    studentId: "ST001",
    studentName: "John Doe",
    grade: "Grade 5",
    medicineName: "Ritalin 10mg",
    dosage: "1 tablet",
    frequency: "2 times daily",
    startDate: "2024-02-01",
    endDate: "2024-06-30",
    prescribedBy: "Dr. Smith",
    status: "active",
    lastConfirmed: "2024-02-21",
  },
  {
    id: 2,
    studentId: "ST002",
    studentName: "Jane Smith",
    grade: "Grade 4",
    medicineName: "Ventolin Inhaler",
    dosage: "2 puffs",
    frequency: "As needed",
    startDate: "2024-01-15",
    endDate: "2024-12-31",
    prescribedBy: "Dr. Johnson",
    status: "active",
    lastConfirmed: "2024-02-21",
  },
];

export const reports = {
  monthlyStats: {
    vaccinations: 120,
    healthCheckups: 85,
    medications: 45,
    incidents: 3,
  },
  classStats: [
    {
      grade: "Grade 1",
      totalStudents: 150,
      vaccinated: 145,
      healthCheckups: 150,
      medications: 10,
    },
    {
      grade: "Grade 2",
      totalStudents: 155,
      vaccinated: 150,
      healthCheckups: 155,
      medications: 8,
    },
  ],
};
