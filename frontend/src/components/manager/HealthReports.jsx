import {
  FileExcelOutlined,
  FilePdfOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Row,
  Select,
  Space,
  Table,
} from "antd";
import React from "react";

const HealthReports = () => {
  const [form] = Form.useForm();

  // Mock data
  const healthReports = [
    {
      grade: "Lớp 1",
      totalStudents: 200,
      vaccinated: 180,
      healthCheckups: 190,
      medications: 15,
    },
    {
      grade: "Lớp 2",
      totalStudents: 220,
      vaccinated: 200,
      healthCheckups: 210,
      medications: 18,
    },
    {
      grade: "Lớp 3",
      totalStudents: 210,
      vaccinated: 190,
      healthCheckups: 200,
      medications: 12,
    },
    {
      grade: "Lớp 4",
      totalStudents: 230,
      vaccinated: 210,
      healthCheckups: 220,
      medications: 20,
    },
    {
      grade: "Lớp 5",
      totalStudents: 240,
      vaccinated: 220,
      healthCheckups: 230,
      medications: 25,
    },
  ];

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

  const handleExportPDF = () => {
    console.log("Export PDF");
  };

  const handleExportExcel = () => {
    console.log("Export Excel");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Báo cáo sức khỏe</h1>
        <Space>
          <Button icon={<FilePdfOutlined />} onClick={handleExportPDF}>
            Xuất PDF
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>
            Xuất Excel
          </Button>
        </Space>
      </div>

      <Card>
        <Form form={form} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="dateRange" label="Khoảng thời gian">
                <DatePicker.RangePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="grade" label="Lớp">
                <Select placeholder="Chọn lớp">
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
                  <Select.Option value="vaccination">Tiêm chủng</Select.Option>
                  <Select.Option value="healthCheckup">
                    Khám sức khỏe
                  </Select.Option>
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
          dataSource={healthReports}
          columns={columns}
          rowKey="grade"
          pagination={false}
        />
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="Tiêm chủng tháng">
            <div className="h-64 flex items-center justify-center text-gray-500">
              Biểu đồ tiêm chủng tháng
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Khám sức khỏe tháng">
            <div className="h-64 flex items-center justify-center text-gray-500">
              Biểu đồ khám sức khỏe tháng
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="Thuốc tháng">
            <div className="h-64 flex items-center justify-center text-gray-500">
              Biểu đồ thuốc tháng
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Sự cố tháng">
            <div className="h-64 flex items-center justify-center text-gray-500">
              Biểu đồ sự cố tháng
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HealthReports;
