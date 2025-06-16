import { EditOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import axios from "axios";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { useAuth } from "../../context/authContext.jsx";
import NotificationDisplay from "../shared/NotificationDisplay.jsx";

const { Title, Text } = Typography;
const { TextArea } = Input;

const validationSchema = Yup.object().shape({
  studentId: Yup.string().required("Vui lòng chọn học sinh"),
  medicationName: Yup.string().required("Vui lòng nhập tên thuốc"),
  dosage: Yup.string().required("Vui lòng nhập liều lượng"),
  frequency: Yup.string().required("Vui lòng nhập tần suất sử dụng"),
  instructions: Yup.string().required("Vui lòng nhập hướng dẫn sử dụng"),
  startDate: Yup.date().required("Vui lòng chọn ngày bắt đầu"),
  endDate: Yup.date().required("Vui lòng chọn ngày kết thúc"),
  description: Yup.string(),
  unit: Yup.string(),
});

const MedicineInfo = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
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

  const handleStudentChange = (studentId) => {
    setSelectedStudent(studentId);
  };

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
      console.error("Error submitting medication:", error);
      message.error(
        error.response?.data?.error || "Có lỗi xảy ra khi gửi thông tin"
      );
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  const currentUserId = user?.id;

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Title level={2}>Thông tin thuốc</Title>
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
                <Select.Option key={child.studentId} value={child.studentId}>
                  {child.fullName} - {child.studentCode}
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
        <Card>
          <div style={{ textAlign: "center", padding: "24px" }}>
            <Text type="secondary">
              Vui lòng chọn học sinh để xem thông báo thuốc
            </Text>
          </div>
        </Card>
      )}

      <Modal
        title="Thêm thuốc mới"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={800}
      >
        <Formik
          initialValues={{
            studentId: selectedStudent,
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
          enableReinitialize={true}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setFieldValue,
          }) => (
            <Form layout="vertical" onFinish={handleSubmit}>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Tên thuốc"
                    validateStatus={
                      touched.medicationName && errors.medicationName
                        ? "error"
                        : ""
                    }
                    help={touched.medicationName && errors.medicationName}
                  >
                    <Input
                      name="medicationName"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.medicationName}
                      placeholder="Nhập tên thuốc"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Liều lượng"
                    validateStatus={
                      touched.dosage && errors.dosage ? "error" : ""
                    }
                    help={touched.dosage && errors.dosage}
                  >
                    <Input
                      name="dosage"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.dosage}
                      placeholder="Ví dụ: 1 viên/lần"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Tần suất sử dụng"
                    validateStatus={
                      touched.frequency && errors.frequency ? "error" : ""
                    }
                    help={touched.frequency && errors.frequency}
                  >
                    <Select
                      name="frequency"
                      onChange={(value) => setFieldValue("frequency", value)}
                      onBlur={handleBlur}
                      value={values.frequency}
                      placeholder="Chọn tần suất"
                    >
                      <Select.Option value="once">1 lần/ngày</Select.Option>
                      <Select.Option value="twice">2 lần/ngày</Select.Option>
                      <Select.Option value="three">3 lần/ngày</Select.Option>
                      <Select.Option value="four">4 lần/ngày</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Mô tả"
                    validateStatus={
                      touched.description && errors.description ? "error" : ""
                    }
                    help={touched.description && errors.description}
                  >
                    <Input
                      name="description"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.description}
                      placeholder="Nhập mô tả thuốc"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Đơn vị"
                    validateStatus={touched.unit && errors.unit ? "error" : ""}
                    help={touched.unit && errors.unit}
                  >
                    <Input
                      name="unit"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.unit}
                      placeholder="Ví dụ: viên, ml, mg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Thời gian sử dụng"
                    validateStatus={
                      (touched.startDate && errors.startDate) ||
                      (touched.endDate && errors.endDate)
                        ? "error"
                        : ""
                    }
                    help={
                      (touched.startDate && errors.startDate) ||
                      (touched.endDate && errors.endDate)
                    }
                  >
                    <Space>
                      <DatePicker
                        placeholder="Ngày bắt đầu"
                        onChange={(date) => setFieldValue("startDate", date)}
                        value={values.startDate}
                      />
                      <span>-</span>
                      <DatePicker
                        placeholder="Ngày kết thúc"
                        onChange={(date) => setFieldValue("endDate", date)}
                        value={values.endDate}
                      />
                    </Space>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    label="Hướng dẫn sử dụng"
                    validateStatus={
                      touched.instructions && errors.instructions ? "error" : ""
                    }
                    help={touched.instructions && errors.instructions}
                  >
                    <TextArea
                      name="instructions"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.instructions}
                      placeholder="Nhập hướng dẫn sử dụng chi tiết"
                      rows={4}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 24,
                  }}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                  >
                    Gửi thông tin
                  </Button>
                </div>
              </Form.Item>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default MedicineInfo;
