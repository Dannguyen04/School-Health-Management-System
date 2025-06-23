import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { useState } from "react";

const AlertsAndEvents = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Mock data for alerts
  const alerts = [
    {
      id: 1,
      type: "Cảnh báo sức khỏe",
      title: "Tăng số ca cúm được báo cáo ở Lớp 9C",
      startDate: "2024-03-18",
      endDate: "2024-03-19",
      status: "Đang diễn ra",
      severity: "Cao",
      source: "Y tá trường học",
      description:
        "Ghi nhận sự gia tăng đột biến về số ca mắc cúm trong học sinh lớp 9C. Cần theo dõi và triển khai các biện pháp phòng ngừa.",
    },
    {
      id: 2,
      type: "Nhắc nhở tiêm chủng",
      title: "Tiêm vắc xin Viêm gan B đến hạn cho Lớp 10A",
      startDate: "2024-03-20",
      endDate: "2024-03-20",
      status: "Đang diễn ra",
      severity: "Trung bình",
      source: "Hệ thống",
      description:
        "Học sinh lớp 10A đến hạn tiêm vắc xin Viêm gan B. Vui lòng kiểm tra hồ sơ tiêm chủng và thông báo cho phụ huynh.",
    },
    {
      id: 3,
      type: "Kiểm tra sức khỏe",
      title: "Lịch kiểm tra sức khỏe định kỳ cho Lớp 8B",
      startDate: "2024-03-25",
      endDate: "2024-03-25",
      status: "Đã kết thúc",
      severity: "Thấp",
      source: "Hệ thống",
      description:
        "Buổi kiểm tra sức khỏe định kỳ hàng năm cho học sinh lớp 8B đã được lên lịch. Vui lòng chuẩn bị đầy đủ hồ sơ và dụng cụ.",
    },
    {
      id: 4,
      type: "Cảnh báo sức khỏe",
      title: "Phát hiện dị ứng thực phẩm ở Lớp 7A",
      startDate: "2024-03-22",
      endDate: "2024-03-22",
      status: "Đang diễn ra",
      severity: "Cao",
      source: "Y tá trường học",
      description:
        "Một học sinh lớp 7A có phản ứng dị ứng nghiêm trọng với đậu phộng. Cần thông báo cho toàn bộ giáo viên và nhân viên nhà trường.",
    },
    {
      id: 5,
      type: "Nhắc nhở tiêm chủng",
      title: "Tiêm vắc xin COVID-19 mũi nhắc lại cho Lớp 11B",
      startDate: "2024-03-28",
      endDate: "2024-03-28",
      status: "Đang diễn ra",
      severity: "Trung bình",
      source: "Hệ thống",
      description:
        "Học sinh lớp 11B đến hạn tiêm mũi nhắc lại vắc xin COVID-19. Vui lòng lên kế hoạch và thông báo cho phụ huynh.",
    },
    {
      id: 6,
      type: "Kiểm tra sức khỏe",
      title: "Khám răng miệng định kỳ cho Lớp 6A",
      startDate: "2024-03-30",
      endDate: "2024-03-30",
      status: "Đang diễn ra",
      severity: "Thấp",
      source: "Hệ thống",
      description:
        "Lịch khám răng miệng định kỳ cho học sinh lớp 6A. Cần chuẩn bị phòng khám và dụng cụ nha khoa.",
    },
  ];

  const columns = [
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag
          color={
            type === "Cảnh báo sức khỏe"
              ? "red"
              : type === "Nhắc nhở tiêm chủng"
              ? "blue"
              : "green"
          }
        >
          {type}
        </Tag>
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Đang diễn ra" ? "green" : "default"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Mức độ nghiêm trọng",
      dataIndex: "severity",
      key: "severity",
      render: (severity) => (
        <Tag
          color={
            severity === "Cao"
              ? "red"
              : severity === "Trung bình"
              ? "orange"
              : "green"
          }
        >
          {severity}
        </Tag>
      ),
    },
    {
      title: "Nguồn",
      dataIndex: "source",
      key: "source",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              type="primary"
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa học sinh"
            description={`Bạn có chắc chắn muốn xóa học sinh "${record.name}"?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Tooltip title="Xóa">
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa ${record.type.toLowerCase()} "${
        record.title
      }"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        console.log("Delete record:", record);
      },
    });
  };

  const handleSubmit = (values) => {
    console.log("Form values:", values);
    setIsModalVisible(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cảnh báo & Sự kiện</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm mới
        </Button>
      </div>

      {/* <Card>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
              >
                <Input placeholder="Nhập tiêu đề" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="type"
                label="Loại"
                rules={[{ required: true, message: "Vui lòng chọn loại" }]}
              >
                <Select placeholder="Chọn loại">
                  <Select.Option value="Cảnh báo sức khỏe">
                    Cảnh báo sức khỏe
                  </Select.Option>
                  <Select.Option value="Nhắc nhở tiêm chủng">
                    Nhắc nhở tiêm chủng
                  </Select.Option>
                  <Select.Option value="Kiểm tra sức khỏe">
                    Kiểm tra sức khỏe
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value="Đang diễn ra">
                    Đang diễn ra
                  </Select.Option>
                  <Select.Option value="Đã kết thúc">Đã kết thúc</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="endDate"
                label="Ngày kết thúc"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày kết thúc" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
              >
                <Input.TextArea rows={4} placeholder="Nhập mô tả" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card> */}

      <Card>
        <Table
          dataSource={alerts}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={
          editingRecord ? "Sửa cảnh báo/sự kiện" : "Thêm cảnh báo/sự kiện mới"
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Nhập tiêu đề" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại"
            rules={[{ required: true, message: "Vui lòng chọn loại" }]}
          >
            <Select placeholder="Chọn loại">
              <Select.Option value="Cảnh báo sức khỏe">
                Cảnh báo sức khỏe
              </Select.Option>
              <Select.Option value="Nhắc nhở tiêm chủng">
                Nhắc nhở tiêm chủng
              </Select.Option>
              <Select.Option value="Kiểm tra sức khỏe">
                Kiểm tra sức khỏe
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="Đang diễn ra">Đang diễn ra</Select.Option>
              <Select.Option value="Đã kết thúc">Đã kết thúc</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả" />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingRecord ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AlertsAndEvents;
