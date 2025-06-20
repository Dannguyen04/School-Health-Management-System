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
      title: "Lớp",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Tổng số học sinh",
      dataIndex: "totalStudents",
      key: "totalStudents",
    },
    {
      title: "Đã tiêm chủng",
      dataIndex: "vaccinated",
      key: "vaccinated",
    },
    {
      title: "Khám sức khỏe",
      dataIndex: "healthCheckups",
      key: "healthCheckups",
    },
    {
      title: "Thuốc",
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
        <h1 className="text-2xl font-bold">Báo cáo & Thống kê</h1>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleExport("pdf")}
          >
            Xuất PDF
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleExport("excel")}
          >
            Xuất Excel
          </Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tiêm chủng tháng"
              value={reports.monthlyStats.vaccinations}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khám sức khỏe tháng"
              value={reports.monthlyStats.healthCheckups}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Thuốc tháng"
              value={reports.monthlyStats.medications}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sự cố tháng"
              value={reports.monthlyStats.incidents}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="dateRange" label="Khoảng thời gian">
                <RangePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="grade" label="Lớp">
                <Select placeholder="Chọn lớp">
                  <Select.Option value="all">Tất cả các lớp</Select.Option>
                  <Select.Option value="Lớp 1">Lớp 1</Select.Option>
                  <Select.Option value="Lớp 2">Lớp 2</Select.Option>
                  <Select.Option value="Lớp 3">Lớp 3</Select.Option>
                  <Select.Option value="Lớp 4">Lớp 4</Select.Option>
                  <Select.Option value="Lớp 5">Lớp 5</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="reportType" label="Loại báo cáo">
                <Select placeholder="Chọn loại báo cáo">
                  <Select.Option value="all">Tất cả báo cáo</Select.Option>
                  <Select.Option value="vaccination">Tiêm chủng</Select.Option>
                  <Select.Option value="health">Khám sức khỏe</Select.Option>
                  <Select.Option value="medication">Thuốc</Select.Option>
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
                Tạo báo cáo
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card title="Thống kê theo lớp">
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
