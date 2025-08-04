import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testVaccineCreate() {
  try {
    console.log('Testing Vaccine creation with diseaseName...');
    
    // Test data
    const testVaccine = {
      name: 'Test Vaccine COVID-19',
      diseaseName: 'COVID-19',
      requirement: 'REQUIRED',
      manufacturer: 'Pfizer-BioNTech',
      origin: 'Đức/Mỹ',
      description: 'Vaccine phòng COVID-19',
      sideEffects: 'Đau tại chỗ tiêm, sốt nhẹ',
      contraindications: 'Dị ứng với thành phần vaccine',
      minAge: 12,
      maxAge: 65,
      maxDoseCount: 2,
      doseSchedules: [
        {
          doseOrder: 1,
          minInterval: 0,
          recommendedInterval: 0,
          description: 'Mũi đầu tiên'
        },
        {
          doseOrder: 2,
          minInterval: 21,
          recommendedInterval: 28,
          description: 'Mũi thứ hai'
        }
      ]
    };

    // Create vaccine
    const vaccine = await prisma.vaccine.create({
      data: testVaccine
    });

    console.log('✅ Vaccine created successfully:', vaccine);

    // Clean up - delete test vaccine
    await prisma.vaccine.delete({
      where: { id: vaccine.id }
    });

    console.log('✅ Test completed successfully - test vaccine deleted');
    
  } catch (error) {
    console.error('❌ Error testing vaccine creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVaccineCreate();
