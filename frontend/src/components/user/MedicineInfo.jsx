import { PlusOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  Typography
} from "antd";
import { Formik } from "formik";
import moment from "moment";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import api from "../../utils/api";

const { Title, Text } = Typography;
const { TextArea } = Input;

// --- Validation Schema ---
const validationSchema = Yup.object().shape({
  medicationName: Yup.string().required("Vui lòng nhập tên thuốc"),
  dosage: Yup.string().required("Vui lòng nhập liều lượng"),
  frequency: Yup.string().required("Vui lòng nhập tần suất"),
  instructions: Yup.string().required("Vui lòng nhập hướng dẫn"),
  startDate: Yup.date().required("Vui lòng chọn ngày bắt đầu").nullable(),
  endDate: Yup.date().nullable().min(Yup.ref('startDate'), "Ngày kết thúc phải sau ngày bắt đầu"),
  description: Yup.string(),
  unit: Yup.string(),
});

// --- Component ---
const MedicineInfo = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentMedicines, setStudentMedicines] = useState([]);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const response = await api.get("/parents/my-children");
        const childrenData = response.data.data || [];
        setChildren(childrenData);
        if (childrenData.length > 0) {
          setSelectedStudentId(childrenData[0].studentId);
        }
      } catch (error) {
        message.error("Không thể tải danh sách học sinh");
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/parents/my-children", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        console.log(response.data.data);
        setChildren(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedStudent(response.data.data[0].studentId);
        }
      }
    } catch (error) {
      console.error("Error fetching children:", error);
      message.error("Không thể lấy danh sách học sinh");
    } finally {
      setLoading(false);
    }
  };

    fetchMedicines();
  }, [selectedStudentId]);

  // --- Handlers ---
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/parents/request-medication/${values.studentId}`,
        {
          medicationName: values.medicationName,
          dosage: values.dosage,
          frequency: values.frequency,
          instructions: values.instructions,
          startDate: values.startDate ? values.startDate.toISOString() : null,
          endDate: values.endDate ? values.endDate.toISOString() : null,
          description: values.description,
          unit: values.unit,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        message.success("Gửi thông tin thuốc thành công");
        resetForm();
        setIsEditModalVisible(false);
        setShowSuccess(true);
      } else {
        message.error(response.data.error || "Có lỗi xảy ra khi gửi thông tin");
      }
    } catch (error) {
      message.error(error.response?.data?.error || "Có lỗi xảy ra khi gửi yêu cầu");
    } finally {
      setSubmitting(false);
    }
  };

  // --- UI Components ---
  const columns = [
    {
      title: 'Tên thuốc',
      dataIndex: ['medication', 'name'],
      key: 'name',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        const color = {
          PENDING_APPROVAL: 'gold',
          APPROVED: 'green',
          REJECTED: 'red',
          ACTIVE: 'blue',
          EXPIRED: 'default',
        }[status];
        return <Tag color={color}>{status.replace('_', ' ')}</Tag>;
      },
    },
    {
      title: 'Liều lượng',
      dataIndex: 'dosage',
      key: 'dosage',
    },
    {
      title: 'Tần suất',
      dataIndex: 'frequency',
      key: 'frequency',
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (text) => moment(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (text) => text ? moment(text).format('DD/MM/YYYY') : 'N/A',
    },
  ];

  const renderContent = () => {
    if (loading && studentMedicines.length === 0) {
      return <div style={{ textAlign: "center", padding: "50px" }}><Spin size="large" /></div>;
    }
    if (!selectedStudentId) {
      return <Alert message="Vui lòng chọn một học sinh để quản lý thông tin thuốc." type="info" showIcon />;
    }
    return (
      <div className="min-h-screen flex justify-center items-start bg-[#f6fcfa] py-10">
        <div className="w-full max-w-5xl mx-auto px-4">
          <div style={{ padding: "24px", textAlign: "center" }}>
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex justify-center items-start bg-[#f6fcfa] py-10">
      <div className="w-full max-w-5xl mx-auto px-4">
        <Card
          className="w-full rounded-3xl shadow-lg border-0 mt-12"
          style={{
            background: "#fff",
            borderRadius: "1.5rem",
            boxShadow: "0px 3px 16px rgba(0,0,0,0.10)",
            padding: "2rem",
            marginTop: "3rem",
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              marginBottom: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <Title level={2} className="!text-[#36ae9a] !mb-0">
                Thông tin thuốc
              </Title>
              <Text type="secondary">Quản lý thông tin thuốc của học sinh</Text>
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              {children && children.length > 0 ? (
                <Select
                  style={{ width: 200 }}
                  value={selectedStudent}
                  onChange={handleStudentChange}
                  placeholder="Chọn học sinh"
                >
                  {children.map((child) => (
                    <Select.Option
                      key={child.studentId}
                      value={child.studentId}
                    >
                      {child.fullName}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <Text type="secondary">Không có học sinh nào</Text>
              )}
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditModalVisible(true)}
                disabled={!selectedStudent}
              >
                Thêm thuốc mới
              </Button>
            </div>
          </div>

          {showSuccess && (
            <Alert
              message="Thông tin thuốc đã được gửi thành công!"
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          {selectedStudent && currentUserId ? (
            <NotificationDisplay userId={currentUserId} type="medication" />
          ) : (
            <Card className="rounded-xl border-0 shadow-none">
              <div style={{ textAlign: "center", padding: "24px" }}>
                <Text type="secondary">
                  Vui lòng chọn học sinh để xem thông báo thuốc
                </Text>
              </div>
            </Card>
          )}

      {/* Modal for adding new medicine request */}
      <Modal
        title="Tạo yêu cầu sử dụng thuốc mới"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Formik
          initialValues={{
            medicationName: "",
            dosage: "",
            frequency: "",
            instructions: "",
            startDate: null,
            endDate: null,
            description: "",
            unit: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
            <Form layout="vertical" onFinish={handleSubmit}>
               <Form.Item label="Tên thuốc" required help={touched.medicationName && errors.medicationName} validateStatus={touched.medicationName && errors.medicationName ? 'error' : ''}>
                    <Input name="medicationName" value={values.medicationName} onChange={handleChange} onBlur={handleBlur} />
                </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Liều lượng" required help={touched.dosage && errors.dosage} validateStatus={touched.dosage && errors.dosage ? 'error' : ''}>
                    <Input name="dosage" value={values.dosage} onChange={handleChange} onBlur={handleBlur} placeholder="Ví dụ: 1 viên"/>
                  </Form.Item>
                </Col>
                <Col span={12}>
                   <Form.Item label="Đơn vị" help={touched.unit && errors.unit} validateStatus={touched.unit && errors.unit ? 'error' : ''}>
                    <Input name="unit" value={values.unit} onChange={handleChange} onBlur={handleBlur} placeholder="Ví dụ: mg, ml" />
                  </Form.Item>
                </Col>
              </Row>
                <Form.Item label="Tần suất" required help={touched.frequency && errors.frequency} validateStatus={touched.frequency && errors.frequency ? 'error' : ''}>
                    <Input name="frequency" value={values.frequency} onChange={handleChange} onBlur={handleBlur} placeholder="Ví dụ: 2 lần/ngày, sau bữa ăn" />
                </Form.Item>
                <Form.Item label="Hướng dẫn sử dụng" required help={touched.instructions && errors.instructions} validateStatus={touched.instructions && errors.instructions ? 'error' : ''}>
                    <TextArea rows={3} name="instructions" value={values.instructions} onChange={handleChange} onBlur={handleBlur} />
                </Form.Item>
                 <Form.Item label="Mô tả thêm về thuốc" help={touched.description && errors.description} validateStatus={touched.description && errors.description ? 'error' : ''}>
                    <TextArea rows={2} name="description" value={values.description} onChange={handleChange} onBlur={handleBlur} />
                </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Ngày bắt đầu" required help={touched.startDate && errors.startDate} validateStatus={touched.startDate && errors.startDate ? 'error' : ''}>
                    <DatePicker style={{ width: '100%' }} name="startDate" value={values.startDate} onChange={(date) => setFieldValue('startDate', date)} onBlur={handleBlur} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Ngày kết thúc" help={touched.endDate && errors.endDate} validateStatus={touched.endDate && errors.endDate ? 'error' : ''}>
                    <DatePicker style={{ width: '100%' }} name="endDate" value={values.endDate} onChange={(date) => setFieldValue('endDate', date)} onBlur={handleBlur} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={isSubmitting} block>
                  Gửi yêu cầu
                </Button>
              </Form.Item>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default MedicineInfo;
