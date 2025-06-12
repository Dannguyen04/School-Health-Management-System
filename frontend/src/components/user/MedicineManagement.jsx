import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const MedicineManagement = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [medicineData, setMedicineData] = useState({
    name: "",
    quantity: null,
    unit: "",
    expiryDate: null,
    supplier: "",
    category: "",
    status: "",
    notes: "",
  });

  // Mock data - replace with actual API data
  const medicines = [
    {
      id: 1,
      name: "Paracetamol",
      quantity: 100,
      unit: "Viên",
      expiryDate: "2024-12-31",
      supplier: "Công ty A",
      category: "Thuốc giảm đau",
      status: "Còn hàng",
      notes: "Thuốc hạ sốt",
    },
    {
      id: 2,
      name: "Vitamin C",
      quantity: 50,
      unit: "Hộp",
      expiryDate: "2024-10-15",
      supplier: "Công ty B",
      category: "Vitamin",
      status: "Sắp hết",
      notes: "Bổ sung vitamin",
    },
  ];

  const handleOpenModal = (medicine = null) => {
    if (medicine) {
      setSelectedMedicine(medicine);
      setMedicineData({
        name: medicine.name,
        quantity: medicine.quantity,
        unit: medicine.unit,
        expiryDate: medicine.expiryDate ? dayjs(medicine.expiryDate) : null,
        supplier: medicine.supplier,
        category: medicine.category,
        status: medicine.status,
        notes: medicine.notes,
      });
    } else {
      setSelectedMedicine(null);
      setMedicineData({
        name: "",
        quantity: null,
        unit: "",
        expiryDate: null,
        supplier: "",
        category: "",
        status: "",
        notes: "",
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedMedicine(null);
    setMedicineData({
      name: "",
      quantity: null,
      unit: "",
      expiryDate: null,
      supplier: "",
      category: "",
      status: "",
      notes: "",
    });
  };

  const handleSubmit = () => {
    // Add API call here to save/update medicine data
    console.log("Submitting medicine data:", medicineData);
    message.success("Thông tin thuốc đã được lưu thành công");
    handleCloseModal();
  };

  const handleDeleteMedicine = (id) => {
    message.success(`Xóa thuốc ${id}`);
    // Add API call to delete medicine
  };

  const getStatusTagColor = (status) => {
    switch (status) {
      case "Còn hàng":
        return "green";
      case "Sắp hết":
        return "orange";
      case "Hết hàng":
        return "red";
      default:
        return "default";
    }
  };

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      title: "Tên thuốc",
      dataIndex: "name",
      key: "name",
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
      title: "Hạn sử dụng",
      dataIndex: "expiryDate",
      key: "expiryDate",
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier",
      key: "supplier",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusTagColor(status)}>{status}</Tag>,
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Thao tác",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            Chỉnh sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteMedicine(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Quản lý thuốc và vật tư y tế</Title>
        <Text type="secondary">
          Theo dõi và quản lý kho thuốc và vật tư y tế
        </Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Input
            placeholder="Tìm kiếm thuốc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<SearchOutlined />}
            size="large"
          />
        </Col>
        <Col xs={24} md={12} style={{ textAlign: "right" }}>
          <Button type="primary" size="large" onClick={() => handleOpenModal()}>
            Thêm mới
          </Button>
        </Col>
      </Row>

      <Card>
        <Table columns={columns} dataSource={filteredMedicines} rowKey="id" />
      </Card>

      <Modal
        title={
          selectedMedicine ? "Chỉnh sửa thông tin thuốc" : "Thêm thuốc mới"
        }
        open={openModal}
        onCancel={handleCloseModal}
        onOk={handleSubmit}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Input
            placeholder="Tên thuốc"
            value={medicineData.name}
            onChange={(e) =>
              setMedicineData({ ...medicineData, name: e.target.value })
            }
          />
          <InputNumber
            placeholder="Số lượng"
            value={medicineData.quantity}
            onChange={(value) =>
              setMedicineData({ ...medicineData, quantity: value })
            }
            style={{ width: "100%" }}
          />
          <Input
            placeholder="Đơn vị"
            value={medicineData.unit}
            onChange={(e) =>
              setMedicineData({ ...medicineData, unit: e.target.value })
            }
          />
          <DatePicker
            placeholder="Hạn sử dụng"
            value={medicineData.expiryDate}
            onChange={(date) =>
              setMedicineData({
                ...medicineData,
                expiryDate: date,
              })
            }
            style={{ width: "100%" }}
          />
          <Input
            placeholder="Nhà cung cấp"
            value={medicineData.supplier}
            onChange={(e) =>
              setMedicineData({ ...medicineData, supplier: e.target.value })
            }
          />
          <Select
            placeholder="Danh mục"
            value={medicineData.category || undefined}
            onChange={(value) =>
              setMedicineData({ ...medicineData, category: value })
            }
            style={{ width: "100%" }}
          >
            <Option value="Thuốc giảm đau">Thuốc giảm đau</Option>
            <Option value="Vitamin">Vitamin</Option>
            <Option value="Kháng sinh">Kháng sinh</Option>
            <Option value="Khác">Khác</Option>
          </Select>
          <Select
            placeholder="Trạng thái"
            value={medicineData.status || undefined}
            onChange={(value) =>
              setMedicineData({ ...medicineData, status: value })
            }
            style={{ width: "100%" }}
          >
            <Option value="Còn hàng">Còn hàng</Option>
            <Option value="Sắp hết">Sắp hết</Option>
            <Option value="Hết hàng">Hết hàng</Option>
          </Select>
          <TextArea
            placeholder="Ghi chú"
            value={medicineData.notes}
            onChange={(e) =>
              setMedicineData({ ...medicineData, notes: e.target.value })
            }
            rows={4}
          />
        </Space>
      </Modal>
    </div>
  );
};

export default MedicineManagement;
