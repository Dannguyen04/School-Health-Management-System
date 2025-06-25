import { DeleteOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  message,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";

const mockConfirmedMedicines = [
  {
    id: 1,
    studentName: "Nguyễn Văn A",
    class: "3A",
    medicineName: "Paracetamol",
    dosage: "500mg",
    frequency: "2 lần/ngày",
    instructions: "Uống sau ăn",
    startDate: "2024-06-01",
    endDate: "2024-06-05",
    quantity: 10,
    unit: "viên",
    parentNote: "Bé bị sốt nhẹ, mong cô cho uống đúng giờ.",
  },
  {
    id: 2,
    studentName: "Trần Thị B",
    class: "4B",
    medicineName: "Amoxicillin",
    dosage: "250mg",
    frequency: "3 lần/ngày",
    instructions: "Uống trước ăn 30 phút",
    startDate: "2024-06-02",
    endDate: "2024-06-07",
    quantity: 15,
    unit: "viên",
    parentNote: "Bé bị viêm họng, đã đi khám bác sĩ.",
  },
];

const statusColor = {
  ACTIVE: "green",
  COMPLETED: "blue",
};

const statusLabel = {
  ACTIVE: "Đang điều trị",
  COMPLETED: "Đã hoàn thành",
};

const MedicalInventory = () => {
  const [data, setData] = useState(mockConfirmedMedicines);
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchForm] = Form.useForm();

  const handleView = (record) => {
    setSelected(record);
    setModalVisible(true);
  };

  const handleDelete = (record) => {
    setData((prev) => prev.filter((item) => item.id !== record.id));
    message.success(`Đã xóa thuốc cho học sinh ${record.studentName}`);
  };

  const handleSearch = (values) => {
    let filtered = mockConfirmedMedicines;
    if (values.studentName) {
      filtered = filtered.filter((item) =>
        item.studentName
          .toLowerCase()
          .includes(values.studentName.trim().toLowerCase())
      );
    }
    if (values.medicineName) {
      filtered = filtered.filter((item) =>
        item.medicineName
          .toLowerCase()
          .includes(values.medicineName.trim().toLowerCase())
      );
    }
    if (values.status) {
      filtered = filtered.filter((item) => item.status === values.status);
    }
    setData(filtered);
  };

  const handleResetFilters = () => {
    searchForm.resetFields();
    setData(mockConfirmedMedicines);
  };

  const columns = [
    {
      title: "Học sinh",
      dataIndex: "studentName",
      key: "studentName",
      render: (text, record) => (
        <span>
          {text} <span className="text-gray-400">({record.class})</span>
        </span>
      ),
    },
    {
      title: "Tên thuốc",
      dataIndex: "medicineName",
      key: "medicineName",
    },
    {
      title: "Liều lượng",
      dataIndex: "dosage",
      key: "dosage",
    },
    {
      title: "Tần suất",
      dataIndex: "frequency",
      key: "frequency",
    },
    {
      title: "Hướng dẫn",
      dataIndex: "instructions",
      key: "instructions",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record) => `${text} ${record.unit}`,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          ></Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa thuốc này?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button size="small" danger icon={<DeleteOutlined />}></Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý thuốc đã xác nhận</h1>
      </div>

      <Card>
        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="studentName" label="Tên học sinh">
                <Input placeholder="Nhập tên học sinh" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="medicineName" label="Tên thuốc">
                <Input placeholder="Nhập tên thuốc" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="status" label="Trạng thái">
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value="ACTIVE">Đang điều trị</Select.Option>
                  <Select.Option value="COMPLETED">Đã hoàn thành</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} className="text-right">
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  htmlType="submit"
                >
                  Tìm kiếm
                </Button>
                <Button onClick={handleResetFilters}>Xóa bộ lọc</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
      <Modal
        title="Chi tiết thuốc đã xác nhận"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={<Button onClick={() => setModalVisible(false)}>Đóng</Button>}
      >
        {selected && (
          <div className="space-y-2">
            <div>
              <b>Học sinh:</b> {selected.studentName} ({selected.class})
            </div>
            <div>
              <b>Tên thuốc:</b> {selected.medicineName}
            </div>
            <div>
              <b>Liều lượng:</b> {selected.dosage}
            </div>
            <div>
              <b>Tần suất:</b> {selected.frequency}
            </div>
            <div>
              <b>Hướng dẫn:</b> {selected.instructions}
            </div>
            <div>
              <b>Ngày bắt đầu:</b>{" "}
              {dayjs(selected.startDate).format("DD/MM/YYYY")}
            </div>
            <div>
              <b>Ngày kết thúc:</b>{" "}
              {dayjs(selected.endDate).format("DD/MM/YYYY")}
            </div>
            <div>
              <b>Số lượng:</b> {selected.quantity} {selected.unit}
            </div>
            <div>
              <b>Ghi chú phụ huynh:</b> {selected.parentNote}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicalInventory;
