import { EditOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Typography,
} from "antd";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import api from "../../utils/api";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Validation schema for the form
const validationSchema = Yup.object().shape({
  allergies: Yup.string().trim(),
  chronicDiseases: Yup.string().trim(),
  medications: Yup.string().trim(),
  treatmentHistory: Yup.string().trim(),
  vision: Yup.string().trim(),
  hearing: Yup.string().trim(),
  height: Yup.number()
    .nullable()
    .typeError("Chiều cao phải là một con số")
    .positive("Chiều cao phải là số dương"),
  weight: Yup.number()
    .nullable()
    .typeError("Cân nặng phải là một con số")
    .positive("Cân nặng phải là số dương"),
  notes: Yup.string().trim(),
});

const HealthProfile = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [healthProfile, setHealthProfile] = useState(null);

  // Fetch children on component mount
  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/parents/my-children", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const studentData = response.data?.data || [];
      setChildren(studentData);
      if (studentData.length > 0) {
        setSelectedStudent(studentData[0].studentId);
      }
    } catch (error) {
      message.error(
        error.response?.data?.error || "Không thể tải danh sách học sinh"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch health profile when a student is selected
  useEffect(() => {
    if (selectedStudent) {
      fetchHealthProfile();
    } else {
      setHealthProfile(null);
    }

  const fetchHealthProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/parents/health-profile/${selectedStudent}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHealthProfile(response.data.data?.healthProfile);
    } catch (error) {
      setHealthProfile(null); // Clear profile on error
      message.error(
        error.response?.data?.error || "Không thể tải hồ sơ sức khỏe"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (studentId) => {
    setSelectedStudentId(studentId);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const transformedValues = {
        ...values,
        allergies: values.allergies
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== ""),
        chronicDiseases: values.chronicDiseases
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== ""),
        medications: values.medications
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== ""),
        treatmentHistory:
          values.treatmentHistory === "" ? null : values.treatmentHistory,
        vision: values.vision === "" ? null : values.vision,
        hearing: values.hearing === "" ? null : values.hearing,
        height:
          values.height === null || values.height === ""
            ? null
            : parseFloat(values.height),
        weight:
          values.weight === null || values.weight === ""
            ? null
            : parseFloat(values.weight),
        notes: values.notes === "" ? null : values.notes,
      };

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/parents/health-profile/${selectedStudent}`,
        transformedValues,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Health profile upserted successfully:", response.data);
      message.success("Cập nhật hồ sơ sức khỏe thành công");
      setIsEditModalVisible(false);
      setShowSuccess(true);
      fetchHealthProfile();
    } catch (error) {
      message.error(
        error.response?.data?.error || "Có lỗi xảy ra khi cập nhật hồ sơ"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getInitialValues = () => ({
    allergies: healthProfile?.allergies?.join(", ") || "",
    chronicDiseases: healthProfile?.chronicDiseases?.join(", ") || "",
    medications: healthProfile?.medications?.join(", ") || "",
    treatmentHistory: healthProfile?.treatmentHistory || "",
    vision: healthProfile?.vision || "",
    hearing: healthProfile?.hearing || "",
    height: healthProfile?.height || "",
    weight: healthProfile?.weight || "",
    notes: healthProfile?.notes || "",
  });

  const renderContent = () => {
    if (loading) {
      return <div style={{ textAlign: "center", padding: "50px" }}><Spin size="large" /></div>;
    }

    if (!selectedStudentId) {
      return <Alert message="Vui lòng chọn một học sinh để xem hoặc cập nhật hồ sơ sức khỏe." type="info" showIcon />;
    }

    if (!healthProfile) {
      return (
        <Alert
          message="Học sinh này chưa có hồ sơ sức khỏe."
          description="Bạn có muốn tạo một hồ sơ mới không?"
          type="info"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => setIsEditModalVisible(true)}>
              Tạo hồ sơ
            </Button>
          }
        />
      );
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
                Hồ sơ sức khỏe
              </Title>
              <Text type="secondary">Thông tin sức khỏe của học sinh</Text>
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              {children && children.length > 0 ? (
                <Select
                  style={{ width: 250 }}
                  value={selectedStudentId}
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
                Cập nhật thông tin
              </Button>
            </div>
          </div>

          {showSuccess && (
            <Alert
              message="Thông tin đã được cập nhật thành công!"
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          {!selectedStudent && (
            <Alert
              message="Vui lòng chọn học sinh để xem hồ sơ sức khỏe"
              type="info"
              showIcon
            />
          )}

          {selectedStudent && !healthProfile && !loading && (
            <Alert
              message="Học sinh này chưa có hồ sơ sức khỏe."
              type="warning"
              showIcon
              action={
                <Button
                  size="small"
                  type="primary"
                  onClick={() => setIsEditModalVisible(true)}
                >
                  Tạo hồ sơ
                </Button>
              }
            />
          )}

          {healthProfile && (
            <Card
              className="rounded-xl border-0 shadow-none"
              style={{ marginBottom: 24 }}
            >
              <Descriptions title="Thông tin cơ bản" bordered>
                <Descriptions.Item label="Dị ứng" span={3}>
                  {healthProfile.allergies?.join(", ")}
                </Descriptions.Item>
                <Descriptions.Item label="Bệnh nền" span={3}>
                  {healthProfile.chronicDiseases?.join(", ")}
                </Descriptions.Item>
                <Descriptions.Item label="Thị lực">
                  {healthProfile.vision}
                </Descriptions.Item>
                <Descriptions.Item label="Thính lực">
                  {healthProfile.hearing}
                </Descriptions.Item>
                <Descriptions.Item label="Chiều cao (cm)">
                  {healthProfile.height}
                </Descriptions.Item>
                <Descriptions.Item label="Cân nặng (kg)">
                  {healthProfile.weight}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions
                title="Thông tin bổ sung"
                bordered
                style={{ marginTop: 24 }}
              >
                <Descriptions.Item label="Ghi chú" span={3}>
                  {healthProfile.notes}
                </Descriptions.Item>
                <Descriptions.Item label="Thuốc đang dùng" span={3}>
                  {healthProfile.medications?.join(", ")}
                </Descriptions.Item>
                <Descriptions.Item label="Lịch sử điều trị" span={3}>
                  {healthProfile.treatmentHistory}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

      <Modal
        title={healthProfile ? "Cập nhật hồ sơ sức khỏe" : "Tạo hồ sơ sức khỏe mới"}
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <Form layout="vertical" onFinish={handleSubmit}>
              <p className="text-gray-500 mb-4">Các trường có dấu (*) là tùy chọn. Với các mục có nhiều giá trị, vui lòng ngăn cách bằng dấu phẩy (vd: Mèo, Chó).</p>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Dị ứng" help={touched.allergies && errors.allergies} validateStatus={touched.allergies && errors.allergies ? 'error' : ''}>
                    <TextArea rows={2} name="allergies" value={values.allergies} onChange={handleChange} onBlur={handleBlur} placeholder="Dị ứng phấn hoa, dị ứng hải sản..." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Bệnh nền" help={touched.chronicDiseases && errors.chronicDiseases} validateStatus={touched.chronicDiseases && errors.chronicDiseases ? 'error' : ''}>
                    <TextArea rows={2} name="chronicDiseases" value={values.chronicDiseases} onChange={handleChange} onBlur={handleBlur} placeholder="Hen suyễn, tiểu đường..." />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Thuốc đang sử dụng" help={touched.medications && errors.medications} validateStatus={touched.medications && errors.medications ? 'error' : ''}>
                    <TextArea rows={2} name="medications" value={values.medications} onChange={handleChange} onBlur={handleBlur} placeholder="Paracetamol, Amoxicillin..." />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Lịch sử điều trị" help={touched.treatmentHistory && errors.treatmentHistory} validateStatus={touched.treatmentHistory && errors.treatmentHistory ? 'error' : ''}>
                    <TextArea rows={3} name="treatmentHistory" value={values.treatmentHistory} onChange={handleChange} onBlur={handleBlur} placeholder="Mô tả các lần điều trị, phẫu thuật trước đây..." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Thị lực" help={touched.vision && errors.vision} validateStatus={touched.vision && errors.vision ? 'error' : ''}>
                    <Input name="vision" value={values.vision} onChange={handleChange} onBlur={handleBlur} placeholder="Mắt trái 8/10, Mắt phải 9/10" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Thính lực" help={touched.hearing && errors.hearing} validateStatus={touched.hearing && errors.hearing ? 'error' : ''}>
                    <Input name="hearing" value={values.hearing} onChange={handleChange} onBlur={handleBlur} placeholder="Bình thường" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Chiều cao (cm)" help={touched.height && errors.height} validateStatus={touched.height && errors.height ? 'error' : ''}>
                    <Input name="height" value={values.height} onChange={handleChange} onBlur={handleBlur} placeholder="165" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Cân nặng (kg)" help={touched.weight && errors.weight} validateStatus={touched.weight && errors.weight ? 'error' : ''}>
                    <Input name="weight" value={values.weight} onChange={handleChange} onBlur={handleBlur} placeholder="55.5" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Ghi chú thêm" help={touched.notes && errors.notes} validateStatus={touched.notes && errors.notes ? 'error' : ''}>
                    <TextArea rows={3} name="notes" value={values.notes} onChange={handleChange} onBlur={handleBlur} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={isSubmitting} block>
                  {healthProfile ? "Lưu thay đổi" : "Tạo hồ sơ"}
                </Button>
              </Form.Item>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default HealthProfile;
