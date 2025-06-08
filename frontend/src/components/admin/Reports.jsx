import {
  AlertOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Progress,
  Row,
  Select,
  Statistic,
  Table,
} from "antd";
import React, { useState } from "react";

const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
  const [dateRange, setDateRange] = useState(null);
  const [reportType, setReportType] = useState("all");

  const statistics = [
    {
      title: "Tổng số học sinh",
      value: 450,
      icon: <TeamOutlined style={{ fontSize: 24 }} />,
      color: "#1890ff",
    },
    {
      title: "Sự kiện y tế",
      value: 25,
      icon: <AlertOutlined style={{ fontSize: 24 }} />,
      color: "#ff4d4f",
    },
    {
      title: "Tiêm chủng",
      value: 180,
      icon: <MedicineBoxOutlined style={{ fontSize: 24 }} />,
      color: "#52c41a",
    },
    {
      title: "Báo cáo sức khỏe",
      value: 450,
      icon: <FileTextOutlined style={{ fontSize: 24 }} />,
      color: "#722ed1",
    },
  ];

  const vaccinationData = [
    {
      key: "1",
      vaccine: "Vắc xin 5 trong 1",
      total: 450,
      completed: 420,
      percentage: 93,
    },
    {
      key: "2",
      vaccine: "Vắc xin cúm",
      total: 450,
      completed: 380,
      percentage: 84,
    },
    {
      key: "3",
      vaccine: "Vắc xin viêm não Nhật Bản",
      total: 450,
      completed: 400,
      percentage: 89,
    },
  ];

  const medicalEventsData = [
    {
      key: "1",
      type: "Tai nạn",
      count: 5,
      percentage: 20,
    },
    {
      key: "2",
      type: "Sốt",
      count: 12,
      percentage: 48,
    },
    {
      key: "3",
      type: "Té ngã",
      count: 8,
      percentage: 32,
    },
  ];

  const columns = [
    {
      title: "Loại vắc xin",
      dataIndex: "vaccine",
      key: "vaccine",
    },
    {
      title: "Tổng số",
      dataIndex: "total",
      key: "total",
    },
    {
      title: "Đã tiêm",
      dataIndex: "completed",
      key: "completed",
    },
    {
      title: "Tỷ lệ",
      dataIndex: "percentage",
      key: "percentage",
      render: (percentage) => (
        <Progress percent={percentage} size="small" status="active" />
      ),
    },
  ];

  const eventColumns = [
    {
      title: "Loại sự kiện",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Số lượng",
      dataIndex: "count",
      key: "count",
    },
    {
      title: "Tỷ lệ",
      dataIndex: "percentage",
      key: "percentage",
      render: (percentage) => (
        <Progress percent={percentage} size="small" status="active" />
      ),
    },
  ];

  const handleGenerateReport = () => {
    console.log("Generating report with:", { dateRange, reportType });
  };

  return (
    <div>
      <Card
        style={{
          marginBottom: 24,
          background: "#f6ffed",
          border: "1px solid #b7eb8f",
        }}
      >
        <b>Hướng dẫn:</b> Chọn khoảng thời gian và loại báo cáo để tạo báo cáo
        sức khỏe, tiêm chủng hoặc kiểm tra y tế định kỳ cho học sinh.
      </Card>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <RangePicker
              style={{ width: "100%" }}
              onChange={(dates) => setDateRange(dates)}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Select
              style={{ width: "100%" }}
              value={reportType}
              onChange={setReportType}
            >
              <Option value="all">Tất cả báo cáo</Option>
              <Option value="vaccination">Báo cáo tiêm chủng</Option>
              <Option value="medical">Báo cáo sự kiện y tế</Option>
              <Option value="health">Báo cáo sức khỏe</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Button type="primary" onClick={handleGenerateReport} block>
              Tạo báo cáo
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {statistics.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Thống kê tiêm chủng">
            <Table
              columns={columns}
              dataSource={vaccinationData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Thống kê sự kiện y tế">
            <Table
              columns={eventColumns}
              dataSource={medicalEventsData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;
