# 🎓 School Health Management System

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232a?logo=react&logoColor=61dafb)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)

---

## 📝 Giới thiệu

> **School Health Management System** là hệ thống quản lý y tế học đường, hỗ trợ quản lý học sinh, phụ huynh, chiến dịch tiêm chủng, kiểm tra sức khỏe, quản lý thuốc, blog, thông báo và nhiều tính năng khác cho nhà trường, y tế và phụ huynh.

---

## 🚀 Công nghệ sử dụng

| Thành phần     | Công nghệ/Thư viện chính                                             |
| -------------- | -------------------------------------------------------------------- |
| Backend        | Node.js, Express.js, Prisma ORM, JWT, Multer, dotenv                 |
| Frontend       | ReactJS, Vite, React Router, Axios, Context API, React Hooks         |
| Database       | MongoDB                                                              |
| Authentication | JSON Web Token (JWT), Middleware xác thực                            |
| Styling        | TailwindCSS, CSS Modules                                             |
| Dev Tools      | Vercel (deploy), ESLint, Prettier, PowerShell (Windows), npm scripts |

---

## ⚡️ Hướng dẫn cài đặt nhanh

### 1️⃣ Backend

```bash
cd School-Health-Management-System/backend
npm install
# Cấu hình file .env nếu cần
npx prisma migrate dev # Khởi tạo/migrate database (nếu dùng Prisma với MongoDB)
npm start # hoặc: node index.js
```

### 2️⃣ Frontend

```bash
cd School-Health-Management-System/frontend
npm install
npm run dev
```

### 🌐 Truy cập

-   Frontend: [http://localhost:5173](http://localhost:5173)
-   Backend (API): [http://localhost:3000](http://localhost:3000) (hoặc port bạn cấu hình)

---

## 📁 Cấu trúc thư mục chính

```
School-Health-Management-System/
├── backend/      # Server Node.js, API, xử lý logic, kết nối DB
│   ├── controllers/   # Xử lý logic cho từng đối tượng (User, Student, Admin...)
│   ├── routes/        # Định nghĩa các endpoint API
│   ├── middleware/    # Các hàm trung gian (auth, upload...)
│   ├── db/            # Kết nối và cấu hình database
│   ├── prisma/        # Cấu hình Prisma ORM (schema, migration)
│   ├── uploads/       # Lưu trữ file upload
│   ├── seed/          # Dữ liệu mẫu để khởi tạo DB
│   └── ...            # Các file cấu hình, khởi động server
├── frontend/    # Ứng dụng React, giao diện người dùng
│   ├── src/
│   │   ├── components/    # Các component giao diện chia theo vai trò (admin, nurse, parent...)
│   │   ├── pages/         # Các trang chính của ứng dụng
│   │   ├── layouts/       # Layout tổng thể cho từng vai trò
│   │   ├── context/       # Quản lý state toàn cục (auth...)
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Hàm tiện ích, gọi API
│   │   └── ...
│   ├── public/        # Ảnh, favicon, file tĩnh
│   └── ...            # Cấu hình, tài nguyên khác
└── README.md      # Tài liệu dự án
```

---

## 🤝 Đóng góp & Liên hệ

-   Mọi đóng góp, phản hồi xin gửi về email hoặc liên hệ trực tiếp nhóm phát triển.
