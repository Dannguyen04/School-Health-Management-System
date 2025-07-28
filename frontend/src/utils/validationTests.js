// Test suite for enhanced validation schemas
// Run this file to verify all test cases mentioned by the user

import {
    validateVision,
    validateHearing,
    validateWeight,
    validateHeight,
    validateMedicineName,
    validateFullName,
    validatePhoneNumber,
    validateEmail,
    validateAvatarURL,
} from "../utils/validationHelpers";

// Test results storage
const testResults = [];

// Helper function to run test
const runTest = (testName, validationFunction, testValue, expectedToPass) => {
    try {
        const result = validationFunction(testValue);
        const passed = result.isValid === expectedToPass;

        testResults.push({
            testName,
            testValue,
            expectedToPass,
            actualResult: result.isValid,
            message: result.message || "Valid",
            status: passed ? "✅ PASS" : "❌ FAIL",
        });

        console.log(
            `${passed ? "✅" : "❌"} ${testName}: ${testValue} -> ${
                result.message || "Valid"
            }`
        );
    } catch (error) {
        testResults.push({
            testName,
            testValue,
            expectedToPass,
            actualResult: false,
            message: error.message,
            status: "❌ ERROR",
        });
        console.log(`❌ ${testName}: ${testValue} -> ERROR: ${error.message}`);
    }
};

console.log("🧪 Running Enhanced Validation Test Suite\n");

// VISION TESTS
console.log("👁️ Vision Validation Tests:");
runTest("Vision: Negative value", validateVision, "-1.5", false);
runTest("Vision: Letters only", validateVision, "abc", false);
runTest("Vision: Emoji", validateVision, "👀😊", false);
runTest("Vision: Valid format", validateVision, "10/10", true);
runTest("Vision: Valid decimal", validateVision, "1.5", true);
runTest("Vision: Excessively high", validateVision, "25", false);

// HEARING TESTS
console.log("\n👂 Hearing Validation Tests:");
runTest("Hearing: Negative number", validateHearing, "-10", false);
runTest("Hearing: Letters only", validateHearing, "xyz", true); // Allow descriptive text
runTest("Hearing: Emoji", validateHearing, "👂🎵", false);
runTest("Hearing: Valid text", validateHearing, "Bình thường", true);
runTest("Hearing: Valid number", validateHearing, "85", true);
runTest("Hearing: Excessively high", validateHearing, "150", false);

// WEIGHT TESTS
console.log("\n⚖️ Weight Validation Tests:");
runTest("Weight: Excessively high value", validateWeight, 400, false);
runTest("Weight: Valid weight", validateWeight, 65.5, true);
runTest("Weight: Negative weight", validateWeight, -5, false);
runTest("Weight: Zero weight", validateWeight, 0, false);

// HEIGHT TESTS
console.log("\n📏 Height Validation Tests:");
runTest("Height: Negative height", validateHeight, -150, false);
runTest("Height: Valid height", validateHeight, 165, true);
runTest("Height: Excessively high", validateHeight, 350, false);
runTest("Height: Too low", validateHeight, 10, false);

// MEDICINE NAME TESTS
console.log("\n💊 Medicine Name Validation Tests:");
runTest(
    "Medicine: Emoji in name",
    validateMedicineName,
    "Paracetamol😊",
    false
);
runTest(
    "Medicine: Valid name",
    validateMedicineName,
    "Paracetamol 500mg",
    true
);
runTest("Medicine: Too short", validateMedicineName, "Ab", false);
runTest("Medicine: Emoji only", validateMedicineName, "😊💊", false);

// FULL NAME TESTS
console.log("\n👤 Full Name Validation Tests:");
runTest("Name: Emoji in full name", validateFullName, "Nguyễn Văn A😊", false);
runTest("Name: Valid name", validateFullName, "Nguyễn Văn An", true);
runTest("Name: Too short", validateFullName, "A", false);
runTest("Name: Numbers in name", validateFullName, "Nguyễn123", false);

// PHONE NUMBER TESTS
console.log("\n📱 Phone Number Validation Tests:");
runTest("Phone: Letters in phone", validatePhoneNumber, "0123abc456", false);
runTest("Phone: Emoji in phone", validatePhoneNumber, "0123😊456", false);
runTest("Phone: Valid phone", validatePhoneNumber, "0123456789", true);
runTest("Phone: Too short", validatePhoneNumber, "123456", false);
runTest("Phone: Too long", validatePhoneNumber, "012345678901", false);

// EMAIL TESTS
console.log("\n📧 Email Validation Tests:");
runTest("Email: Emoji in email", validateEmail, "test😊@example.com", false);
runTest("Email: Valid email", validateEmail, "test@example.com", true);
runTest("Email: Invalid format", validateEmail, "invalid-email", false);
runTest("Email: Missing @", validateEmail, "testexample.com", false);

// URL TESTS
console.log("\n🌐 Avatar URL Validation Tests:");
runTest(
    "URL: Valid URL",
    validateAvatarURL,
    "https://example.com/avatar.jpg",
    true
);
runTest("URL: Invalid URL", validateAvatarURL, "not-a-url", false);
runTest("URL: Empty (optional)", validateAvatarURL, "", true);
runTest(
    "URL: HTTP URL",
    validateAvatarURL,
    "http://example.com/image.png",
    true
);

// SUMMARY
console.log("\n📊 Test Summary:");
const totalTests = testResults.length;
const passedTests = testResults.filter((t) => t.status === "✅ PASS").length;
const failedTests = testResults.filter((t) => t.status === "❌ FAIL").length;
const errorTests = testResults.filter((t) => t.status === "❌ ERROR").length;

console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${failedTests} ❌`);
console.log(`Errors: ${errorTests} ⚠️`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

// Export results for external use
export const validationTestResults = testResults;
export default testResults;
