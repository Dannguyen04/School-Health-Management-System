# Tài liệu Schema Prisma - Hệ thống Quản lý Y tế Học đường

## 1. Tổng quan
Hệ thống quản lý y tế học đường dành cho phòng y tế của trường học, hỗ trợ quản lý sức khỏe học sinh, tiêm chủng, kiểm tra y tế định kỳ và xử lý các sự kiện y tế.

## 2. Các loại người dùng (UserRole)

| Role | Tiếng Việt | Mô tả |
|------|------------|-------|
| `STUDENT` | Học sinh | Học sinh của trường |
| `PARENT` | Phụ huynh | Phụ huynh học sinh |
| `SCHOOL_NURSE` | Y tá trường học | Nhân viên y tế của trường |
| `MANAGER` | Quản lý | Quản lý phòng y tế |
| `ADMIN` | Quản trị viên | Quản trị hệ thống |

## 3. Các Model chính

### 3.1 User (Người dùng)
- **Mục đích**: Model cơ sở cho tất cả người dùng trong hệ thống
- **Đặc điểm**: Mỗi user có thể có một profile tương ứng với role của họ
- **Quan hệ**: 1-1 với các profile (Student, Parent, SchoolNurse, Manager, Admin)

### 3.2 Student (Học sinh) - **OPTIONAL**
- **Mục đích**: Lưu thông tin chi tiết của học sinh
- **Lưu ý**: Chỉ những user có role `STUDENT` mới có profile này
- **Thông tin**: Mã học sinh, ngày sinh, lớp, nhóm máu, liên lạc khẩn cấp

### 3.3 Parent (Phụ huynh)
- **Mục đích**: Lưu thông tin phụ huynh
- **Chức năng**: Khai báo hồ sơ sức khỏe con em, gửi thuốc cho trường

### 3.4 SchoolNurse (Y tá trường học)
- **Mục đích**: Lưu thông tin y tá
- **Chức năng**: Xử lý sự kiện y tế, tiêm chủng, kiểm tra sức khỏe

## 4. Quản lý Sức khỏe

### 4.1 HealthProfile (Hồ sơ sức khỏe)
- **Mục đích**: Lưu trữ thông tin sức khỏe chi tiết của học sinh
- **Bao gồm**:
  - Dị ứng (`allergies`)
  - Bệnh mãn tính (`chronicDiseases`)
  - Tiền sử điều trị (`treatmentHistory`)
  - Thị lực (`vision`)
  - Thính lực (`hearing`)
  - Chiều cao, cân nặng (`height`, `weight`)

### 4.2 MedicalEvent (Sự kiện y tế)
- **Mục đích**: Ghi nhận và xử lý các sự kiện y tế trong trường
- **Loại sự kiện**:
  - `ACCIDENT`: Tai nạn
  - `FEVER`: Sốt
  - `FALL`: Té ngã
  - `EPIDEMIC`: Dịch bệnh
  - `ALLERGY_REACTION`: Phản ứng dị ứng
  - `CHRONIC_DISEASE_EPISODE`: Cơn bệnh mãn tính
  - `OTHER`: Khác

## 5. Quản lý Thuốc

### 5.1 Medication (Thuốc)
- **Mục đích**: Danh mục thuốc và vật tư y tế
- **Thông tin**: Tên thuốc, liều lượng, hạn sử dụng, tồn kho

### 5.2 StudentMedication (Thuốc của học sinh)
- **Mục đích**: Quản lý thuốc mà phụ huynh gửi cho học sinh
- **Trạng thái**:
  - `PENDING_APPROVAL`: Chờ phê duyệt
  - `APPROVED`: Đã phê duyệt
  - `REJECTED`: Từ chối
  - `ACTIVE`: Đang sử dụng
  - `EXPIRED`: Hết hạn

### 5.3 StockMovement (Xuất nhập kho)
- **Mục đích**: Theo dõi xuất nhập kho thuốc
- **Loại**: Nhập kho, xuất kho, hết hạn, hư hỏng

## 6. Tiêm chủng

### 6.1 VaccinationCampaign (Chiến dịch tiêm chủng)
- **Mục đích**: Quản lý các đợt tiêm chủng
- **Quy trình**: Thông báo → Xác nhận đồng ý → Chuẩn bị danh sách → Tiêm → Theo dõi

### 6.2 Vaccination (Tiêm chủng)
- **Mục đích**: Theo dõi quá trình tiêm chủng từng học sinh
- **Trạng thái**:
  - `SCHEDULED`: Đã lên lịch
  - `COMPLETED`: Hoàn thành
  - `POSTPONED`: Hoãn lại
  - `CANCELLED`: Hủy bỏ

## 7. Kiểm tra Y tế

### 7.1 MedicalCheckCampaign (Chiến dịch kiểm tra y tế)
- **Mục đích**: Quản lý các đợt kiểm tra y tế định kỳ
- **Nội dung**: Thị lực, thính lực, răng miệng, chiều cao cân nặng

### 7.2 MedicalCheck (Kiểm tra y tế)
- **Mục đích**: Lưu kết quả kiểm tra từng học sinh
- **Kết quả**: Vision, hearing, dental, height/weight, đánh giá tổng quát
- **Theo dõi**: Có thể cần tư vấn riêng nếu có bất thường

## 8. Hệ thống Thông báo

### 8.1 Notification (Thông báo)
- **Mục đích**: Gửi thông báo cho phụ huynh
- **Loại thông báo**: Tiêm chủng, kiểm tra y tế, thuốc, thông báo chung
- **Trạng thái**:
  - `SENT`: Đã gửi
  - `DELIVERED`: Đã nhận
  - `READ`: Đã đọc
  - `EXPIRED`: Hết hạn

## 9. Quản lý Nội dung

### 9.1 Post (Bài viết)
- **Mục đích**: Trang chủ, blog chia sẻ kinh nghiệm
- **Danh mục**: Mẹo sức khỏe, tin tức trường, chia sẻ kinh nghiệm

### 9.2 MedicalDocument (Tài liệu y tế)
- **Mục đích**: Lưu trữ tài liệu, hình ảnh liên quan đến sự kiện y tế

## 10. Hệ thống Hỗ trợ

### 10.1 AuditLog (Nhật ký hoạt động)
- **Mục đích**: Theo dõi các hoạt động của người dùng
- **Ghi nhận**: Tạo, sửa, xóa, đăng nhập, đăng xuất

### 10.2 SchoolInfo (Thông tin trường)
- **Mục đích**: Lưu thông tin cơ bản của trường học
- **Bao gồm**: Tên trường, địa chỉ, thông tin phòng y tế

## 11. Quan hệ đặc biệt

### 11.1 StudentParent (Quan hệ Học sinh - Phụ huynh)
- **Mục đích**: Một học sinh có thể có nhiều phụ huynh (cha, mẹ, người giám hộ)
- **Thông tin