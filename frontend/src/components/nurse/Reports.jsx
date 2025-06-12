import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Row,
  Select,
  Space,
  Statistic,
  Table,
} from "antd";
import React from "react";
import { reports } from "../../mock/nurseData";

const { RangePicker } = DatePicker;

const Reports = () => {
  const [searchForm] = Form.useForm();

  const columns = [
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Total Students",
      dataIndex: "totalStudents",
      key: "totalStudents",
    },
    {
      title: "Vaccinated",
      dataIndex: "vaccinated",
      key: "vaccinated",
    },
    {
      title: "Health Checkups",
      dataIndex: "healthCheckups",
      key: "healthCheckups",
    },
    {
      title: "Medications",
      dataIndex: "medications",
      key: "medications",
    },
  ];

  const handleSearch = (values) => {
    console.log("Search values:", values);
  };

  const handleExport = (type) => {
    console.log("Exporting report type:", type);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports & Statistics</h1>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleExport("pdf")}
          >
            Export PDF
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleExport("excel")}
          >
            Export Excel
          </Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Monthly Vaccinations"
              value={reports.monthlyStats.vaccinations}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Monthly Health Checkups"
              value={reports.monthlyStats.healthCheckups}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Monthly Medications"
              value={reports.monthlyStats.medications}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Monthly Incidents"
              value={reports.monthlyStats.incidents}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="dateRange" label="Date Range">
                <RangePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="grade" label="Grade">
                <Select placeholder="Select grade">
                  <Select.Option value="all">All Grades</Select.Option>
                  <Select.Option value="Grade 1">Grade 1</Select.Option>
                  <Select.Option value="Grade 2">Grade 2</Select.Option>
                  <Select.Option value="Grade 3">Grade 3</Select.Option>
                  <Select.Option value="Grade 4">Grade 4</Select.Option>
                  <Select.Option value="Grade 5">Grade 5</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="reportType" label="Report Type">
                <Select placeholder="Select report type">
                  <Select.Option value="all">All Reports</Select.Option>
                  <Select.Option value="vaccination">Vaccination</Select.Option>
                  <Select.Option value="health">Health Checkup</Select.Option>
                  <Select.Option value="medication">Medication</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} className="text-right">
              <Button
                type="primary"
                icon={<SearchOutlined />}
                htmlType="submit"
              >
                Generate Report
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card title="Class-wise Statistics">
        <Table
          dataSource={reports.classStats}
          columns={columns}
          rowKey="grade"
        />
      </Card>
    </div>
  );
};

export default Reports;
