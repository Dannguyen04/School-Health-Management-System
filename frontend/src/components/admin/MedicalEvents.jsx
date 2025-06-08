import {
  BellOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import { useState } from "react";

const { Option } = Select;
const { TextArea } = Input;

const MedicalEvents = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState(null);

  const columns = [
    {
      title: "Mã sự kiện",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Học sinh",
      dataIndex: "student",
      key: "student",
    },
    {
      title: "Loại sự kiện",
      dataIndex: "eventType",
      key: "eventType",
      render: (type) => {
        const colors = {
          "Tai nạn": "red",
          Sốt: "orange",
          "Té ngã": "blue",
          Khác: "default",
        };
        return <Tag color={colors[type]}>{type}</Tag>;
      },
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          "Đã xử lý": "green",
          "Đang xử lý": "processing",
          "Chưa xử lý": "default",
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: "Theo dõi sau sự kiện",
      dataIndex: "followUp",
      key: "followUp",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
          <Button
            type="default"
            icon={<BellOutlined />}
            onClick={() => handleNotify(record)}
          >
            Thông báo
          </Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: "1",
      id: "ME001",
      student: "Nguyễn Văn A",
      eventType: "Tai nạn",
      time: "2024-03-20 09:30",
      status: "Đã xử lý",
      description: "Té ngã trong giờ ra chơi",
      action: "Đã sơ cứu và thông báo cho phụ huynh",
      followUp: "Theo dõi 3 ngày, không có biến chứng",
    },
    {
      key: "2",
      id: "ME002",
      student: "Trần Thị B",
      eventType: "Sốt",
      time: "2024-03-20 10:15",
      status: "Đang xử lý",
      description: "Sốt cao 39 độ",
      action: "Đang theo dõi và cho uống thuốc hạ sốt",
      followUp: "Đã hạ sốt, tiếp tục theo dõi tại nhà",
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
    console.log("Deleting record:", record);
    message.success("Đã xóa sự kiện y tế");
  };

  const handleNotify = (record) => {
    console.log("Notifying for record:", record);
    message.success("Đã gửi thông báo đến phụ huynh");
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      console.log("Form values:", values);
      setIsModalVisible(false);
      message.success(
        editingRecord ? "Cập nhật thành công" : "Thêm mới thành công"
      );
    });
  };

  return (
    <div>
      <Card
        title="Quản lý sự kiện y tế"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm sự kiện
          </Button>
        }
      >
        <Table columns={columns} dataSource={data} />
      </Card>

      <Modal
        title={editingRecord ? "Sửa sự kiện y tế" : "Thêm sự kiện y tế mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="id"
            label="Mã sự kiện"
            rules={[{ required: true, message: "Vui lòng nhập mã sự kiện" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="student"
            label="Học sinh"
            rules={[{ required: true, message: "Vui lòng chọn học sinh" }]}
          >
            <Select>
              <Option value="Nguyễn Văn A">Nguyễn Văn A</Option>
              <Option value="Trần Thị B">Trần Thị B</Option>
              <Option value="Lê Văn C">Lê Văn C</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="eventType"
            label="Loại sự kiện"
            rules={[{ required: true, message: "Vui lòng chọn loại sự kiện" }]}
          >
            <Select>
              <Option value="Tai nạn">Tai nạn</Option>
              <Option value="Sốt">Sốt</Option>
              <Option value="Té ngã">Té ngã</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="time"
            label="Thời gian"
            rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Option value="Chưa xử lý">Chưa xử lý</Option>
              <Option value="Đang xử lý">Đang xử lý</Option>
              <Option value="Đã xử lý">Đã xử lý</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item name="action" label="Hành động đã thực hiện">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item name="followUp" label="Theo dõi sau sự kiện">
            <TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicalEvents;
