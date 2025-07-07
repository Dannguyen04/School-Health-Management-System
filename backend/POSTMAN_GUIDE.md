# Hướng dẫn Test API Vaccination Campaign với Postman

## 🚀 Import Collection vào Postman

1. Mở Postman
2. Click **Import**
3. Chọn file `postman_vaccination_campaign.json`
4. Collection sẽ được import với 5 test cases

## 🔧 Chuẩn bị trước khi test

### 1. Lấy JWT Token

```bash
# Đăng nhập để lấy token
POST http://localhost:5000/api/auth/login
{
  "email": "manager@example.com",
  "password": "your_password"
}
```

### 2. Lấy Vaccine ID

```bash
# Lấy danh sách vaccine
GET http://localhost:5000/api/manager/vaccination
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3. Thay thế placeholders

-   **YOUR_JWT_TOKEN_HERE** → JWT token thực tế
-   **VACCINE_ID_HERE** → ID của vaccine từ database

## 📋 Test Cases

### 1. **Create Vaccination Campaign** (Complete)

```json
{
    "name": "Chiến dịch tiêm COVID-19 học kỳ 1 năm 2025",
    "description": "Chiến dịch tiêm chủng COVID-19 cho học sinh các khối 6, 7, 8...",
    "vaccineId": "VACCINE_ID_HERE",
    "targetGrades": ["6", "7", "8"],
    "scheduledDate": "2025-02-15T08:00:00.000Z",
    "deadline": "2025-02-28T17:00:00.000Z",
    "totalStudents": 450
}
```

### 2. **Required Vaccine Campaign**

```json
{
    "name": "Tiêm phòng Sởi - Rubella bắt buộc",
    "description": "Chiến dịch tiêm phòng Sởi - Rubella cho học sinh lớp 1...",
    "vaccineId": "VACCINE_ID_HERE",
    "targetGrades": ["1"],
    "scheduledDate": "2025-03-01T08:00:00.000Z",
    "deadline": "2025-03-15T17:00:00.000Z",
    "totalStudents": 120
}
```

### 3. **Optional Vaccine Campaign**

```json
{
    "name": "Tiêm phòng Cúm mùa 2025",
    "description": "Chiến dịch tiêm phòng cúm mùa tự nguyện...",
    "vaccineId": "VACCINE_ID_HERE",
    "targetGrades": ["9", "10", "11", "12"],
    "scheduledDate": "2025-04-01T08:00:00.000Z",
    "deadline": "2025-04-30T17:00:00.000Z",
    "totalStudents": 800
}
```

### 4. **Minimal Data Test**

```json
{
    "name": "Chiến dịch test tối thiểu",
    "vaccineId": "VACCINE_ID_HERE",
    "targetGrades": ["5"],
    "scheduledDate": "2025-05-01T08:00:00.000Z",
    "deadline": "2025-05-15T17:00:00.000Z"
}
```

### 5. **Validation Error Test**

```json
{
    "name": "",
    "vaccineId": "invalid_vaccine_id",
    "targetGrades": [],
    "scheduledDate": "2025-01-01T08:00:00.000Z",
    "deadline": "2025-01-02T17:00:00.000Z",
    "totalStudents": -10
}
```

## ✅ Expected Responses

### Success Response (201)

```json
{
    "success": true,
    "data": {
        "id": "generated_campaign_id",
        "name": "Chiến dịch tiêm COVID-19 học kỳ 1 năm 2025",
        "description": "...",
        "vaccineId": "vaccine_id",
        "vaccineName": "COVID-19 Vaccine",
        "vaccineManufacturer": "Pfizer",
        "vaccineRequirement": "REQUIRED",
        "targetGrades": ["6", "7", "8"],
        "scheduledDate": "2025-02-15T08:00:00.000Z",
        "deadline": "2025-02-28T17:00:00.000Z",
        "totalStudents": 450,
        "consentedStudents": 0,
        "vaccinatedStudents": 0,
        "completionRate": 0,
        "isActive": true,
        "status": "ACTIVE",
        "createdAt": "2025-07-07T...",
        "updatedAt": "2025-07-07T...",
        "vaccine": {
            "id": "vaccine_id",
            "name": "COVID-19 Vaccine",
            "requirement": "REQUIRED",
            "manufacturer": "Pfizer"
        }
    },
    "message": "Tạo chiến dịch tiêm chủng thành công"
}
```

### Error Response (400)

```json
{
    "success": false,
    "error": "Thiếu thông tin bắt buộc: name, vaccineId, scheduledDate, deadline"
}
```

## 🔍 Validation Rules

1. **name**: Bắt buộc, không rỗng
2. **vaccineId**: Bắt buộc, phải tồn tại trong database
3. **scheduledDate**: Bắt buộc, phải >= hôm nay
4. **deadline**: Bắt buộc, phải cách scheduledDate ít nhất 7 ngày
5. **targetGrades**: Bắt buộc, array không rỗng
6. **totalStudents**: Tùy chọn, số nguyên >= 0
7. **description**: Tùy chọn

## 📝 Notes

-   Server chạy ở port **5000**
-   Cần authentication với JWT token
-   Denormalized data sẽ được tự động thêm vào
-   Notification sẽ được tự động tạo cho manager
-   Campaign statistics được khởi tạo với giá trị 0
