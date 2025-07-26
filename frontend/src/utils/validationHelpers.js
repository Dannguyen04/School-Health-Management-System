// Helper functions for enhanced validation

// Emoji detection regex
export const containsEmoji = (str) => {
    const emojiRegex =
        /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu;
    return emojiRegex.test(str);
};

// Phone number validation with emoji check
export const validatePhoneNumber = (phone) => {
    if (!phone) return false;

    // Check for emoji
    if (containsEmoji(phone)) {
        return {
            isValid: false,
            message: "Số điện thoại không được chứa emoji",
        };
    }

    // Check for letters
    if (/[a-zA-Z]/.test(phone)) {
        return {
            isValid: false,
            message: "Số điện thoại không được chứa chữ cái",
        };
    }

    // Check format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
        return {
            isValid: false,
            message: "Số điện thoại phải có 10-11 chữ số",
        };
    }

    return { isValid: true };
};

// Email validation with emoji check
export const validateEmail = (email) => {
    if (!email) return false;

    // Check for emoji
    if (containsEmoji(email)) {
        return { isValid: false, message: "Email không được chứa emoji" };
    }

    // Standard email regex
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, message: "Email không hợp lệ" };
    }

    return { isValid: true };
};

// Full name validation with emoji check
export const validateFullName = (name) => {
    if (!name) return false;

    // Check for emoji
    if (containsEmoji(name)) {
        return { isValid: false, message: "Họ tên không được chứa emoji" };
    }

    // Check minimum length
    if (name.trim().length < 2) {
        return { isValid: false, message: "Họ tên phải có ít nhất 2 ký tự" };
    }

    // Check for numbers
    if (/[0-9]/.test(name)) {
        return { isValid: false, message: "Họ tên không được chứa số" };
    }

    return { isValid: true };
};

// Medicine name validation
export const validateMedicineName = (name) => {
    if (!name) return false;

    // Check for emoji
    if (containsEmoji(name)) {
        return { isValid: false, message: "Tên thuốc không được chứa emoji" };
    }

    // Check minimum length
    if (name.trim().length < 3) {
        return { isValid: false, message: "Tên thuốc phải có ít nhất 3 ký tự" };
    }

    return { isValid: true };
};

// Vision validation with comprehensive checks
export const validateVision = (vision) => {
    if (!vision) return false;

    // Check for emoji
    if (containsEmoji(vision)) {
        return { isValid: false, message: "Thị lực không được chứa emoji" };
    }

    // Check if it's a number and if it's negative
    const numericValue = parseFloat(vision);
    if (!isNaN(numericValue)) {
        if (numericValue < 0) {
            return { isValid: false, message: "Thị lực không được là số âm" };
        }
        // Allow reasonable vision range
        if (numericValue > 20) {
            return { isValid: false, message: "Giá trị thị lực quá cao" };
        }
    }

    // Check for invalid letters (allow some vision formats like "10/10", "6/6")
    if (/^[a-zA-Z]+$/.test(vision)) {
        return {
            isValid: false,
            message: "Thị lực không được chỉ chứa chữ cái",
        };
    }

    return { isValid: true };
};

// Hearing validation with comprehensive checks
export const validateHearing = (hearing) => {
    if (!hearing) return false;

    // Check for emoji
    if (containsEmoji(hearing)) {
        return { isValid: false, message: "Thính lực không được chứa emoji" };
    }

    // Check if it's a number and if it's negative
    const numericValue = parseFloat(hearing);
    if (!isNaN(numericValue)) {
        if (numericValue < 0) {
            return { isValid: false, message: "Thính lực không được là số âm" };
        }
    }

    // Check for invalid letters only (allow descriptive text like "Bình thường")
    if (/^[0-9]+$/.test(hearing)) {
        // If it's purely numeric, check range
        if (numericValue > 100) {
            return { isValid: false, message: "Giá trị thính lực quá cao" };
        }
    }

    return { isValid: true };
};

// Weight validation with comprehensive checks
export const validateWeight = (weight) => {
    if (weight === null || weight === undefined) return false;

    const numericValue = parseFloat(weight);

    if (isNaN(numericValue)) {
        return { isValid: false, message: "Cân nặng phải là số" };
    }

    if (numericValue < 0) {
        return { isValid: false, message: "Cân nặng không được là số âm" };
    }

    if (numericValue > 300) {
        return { isValid: false, message: "Cân nặng quá cao (tối đa 300kg)" };
    }

    if (numericValue < 1) {
        return { isValid: false, message: "Cân nặng quá thấp (tối thiểu 1kg)" };
    }

    return { isValid: true };
};

// Height validation with comprehensive checks
export const validateHeight = (height) => {
    if (height === null || height === undefined) return false;

    const numericValue = parseFloat(height);

    if (isNaN(numericValue)) {
        return { isValid: false, message: "Chiều cao phải là số" };
    }

    if (numericValue < 0) {
        return { isValid: false, message: "Chiều cao không được là số âm" };
    }

    if (numericValue > 300) {
        return { isValid: false, message: "Chiều cao quá cao (tối đa 300cm)" };
    }

    if (numericValue < 30) {
        return {
            isValid: false,
            message: "Chiều cao quá thấp (tối thiểu 30cm)",
        };
    }

    return { isValid: true };
};

// URL validation
export const validateAvatarURL = (url) => {
    if (!url) return { isValid: true }; // Optional field

    try {
        new URL(url);
        return { isValid: true };
    } catch {
        return { isValid: false, message: "URL không hợp lệ" };
    }
};
