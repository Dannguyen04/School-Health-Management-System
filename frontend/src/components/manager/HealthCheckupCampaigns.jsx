import {
  CheckCircleTwoTone,
  ClockCircleTwoTone,
  CloseCircleTwoTone,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  NotificationOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  Modal as AntdModal,
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
  Tooltip,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationToastList from "../shared/NotificationToastList";

const { TextArea } = Input;

const HealthCheckupCampaigns = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchForm] = Form.useForm();
  const [campaignForm] = Form.useForm();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [statusModal, setStatusModal] = useState({
    open: false,
    record: null,
  });
  const [statusLoading, setStatusLoading] = useState(false);
  const [notifyModal, setNotifyModal] = useState({
    open: false,
    campaign: null,
    loading: false,
  });
  const [managerToasts, setManagerToasts] = useState([]);

  const { refresh: refreshNotifications } = useNotifications();

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

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACTIVE":
        return <ClockCircleTwoTone twoToneColor="#1890ff" />;
      case "FINISHED":
        return <CheckCircleTwoTone twoToneColor="#52c41a" />;
      case "CANCELLED":
        return <CloseCircleTwoTone twoToneColor="#ff4d4f" />;
      default:
        return <SyncOutlined spin />;
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
        return { success: true };
      } else {
        message.error(res.data.error || "Không thể thêm chiến dịch");
        return { success: false, error: res.data.error };
      }
    } catch (err) {
      const backendMsg = err.response?.data?.error;
      message.error(backendMsg || "Không thể thêm chiến dịch");
      return { success: false, error: backendMsg };
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
      // Hiển thị lỗi thân thiện, ẩn lỗi kỹ thuật
      const backendMsg = err.response?.data?.error;
      if (
        backendMsg &&
        (backendMsg.toLowerCase().includes("prisma") ||
          backendMsg.toLowerCase().includes("invalid") ||
          err.response?.status === 500)
      ) {
        message.error(
          "Có lỗi xảy ra, vui lòng thử lại hoặc liên hệ quản trị viên!"
        );
      } else {
        message.error(backendMsg || "Không thể cập nhật chiến dịch");
      }
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
        <Tooltip title={getStatusText(status)}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Tag color={getStatusColor(status)} style={{ marginLeft: 4 }}>
              {getStatusText(status)}
            </Tag>
          </span>
        </Tooltip>
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
          {record.status === "ACTIVE" && (
            <Button
              type="default"
              onClick={() => setStatusModal({ open: true, record })}
            >
              Cập nhật trạng thái
            </Button>
          )}
          <Button
            icon={<NotificationOutlined />}
            onClick={() => handleNotifyClick(record)}
            type="dashed"
          >
            Gửi thông báo
          </Button>
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

  // Add updateCampaignStatus function
  const updateCampaignStatus = async (id, status) => {
    setStatusLoading(true);
    try {
      const res = await axios.put(
        `/api/medical-campaigns/${id}/status`,
        { status },
        { headers: getHeaders() }
      );
      if (res.data.success) {
        message.success("Cập nhật trạng thái thành công");
        fetchCampaigns();
        setStatusModal({ open: false, record: null });
      } else {
        message.error(res.data.error || "Không thể cập nhật trạng thái");
      }
    } catch (err) {
      message.error(
        err.response?.data?.error || "Không thể cập nhật trạng thái"
      );
    } finally {
      setStatusLoading(false);
    }
  };

  // Gửi thông báo chiến dịch (gọi API)
  const doNotifyParents = async (id) => {
    setNotifyModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await axios.post(
        `/api/medical-campaigns/${id}/notify-parents`,
        {},
        {
          headers: getHeaders(),
        }
      );
      if (res.data.success) {
        message.success(res.data.message || "Đã gửi thông báo thành công!");
        setNotifyModal({ open: false, campaign: null, loading: false });
        // Sau khi gửi, reload notification cho Bell và Toast
        if (typeof refreshNotifications === "function") refreshNotifications();
        // Hiển thị notification mẫu cho manager
        if (notifyModal.campaign) {
          setManagerToasts((prev) => [
            {
              id: `manager-test-${Date.now()}`,
              title: `Thông báo chiến dịch khám sức khỏe: ${notifyModal.campaign.name}`,
              message: "Đã gửi thông báo cho phụ huynh",
              type: "medical_campaign",
              status: "SENT",
              sentAt: new Date(),
            },
            ...prev,
          ]);
        }
      } else {
        message.error(res.data.error || "Không thể gửi thông báo");
        setNotifyModal((prev) => ({ ...prev, loading: false }));
      }
    } catch (err) {
      message.error(err.response?.data?.error || "Không thể gửi thông báo");
      setNotifyModal((prev) => ({ ...prev, loading: false }));
    }
  };
  // Khi bấm nút gửi thông báo
  const handleNotifyClick = (campaign) => {
    setNotifyModal({ open: true, campaign, loading: false });
  };

  // Xử lý đóng toast mẫu
  const handleManagerToastClose = (id) => {
    setManagerToasts((prev) => prev.filter((t) => t.id !== id));
  };
  // Xử lý đánh dấu đã đọc toast mẫu
  const handleManagerToastMarkAsRead = (id) => {
    setManagerToasts((prev) => prev.filter((t) => t.id !== id));
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
                }
              : {
                  name: "",
                  description: "",
                  targetGrades: [],
                  scheduledDate: null,
                  deadline: null,
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
                "Deadline phải cách ngày bắt đầu ít nhất 1 tuần",
                function (value) {
                  const { scheduledDate } = this.parent;
                  if (!scheduledDate || !value) return true;
                  const start = new Date(scheduledDate);
                  const end = new Date(value);
                  return end - start >= 7 * 24 * 60 * 60 * 1000;
                }
              ),
          })}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            let success = false;
            let errorMsg = "";
            if (selectedCampaign) {
              const updateData = {};
              if (values.name) updateData.name = values.name;
              if (values.description !== undefined)
                updateData.description = values.description;
              if (values.targetGrades)
                updateData.targetGrades = values.targetGrades
                  .map(String)
                  .sort((a, b) => Number(a) - Number(b)); // Ép kiểu sang chuỗi và sort
              success = await updateCampaign(selectedCampaign.id, updateData);
            } else {
              const data = {
                name: values.name,
                description: values.description,
                targetGrades: values.targetGrades
                  .map(String)
                  .sort((a, b) => Number(a) - Number(b)), // Ép kiểu sang chuỗi và sort
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
                status: "ACTIVE",
              };
              const result = await createCampaign(data);
              success = result.success;
              errorMsg = result.error;
              // Nếu có lỗi về ngày từ backend, setFieldError cho trường liên quan
              if (!success && errorMsg) {
                let matched = false;
                const lowerMsg = errorMsg ? errorMsg.toLowerCase() : "";
                if (
                  lowerMsg.includes("ngày bắt đầu") ||
                  lowerMsg.includes("khởi tạo") ||
                  lowerMsg.includes("scheduled")
                ) {
                  setFieldError("scheduledDate", errorMsg);
                  matched = true;
                }
                if (
                  lowerMsg.includes("deadline") ||
                  lowerMsg.includes("kết thúc")
                ) {
                  setFieldError("deadline", errorMsg);
                  matched = true;
                }
                if (!matched) {
                  setFieldError("scheduledDate", errorMsg);
                  setFieldError("deadline", errorMsg);
                }
              }
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
                      errors.scheduledDate ? errors.scheduledDate : undefined
                    }
                    validateStatus={errors.scheduledDate ? "error" : undefined}
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
                    help={errors.deadline ? errors.deadline : undefined}
                    validateStatus={errors.deadline ? "error" : undefined}
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
      {/* Modal cập nhật trạng thái */}
      <Modal
        title="Cập nhật trạng thái chiến dịch"
        open={statusModal.open}
        onCancel={() => setStatusModal({ open: false, record: null })}
        footer={null}
        centered
      >
        {statusModal.record && (
          <div style={{ marginBottom: 16 }}>
            <b>Tên chiến dịch:</b> {statusModal.record.name}
            <br />
            <b>Trạng thái hiện tại:</b>{" "}
            {getStatusText(statusModal.record.status)}
          </div>
        )}
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button
            type="primary"
            icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
            block
            disabled={statusModal.record?.status !== "ACTIVE"}
            loading={statusLoading}
            onClick={() =>
              updateCampaignStatus(statusModal.record.id, "FINISHED")
            }
          >
            Hoàn thành chiến dịch
          </Button>
          <Button
            type="default"
            icon={<CloseCircleTwoTone twoToneColor="#ff4d4f" />}
            block
            disabled={statusModal.record?.status !== "ACTIVE"}
            loading={statusLoading}
            onClick={() =>
              updateCampaignStatus(statusModal.record.id, "CANCELLED")
            }
          >
            Hủy chiến dịch
          </Button>
        </Space>
      </Modal>
      {/* Modal xác nhận gửi thông báo */}
      <AntdModal
        open={notifyModal.open}
        title={
          <span>
            <ExclamationCircleOutlined
              style={{ color: "#faad14", marginRight: 8 }}
            />
            Xác nhận gửi thông báo
          </span>
        }
        onCancel={() =>
          setNotifyModal({
            open: false,
            campaign: null,
            loading: false,
          })
        }
        onOk={() => doNotifyParents(notifyModal.campaign?.id)}
        okText="Gửi thông báo"
        cancelText="Hủy"
        confirmLoading={notifyModal.loading}
      >
        {notifyModal.campaign && (
          <div>
            <ul>
              <li>
                <b>Tên chiến dịch:</b> {notifyModal.campaign.name}
              </li>
              <li>
                <b>Khối áp dụng:</b>{" "}
                {(notifyModal.campaign.targetGrades || []).join(", ")}
              </li>
              <li>
                <b>Thời gian:</b>{" "}
                {dayjs(notifyModal.campaign.scheduledDate).format("DD/MM/YYYY")}{" "}
                - {dayjs(notifyModal.campaign.deadline).format("DD/MM/YYYY")}
              </li>
            </ul>
            <p style={{ marginTop: 8 }}>
              <b>Lưu ý:</b> Thông báo sẽ được gửi tới tất cả phụ huynh có con
              thuộc các khối này.
            </p>
          </div>
        )}
      </AntdModal>
      {/* Toast notification mẫu cho manager */}
      <NotificationToastList
        notifications={managerToasts}
        onClose={handleManagerToastClose}
        onMarkAsRead={handleManagerToastMarkAsRead}
      />
    </div>
  );
};

export default HealthCheckupCampaigns;
