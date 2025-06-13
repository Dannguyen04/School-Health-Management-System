import {
  CheckSquareOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  ProfileOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const { Sider } = Layout;

const menuItems = [
  {
    key: "/user",
    icon: <ScheduleOutlined />,
    label: "Dashboard",
  },
  {
    key: "/user/vaccination-schedule",
    icon: <ScheduleOutlined />,
    label: "Lịch tiêm & khám",
  },
  {
    key: "/user/health-checkup-results",
    icon: <FileTextOutlined />,
    label: "Kết quả khám sức khỏe",
  },
  {
    key: "/user/consent-forms",
    icon: <CheckSquareOutlined />,
    label: "Form đồng ý",
  },
  {
    key: "/user/health-profile",
    icon: <ProfileOutlined />,
    label: "Hồ sơ sức khỏe",
  },
  {
    key: "/user/medicine-info",
    icon: <MedicineBoxOutlined />,
    label: "Gửi thuốc",
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider
      width={240}
      style={{
        position: "fixed",
        height: "100vh",
        left: 0,
        top: 64,
        overflow: "auto",
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ height: "100%" }}
      />
    </Sider>
  );
};

export default Sidebar;
