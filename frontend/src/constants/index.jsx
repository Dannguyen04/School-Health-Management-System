import {
  AlertCircle,
  BarChart2,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Package,
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
    ],
  },
];

export const managerNavbarLinks = [
  {
    title: "Dashboard",
    links: [
      { label: "Bảng Điều Khiển", path: "/manager", icon: LayoutDashboard },
    ],
  },
  {
    title: "Quản lý",
    links: [
      { label: "Danh Sách Học Sinh", path: "/manager/students", icon: Users },
      {
        label: "Báo Cáo Sức Khỏe",
        path: "/manager/health-reports",
        icon: FileText,
      },
      {
        label: "Tiêm Chủng",
        path: "/manager/vaccination-campaigns",
        icon: Package,
      },
      {
        label: "Khám Sức Khỏe",
        path: "/manager/health-checkup-campaigns",
        icon: Package,
      },
      {
        label: "Cảnh Báo & Sự Kiện",
        path: "/manager/alerts-events",
        icon: AlertCircle,
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
      { label: "Kho Thuốc", path: "/nurse/medical-inventory", icon: Package },
      {
        label: "Điều Trị Học Sinh",
        path: "/nurse/student-treatment",
        icon: Users,
      },
      { label: "Tiêm Chủng", path: "/nurse/vaccination", icon: FlaskConical },
      { label: "Khám Sức Khỏe", path: "/nurse/health-checkups", icon: User },
      {
        label: "Xác Nhận Thuốc",
        path: "/nurse/confirmed-medicines",
        icon: Package,
      },
      { label: "Báo Cáo Y Tế", path: "/nurse/medical-event", icon: BarChart2 },
    ],
  },
];
