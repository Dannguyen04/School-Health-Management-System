import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import React, { useState } from "react";

const { Option } = Select;

const MedicalSupplies = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState(null);

  const columns = [
    {
      title: "Mã vật tư",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên vật tư",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          Đủ: "green",
          "Cần bổ sung": "orange",
          "Hết hàng": "red",
        };
        return (
          <Tag color={colors[status]}>
            {status}
            {status !== "Đủ" && <WarningOutlined style={{ marginLeft: 8 }} />}
          </Tag>
        );
      },
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
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: "1",
      id: "VT001",
      name: "Bông y tế",
      type: "Vật tư tiêu hao",
      quantity: 50,
      unit: "Hộp",
      status: "Đủ",
    },
    {
      key: "2",
      id: "VT002",
      name: "Thuốc hạ sốt",
      type: "Thuốc",
      quantity: 5,
      unit: "Hộp",
      status: "Cần bổ sung",
    },
    {
      key: "3",
      id: "VT003",
      name: "Băng keo y tế",
      type: "Vật tư tiêu hao",
      quantity: 0,
      unit: "Cuộn",
      status: "Hết hàng",
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
    message.success("Đã xóa vật tư y tế");
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
        title="Quản lý thuốc và vật tư y tế"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm vật tư
          </Button>
        }
      >
        <Table columns={columns} dataSource={data} />
      </Card>

      <Modal
        title={editingRecord ? "Sửa vật tư y tế" : "Thêm vật tư y tế mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="id"
            label="Mã vật tư"
            rules={[{ required: true, message: "Vui lòng nhập mã vật tư" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên vật tư"
            rules={[{ required: true, message: "Vui lòng nhập tên vật tư" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại"
            rules={[{ required: true, message: "Vui lòng chọn loại" }]}
          >
            <Select>
              <Option value="Thuốc">Thuốc</Option>
              <Option value="Vật tư tiêu hao">Vật tư tiêu hao</Option>
              <Option value="Dụng cụ y tế">Dụng cụ y tế</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Đơn vị"
            rules={[{ required: true, message: "Vui lòng chọn đơn vị" }]}
          >
            <Select>
              <Option value="Hộp">Hộp</Option>
              <Option value="Cuộn">Cuộn</Option>
              <Option value="Cái">Cái</Option>
              <Option value="Viên">Viên</Option>
              <Option value="Chai">Chai</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Option value="Đủ">Đủ</Option>
              <Option value="Cần bổ sung">Cần bổ sung</Option>
              <Option value="Hết hàng">Hết hàng</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicalSupplies;
