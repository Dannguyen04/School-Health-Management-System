import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
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
  Tooltip,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";

const { TextArea } = Input;

const VaccinationCampaigns = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchForm] = Form.useForm();
  const [consentModal, setConsentModal] = useState({
    visible: false,
    campaign: null,
  });
  const [consentListModal, setConsentListModal] = useState({
    visible: false,
    campaign: null,
    consents: [],
  });
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [allGrades, setAllGrades] = useState([]);
  const [consentLoading, setConsentLoading] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // API headers
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  });

  // Fetch all vaccinations for dropdown
  const fetchVaccinations = async () => {
    try {
      const response = await axios.get(
        "/api/manager/vaccination-campaigns/vaccines",
        {
          headers: getHeaders(),
        }
      );
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log(response.data.data);

        setVaccinations(response.data.data);
      } else {
        setVaccinations([]);
      }
    } catch (error) {
      console.error("Error fetching vaccinations:", error);
      setVaccinations([]);
    }
  };

  // Fetch campaigns
  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/manager/vaccination-campaigns", {
        headers: getHeaders(),
      });
      if (response.data.success) {
        console.log(response.data.data);
        setAllCampaigns(response.data.data || []);
        setCampaigns(response.data.data || []);
      } else {
        message.error(
          response.data.error || "Không thể tải danh sách chiến dịch"
        );
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      message.error("Không thể tải danh sách chiến dịch");
    } finally {
      setLoading(false);
    }
  };

  // Create campaign
  const createCampaign = async (data) => {
    try {
      const response = await axios.post(
        "/api/manager/vaccination-campaigns",
        data,
        {
          headers: getHeaders(),
        }
      );
      if (response.data.success) {
        message.success("Thêm chiến dịch thành công");
        fetchCampaigns();
        return true;
      } else {
        message.error(response.data.error || "Không thể thêm chiến dịch");
        return false;
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      message.error(error.response?.data?.error || "Không thể thêm chiến dịch");
      return false;
    }
  };

  // Update campaign
  const updateCampaign = async (id, data) => {
    try {
      const response = await axios.put(
        `/api/manager/vaccination-campaigns/${id}`,
        data,
        {
          headers: getHeaders(),
        }
      );
      if (response.data.success) {
        message.success("Cập nhật chiến dịch thành công");
        fetchCampaigns();
        return true;
      } else {
        message.error(response.data.error || "Không thể cập nhật chiến dịch");
        return false;
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
      message.error(
        error.response?.data?.error || "Không thể cập nhật chiến dịch"
      );
      return false;
    }
  };

  // Delete campaign
  const deleteCampaign = async (id) => {
    try {
      const response = await axios.delete(
        `/api/manager/vaccination-campaigns/${id}`,
        {
          headers: getHeaders(),
        }
      );
      if (response.data.success) {
        message.success("Xóa chiến dịch thành công");
        fetchCampaigns();
        return true;
      } else {
        message.error(response.data.error || "Không thể xóa chiến dịch");
        return false;
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
      message.error(error.response?.data?.error || "Không thể xóa chiến dịch");
      return false;
    }
  };

  const handleSendConsentClick = async (campaign) => {
    setConsentModal({ visible: true, campaign });
    // Fetch all grades with student count when opening modal
    try {
      const res = await axios.get("/api/manager/students/grades-with-count", {
        headers: getHeaders(),
      });
      if (res.data.success && Array.isArray(res.data.data)) {
        setAllGrades(res.data.data);
        // Mặc định chọn các khối có trong campaign.targetGrades nếu có, nếu không chọn hết
        const defaultGrades =
          Array.isArray(campaign.targetGrades) &&
          campaign.targetGrades.length > 0
            ? campaign.targetGrades
            : res.data.data.map((g) => g.grade);
        setSelectedGrades(defaultGrades);
      } else {
        setAllGrades([]);
        setSelectedGrades([]);
      }
    } catch (err) {
      setAllGrades([]);
      setSelectedGrades([]);
    }
  };

  const handleConsentModalOk = async () => {
    if (!consentModal.campaign) return;
    setConsentLoading(true);
    await sendConsent(consentModal.campaign.id, selectedGrades);
    setConsentLoading(false);
    setConsentModal({ visible: false, campaign: null });
  };

  const handleConsentModalCancel = () => {
    setConsentModal({ visible: false, campaign: null });
  };

  const handleGradeChange = (checkedValues) => {
    setSelectedGrades(checkedValues);
  };

  const sendConsent = async (campaignId, grades) => {
    try {
      const response = await axios.post(
        `/api/manager/vaccination-campaigns/${campaignId}/send-consent`,
        { grades },
        { headers: getHeaders() }
      );
      if (response.data.success) {
        message.success(
          response.data.message || "Đã gửi phiếu đồng ý thành công"
        );
      } else {
        message.error(response.data.error || "Không thể gửi phiếu đồng ý");
      }
    } catch (error) {
      message.error(
        error.response?.data?.error || "Không thể gửi phiếu đồng ý"
      );
    }
  };

  const handleViewConsents = async (campaign) => {
    try {
      const response = await axios.get(
        `/api/manager/vaccination-campaigns/${campaign.id}/consents`,
        { headers: getHeaders() }
      );
      if (response.data.success) {
        setConsentListModal({
          visible: true,
          campaign: response.data.data.campaign,
          consents: response.data.data.consents,
        });
      } else {
        message.error(
          response.data.error || "Không thể tải danh sách phiếu đồng ý"
        );
      }
    } catch (error) {
      message.error(
        error.response?.data?.error || "Không thể tải danh sách phiếu đồng ý"
      );
    }
  };

  const handleConsentListModalCancel = () => {
    setConsentListModal({ visible: false, campaign: null, consents: [] });
  };

  // Load data on component mount
  useEffect(() => {
    const fetchAll = async () => {
      await fetchVaccinations();
      await fetchCampaigns();
    };
    fetchAll();
  }, []);

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

  const columns = [
    {
      title: "Tên chiến dịch",
      dataIndex: "name",
      key: "name",
      width: 220,
      ellipsis: { showTitle: false },
      render: (name) => (
        <Tooltip placement="topLeft" title={name}>
          {name}
        </Tooltip>
      ),
    },
    {
      title: "Khối áp dụng",
      dataIndex: "targetGrades",
      key: "targetGrades",
      render: (grades) => {
        const sorted = (grades || [])
          .slice()
          .sort((a, b) => Number(a) - Number(b));
        return (
          <Space>
            {sorted.map((g) => (
              <Tag color="geekblue" key={g}>
                {g}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "Loại vaccine",
      dataIndex: ["vaccinations", "name"],
      key: "vaccinationName",
      width: 120,
      align: "center",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      width: 120,
      align: "center",
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "deadline",
      key: "deadline",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      width: 120,
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      width: 110,
      align: "center",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
      ellipsis: { showTitle: false },
      render: (description) => (
        <Tooltip placement="topLeft" title={description || "Không có"}>
          {description || "Không có"}
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 240,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          ></Button>
          <Popconfirm
            title="Xóa chiến dịch"
            description={`Bạn có chắc chắn muốn xóa chiến dịch ${record.name}?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button danger icon={<DeleteOutlined />}></Button>
          </Popconfirm>
          <Button
            icon={<SendOutlined />}
            onClick={() => handleSendConsentClick(record)}
            type="default"
          >
            Gửi phiếu đồng ý
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewConsents(record)}
            type="default"
          >
            Xem phiếu đồng ý
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    setSelectedCampaign(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    await deleteCampaign(id);
  };

  const handleSearch = (values) => {
    let filtered = allCampaigns;
    if (values.name?.trim()) {
      filtered = filtered.filter((c) =>
        c.name.trim().toLowerCase().includes(values.name.trim().toLowerCase())
      );
    }
    if (values.vaccinationName) {
      filtered = filtered.filter(
        (c) => c.vaccination?.name === values.vaccinationName
      );
    }
    if (values.status) {
      filtered = filtered.filter((c) => c.status === values.status);
    }
    setCampaigns(filtered);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setCampaigns(allCampaigns);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedCampaign(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chiến dịch tiêm chủng</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
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
              <Form.Item name="vaccinationName" label="Loại vaccine">
                <Select placeholder="Chọn loại vaccine">
                  {vaccinations.map((vaccination) => (
                    <Select.Option
                      key={vaccination.id}
                      value={vaccination.name}
                    >
                      {vaccination.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="status" label="Trạng thái">
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value="ACTIVE">Đang diễn ra</Select.Option>
                  <Select.Option value="FINISHED">Hoàn thành</Select.Option>
                  <Select.Option value="CANCELLED">Đã hủy</Select.Option>
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
                style={{ marginRight: 8 }}
              >
                Tìm kiếm
              </Button>
              <Button onClick={handleReset}>Xóa bộ lọc</Button>
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
          pagination={{
            pageSize: 5,
            showQuickJumper: true,
          }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      <Modal
        title={
          selectedCampaign
            ? "Sửa chiến dịch tiêm chủng"
            : "Thêm chiến dịch tiêm chủng"
        }
        open={isModalVisible}
        onCancel={handleModalCancel}
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
                  vaccinationName: selectedCampaign.vaccination?.name || "",
                  startDate: selectedCampaign.scheduledDate
                    ? dayjs(selectedCampaign.scheduledDate)
                    : null,
                  endDate: selectedCampaign.deadline
                    ? dayjs(selectedCampaign.deadline)
                    : null,
                  status: selectedCampaign.status,
                }
              : {
                  name: "",
                  description: "",
                  vaccinationName: "",
                  targetGrades: [],
                  startDate: null,
                  endDate: null,
                }
          }
          enableReinitialize
          validationSchema={Yup.object({
            name: Yup.string().required("Vui lòng nhập tên chiến dịch"),
            vaccinationName: selectedCampaign
              ? Yup.string()
              : Yup.string().required("Vui lòng chọn loại vaccine"),
            startDate: selectedCampaign
              ? Yup.date()
              : Yup.date().required("Vui lòng chọn ngày bắt đầu"),
            endDate: selectedCampaign
              ? Yup.date()
              : Yup.date()
                  .required("Vui lòng chọn ngày kết thúc")
                  .test(
                    "is-at-least-7-days",
                    "Ngày kết thúc phải cách ngày bắt đầu ít nhất 1 tuần",
                    function (value) {
                      const { startDate } = this.parent;
                      if (!startDate || !value) return true;
                      const start = new Date(startDate);
                      const end = new Date(value);
                      return end - start >= 7 * 24 * 60 * 60 * 1000;
                    }
                  ),
            description: Yup.string(),
            targetGrades: Yup.array().min(1, "Vui lòng chọn khối áp dụng"),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            let success = false;

            if (selectedCampaign) {
              const updateData = {
                name: values.name,
                description: values.description,
                status: values.status,
                targetGrades: values.targetGrades,
              };
              success = await updateCampaign(selectedCampaign.id, updateData);
            } else {
              const selectedVaccination = vaccinations.find(
                (v) => v.name === values.vaccinationName
              );
              if (!selectedVaccination) {
                message.error("Vui lòng chọn loại vaccine hợp lệ");
                setSubmitting(false);
                return;
              }

              const createData = {
                name: values.name,
                description: values.description,
                vaccinationId: selectedVaccination.id,
                targetGrades: values.targetGrades,
                scheduledDate: values.startDate
                  ? typeof values.startDate === "string"
                    ? values.startDate
                    : values.startDate.toISOString()
                  : null,
                deadline: values.endDate
                  ? typeof values.endDate === "string"
                    ? values.endDate
                    : values.endDate.toISOString()
                  : null,
              };
              success = await createCampaign(createData);
            }

            setSubmitting(false);
            if (success) {
              setIsModalVisible(false);
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
                />
              </Form.Item>
              <Form.Item
                label="Loại vaccine"
                help={
                  touched.vaccinationName && errors.vaccinationName
                    ? errors.vaccinationName
                    : undefined
                }
                validateStatus={
                  touched.vaccinationName && errors.vaccinationName
                    ? "error"
                    : undefined
                }
              >
                <Select
                  value={values.vaccinationName}
                  onChange={(val) => setFieldValue("vaccinationName", val)}
                  onBlur={handleBlur}
                  disabled={!!selectedCampaign}
                  placeholder="Chọn loại vaccine"
                >
                  {vaccinations.map((vaccination) => (
                    <Select.Option
                      key={vaccination.id}
                      value={vaccination.name}
                    >
                      {vaccination.name}
                    </Select.Option>
                  ))}
                </Select>
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
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Ngày bắt đầu"
                    help={
                      touched.startDate && errors.startDate
                        ? errors.startDate
                        : undefined
                    }
                    validateStatus={
                      touched.startDate && errors.startDate
                        ? "error"
                        : undefined
                    }
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      value={values.startDate ? dayjs(values.startDate) : null}
                      onChange={(date) => setFieldValue("startDate", date)}
                      onBlur={handleBlur}
                      disabled={!!selectedCampaign}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Ngày kết thúc"
                    help={
                      touched.endDate && errors.endDate
                        ? errors.endDate
                        : undefined
                    }
                    validateStatus={
                      touched.endDate && errors.endDate ? "error" : undefined
                    }
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      value={values.endDate ? dayjs(values.endDate) : null}
                      onChange={(date) => setFieldValue("endDate", date)}
                      onBlur={handleBlur}
                      disabled={!!selectedCampaign}
                    />
                  </Form.Item>
                </Col>
              </Row>
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
              {selectedCampaign && (
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
                    name="status"
                    value={values.status}
                    onChange={(val) => setFieldValue("status", val)}
                    onBlur={handleBlur}
                  >
                    <Select.Option value="ACTIVE">Đang diễn ra</Select.Option>
                    <Select.Option value="FINISHED">Hoàn thành</Select.Option>
                    <Select.Option value="CANCELLED">Đã hủy</Select.Option>
                  </Select>
                </Form.Item>
              )}
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                  {selectedCampaign ? "Cập nhật" : "Thêm"}
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={handleModalCancel}>
                  Hủy
                </Button>
              </Form.Item>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Modal xác nhận gửi phiếu đồng ý */}
      <Modal
        title={`Gửi phiếu đồng ý tiêm chủng: ${
          consentModal.campaign?.name || ""
        }`}
        open={consentModal.visible}
        onOk={handleConsentModalOk}
        onCancel={handleConsentModalCancel}
        confirmLoading={consentLoading}
        okButtonProps={{ disabled: consentLoading }}
      >
        <div>
          <p>Chọn các khối sẽ gửi phiếu đồng ý tiêm chủng:</p>
          <Checkbox.Group
            options={allGrades.map((g) => ({
              label: `Khối ${g.grade} (${g.count} học sinh)`,
              value: g.grade,
              disabled: g.count === 0,
            }))}
            value={selectedGrades}
            onChange={handleGradeChange}
          />
          <p style={{ marginTop: 16 }}>
            Bạn có chắc chắn muốn gửi phiếu cho các khối đã chọn không?
          </p>
        </div>
      </Modal>

      {/* Modal xem danh sách phiếu đồng ý */}
      <Modal
        title={`Danh sách phiếu đồng ý - ${consentListModal.campaign?.name}`}
        open={consentListModal.visible}
        onCancel={handleConsentListModalCancel}
        footer={[
          <Button key="close" onClick={handleConsentListModalCancel}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {/* Thống kê tổng quan */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Card size="small" style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#1890ff",
                  }}
                >
                  {consentListModal.consents.length}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>Tổng số</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#52c41a",
                  }}
                >
                  {
                    consentListModal.consents.filter((c) => c.consent === true)
                      .length
                  }
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>Đã đồng ý</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#ff4d4f",
                  }}
                >
                  {
                    consentListModal.consents.filter((c) => c.consent === false)
                      .length
                  }
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  Đã từ chối
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#faad14",
                  }}
                >
                  {consentListModal.consents.length > 0
                    ? Math.round(
                        (consentListModal.consents.filter(
                          (c) => c.consent === true
                        ).length /
                          consentListModal.consents.length) *
                          100
                      )
                    : 0}
                  %
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  Tỷ lệ đồng ý
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        {Array.isArray(consentListModal.campaign?.vaccinations) &&
          consentListModal.campaign.vaccinations.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <b>Loại vaccine:</b>{" "}
              {consentListModal.campaign.vaccinations[0]?.name}
            </div>
          )}

        <Table
          dataSource={consentListModal.consents}
          columns={[
            {
              title: "Học sinh",
              dataIndex: ["student", "user", "fullName"],
              key: "studentName",
            },
            {
              title: "Phụ huynh",
              dataIndex: ["parent", "user", "fullName"],
              key: "parentName",
            },
            {
              title: "Email phụ huynh",
              dataIndex: ["parent", "user", "email"],
              key: "parentEmail",
            },
            {
              title: "Trạng thái",
              dataIndex: "consent",
              key: "consent",
              render: (consent) => (
                <Tag color={consent ? "success" : "error"}>
                  {consent ? "Đã đồng ý" : "Đã từ chối"}
                </Tag>
              ),
            },
            {
              title: "Ghi chú",
              dataIndex: "notes",
              key: "notes",
              render: (notes) => notes || "Không có",
            },
            {
              title: "Ngày gửi",
              dataIndex: "submittedAt",
              key: "submittedAt",
              render: (date) => new Date(date).toLocaleDateString("vi-VN"),
            },
          ]}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  );
};

export default VaccinationCampaigns;
