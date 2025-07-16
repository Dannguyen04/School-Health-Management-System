import {
  BellOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  HistoryOutlined,
  MedicineBoxOutlined,
  SmileOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  List,
  message,
  Modal,
  notification,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { TextArea } = Input;
const { Text, Title, Paragraph } = Typography;
const { Option } = Select;

const StudentTreatment = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [form] = Form.useForm();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyData, setHistoryData] = useState({ logs: [], summary: {} });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTitle, setHistoryTitle] = useState("");
  const [summary, setSummary] = useState({});
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: "",
  });
  const [notificationDrawerVisible, setNotificationDrawerVisible] =
    useState(false);
  const [scheduledTreatments, setScheduledTreatments] = useState([]);
  const [upcomingNotifications, setUpcomingNotifications] = useState([]);
  const [notificationInterval, setNotificationInterval] = useState(null);
  const [sentNotifications, setSentNotifications] = useState(new Set());
  const [scheduleFilter, setScheduleFilter] = useState("all");
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStudent, setFilterStudent] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterMedicine, setFilterMedicine] = useState("");
  const [filterTime, setFilterTime] = useState("");

  useEffect(() => {
    fetchTreatments();
    fetchScheduledTreatments();
    startNotificationCheck();

    return () => {
      if (notificationInterval) {
        clearInterval(notificationInterval);
      }
    };
  }, []);

  const startNotificationCheck = () => {
    const interval = setInterval(() => {
      checkUpcomingMedications();
    }, 60000);
    setNotificationInterval(interval);
  };

  const checkUpcomingMedications = () => {
    const now = new Date();
    scheduledTreatments.forEach((treatment) => {
      (treatment.customTimes || []).forEach((time) => {
        const [hours, minutes] = time.split(":").map(Number);
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);
        const timeDiff = scheduledTime.getTime() - now.getTime();
        if (timeDiff > 0 && timeDiff <= 300000) {
          const key = `${treatment.id}_${time}_${now.toDateString()}`;
          if (!sentNotifications.has(key)) {
            notification.warning({
              message: "Đến giờ cấp phát thuốc phụ huynh gửi!",
              description: `${treatment.studentName} - ${treatment.medication.name} lúc ${time}`,
              duration: 0,
              icon: <BellOutlined />,
              onClick: () => {
                setSelectedTreatment(treatment);
                setIsModalVisible(true);
              },
            });
            setSentNotifications((prev) => new Set(prev).add(key));
          }
        }
      });
    });
  };

  const fetchScheduledTreatments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/nurse/scheduled-treatments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setScheduledTreatments(response.data.data);
        setUpcomingNotifications(response.data.upcoming || []);
        setSentNotifications(new Set());
      }
    } catch (error) {
      console.error("Error fetching scheduled treatments:", error);
    }
  };

  const fetchTreatments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/nurse/student-treatments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setTreatments(response.data.data);
        setSummary(response.data.summary || {});
      } else {
        setTreatments([]);
        setSummary({});
      }
    } catch (error) {
      console.error("Error fetching treatments:", error);
      message.error("Lỗi khi tải danh sách điều trị");
      setTreatments([]);
      setSummary({});
    } finally {
      setLoading(false);
    }
  };

  const handleGiveMedication = (record) => {
    if (!record.canAdminister) {
      const reasons = record.warnings.join(", ");
      message.warning(`Không thể cấp phát thuốc: ${reasons}`);
      return;
    }
    setSelectedTreatment(record);
    const dosageNumber = parseFloat(record.dosage);
    form.setFieldsValue({
      quantityUsed: dosageNumber,
      dosageGiven: dosageNumber,
      notes: "",
    });
    setIsModalVisible(true);
  };

  const handleViewDetails = (record) => {
    setDetailRecord(record);
    setDetailModalVisible(true);
  };

  const handleViewHistory = async (record) => {
    setHistoryModalVisible(true);
    setHistoryLoading(true);
    setHistoryTitle(`${record.studentName} - ${record.medication.name}`);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/nurse/medication-history/${record.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setHistoryData(response.data.data);
      } else {
        setHistoryData({ logs: [], summary: {} });
      }
    } catch (error) {
      setHistoryData({ logs: [], summary: {} });
      console.error("Error fetching medication history:", error);
      message.error("Lỗi khi lấy lịch sử cấp phát thuốc");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleStopTreatment = async (record) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/nurse/student-treatments/${record.id}/stop`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Đã dừng điều trị cho học sinh này");
      fetchTreatments();
    } catch {
      message.error("Lỗi khi dừng điều trị");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "green";
      case "low_stock":
        return "orange";
      case "out_of_stock":
        return "red";
      default:
        return "default";
    }
  };

  const getFrequencyText = (frequency) => {
    const freqMap = {
      once: "1 lần/ngày",
      twice: "2 lần/ngày",
      three: "3 lần/ngày",
      four: "4 lần/ngày",
    };
    return freqMap[frequency] || frequency || "-";
  };

  const formatCustomTimes = (customTimes) => {
    if (
      !customTimes ||
      !Array.isArray(customTimes) ||
      customTimes.length === 0
    ) {
      return "Không có";
    }
    return customTimes.join(", ");
  };

  const columns = [
    {
      title: "Học sinh",
      dataIndex: "studentName",
      key: "studentName",
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <Text type="secondary" className="text-xs">
            {record.studentCode} - {record.grade} {record.class}
          </Text>
          <div className="mt-1">
            <Tag color="blue" size="small">
              <UserOutlined /> {record.parentName}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Thuốc",
      dataIndex: "medication",
      key: "medication",
      render: (medication) => (
        <div>
          <div className="font-medium">{medication.name}</div>
          <Text type="secondary" className="text-xs">
            Thuốc phụ huynh gửi: {medication.stockQuantity} {medication.unit}
          </Text>
          <div className="mt-1">
            <Tag color={getStatusColor(medication.stockStatus)} size="small">
              {medication.stockStatus === "out_of_stock"
                ? "Hết thuốc phụ huynh gửi"
                : medication.stockStatus === "low_stock"
                ? "Sắp hết thuốc phụ huynh gửi"
                : "Còn thuốc phụ huynh gửi"}
            </Tag>
            {medication.expiryStatus === "expiring_soon" && (
              <Tag color="orange" size="small">
                Sắp hết hạn
              </Tag>
            )}
            {medication.expiryStatus === "expired" && (
              <Tag color="red" size="small">
                Hết hạn
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Liều lượng & Tần suất",
      dataIndex: "dosage",
      key: "dosage",
      render: (dosage, record) => {
        const timeUntilNext = record.timeUntilNext;
        return (
          <div>
            <div className="font-medium">{dosage}</div>
            <Text type="secondary" className="text-xs">
              {getFrequencyText(record.frequency)}
            </Text>
            <div className="mt-1">
              <Text type="secondary" className="text-xs">
                Hôm nay: {record.todayDosage} / {record.dailyLimit}
              </Text>
            </div>
            {record.customTimes && record.customTimes.length > 0 && (
              <div className="mt-1">
                <Tag color="purple" size="small">
                  <ClockCircleOutlined /> Giờ cấp phát:{" "}
                  {formatCustomTimes(record.customTimes)}
                </Tag>
                {timeUntilNext && (
                  <div className="mt-1">
                    <Tag color="green" size="small">
                      <BellOutlined /> Lần tiếp theo: {timeUntilNext.time} (
                      {timeUntilNext.hours}h {timeUntilNext.minutes}m)
                    </Tag>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        const hasWarnings = record.warnings && record.warnings.length > 0;
        const timeUntilNext = record.timeUntilNext;
        const isDueSoon =
          timeUntilNext &&
          timeUntilNext.hours === 0 &&
          timeUntilNext.minutes <= 30;

        return (
          <div>
            <Tag
              color={record.canAdminister ? "green" : "red"}
              icon={
                record.canAdminister ? <CheckOutlined /> : <WarningOutlined />
              }
            >
              {record.canAdminister ? "Có thể cấp phát" : "Không thể cấp phát"}
            </Tag>
            {isDueSoon && (
              <div className="mt-1">
                <Tag color="red" size="small">
                  <BellOutlined /> Đến giờ cấp phát!
                </Tag>
              </div>
            )}
            {hasWarnings && (
              <div className="mt-1">
                {record.warnings.map((warning, index) => (
                  <Tag key={index} color="orange" size="small">
                    {warning}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Thời gian",
      key: "timeInfo",
      render: (_, record) => (
        <div>
          <div>
            <Text type="secondary" className="text-xs">
              Bắt đầu: {dayjs(record.startDate).format("DD/MM/YYYY")}
            </Text>
          </div>
          {record.endDate && (
            <div>
              <Text type="secondary" className="text-xs">
                Kết thúc: {dayjs(record.endDate).format("DD/MM/YYYY")}
              </Text>
            </div>
          )}
          {record.lastAdministration && (
            <div>
              <Tag color="blue" size="small">
                <HistoryOutlined /> Lần cuối:{" "}
                {dayjs(record.lastAdministration).format("HH:mm DD/MM")}
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => {
        const timeUntilNext = record.timeUntilNext;
        const isDueSoon =
          timeUntilNext &&
          timeUntilNext.hours === 0 &&
          timeUntilNext.minutes <= 30;

        return (
          <Space direction="vertical" size="small">
            <Space>
              <Tooltip title="Cấp phát thuốc">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleGiveMedication(record)}
                  disabled={
                    !record.canAdminister ||
                    record.treatmentStatus !== "ONGOING"
                  }
                  size="small"
                  danger={isDueSoon}
                />
              </Tooltip>
              <Tooltip title="Xem chi tiết">
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetails(record)}
                  size="small"
                />
              </Tooltip>
              <Tooltip title="Lịch sử cấp phát">
                <Button
                  icon={<HistoryOutlined />}
                  onClick={() => handleViewHistory(record)}
                  size="small"
                />
              </Tooltip>
            </Space>
            {record.treatmentStatus === "ONGOING" && (
              <Popconfirm
                title="Bạn chắc chắn muốn dừng điều trị học sinh này?"
                onConfirm={() => handleStopTreatment(record)}
                okText="Dừng"
                cancelText="Hủy"
              >
                <Button danger type="dashed" size="small">
                  Dừng điều trị
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  const scheduleColumns = [
    {
      title: "Học sinh",
      dataIndex: "studentName",
      key: "studentName",
      render: (text, record) => (
        <div>
          <b>{text}</b>
          <div className="text-xs text-gray-500">
            {record.studentCode} - {record.grade} {record.class}
          </div>
        </div>
      ),
    },
    {
      title: "Thuốc",
      dataIndex: "medication",
      key: "medication",
      render: (med) => (
        <div>
          <b>{med.name}</b>
          <div className="text-xs text-gray-500">
            {med.dosage} {med.unit}
          </div>
        </div>
      ),
    },
    {
      title: "Giờ cấp phát",
      dataIndex: "todaySchedules",
      key: "customTimes",
      render: (times) =>
        times && times.length > 0 ? (
          times.map((t, i) => (
            <Tag color="purple" key={i}>
              <ClockCircleOutlined /> {t}
            </Tag>
          ))
        ) : (
          <Tag color="default">Đã cấp phát hết</Tag>
        ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        if (!record.todaySchedules || record.todaySchedules.length === 0)
          return <Tag color="green">Đã cấp phát hết</Tag>;
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const isOverdue = record.todaySchedules.every((time) => {
          const [h, m] = time.split(":").map(Number);
          return h * 60 + m < currentTime;
        });
        if (isOverdue) return <Tag color="red">Đã qua giờ</Tag>;
        return <Tag color="blue">Chưa cấp phát</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          disabled={!record.canAdminister}
          onClick={() => {
            const fullTreatment = treatments.find((t) => t.id === record.id);
            setSelectedTreatment(fullTreatment || record);
            const dosageNumber = parseFloat((fullTreatment || record).dosage);
            form.setFieldsValue({
              quantityUsed: dosageNumber,
              dosageGiven: dosageNumber,
              notes: "",
            });
            setIsModalVisible(true);
            setScheduleModalVisible(false);
          }}
        >
          Cấp phát
        </Button>
      ),
    },
  ];

  const getFilteredScheduledTreatments = () => {
    return scheduledTreatments.filter((item) => {
      let statusMatch = true;
      if (filterStatus !== "all") {
        if (!item.todaySchedules || item.todaySchedules.length === 0) {
          statusMatch = filterStatus === "done";
        } else {
          const now = new Date();
          const currentTime = now.getHours() * 60 + now.getMinutes();
          const allPast = item.todaySchedules.every((time) => {
            const [h, m] = time.split(":").map(Number);
            return h * 60 + m < currentTime;
          });
          const anyFuture = item.todaySchedules.some((time) => {
            const [h, m] = time.split(":").map(Number);
            return h * 60 + m >= currentTime;
          });
          if (filterStatus === "overdue") statusMatch = allPast;
          else if (filterStatus === "not_given") statusMatch = anyFuture;
          else statusMatch = false;
        }
      }
      let studentMatch =
        !filterStudent ||
        item.studentName.toLowerCase().includes(filterStudent.toLowerCase());
      let classMatch =
        !filterClass ||
        (item.class &&
          item.class.toLowerCase().includes(filterClass.toLowerCase()));
      let medMatch =
        !filterMedicine ||
        (item.medication &&
          item.medication.name
            .toLowerCase()
            .includes(filterMedicine.toLowerCase()));
      let timeMatch =
        !filterTime ||
        (item.todaySchedules &&
          item.todaySchedules.some((t) => t.includes(filterTime)));
      return statusMatch && studentMatch && classMatch && medMatch && timeMatch;
    });
  };

  const items = [
    {
      key: "treatments",
      label: "Danh sách điều trị",
      children: (
        <div className="space-y-6">
          {summary && Object.keys(summary).length > 0 && (
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Tổng số điều trị"
                    value={summary.total || 0}
                    prefix={<MedicineBoxOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Có thể cấp phát"
                    value={summary.canAdminister || 0}
                    valueStyle={{ color: "#52c41a" }}
                    prefix={<CheckOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Đã cấp phát hôm nay"
                    value={summary.administeredToday || 0}
                    valueStyle={{ color: "#1890ff" }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          )}

          <Card>
            <Spin spinning={loading}>
              <Table
                dataSource={treatments}
                columns={columns}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showQuickJumper: true,
                  showSizeChanger: true,
                }}
                scroll={{ x: 1200 }}
              />
            </Spin>
          </Card>
        </div>
      ),
    },
    {
      key: "scheduled",
      label: (
        <span>
          <BellOutlined /> Lịch cấp phát
          {upcomingNotifications.length > 0 && (
            <Badge count={upcomingNotifications.length} size="small" />
          )}
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Card>
            <div className="mb-4">
              <Title level={4}>Lịch cấp phát hôm nay</Title>
              <Text type="secondary">
                Danh sách các lịch cấp phát thuốc theo giờ
              </Text>
            </div>

            {scheduledTreatments.length > 0 ? (
              <List
                dataSource={scheduledTreatments}
                renderItem={(treatment) => {
                  const timeUntilNext = treatment.timeUntilNext;
                  const isDueSoon =
                    timeUntilNext &&
                    timeUntilNext.hours === 0 &&
                    timeUntilNext.minutes <= 30;

                  return (
                    <List.Item
                      actions={[
                        <Button
                          key="give"
                          type="primary"
                          size="small"
                          onClick={() => handleGiveMedication(treatment)}
                          disabled={!treatment.canAdminister}
                          danger={isDueSoon}
                        >
                          Cấp phát
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <div className="flex items-center justify-between">
                            <span>{treatment.studentName}</span>
                            {isDueSoon && (
                              <Tag color="red">
                                <BellOutlined /> Đến giờ!
                              </Tag>
                            )}
                          </div>
                        }
                        description={
                          <div>
                            <div>
                              {treatment.medication.name} - {treatment.dosage}
                            </div>
                            <div className="mt-1">
                              <Tag color="purple">
                                <ClockCircleOutlined />{" "}
                                {formatCustomTimes(treatment.customTimes)}
                              </Tag>
                              {timeUntilNext && (
                                <Tag color="green">
                                  Lần tiếp theo: {timeUntilNext.time}(
                                  {timeUntilNext.hours}h {timeUntilNext.minutes}
                                  m)
                                </Tag>
                              )}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <div className="text-center py-8">
                <Text type="secondary">
                  Không có lịch cấp phát thuốc phụ huynh gửi nào hôm nay
                </Text>
                <div className="mt-2">
                  <Text type="secondary" className="text-xs">
                    Phụ huynh cần gửi thuốc và y tá cần lên lịch cấp phát
                  </Text>
                </div>
              </div>
            )}
          </Card>
        </div>
      ),
    },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const maxTimes = selectedTreatment.customTimes?.length || 1;
      const timesGiven = selectedTreatment.timesGivenToday || 0;
      const totalGiven = selectedTreatment.todayDosage || 0;
      const dailyLimit = selectedTreatment.dailyLimit;
      const dosageToGive = values.dosageGiven;

      if (timesGiven === maxTimes && totalGiven + dosageToGive <= dailyLimit) {
        setSubmitting(false);
        Modal.confirm({
          title: "Cảnh báo",
          content:
            "Bạn đã cấp phát đủ số lần trong ngày, nhưng tổng liều chưa đủ. Xác nhận cấp phát thêm cho trường hợp đặc biệt?",
          onOk: () => {
            submitGiveMedicine(values);
          },
        });
        return;
      }

      if (timesGiven >= maxTimes && totalGiven >= dailyLimit) {
        setSubmitting(false);
        message.error(
          "Đã cấp phát đủ số lần và tổng liều trong ngày. Không thể cấp phát thêm."
        );
        return;
      }

      submitGiveMedicine(values);
    } catch (error) {
      setIsModalVisible(false);
      setSelectedTreatment(null);
      setTimeout(() => {
        if (error.response?.data?.error) {
          setErrorModal({
            visible: true,
            message: error.response.data.error,
          });
        } else {
          setErrorModal({
            visible: true,
            message: "Lỗi khi ghi nhận cấp phát thuốc",
          });
        }
      }, 300);
    } finally {
      setSubmitting(false);
    }
  };

  const submitGiveMedicine = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/nurse/give-medicine/${selectedTreatment.id}`,
        {
          quantityUsed: values.dosageGiven,
          dosageGiven: values.dosageGiven,
          notes: values.notes,
          administrationTime: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        message.success("Đã ghi nhận cấp phát thuốc phụ huynh gửi thành công");

        if (response.data.warnings && response.data.warnings.length > 0) {
          Modal.warning({
            title: "Cảnh báo",
            content: (
              <ul>
                {response.data.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            ),
          });
        }
      }

      setIsModalVisible(false);
      form.resetFields();
      setSelectedTreatment(null);
      fetchTreatments();
      fetchScheduledTreatments();
    } catch (error) {
      setIsModalVisible(false);
      setSelectedTreatment(null);
      setTimeout(() => {
        if (error.response?.data?.error) {
          setErrorModal({
            visible: true,
            message: error.response.data.error,
          });
        } else {
          setErrorModal({
            visible: true,
            message: "Lỗi khi ghi nhận cấp phát thuốc",
          });
        }
      }, 300);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="mb-2">
            Cấp phát thuốc
          </Title>
          <Text type="secondary">
            Quản lý cấp phát thuốc từ phụ huynh và lịch điều trị cho học sinh
          </Text>
        </div>
        <div className="flex space-x-2">
          <Button
            icon={<BellOutlined />}
            onClick={() => setScheduleModalVisible(true)}
            type="primary"
          >
            Lịch cấp phát hôm nay
          </Button>
        </div>
      </div>

      {items[0].children}

      <Modal
        title={
          <span>
            <BellOutlined /> Lịch cấp phát thuốc hôm nay
          </span>
        }
        open={scheduleModalVisible}
        onCancel={() => setScheduleModalVisible(false)}
        footer={null}
        width={800}
      >
        <div className="flex flex-wrap gap-2 mb-4 items-end">
          <div>
            <span className="mr-1">Trạng thái:</span>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ minWidth: 120 }}
              options={[
                { value: "all", label: "Tất cả" },
                { value: "not_given", label: "Chưa cấp phát" },
                { value: "overdue", label: "Đã qua giờ" },
                { value: "done", label: "Đã cấp phát hết" },
              ]}
            />
          </div>
          <div>
            <Input
              placeholder="Tên học sinh"
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              allowClear
              style={{ minWidth: 140 }}
            />
          </div>
          <div>
            <Input
              placeholder="Lớp"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              allowClear
              style={{ minWidth: 80 }}
            />
          </div>
          <div>
            <Input
              placeholder="Tên thuốc"
              value={filterMedicine}
              onChange={(e) => setFilterMedicine(e.target.value)}
              allowClear
              style={{ minWidth: 120 }}
            />
          </div>
          <div>
            <Input
              placeholder="Giờ cấp phát"
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
              allowClear
              style={{ minWidth: 100 }}
            />
          </div>
          <Button
            onClick={() => {
              setFilterStatus("all");
              setFilterStudent("");
              setFilterClass("");
              setFilterMedicine("");
              setFilterTime("");
            }}
          >
            Xóa lọc
          </Button>
        </div>
        <Table
          dataSource={getFilteredScheduledTreatments()}
          columns={scheduleColumns}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          locale={{
            emptyText: (
              <div className="text-center py-8">
                <SmileOutlined style={{ fontSize: 32, color: "#aaa" }} />
                <div className="mt-2 text-gray-500">
                  Không có lịch cấp phát nào hôm nay
                </div>
              </div>
            ),
          }}
        />
      </Modal>

      <Modal
        title="Cấp phát thuốc cho học sinh"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedTreatment(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedTreatment && (
          <div className="mb-4">
            <Alert
              message={`Cấp phát thuốc cho ${selectedTreatment.studentName}`}
              description={`Thuốc phụ huynh gửi: ${selectedTreatment.medication.name} - ${selectedTreatment.dosage} (Còn lại: ${selectedTreatment.medication.stockQuantity} ${selectedTreatment.medication.unit})`}
              type="info"
              showIcon
            />
            {selectedTreatment.customTimes &&
              selectedTreatment.customTimes.length > 0 && (
                <div className="mt-2">
                  <Tag color="purple">
                    <ClockCircleOutlined /> Giờ cấp phát:{" "}
                    {formatCustomTimes(selectedTreatment.customTimes)}
                  </Tag>
                </div>
              )}
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="dosageGiven"
            label={
              <span>
                Liều dùng thực tế
                <span
                  title="Số lượng thuốc thực tế đã cấp phát cho học sinh trong lần này. Mặc định bằng liều kê đơn."
                  style={{
                    marginLeft: 6,
                    color: "#888",
                    cursor: "help",
                  }}
                >
                  ?
                </span>
              </span>
            }
            rules={[
              {
                required: true,
                message: "Vui lòng nhập liều dùng",
              },
              {
                type: "number",
                min: 0.1,
                message: "Liều dùng phải lớn hơn 0",
              },
              {
                validator: (_, value) => {
                  if (
                    value > 0 &&
                    selectedTreatment &&
                    value > parseFloat(selectedTreatment.dosage)
                  ) {
                    return Promise.reject(
                      `Liều dùng mỗi lần không được vượt quá ${selectedTreatment.dosage} ${selectedTreatment.medication.unit}`
                    );
                  }
                  if (
                    value > 0 &&
                    selectedTreatment &&
                    value + (selectedTreatment.todayDosage || 0) >
                      selectedTreatment.dailyLimit
                  ) {
                    return Promise.reject(
                      `Tổng liều dùng hôm nay không được vượt quá ${
                        selectedTreatment.dailyLimit
                      } (${selectedTreatment.todayDosage || 0} đã dùng)`
                    );
                  }
                  if (
                    selectedTreatment &&
                    selectedTreatment.customTimes &&
                    Array.isArray(selectedTreatment.customTimes) &&
                    typeof selectedTreatment.timesGivenToday === "number"
                  ) {
                    const maxTimes = selectedTreatment.customTimes.length;
                    const timesGiven = selectedTreatment.timesGivenToday;
                    if (timesGiven >= maxTimes) {
                      return Promise.reject(
                        `Đã cấp phát đủ số lần trong ngày (${maxTimes} lần)`
                      );
                    }
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              min={0.1}
              step={0.1}
              style={{ width: "100%" }}
              addonAfter={selectedTreatment?.medication?.unit}
              defaultValue={selectedTreatment?.dosage}
            />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <TextArea
              rows={4}
              placeholder="Ghi chú về việc cấp phát thuốc, quan sát của học sinh, v.v."
            />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => {
                setIsModalVisible(false);
                setSelectedTreatment(null);
                form.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Ghi nhận cấp phát
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={
          <span>
            <EyeOutlined /> Chi tiết điều trị
          </span>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
        bodyStyle={{ padding: 0 }}
      >
        {detailRecord && (
          <div className="p-6 space-y-6">
            <div>
              <div className="font-semibold text-lg mb-2 text-blue-700 flex items-center gap-2">
                <UserOutlined /> Thông tin học sinh
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base">
                <div>
                  <b>Tên học sinh:</b> {detailRecord.studentName}
                </div>
                <div>
                  <b>Mã học sinh:</b> {detailRecord.studentCode}
                </div>
                <div>
                  <b>Lớp:</b> {detailRecord.class}
                </div>
                <div>
                  <b>Phụ huynh:</b> {detailRecord.parentName}
                </div>
                <div>
                  <b>SĐT:</b> {detailRecord.parentPhone}
                </div>
                <div>
                  <b>Tần suất:</b> {getFrequencyText(detailRecord.frequency)}
                </div>
                <div>
                  <b>Giờ cấp phát cụ thể:</b>{" "}
                  {formatCustomTimes(detailRecord.customTimes)}
                </div>
              </div>
            </div>
            <Divider className="my-2" />
            <div>
              <div className="font-semibold text-lg mb-2 text-green-700 flex items-center gap-2">
                <MedicineBoxOutlined /> Thông tin thuốc
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base">
                <div>
                  <b>Tên thuốc:</b> {detailRecord.medication.name}
                </div>
                <div>
                  <b>Liều lượng:</b> {detailRecord.dosage}
                </div>
                <div>
                  <b>Tần suất:</b> {getFrequencyText(detailRecord.frequency)}
                </div>
                <div>
                  <b>Giờ uống cụ thể:</b>{" "}
                  {formatCustomTimes(detailRecord.customTimes)}
                </div>
                <div>
                  <b>Tồn kho:</b>{" "}
                  <Tag
                    color={
                      detailRecord.medication.stockQuantity > 10
                        ? "green"
                        : detailRecord.medication.stockQuantity > 0
                        ? "orange"
                        : "red"
                    }
                  >
                    {detailRecord.medication.stockQuantity}{" "}
                    {detailRecord.medication.unit}
                  </Tag>
                </div>
                <div>
                  <b>Mô tả:</b>{" "}
                  {detailRecord.medication.description || "Không có"}
                </div>
                <div className="md:col-span-3">
                  <b>Hướng dẫn:</b> {detailRecord.instructions || "Không có"}
                </div>
              </div>
            </div>
            <Divider className="my-2" />
            <div>
              <div className="font-semibold text-lg mb-2 text-purple-700 flex items-center gap-2">
                <ClockCircleOutlined /> Thông tin điều trị
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base">
                <div>
                  <b>Ngày bắt đầu:</b>{" "}
                  {dayjs(detailRecord.startDate).format("DD/MM/YYYY")}
                </div>
                <div>
                  <b>Ngày kết thúc:</b>{" "}
                  {detailRecord.endDate
                    ? dayjs(detailRecord.endDate).format("DD/MM/YYYY")
                    : "Không có"}
                </div>
                <div>
                  <b>Trạng thái:</b>{" "}
                  <Tag
                    color={
                      detailRecord.treatmentStatus === "ONGOING"
                        ? "green"
                        : "red"
                    }
                  >
                    {detailRecord.treatmentStatus === "ONGOING"
                      ? "Đang điều trị"
                      : "Đã dừng"}
                  </Tag>
                </div>
                <div>
                  <b>Liều dùng hôm nay:</b> {detailRecord.todayDosage} /{" "}
                  {detailRecord.dailyLimit}
                </div>
                <div>
                  <b>Lần cấp phát cuối:</b>{" "}
                  {detailRecord.lastAdministration
                    ? dayjs(detailRecord.lastAdministration).format(
                        "HH:mm DD/MM/YYYY"
                      )
                    : "Chưa có"}
                </div>
              </div>
            </div>
            {detailRecord.warnings && detailRecord.warnings.length > 0 && (
              <div>
                <Divider className="my-2" />
                <Alert
                  message="Cảnh báo"
                  description={
                    <ul className="list-disc pl-5">
                      {detailRecord.warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  }
                  type="warning"
                  showIcon
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title={`Lịch sử cấp phát - ${historyTitle}`}
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={null}
        width={800}
      >
        <Spin spinning={historyLoading}>
          {historyData.logs && historyData.logs.length > 0 ? (
            <div>
              {historyData.logs.map((log, index) => (
                <div key={index}>
                  <Descriptions
                    size="small"
                    column={1}
                    bordered
                    title={
                      <span>
                        <CheckOutlined
                          style={{
                            color: "green",
                            marginRight: 8,
                          }}
                        />
                        {dayjs(log.givenAt).format("HH:mm DD/MM/YYYY")}
                      </span>
                    }
                  >
                    <Descriptions.Item label="Liều dùng">
                      {log.dosageGiven}
                    </Descriptions.Item>
                    <Descriptions.Item label="Y tá">
                      {log.nurseName || "Chưa rõ"}
                    </Descriptions.Item>
                    {log.notes && (
                      <Descriptions.Item label="Ghi chú">
                        {log.notes}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                  {index < historyData.logs.length - 1 && (
                    <Divider style={{ margin: "16px 0" }} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Text type="secondary">Chưa có lịch sử cấp phát</Text>
            </div>
          )}
        </Spin>
      </Modal>

      <Drawer
        title="Lịch cấp phát thuốc hôm nay"
        placement="right"
        onClose={() => setNotificationDrawerVisible(false)}
        open={notificationDrawerVisible}
        width={400}
      >
        <div className="space-y-4">
          {scheduledTreatments.length > 0 ? (
            scheduledTreatments.map((treatment, index) => {
              const timeUntilNext = treatment.timeUntilNext;
              const isDueSoon =
                timeUntilNext &&
                timeUntilNext.hours === 0 &&
                timeUntilNext.minutes <= 30;

              return (
                <Card key={index} size="small">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{treatment.studentName}</div>
                      <div className="text-sm text-gray-600">
                        {treatment.medication.name} - {treatment.dosage}
                      </div>
                      <div className="mt-1">
                        <Tag color="purple">
                          <ClockCircleOutlined />{" "}
                          {formatCustomTimes(treatment.customTimes)}
                        </Tag>
                        {timeUntilNext && (
                          <Tag
                            color={isDueSoon ? "red" : "green"}
                            className="ml-1"
                          >
                            <BellOutlined /> Lần tiếp theo: {timeUntilNext.time}
                            ({timeUntilNext.hours}h {timeUntilNext.minutes}
                            m)
                          </Tag>
                        )}
                      </div>
                      {isDueSoon && (
                        <div className="mt-1">
                          <Tag color="red">
                            <BellOutlined /> Đến giờ cấp phát!
                          </Tag>
                        </div>
                      )}
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      danger={isDueSoon}
                      onClick={() => {
                        const fullTreatment = treatments.find(
                          (t) => t.id === treatment.id
                        );
                        setSelectedTreatment(fullTreatment || treatment);
                        const dosageNumber = parseFloat(
                          (fullTreatment || treatment).dosage
                        );
                        form.setFieldsValue({
                          quantityUsed: dosageNumber,
                          dosageGiven: dosageNumber,
                          notes: "",
                        });
                        setIsModalVisible(true);
                        setNotificationDrawerVisible(false);
                      }}
                    >
                      Cấp phát
                    </Button>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Text type="secondary">Không có lịch cấp phát nào hôm nay</Text>
            </div>
          )}
        </div>
      </Drawer>

      <Modal
        title="Lỗi"
        open={errorModal.visible}
        onCancel={() => setErrorModal({ visible: false, message: "" })}
        footer={[
          <Button
            key="ok"
            onClick={() => setErrorModal({ visible: false, message: "" })}
          >
            OK
          </Button>,
        ]}
      >
        <p>{errorModal.message}</p>
      </Modal>
    </div>
  );
};

export default StudentTreatment;
