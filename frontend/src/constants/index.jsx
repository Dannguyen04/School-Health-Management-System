import {
  AlertCircle,
  BarChart2,
  BookOpen,
  FileText,
  FlaskConical,
  Heart,
  LayoutDashboard,
  Package,
  Syringe,
  User,
  Users,
} from "lucide-react";

export const adminNavbarLinks = [
  {
    title: "Dashboard",
    links: [
      { label: "Bảng Điều Khiển", path: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Quản lý",
    links: [
      { label: "Quản Lý Người Dùng", path: "/admin/users", icon: User },
      { label: "Quản Lý Học Sinh", path: "/admin/students", icon: Users },
      { label: "Quản Lý Phụ Huynh", path: "/admin/parents", icon: Users },
    ],
  },
];

export const managerNavbarLinks = [
  {
    title: "Dashboard",
    links: [
      {
        label: "Bảng Điều Khiển",
        path: "/manager",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Quản Lý",
    links: [
      {
        label: "Danh Sách Học Sinh",
        path: "/manager/students",
        icon: Users,
      },
      {
        label: "Cảnh Báo & Sự Kiện",
        path: "/manager/alerts-events",
        icon: AlertCircle,
      },
    ],
  },
  {
    title: "Tiêm Chủng",
    links: [
      {
        label: "Chiến dịch",
        path: "/manager/vaccination-campaigns",
        icon: Package,
      },
      {
        label: "Báo cáo tiêm chủng",
        path: "/manager/vaccination-report",
        icon: FileText,
      },
      {
        label: "Quản lý Vaccine",
        path: "/manager/vaccination",
        icon: Syringe,
      },
    ],
  },
  {
    title: "Khám sức khỏe",
    links: [
      {
        label: "Chiến dịch",
        path: "/manager/health-checkup-campaigns",
        icon: Package,
      },
      {
        label: "Báo Cáo Sức Khỏe",
        path: "/manager/health-reports",
        icon: FileText,
      },
    ],
  },
];

export const nurseNavbarLinks = [
  {
    title: "Dashboard",
    links: [
      { label: "Bảng Điều Khiển", path: "/nurse", icon: LayoutDashboard },
    ],
  },
  {
    title: "Quản lý",
    links: [
      {
        label: "Thuốc đã duyệt",
        path: "/nurse/medical-inventory",
        icon: Package,
      },

      {
        label: "Xác Nhận Thuốc",
        path: "/nurse/confirmed-medicines",
        icon: Package,
      },
      {
        label: "Cấp phát thuốc",
        path: "/nurse/student-treatment",
        icon: Users,
      },
      {
        label: "Quản lý bài viết",
        path: "/nurse/blog-management",
        icon: BookOpen,
      },
    ],
  },
  {
    title: "Khám sức khỏe",
    links: [
      {
        label: "Khám Sức Khỏe",
        path: "/nurse/health-checkups",
        icon: User,
      },
      {
        label: "Hồ Sơ Sức Khỏe",
        path: "/nurse/student-health-profile",
        icon: Heart,
      },
    ],
  },
  {
    title: "Tiêm chủng",
    links: [
      {
        label: "Tiêm Chủng",
        path: "/nurse/vaccination-report",
        icon: FlaskConical,
      },
    ],
  },
  {
    title: "Sự kiện y tế",
    links: [
      // Xóa mục Điều Trị Học Sinh ở đây
      {
        label: "Báo Cáo Y Tế",
        path: "/nurse/medical-event",
        icon: BarChart2,
      },
    ],
  },
];
