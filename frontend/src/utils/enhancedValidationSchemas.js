import * as Yup from "yup";
import {
    validatePhoneNumber,
    validateEmail,
    validateFullName,
    validateMedicineName,
    validateVision,
    validateHearing,
    validateWeight,
    validateHeight,
    validateAvatarURL,
} from "../utils/validationHelpers";

// Enhanced validation schemas addressing all test cases

// User Management Schema
export const enhancedUserValidationSchema = Yup.object().shape({
    name: Yup.string()
        .required("Vui lòng nhập tên")
        .test("no-emoji", "Họ tên không được chứa emoji", (value) => {
            if (!value) return true;
            const result = validateFullName(value);
            return result.isValid;
        })
        .min(2, "Tên phải có ít nhất 2 ký tự")
        .max(50, "Tên không được quá 50 ký tự"),

    email: Yup.string()
        .required("Vui lòng nhập email")
        .test("email-validation", "Email không hợp lệ", (value) => {
            if (!value) return true;
            const result = validateEmail(value);
            return result.isValid;
        }),

    phone: Yup.string()
        .required("Vui lòng nhập số điện thoại")
        .test("phone-validation", "Số điện thoại không hợp lệ", (value) => {
            if (!value) return true;
            const result = validatePhoneNumber(value);
            return result.isValid;
        }),

    avatarUrl: Yup.string().test(
        "url-validation",
        "URL không hợp lệ",
        (value) => {
            if (!value) return true;
            const result = validateAvatarURL(value);
            return result.isValid;
        }
    ),

    password: Yup.string().when("$isEditing", {
        is: false,
        then: (schema) =>
            schema
                .required("Vui lòng nhập mật khẩu")
                .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
        otherwise: (schema) => schema.optional(),
    }),

    role: Yup.string()
        .required("Vui lòng chọn vai trò")
        .oneOf(["ADMIN", "MANAGER", "NURSE", "PARENT"], "Vai trò không hợp lệ"),
});

// Enhanced Health Profile Schema
export const enhancedHealthProfileSchema = Yup.object().shape({
    hasAllergy: Yup.boolean(),
    allergies: Yup.array().when("hasAllergy", {
        is: true,
        then: (schema) =>
            schema.min(1, "Vui lòng thêm ít nhất 1 dị ứng").of(
                Yup.object().shape({
                    type: Yup.string().required("Chọn loại dị ứng"),
                    name: Yup.string().required("Nhập tên dị ứng"),
                    level: Yup.string().required("Chọn mức độ"),
                    symptoms: Yup.string().required("Nhập triệu chứng"),
                })
            ),
        otherwise: (schema) => schema,
    }),

    hasDisease: Yup.boolean(),
    chronicDiseases: Yup.array().when("hasDisease", {
        is: true,
        then: (schema) =>
            schema.min(1, "Vui lòng thêm ít nhất 1 bệnh nền").of(
                Yup.object().shape({
                    group: Yup.string().required("Chọn nhóm bệnh"),
                    name: Yup.string().required("Nhập tên bệnh"),
                    level: Yup.string().required("Chọn mức độ"),
                    status: Yup.string().required("Chọn tình trạng hiện tại"),
                    doctor: Yup.string(),
                    hospital: Yup.string(),
                    notes: Yup.string(),
                })
            ),
        otherwise: (schema) => schema,
    }),

    medications: Yup.array().of(Yup.string().required("Nhập tên thuốc")),

    // Enhanced vision validation
    vision: Yup.string()
        .required("Vui lòng nhập thị lực")
        .test("vision-validation", "Thị lực không hợp lệ", (value) => {
            if (!value) return true;
            const result = validateVision(value);
            if (!result.isValid) {
                return new Yup.ValidationError(result.message, value, "vision");
            }
            return true;
        }),

    // Enhanced hearing validation
    hearing: Yup.string()
        .required("Vui lòng nhập thính lực")
        .test("hearing-validation", "Thính lực không hợp lệ", (value) => {
            if (!value) return true;
            const result = validateHearing(value);
            if (!result.isValid) {
                return new Yup.ValidationError(
                    result.message,
                    value,
                    "hearing"
                );
            }
            return true;
        }),

    // Enhanced height validation
    height: Yup.number()
        .typeError("Chiều cao phải là số")
        .required("Vui lòng nhập chiều cao")
        .test("height-validation", "Chiều cao không hợp lệ", (value) => {
            if (value === null || value === undefined) return true;
            const result = validateHeight(value);
            if (!result.isValid) {
                return new Yup.ValidationError(result.message, value, "height");
            }
            return true;
        }),

    // Enhanced weight validation
    weight: Yup.number()
        .typeError("Cân nặng phải là số")
        .required("Vui lòng nhập cân nặng")
        .test("weight-validation", "Cân nặng không hợp lệ", (value) => {
            if (value === null || value === undefined) return true;
            const result = validateWeight(value);
            if (!result.isValid) {
                return new Yup.ValidationError(result.message, value, "weight");
            }
            return true;
        }),
});

// Enhanced Medicine Schema
export const enhancedMedicineSchema = Yup.object().shape({
    // Step 1: Basic Info
    medicationName: Yup.string()
        .required("Vui lòng nhập tên thuốc")
        .test("medicine-name-validation", "Tên thuốc không hợp lệ", (value) => {
            if (!value) return true;
            const result = validateMedicineName(value);
            if (!result.isValid) {
                return new Yup.ValidationError(
                    result.message,
                    value,
                    "medicationName"
                );
            }
            return true;
        })
        .min(3, "Tên thuốc phải có ít nhất 3 ký tự"),

    medicationType: Yup.string().required("Vui lòng chọn loại thuốc"),

    medicationTypeDetail: Yup.string().when("medicationType", {
        is: (val) => val === "khac",
        then: (schema) =>
            schema
                .required("Vui lòng nhập loại thuốc cụ thể")
                .min(3, "Loại thuốc phải có ít nhất 3 ký tự"),
        otherwise: (schema) => schema,
    }),

    stockQuantity: Yup.number()
        .typeError("Vui lòng nhập số lượng")
        .min(1, "Số lượng phải lớn hơn 0")
        .required("Vui lòng nhập số lượng"),

    // Step 2: Dosage
    dosage: Yup.string().required("Vui lòng nhập liều lượng"),
    unit: Yup.string().required("Vui lòng chọn đơn vị"),
    unitDetail: Yup.string().when("unit", {
        is: (val) => val === "khac",
        then: (schema) =>
            schema
                .required("Vui lòng nhập đơn vị cụ thể")
                .min(1, "Đơn vị phải có ít nhất 1 ký tự"),
        otherwise: (schema) => schema,
    }),

    frequency: Yup.string().required("Vui lòng chọn tần suất sử dụng"),
    customTimes: Yup.array().when("frequency", {
        is: (val) => val !== "as-needed",
        then: (schema) =>
            schema
                .of(Yup.string().required("Vui lòng nhập giờ uống"))
                .min(1, "Vui lòng nhập ít nhất 1 giờ uống")
                .max(10, "Không được nhập quá 10 giờ uống"),
        otherwise: (schema) => schema,
    }),

    // Step 3: Usage Instructions
    usageNote: Yup.string().required("Vui lòng chọn cách sử dụng"),
    instructions: Yup.string(),
    importantNotes: Yup.array(),
    importantNotesDetail: Yup.string().when("importantNotes", {
        is: (val) => Array.isArray(val) && val.includes("other"),
        then: (schema) =>
            schema.required("Vui lòng nhập lưu ý quan trọng khác"),
        otherwise: (schema) => schema,
    }),
    usageNoteDetail: Yup.string().when("usageNote", {
        is: (val) => val === "other",
        then: (schema) => schema.required("Vui lòng nhập cách sử dụng cụ thể"),
        otherwise: (schema) => schema,
    }),

    // Step 4: Confirmation
    agreeConfirm: Yup.boolean().oneOf([true], "Bạn phải xác nhận thông tin"),
    agreeTerms: Yup.boolean().oneOf(
        [true],
        "Bạn phải chấp nhận tự chịu trách nhiệm với các phản ứng không mong muốn"
    ),
});

// Enhanced Health Checkup Schema (for nurse)
export const enhancedHealthCheckupSchema = Yup.object().shape({
    scheduledDate: Yup.date().required("Vui lòng chọn ngày khám"),

    height: Yup.number()
        .typeError("Chiều cao phải là số")
        .test("height-validation", "Chiều cao không hợp lệ", (value) => {
            if (value === null || value === undefined) return false;
            const result = validateHeight(value);
            if (!result.isValid) {
                return new Yup.ValidationError(result.message, value, "height");
            }
            return true;
        })
        .required("Chiều cao là bắt buộc"),

    weight: Yup.number()
        .typeError("Cân nặng phải là số")
        .test("weight-validation", "Cân nặng không hợp lệ", (value) => {
            if (value === null || value === undefined) return false;
            const result = validateWeight(value);
            if (!result.isValid) {
                return new Yup.ValidationError(result.message, value, "weight");
            }
            return true;
        })
        .required("Cân nặng là bắt buộc"),

    pulse: Yup.number()
        .typeError("Mạch phải là số")
        .min(40, "Mạch 40-200")
        .max(200, "Mạch 40-200")
        .required("Mạch là bắt buộc"),

    systolicBP: Yup.number()
        .typeError("Huyết áp tâm thu phải là số")
        .min(60, "Tâm thu 60-250")
        .max(250, "Tâm thu 60-250")
        .required("Huyết áp tâm thu là bắt buộc"),

    diastolicBP: Yup.number()
        .typeError("Huyết áp tâm trương phải là số")
        .min(30, "Tâm trương 30-150")
        .max(150, "Tâm trương 30-150")
        .required("Huyết áp tâm trương là bắt buộc"),

    physicalClassification: Yup.string()
        .oneOf(["EXCELLENT", "GOOD", "AVERAGE", "WEAK"])
        .required("Chọn phân loại thể lực"),

    // Enhanced vision fields
    visionRightNoGlasses: Yup.number()
        .typeError("Thị lực phải là số")
        .test("vision-validation", "Thị lực không hợp lệ", (value) => {
            if (value === null || value === undefined) return false;
            if (value < 0) {
                return new Yup.ValidationError(
                    "Thị lực không được là số âm",
                    value,
                    "visionRightNoGlasses"
                );
            }
            if (value > 20) {
                return new Yup.ValidationError(
                    "Giá trị thị lực quá cao",
                    value,
                    "visionRightNoGlasses"
                );
            }
            return true;
        })
        .required("Thị lực mắt phải (không kính) là bắt buộc"),

    visionLeftNoGlasses: Yup.number()
        .typeError("Thị lực phải là số")
        .test("vision-validation", "Thị lực không hợp lệ", (value) => {
            if (value === null || value === undefined) return false;
            if (value < 0) {
                return new Yup.ValidationError(
                    "Thị lực không được là số âm",
                    value,
                    "visionLeftNoGlasses"
                );
            }
            if (value > 20) {
                return new Yup.ValidationError(
                    "Giá trị thị lực quá cao",
                    value,
                    "visionLeftNoGlasses"
                );
            }
            return true;
        })
        .required("Thị lực mắt trái (không kính) là bắt buộc"),

    visionRightWithGlasses: Yup.number()
        .typeError("Thị lực phải là số")
        .test("vision-validation", "Thị lực không hợp lệ", (value) => {
            if (value === null || value === undefined) return false;
            if (value < 0) {
                return new Yup.ValidationError(
                    "Thị lực không được là số âm",
                    value,
                    "visionRightWithGlasses"
                );
            }
            if (value > 20) {
                return new Yup.ValidationError(
                    "Giá trị thị lực quá cao",
                    value,
                    "visionRightWithGlasses"
                );
            }
            return true;
        })
        .required("Thị lực mắt phải (có kính) là bắt buộc"),

    visionLeftWithGlasses: Yup.number()
        .typeError("Thị lực phải là số")
        .test("vision-validation", "Thị lực không hợp lệ", (value) => {
            if (value === null || value === undefined) return false;
            if (value < 0) {
                return new Yup.ValidationError(
                    "Thị lực không được là số âm",
                    value,
                    "visionLeftWithGlasses"
                );
            }
            if (value > 20) {
                return new Yup.ValidationError(
                    "Giá trị thị lực quá cao",
                    value,
                    "visionLeftWithGlasses"
                );
            }
            return true;
        })
        .required("Thị lực mắt trái (có kính) là bắt buộc"),

    // Enhanced hearing fields
    hearingLeftNormal: Yup.number()
        .typeError("Thính lực phải là số")
        .test("hearing-validation", "Thính lực không hợp lệ", (value) => {
            if (value === null || value === undefined) return false;
            if (value < 0) {
                return new Yup.ValidationError(
                    "Thính lực không được là số âm",
                    value,
                    "hearingLeftNormal"
                );
            }
            return true;
        })
        .required("Thính lực trái (bình thường) là bắt buộc"),

    hearingLeftWhisper: Yup.number()
        .typeError("Thính lực phải là số")
        .test("hearing-validation", "Thính lực không hợp lệ", (value) => {
            if (value === null || value === undefined) return false;
            if (value < 0) {
                return new Yup.ValidationError(
                    "Thính lực không được là số âm",
                    value,
                    "hearingLeftWhisper"
                );
            }
            return true;
        })
        .required("Thính lực trái (thì thầm) là bắt buộc"),

    hearingRightNormal: Yup.number()
        .typeError("Thính lực phải là số")
        .test("hearing-validation", "Thính lực không hợp lệ", (value) => {
            if (value === null || value === undefined) return false;
            if (value < 0) {
                return new Yup.ValidationError(
                    "Thính lực không được là số âm",
                    value,
                    "hearingRightNormal"
                );
            }
            return true;
        })
        .required("Thính lực phải (bình thường) là bắt buộc"),

    hearingRightWhisper: Yup.number()
        .typeError("Thính lực phải là số")
        .test("hearing-validation", "Thính lực không hợp lệ", (value) => {
            if (value === null || value === undefined) return false;
            if (value < 0) {
                return new Yup.ValidationError(
                    "Thính lực không được là số âm",
                    value,
                    "hearingRightWhisper"
                );
            }
            return true;
        })
        .required("Thính lực phải (thì thầm) là bắt buộc"),

    dentalUpperJaw: Yup.string().required("Nhập kết quả răng hàm trên"),
    dentalLowerJaw: Yup.string().required("Nhập kết quả răng hàm dưới"),
    clinicalNotes: Yup.string().required("Nhập ghi chú lâm sàng"),
    overallHealth: Yup.string().required("Chọn tình trạng sức khỏe tổng thể"),
    recommendations: Yup.string(),
    requiresFollowUp: Yup.boolean(),
    followUpDate: Yup.date().when("requiresFollowUp", {
        is: true,
        then: (schema) => schema.required("Vui lòng chọn ngày tái khám"),
        otherwise: (schema) => schema.nullable(),
    }),
    notes: Yup.string(),
});

export default {
    enhancedUserValidationSchema,
    enhancedHealthProfileSchema,
    enhancedMedicineSchema,
    enhancedHealthCheckupSchema,
};
