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
      const response = await axios.get("/api/parents/children");
      if (response.data.success) {
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
      const response = await axios.post(
        `/api/parents/students/${values.studentId}/medications`,
        {
          medicationName: values.medicationName,
          dosage: values.dosage,
          frequency: values.frequency,
          instructions: values.instructions,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate ? values.endDate.toISOString() : null,
          description: values.description,
          unit: values.unit,
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
      <Table
        columns={columns}
        dataSource={studentMedicines}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />
    );
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4 pt-24">
      <Card className="rounded-xl shadow-md p-4">
        {/* Header Section */}
        <div className="pb-4 border-b mb-6">
          <Title level={2} className="text-gray-800 !m-0">Quản lý thuốc</Title>
          <Text type="secondary">Xem và gửi yêu cầu sử dụng thuốc cho học sinh tại trường.</Text>
        </div>

        {/* Controls Section */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Text strong>Chọn học sinh:</Text>
            <Select
              style={{ width: 250 }}
              value={selectedStudentId}
              onChange={setSelectedStudentId}
              placeholder="-- Vui lòng chọn --"
              loading={loading && children.length === 0}
              disabled={children.length === 0}
            >
              {children.map((child) => (
                <Select.Option key={child.studentId} value={child.studentId}>
                  {child.fullName}
                </Select.Option>
              ))}
            </Select>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            disabled={!selectedStudentId}
          >
            Yêu cầu thuốc mới
          </Button>
        </div>
        
        <Divider />

        {/* Content Section */}
        <div className="mt-6">
          {renderContent()}
        </div>
      </Card>

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
