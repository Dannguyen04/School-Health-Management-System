import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
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
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";

const { TextArea } = Input;

const HealthCheckupCampaigns = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchForm] = Form.useForm();
  const [campaignForm] = Form.useForm();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allCampaigns, setAllCampaigns] = useState([]);

  const getAuthToken = () => localStorage.getItem("token");
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "blue";
      case "FINISHED":
        return "green";
      case "CANCELLED":
        return "red";
      default:
        return "default";
    }
  };
  const getStatusText = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Đang diễn ra";
      case "FINISHED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // Fetch all campaigns
  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/medical-campaigns", {
        headers: getHeaders(),
      });
      if (res.data.success) {
        const mapped = (res.data.data || []).map((c) => ({
          id: c.id,
          name: c.name,
          targetGrades: c.targetGrades || [],
          scheduledDate: c.scheduledDate,
          deadline: c.deadline,
          status: c.status,
          isActive: c.isActive,
          description: c.description,
          raw: c,
        }));
        setCampaigns(mapped);
        setAllCampaigns(mapped);
      } else {
        message.error(res.data.error || "Không thể tải danh sách chiến dịch");
      }
    } catch {
      message.error("Không thể tải danh sách chiến dịch");
    } finally {
      setLoading(false);
    }
  };

  // Create campaign
  const createCampaign = async (data) => {
    try {
      const res = await axios.post("/api/medical-campaigns", data, {
        headers: getHeaders(),
      });
      if (res.data.success) {
        message.success("Thêm chiến dịch thành công");
        fetchCampaigns();
        return true;
      } else {
        message.error(res.data.error || "Không thể thêm chiến dịch");
        return false;
      }
    } catch (err) {
      // Hiển thị lỗi trả về từ backend nếu có
      const backendMsg = err.response?.data?.error;
      message.error(backendMsg || "Không thể thêm chiến dịch");
      return false;
    }
  };

  // Update campaign
  const updateCampaign = async (id, data) => {
    try {
      const res = await axios.put(`/api/medical-campaigns/${id}`, data, {
        headers: getHeaders(),
      });
      if (res.data.success) {
        message.success("Cập nhật chiến dịch thành công");
        fetchCampaigns();
        return true;
      } else {
        message.error(res.data.error || "Không thể cập nhật chiến dịch");
        return false;
      }
    } catch (err) {
      // Hiển thị lỗi trả về từ backend nếu có
      const backendMsg = err.response?.data?.error;
      message.error(backendMsg || "Không thể cập nhật chiến dịch");
      return false;
    }
  };

  // Delete campaign
  const deleteCampaign = async (id) => {
    try {
      const res = await axios.delete(`/api/medical-campaigns/${id}`, {
        headers: getHeaders(),
      });
      if (res.data.success) {
        message.success("Xóa chiến dịch thành công");
        fetchCampaigns();
        return true;
      } else {
        message.error(res.data.error || "Không thể xóa chiến dịch");
        return false;
      }
    } catch (err) {
      message.error(err.response?.data?.error || "Không thể xóa chiến dịch");
      return false;
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const normalizeString = (str) =>
    str.replace(/\s+/g, " ").trim().toLowerCase();

  // Table columns
  const columns = [
    {
      title: "Tên chiến dịch",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Khối áp dụng",
      dataIndex: "targetGrades",
      key: "targetGrades",
      render: (grades) => (
        <Space>
          {(grades || []).map((g) => (
            <Tag color="geekblue" key={g}>
              {g}
            </Tag>
          ))}
        </Space>
      ),
    },
    // {
    //   title: "Loại khám",
    //   dataIndex: "checkTypes",
    //   key: "checkTypes",
    //   render: (types) => (
    //     <Space>
    //       {(types || []).map((t) => (
    //         <Tag color="purple" key={t}>
    //           {t}
    //         </Tag>
    //       ))}
    //     </Space>
    //   ),
    // },
    {
      title: "Ngày bắt đầu",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : ""),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "deadline",
      key: "deadline",
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : ""),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
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
            title="Xóa chiến dịch"
            description={`Bạn có chắc chắn muốn xóa chiến dịch ${record.name}?`}
            onConfirm={() => deleteCampaign(record.id)}
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

  // Edit
  const handleEdit = (record) => {
    setSelectedCampaign(record);
    campaignForm.setFieldsValue({
      name: record.name,
      description: record.description,
      targetGrades: record.targetGrades,
      status: record.status,
    });
    setIsModalVisible(true);
  };

  // Search
  const handleSearch = (values) => {
    let filtered = allCampaigns;
    if (values.name?.trim()) {
      const searchName = normalizeString(values.name);
      filtered = filtered.filter((c) =>
        normalizeString(c.name).includes(searchName)
      );
    }
    if (values.type) {
      const searchType = normalizeString(values.type);
      filtered = filtered.filter((c) =>
        normalizeString(c.type || "").includes(searchType)
      );
    }
    if (values.status) {
      filtered = filtered.filter((c) => c.status === values.status);
    }
    setCampaigns(filtered);
  };

  // Xóa bộ lọc
  const handleResetFilters = () => {
    searchForm.resetFields();
    setCampaigns(allCampaigns);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chiến dịch khám sức khỏe</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedCampaign(null);
            campaignForm.resetFields();
            setIsModalVisible(true);
          }}
        >
          Thêm chiến dịch
        </Button>
      </div>

      <Card>
        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="name" label="Tên chiến dịch">
                <Input placeholder="Nhập tên chiến dịch" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="type" label="Loại khám">
                <Select placeholder="Chọn loại khám" allowClear>
                  <Select.Option value="Khám tổng quát">
                    Khám tổng quát
                  </Select.Option>
                  <Select.Option value="Khám mắt">Khám mắt</Select.Option>
                  <Select.Option value="Khám răng">Khám răng</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="status" label="Trạng thái">
                <Select placeholder="Chọn trạng thái" allowClear>
                  <Select.Option value="ACTIVE">Đang diễn ra</Select.Option>
                  <Select.Option value="FINISHED">Hoàn thành</Select.Option>
                  <Select.Option value="CANCELLED">Đã hủy</Select.Option>
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
          dataSource={campaigns}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5, showQuickJumper: true }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      <Modal
        title={
          selectedCampaign
            ? "Sửa chiến dịch khám sức khỏe"
            : "Thêm chiến dịch khám sức khỏe"
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          campaignForm.resetFields();
          setSelectedCampaign(null);
        }}
        width={600}
        footer={null}
      >
        <Formik
          initialValues={
            selectedCampaign
              ? {
                  name: selectedCampaign.name,
                  description: selectedCampaign.description,
                  targetGrades: selectedCampaign.targetGrades || [],
                  scheduledDate: selectedCampaign.scheduledDate
                    ? dayjs(selectedCampaign.scheduledDate)
                    : null,
                  deadline: selectedCampaign.deadline
                    ? dayjs(selectedCampaign.deadline)
                    : null,
                  status: selectedCampaign.status,
                }
              : {
                  name: "",
                  description: "",
                  targetGrades: [],
                  scheduledDate: null,
                  deadline: null,
                  status: "ACTIVE",
                }
          }
          enableReinitialize
          validationSchema={Yup.object({
            name: Yup.string().required("Vui lòng nhập tên chiến dịch"),
            description: Yup.string(),
            targetGrades: Yup.array().min(1, "Vui lòng chọn khối áp dụng"),
            scheduledDate: Yup.date().required("Vui lòng chọn ngày bắt đầu"),
            deadline: Yup.date()
              .required("Vui lòng chọn ngày kết thúc")
              .test(
                "is-at-least-7-days",
                "Ngày kết thúc phải cách ngày bắt đầu ít nhất 1 tuần",
                function (value) {
                  const { scheduledDate } = this.parent;
                  if (!scheduledDate || !value) return true;
                  const start = new Date(scheduledDate);
                  const end = new Date(value);
                  return end - start >= 7 * 24 * 60 * 60 * 1000;
                }
              ),
            status: Yup.string().required("Vui lòng chọn trạng thái"),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            let success = false;

            if (selectedCampaign) {
              // Try sending data in a format that works with backend's incorrect Prisma usage
              const updateData = {};
              if (values.name) updateData.name = values.name;
              if (values.description !== undefined)
                updateData.description = values.description;
              if (values.targetGrades)
                updateData.targetGrades = values.targetGrades;
              if (values.status) updateData.status = values.status;

              success = await updateCampaign(selectedCampaign.id, updateData);
            } else {
              // For create, send all required fields
              const data = {
                name: values.name,
                description: values.description,
                targetGrades: values.targetGrades,
                scheduledDate: values.scheduledDate
                  ? typeof values.scheduledDate === "string"
                    ? values.scheduledDate
                    : values.scheduledDate.toISOString()
                  : "",
                deadline: values.deadline
                  ? typeof values.deadline === "string"
                    ? values.deadline
                    : values.deadline.toISOString()
                  : "",
                status: values.status,
              };
              success = await createCampaign(data);
            }

            setSubmitting(false);
            if (success) {
              setIsModalVisible(false);
              campaignForm.resetFields();
              setSelectedCampaign(null);
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
                label="Tên chiến dịch"
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
                  disabled={false}
                />
              </Form.Item>
              <Form.Item
                label="Mô tả"
                help={
                  touched.description && errors.description
                    ? errors.description
                    : undefined
                }
                validateStatus={
                  touched.description && errors.description
                    ? "error"
                    : undefined
                }
              >
                <TextArea
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Form.Item>
              <Form.Item
                label="Khối áp dụng"
                help={
                  touched.targetGrades && errors.targetGrades
                    ? errors.targetGrades
                    : undefined
                }
                validateStatus={
                  touched.targetGrades && errors.targetGrades
                    ? "error"
                    : undefined
                }
              >
                <Select
                  mode="multiple"
                  value={values.targetGrades}
                  onChange={(val) => setFieldValue("targetGrades", val)}
                  onBlur={handleBlur}
                  options={["1", "2", "3", "4", "5"].map((g) => ({
                    label: g,
                    value: g,
                  }))}
                />
              </Form.Item>
              {/* <Form.Item
                label="Loại khám"
                help={
                  touched.checkTypes && errors.checkTypes
                    ? errors.checkTypes
                    : undefined
                }
                validateStatus={
                  touched.checkTypes && errors.checkTypes ? "error" : undefined
                }
              >
                <Select
                  mode="multiple"
                  value={values.checkTypes}
                  onChange={(val) => setFieldValue("checkTypes", val)}
                  onBlur={handleBlur}
                  options={[
                    { label: "Khám tổng quát", value: "Khám tổng quát" },
                    { label: "Khám mắt", value: "Khám mắt" },
                    { label: "Khám răng", value: "Khám răng" },
                  ]}
                  disabled={!!selectedCampaign}
                />
              </Form.Item> */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Ngày bắt đầu"
                    help={
                      touched.scheduledDate && errors.scheduledDate
                        ? errors.scheduledDate
                        : undefined
                    }
                    validateStatus={
                      touched.scheduledDate && errors.scheduledDate
                        ? "error"
                        : undefined
                    }
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      value={
                        values.scheduledDate
                          ? dayjs(values.scheduledDate)
                          : null
                      }
                      onChange={(date) => setFieldValue("scheduledDate", date)}
                      onBlur={handleBlur}
                      disabled={!!selectedCampaign}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Ngày kết thúc"
                    help={
                      touched.deadline && errors.deadline
                        ? errors.deadline
                        : undefined
                    }
                    validateStatus={
                      touched.deadline && errors.deadline ? "error" : undefined
                    }
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      value={values.deadline ? dayjs(values.deadline) : null}
                      onChange={(date) => setFieldValue("deadline", date)}
                      onBlur={handleBlur}
                      disabled={!!selectedCampaign}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                label="Trạng thái"
                help={
                  touched.status && errors.status ? errors.status : undefined
                }
                validateStatus={
                  touched.status && errors.status ? "error" : undefined
                }
              >
                <Select
                  value={values.status}
                  onChange={(val) => setFieldValue("status", val)}
                  onBlur={handleBlur}
                  options={[
                    { label: "Đang diễn ra", value: "ACTIVE" },
                    { label: "Hoàn thành", value: "FINISHED" },
                    { label: "Đã hủy", value: "CANCELLED" },
                  ]}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                  {selectedCampaign ? "Cập nhật" : "Thêm"}
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  onClick={() => {
                    setIsModalVisible(false);
                    campaignForm.resetFields();
                    setSelectedCampaign(null);
                  }}
                >
                  Hủy
                </Button>
              </Form.Item>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default HealthCheckupCampaigns;
