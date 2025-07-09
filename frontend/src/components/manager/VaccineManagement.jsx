import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import axios from "axios";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";

const { TextArea } = Input;

const VaccineManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchForm] = Form.useForm();
  const [vaccineForm] = Form.useForm();
  const [filteredVaccines, setFilteredVaccines] = useState([]);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: "",
  });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // API headers
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  });

  // Fetch all vaccines
  const fetchVaccines = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/manager/vaccination", {
        headers: getHeaders(),
      });
      if (response.data.success) {
        setVaccines(response.data.data || []);
        setFilteredVaccines(response.data.data || []);
      } else {
        message.error(response.data.error || "Không thể tải danh sách vaccine");
      }
    } catch (error) {
      console.error("Error fetching vaccines:", error);
      message.error("Không thể tải danh sách vaccine");
    } finally {
      setLoading(false);
    }
  };

  // Create vaccine
  const createVaccine = async (data) => {
    try {
      const response = await axios.post("/api/manager/vaccination", data, {
        headers: getHeaders(),
      });
      if (response.data.success) {
        message.success("Thêm vaccine thành công");
        fetchVaccines();
        return true;
      } else {
        message.error(response.data.error || "Không thể thêm vaccine");
        return false;
      }
    } catch (error) {
      console.error("Error creating vaccine:", error);
      message.error(error.response?.data?.error || "Không thể thêm vaccine");
      return false;
    }
  };

  // Update vaccine
  const updateVaccine = async (id, data) => {
    try {
      const response = await axios.put(`/api/manager/vaccination/${id}`, data, {
        headers: getHeaders(),
      });
      if (response.data.success) {
        message.success("Cập nhật vaccine thành công");
        fetchVaccines();
        return true;
      } else {
        message.error(response.data.error || "Không thể cập nhật vaccine");
        return false;
      }
    } catch (error) {
      console.error("Error updating vaccine:", error);
      message.error(
        error.response?.data?.error || "Không thể cập nhật vaccine"
      );
      return false;
    }
  };

  // Delete vaccine
  const deleteVaccine = async (id) => {
    try {
      const response = await axios.delete(`/api/manager/vaccination/${id}`, {
        headers: getHeaders(),
      });
      if (response.data.success) {
        message.success("Xóa vaccine thành công");
        fetchVaccines();
        return true;
      } else {
        setErrorModal({
          visible: true,
          message: response.data.error || "Không thể xóa vaccine",
        });
        return false;
      }
    } catch (error) {
      console.error("Error deleting vaccine:", error);
      setErrorModal({
        visible: true,
        message: error.response?.data?.error || "Không thể xóa vaccine",
      });
      return false;
    }
  };

  // Load vaccines on component mount
  useEffect(() => {
    fetchVaccines();
  }, []);

  // Đảm bảo khi vaccines thay đổi (fetch lại), filteredVaccines cũng cập nhật
  useEffect(() => {
    setFilteredVaccines(vaccines);
  }, [vaccines]);

  const columns = [
    {
      title: "Tên vaccine",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Yêu cầu",
      dataIndex: "requirement",
      key: "requirement",
      render: (requirement) => (
        <Tag color={requirement === "REQUIRED" ? "red" : "blue"}>
          {requirement === "REQUIRED" ? "Bắt buộc" : "Tùy chọn"}
        </Tag>
      ),
    },
    {
      title: "Nhà sản xuất",
      dataIndex: "manufacturer",
      key: "manufacturer",
    },
    {
      title: "Nguồn gốc",
      dataIndex: "origin",
      key: "origin",
    },
    {
      title: "Tác dụng phụ",
      dataIndex: "sideEffects",
      key: "sideEffects",
      render: (sideEffects) =>
        sideEffects && sideEffects.length > 50 ? (
          <Tooltip
            title={
              <div
                style={{
                  maxWidth: 350,
                  maxHeight: 200,
                  overflow: "auto",
                  whiteSpace: "pre-line",
                }}
              >
                {sideEffects}
              </div>
            }
          >
            {sideEffects.slice(0, 50)}...{" "}
            <span style={{ color: "#1677ff", cursor: "pointer" }}>
              (Xem thêm)
            </span>
          </Tooltip>
        ) : (
          sideEffects || "Không có"
        ),
    },
    {
      title: "Chống chỉ định",
      dataIndex: "contraindications",
      key: "contraindications",
      render: (contraindications) =>
        contraindications && contraindications.length > 50 ? (
          <Tooltip
            title={
              <div
                style={{
                  maxWidth: 350,
                  maxHeight: 200,
                  overflow: "auto",
                  whiteSpace: "pre-line",
                }}
              >
                {contraindications}
              </div>
            }
          >
            {contraindications.slice(0, 50)}...{" "}
            <span style={{ color: "#1677ff", cursor: "pointer" }}>
              (Xem thêm)
            </span>
          </Tooltip>
        ) : (
          contraindications || "Không có"
        ),
    },
    {
      title: "Độ tuổi khuyến nghị",
      dataIndex: "recommendedAge",
      key: "recommendedAge",
      render: (recommendedAge) => recommendedAge || "Không có",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (description) =>
        description && description.length > 50 ? (
          <Tooltip
            title={
              <div
                style={{
                  maxWidth: 350,
                  maxHeight: 200,
                  overflow: "auto",
                  whiteSpace: "pre-line",
                }}
              >
                {description}
              </div>
            }
          >
            {description.slice(0, 50)}...{" "}
            <span style={{ color: "#1677ff", cursor: "pointer" }}>
              (Xem thêm)
            </span>
          </Tooltip>
        ) : (
          description || "Không có"
        ),
    },
    {
      title: "Tham khảo",
      dataIndex: "referenceUrl",
      key: "referenceUrl",
      render: (url) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            Link
          </a>
        ) : (
          "Không có"
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          ></Button>
          <Popconfirm
            title="Xóa vaccine"
            description={`Bạn có chắc chắn muốn xóa vaccine ${record.name}?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button danger icon={<DeleteOutlined />}></Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    setSelectedVaccine(record);
    vaccineForm.setFieldsValue({
      ...record,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    await deleteVaccine(id);
  };

  const handleSearch = (values) => {
    const { name, requirement } = values;
    let filtered = vaccines;
    if (name) {
      filtered = filtered.filter((v) =>
        v.name?.trim().toLowerCase().includes(name.trim().toLowerCase())
      );
    }
    if (requirement) {
      filtered = filtered.filter((v) => v.requirement === requirement);
    }
    setFilteredVaccines(filtered);
  };

  // Xóa bộ lọc
  const handleResetFilters = () => {
    searchForm.resetFields();
    setFilteredVaccines(vaccines);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    vaccineForm.resetFields();
    setSelectedVaccine(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý vaccine</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Thêm vaccine
        </Button>
      </div>

      <Card>
        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="name" label="Tên vaccine">
                <Input placeholder="Nhập tên vaccine" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="requirement" label="Yêu cầu">
                <Select placeholder="Chọn yêu cầu">
                  <Select.Option value="REQUIRED">Bắt buộc</Select.Option>
                  <Select.Option value="OPTIONAL">Tùy chọn</Select.Option>
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
          dataSource={filteredVaccines}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 5,
            showQuickJumper: true,
          }}
        />
      </Card>

      <Modal
        title={selectedVaccine ? "Sửa vaccine" : "Thêm vaccine"}
        open={isModalVisible}
        onCancel={handleModalCancel}
        width={600}
        footer={null}
      >
        <Formik
          initialValues={
            selectedVaccine
              ? {
                  name: selectedVaccine.name,
                  requirement: selectedVaccine.requirement,
                  manufacturer: selectedVaccine.manufacturer || "",
                  origin: selectedVaccine.origin || "",
                  referenceUrl: selectedVaccine.referenceUrl || "",
                  description: selectedVaccine.description || "",
                  sideEffects: selectedVaccine.sideEffects || "",
                  contraindications: selectedVaccine.contraindications || "",
                  recommendedAge: selectedVaccine.recommendedAge || "",
                }
              : {
                  name: "",
                  requirement: "",
                  manufacturer: "",
                  origin: "",
                  referenceUrl: "",
                  description: "",
                  sideEffects: "",
                  contraindications: "",
                  recommendedAge: "",
                }
          }
          enableReinitialize
          validationSchema={Yup.object({
            name: Yup.string().required("Vui lòng nhập tên vaccine"),
            requirement: Yup.string().required("Vui lòng chọn yêu cầu"),
            manufacturer: Yup.string().required("Vui lòng nhập nhà sản xuất"),
            origin: Yup.string().required("Vui lòng nhập nguồn gốc"),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            const data = {
              name: values.name,
              requirement: values.requirement,
              manufacturer: values.manufacturer,
              origin: values.origin,
              referenceUrl: values.referenceUrl || undefined,
              description: values.description || undefined,
              sideEffects: values.sideEffects || undefined,
              contraindications: values.contraindications || undefined,
              recommendedAge: values.recommendedAge || undefined,
            };
            let success = false;
            if (selectedVaccine) {
              success = await updateVaccine(selectedVaccine.id, data);
            } else {
              success = await createVaccine(data);
            }
            setSubmitting(false);
            if (success) {
              setIsModalVisible(false);
              vaccineForm.resetFields && vaccineForm.resetFields();
              setSelectedVaccine(null);
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            isSubmitting,
          }) => (
            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="Tên vaccine"
                help={touched.name && errors.name ? errors.name : undefined}
                validateStatus={
                  touched.name && errors.name ? "error" : undefined
                }
              >
                <Input
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Form.Item>
              <Form.Item
                label="Yêu cầu"
                help={
                  touched.requirement && errors.requirement
                    ? errors.requirement
                    : undefined
                }
                validateStatus={
                  touched.requirement && errors.requirement
                    ? "error"
                    : undefined
                }
              >
                <Select
                  value={values.requirement}
                  onChange={(val) => setFieldValue("requirement", val)}
                  onBlur={handleBlur}
                  placeholder="Chọn yêu cầu"
                >
                  <Select.Option value="REQUIRED">Bắt buộc</Select.Option>
                  <Select.Option value="OPTIONAL">Tùy chọn</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Nhà sản xuất"
                help={
                  touched.manufacturer && errors.manufacturer
                    ? errors.manufacturer
                    : undefined
                }
                validateStatus={
                  touched.manufacturer && errors.manufacturer
                    ? "error"
                    : undefined
                }
              >
                <Input
                  name="manufacturer"
                  value={values.manufacturer}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Form.Item>
              <Form.Item
                label="Nguồn gốc"
                help={
                  touched.origin && errors.origin ? errors.origin : undefined
                }
                validateStatus={
                  touched.origin && errors.origin ? "error" : undefined
                }
              >
                <Input
                  name="origin"
                  value={values.origin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Form.Item>
              <Form.Item label="Đường dẫn tham khảo">
                <Input
                  name="referenceUrl"
                  value={values.referenceUrl}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập link tham khảo (nếu có)"
                />
              </Form.Item>
              <Form.Item label="Mô tả">
                <TextArea
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={2}
                  placeholder="Nhập mô tả (nếu có)"
                />
              </Form.Item>
              <Form.Item label="Tác dụng phụ">
                <TextArea
                  name="sideEffects"
                  value={values.sideEffects}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={2}
                  placeholder="Nhập tác dụng phụ (nếu có)"
                />
              </Form.Item>
              <Form.Item label="Chống chỉ định">
                <TextArea
                  name="contraindications"
                  value={values.contraindications}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={2}
                  placeholder="Nhập chống chỉ định (nếu có)"
                />
              </Form.Item>
              <Form.Item label="Độ tuổi khuyến nghị">
                <Input
                  name="recommendedAge"
                  value={values.recommendedAge}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập độ tuổi khuyến nghị (nếu có)"
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                  {selectedVaccine ? "Cập nhật" : "Thêm"}
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={handleModalCancel}>
                  Hủy
                </Button>
              </Form.Item>
            </Form>
          )}
        </Formik>
      </Modal>

      {errorModal.visible && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setErrorModal({ visible: false, message: "" })}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                color: "#ff4d4f",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ExclamationCircleOutlined style={{ marginRight: 8 }} />
              Lỗi xóa vaccine
            </h3>
            <p style={{ marginBottom: "16px" }}>{errorModal.message}</p>
            <Button
              type="primary"
              danger
              onClick={() => setErrorModal({ visible: false, message: "" })}
            >
              Đóng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccineManagement;
