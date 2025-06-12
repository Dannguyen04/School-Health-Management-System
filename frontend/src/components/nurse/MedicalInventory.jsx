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
      title: "Item Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record) => (
        <span className={text <= record.minStock ? "text-red-500" : ""}>
          {text} {record.unit}
        </span>
      ),
    },
    {
      title: "Minimum Stock",
      dataIndex: "minStock",
      key: "minStock",
      render: (text, record) => `${text} ${record.unit}`,
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
    },
    {
      title: "Actions",
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
      title: "Are you sure you want to delete this item?",
      content: `This will permanently delete ${record.name} from inventory.`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
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
        <h1 className="text-2xl font-bold">Medical Inventory</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Add Item
        </Button>
      </div>

      {lowStockItems.length > 0 && (
        <Alert
          message="Low Stock Alert"
          description={`${lowStockItems.length} items are running low on stock`}
          type="warning"
          showIcon
        />
      )}

      <Card>
        <Table dataSource={medicalInventory} columns={columns} rowKey="id" />
      </Card>

      <Modal
        title={editingItem ? "Edit Item" : "Add New Item"}
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
            label="Item Name"
            rules={[{ required: true, message: "Please enter item name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select>
              <Select.Option value="Pain Relief">Pain Relief</Select.Option>
              <Select.Option value="First Aid">First Aid</Select.Option>
              <Select.Option value="Antibiotics">Antibiotics</Select.Option>
              <Select.Option value="Supplies">Supplies</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: "Please enter quantity" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Unit"
            rules={[{ required: true, message: "Please enter unit" }]}
          >
            <Select>
              <Select.Option value="tablets">Tablets</Select.Option>
              <Select.Option value="bottles">Bottles</Select.Option>
              <Select.Option value="pieces">Pieces</Select.Option>
              <Select.Option value="boxes">Boxes</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="minStock"
            label="Minimum Stock"
            rules={[{ required: true, message: "Please enter minimum stock" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="expiryDate"
            label="Expiry Date"
            rules={[{ required: true, message: "Please select expiry date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicalInventory;
