import {
  ExperimentOutlined,
  FileTextOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Layout, Row, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const QuickLinkCard = ({ title, description, icon, path }) => {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      style={{ height: "100%" }}
      actions={[
        <Button type="link" onClick={() => navigate(path)}>
          Xem chi tiết
        </Button>,
      ]}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        {icon}
        <Title level={5} style={{ margin: "0 0 0 8px" }}>
          {title}
        </Title>
      </div>
      <Paragraph type="secondary">{description}</Paragraph>
    </Card>
  );
};

const Dashboard = () => {
  const quickLinks = [
    {
      title: "Hồ sơ sức khỏe",
      description: "Cập nhật và xem thông tin sức khỏe của học sinh",
      icon: <MedicineBoxOutlined style={{ fontSize: 24, color: "#1890ff" }} />,
      path: "/user/health-profile",
    },
    {
      title: "Tiêm chủng",
      description: "Quản lý lịch tiêm chủng và theo dõi tình trạng",
      icon: <ExperimentOutlined style={{ fontSize: 24, color: "#1890ff" }} />,
      path: "/user/vaccination-schedule",
    },
    {
      title: "Tài liệu sức khỏe",
      description: "Truy cập các tài liệu và hướng dẫn về sức khỏe",
      icon: <FileTextOutlined style={{ fontSize: 24, color: "#1890ff" }} />,
      path: "/user/blog",
    },
    {
      title: "Gửi thuốc",
      description: "Gửi thuốc cho học sinh",
      icon: <HeartOutlined style={{ fontSize: 24, color: "#1890ff" }} />,
      path: "/user/medicine-info",
    },
  ];

  return (
    <Content style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Chào mừng đến với Hệ thống Y tế Trường học</Title>
        <Text type="secondary">
          Quản lý và theo dõi sức khỏe học sinh một cách hiệu quả
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {quickLinks.map((link) => (
          <Col xs={24} sm={12} md={6} key={link.title}>
            <QuickLinkCard {...link} />
          </Col>
        ))}
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Title level={4}>Thông tin nhanh</Title>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Title level={5}>Lịch kiểm tra sức khỏe sắp tới</Title>
            {/* Add calendar or upcoming events component here */}
          </Col>
          <Col xs={24} md={12}>
            <Title level={5}>Thông báo mới nhất</Title>
            {/* Add notifications component here */}
          </Col>
        </Row>
      </Card>
    </Content>
  );
};

export default Dashboard;
