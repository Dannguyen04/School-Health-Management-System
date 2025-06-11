import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Card, Col, Row, Select, Statistic, Typography } from "antd";
import React, { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const { Title, Text } = Typography;
const { Option } = Select;

const Reports = () => {
  const [timeRange, setTimeRange] = useState("month");

  // Mock data - replace with actual API data
  const vaccinationData = [
    { name: "Tháng 1", completed: 45, pending: 15 },
    { name: "Tháng 2", completed: 60, pending: 10 },
    { name: "Tháng 3", completed: 75, pending: 5 },
  ];

  const healthCheckupData = [
    { name: "Bình thường", value: 70 },
    { name: "Cần theo dõi", value: 20 },
    { name: "Cần can thiệp", value: 10 },
  ];

  const medicalEventsData = [
    { name: "Tai nạn", value: 5 },
    { name: "Sốt", value: 15 },
    { name: "Dị ứng", value: 3 },
    { name: "Khác", value: 2 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const summaryData = [
    {
      title: "Tổng số học sinh",
      value: "500",
      change: "+5%",
      trend: "up",
    },
    {
      title: "Đã tiêm chủng",
      value: "450",
      change: "+10%",
      trend: "up",
    },
    {
      title: "Sự kiện y tế",
      value: "25",
      change: "-5%",
      trend: "down",
    },
    {
      title: "Kiểm tra sức khỏe",
      value: "480",
      change: "+8%",
      trend: "up",
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Báo cáo và thống kê</Title>
        <Text type="secondary">
          Theo dõi và phân tích dữ liệu sức khỏe học sinh
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {summaryData.map((item) => (
          <Col xs={24} sm={12} md={6} key={item.title}>
            <Card>
              <Statistic
                title={item.title}
                value={item.value}
                valueStyle={{ fontSize: "24px" }}
                suffix={
                  <span
                    style={{
                      fontSize: "14px",
                      color: item.trend === "up" ? "#52c41a" : "#ff4d4f",
                    }}
                  >
                    {item.change} so với tháng trước
                    {item.trend === "up" ? (
                      <ArrowUpOutlined />
                    ) : (
                      <ArrowDownOutlined />
                    )}
                  </span>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ margin: "24px 0" }}>
        <Select
          value={timeRange}
          onChange={setTimeRange}
          style={{ width: 200 }}
        >
          <Option value="week">Tuần này</Option>
          <Option value="month">Tháng này</Option>
          <Option value="quarter">Quý này</Option>
          <Option value="year">Năm nay</Option>
        </Select>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card title="Tiến độ tiêm chủng">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vaccinationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" name="Đã tiêm" fill="#8884d8" />
                <Bar dataKey="pending" name="Chờ tiêm" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Tình trạng sức khỏe">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={healthCheckupData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {healthCheckupData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24}>
          <Card title="Sự kiện y tế">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={medicalEventsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {medicalEventsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;
