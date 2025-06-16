import { DownloadOutlined } from "@ant-design/icons";
import { Bar, Pie } from "@ant-design/plots";
import { Button, Card, Col, DatePicker, Row, Select, Table } from "antd";
import React, { useState } from "react";

const { Option } = Select;
const { RangePicker } = DatePicker;

const HealthReports = () => {
  const [reportType, setReportType] = useState("periodic");

  // Mock data for charts
  const vaccinationData = [
    { type: "COVID-19", value: 850 },
    { type: "Hepatitis B", value: 920 },
    { type: "MMR", value: 780 },
    { type: "DTaP", value: 890 },
  ];

  const healthCheckData = [
    { type: "Normal", value: 750 },
    { type: "Follow-up Required", value: 150 },
    { type: "Medical Attention", value: 50 },
  ];

  // Mock data for reports table
  const reports = [
    {
      id: 1,
      type: "Periodic",
      name: "Q1 2024 Health Report",
      date: "2024-03-31",
      status: "Completed",
    },
    {
      id: 2,
      type: "Event",
      name: "Flu Outbreak Report",
      date: "2024-03-15",
      status: "Completed",
    },
    {
      id: 3,
      type: "Periodic",
      name: "Q4 2023 Health Report",
      date: "2023-12-31",
      status: "Completed",
    },
  ];

  const columns = [
    {
      title: "Report Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Report Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button type="link" icon={<DownloadOutlined />}>
          Download
        </Button>
      ),
    },
  ];

  const vaccinationConfig = {
    data: vaccinationData,
    xField: "value",
    yField: "type",
    seriesField: "type",
    legend: {
      position: "top",
    },
  };

  const healthCheckConfig = {
    data: healthCheckData,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    label: {
      type: "outer",
    },
    legend: {
      position: "top",
    },
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap gap-4 mb-4">
          <Select
            defaultValue="periodic"
            style={{ width: 200 }}
            onChange={setReportType}
          >
            <Option value="periodic">Periodic Reports</Option>
            <Option value="event">Event Reports</Option>
          </Select>

          <RangePicker style={{ width: 300 }} />
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Vaccination Coverage">
              <Bar {...vaccinationConfig} />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Health Check Results">
              <Pie {...healthCheckConfig} />
            </Card>
          </Col>
        </Row>
      </Card>

      <Card title="Reports">
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default HealthReports;
