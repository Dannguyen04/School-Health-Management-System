import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
} from "antd";
import React, { useState } from "react";
import { medicalInventory } from "../../mock/nurseData";

const { TextArea } = Input;

const MedicalInventory = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: "Tên vật tư",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record) => (
        <span className={text <= record.minStock ? "text-red-500" : ""}>
          {text} {record.unit}
        </span>
      ),
    },
    {
      title: "Tồn kho tối thiểu",
      dataIndex: "minStock",
      key: "minStock",
      render: (text, record) => `${text} ${record.unit}`,
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "expiryDate",
      key: "expiryDate",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa vật tư này?",
      content: `Việc này sẽ xóa vĩnh viễn ${record.name} khỏi kho.`,
      okText: "Có",
      okType: "danger",
      cancelText: "Không",
      onOk() {
        console.log("Delete item:", record);
      },
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      console.log("Form values:", values);
      setIsModalVisible(false);
      form.resetFields();
      setEditingItem(null);
    });
  };

  const lowStockItems = medicalInventory.filter(
    (item) => item.quantity <= item.minStock
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý kho y tế</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Thêm vật tư
        </Button>
      </div>

      {lowStockItems.length > 0 && (
        <Alert
          message="Cảnh báo tồn kho thấp"
          description={`${lowStockItems.length} vật tư đang ở mức tồn kho thấp`}
          type="warning"
          showIcon
        />
      )}

      <Card>
        <Table dataSource={medicalInventory} columns={columns} rowKey="id" />
      </Card>

      <Modal
        title={editingItem ? "Sửa vật tư" : "Thêm vật tư mới"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingItem(null);
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên vật tư"
            rules={[{ required: true, message: "Vui lòng nhập tên vật tư" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select>
              <Select.Option value="Thuốc giảm đau">
                Thuốc giảm đau
              </Select.Option>
              <Select.Option value="Sơ cứu">Sơ cứu</Select.Option>
              <Select.Option value="Kháng sinh">Kháng sinh</Select.Option>
              <Select.Option value="Vật tư y tế">Vật tư y tế</Select.Option>
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
              <Select.Option value="viên">Viên</Select.Option>
              <Select.Option value="chai">Chai</Select.Option>
              <Select.Option value="cái">Cái</Select.Option>
              <Select.Option value="hộp">Hộp</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="minStock"
            label="Tồn kho tối thiểu"
            rules={[
              { required: true, message: "Vui lòng nhập tồn kho tối thiểu" },
            ]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="expiryDate"
            label="Hạn sử dụng"
            rules={[{ required: true, message: "Vui lòng chọn hạn sử dụng" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicalInventory;
