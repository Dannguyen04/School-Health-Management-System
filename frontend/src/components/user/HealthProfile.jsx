import { EditOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Typography,
} from "antd";
import axios from "axios";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";

const { Title, Text } = Typography;
const { TextArea } = Input;

const validationSchema = Yup.object().shape({
  allergies: Yup.string().required("Vui lòng nhập thông tin dị ứng"),
  chronicDiseases: Yup.string().required("Vui lòng nhập thông tin bệnh nền"),
  medications: Yup.string().required("Vui lòng nhập thông tin thuốc đang dùng"),
  treatmentHistory: Yup.string(),
  vision: Yup.string(),
  hearing: Yup.string(),
  height: Yup.number().nullable(),
  weight: Yup.number().nullable(),
  notes: Yup.string(),
});

const HealthProfile = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [healthProfile, setHealthProfile] = useState(null);

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

  useEffect(() => {
    if (selectedStudent) {
      fetchHealthProfile();
    } else {
      setHealthProfile(null);
    }
  }, [selectedStudent]);

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
      setHealthProfile(null);
      message.error(
        error.response?.data?.error || "Không thể tải hồ sơ sức khỏe"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (studentId) => {
    setSelectedStudent(studentId);
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
      console.error("Error updating health profile:", error);
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
    height: healthProfile?.height || null,
    weight: healthProfile?.weight || null,
    notes: healthProfile?.notes || "",
  });

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f6fcfa] ">
        <div className="w-full max-w-5xl mx-auto px-4">
          <div style={{ padding: "24px", textAlign: "center" }}>
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f6fcfa]">
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
            title="Cập nhật hồ sơ sức khỏe"
            open={isEditModalVisible}
            onCancel={() => setIsEditModalVisible(false)}
            footer={null}
            width={800}
          >
            <Formik
              initialValues={getInitialValues()}
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
              }) => (
                <Form layout="vertical" onFinish={handleSubmit}>
                  <Title level={4}>Thông tin cơ bản</Title>
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Dị ứng"
                        validateStatus={
                          touched.allergies && errors.allergies ? "error" : ""
                        }
                        help={touched.allergies && errors.allergies}
                      >
                        <TextArea
                          name="allergies"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.allergies}
                          placeholder="Nhập thông tin dị ứng (nếu có)"
                          rows={4}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Bệnh nền"
                        validateStatus={
                          touched.chronicDiseases && errors.chronicDiseases
                            ? "error"
                            : ""
                        }
                        help={touched.chronicDiseases && errors.chronicDiseases}
                      >
                        <TextArea
                          name="chronicDiseases"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.chronicDiseases}
                          placeholder="Nhập thông tin bệnh nền (nếu có)"
                          rows={4}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="vision" label="Thị lực">
                        <Input
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.vision}
                          placeholder="Nhập thị lực"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="hearing" label="Thính lực">
                        <Input
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.hearing}
                          placeholder="Nhập thính lực"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="height" label="Chiều cao (cm)">
                        <Input
                          type="number"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.height}
                          placeholder="Nhập chiều cao"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="weight" label="Cân nặng (kg)">
                        <Input
                          type="number"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.weight}
                          placeholder="Nhập cân nặng"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Title level={4} style={{ marginTop: 24 }}>
                    Thông tin bổ sung
                  </Title>
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Thuốc đang dùng"
                        validateStatus={
                          touched.medications && errors.medications
                            ? "error"
                            : ""
                        }
                        help={touched.medications && errors.medications}
                      >
                        <TextArea
                          name="medications"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.medications}
                          placeholder="Nhập thông tin thuốc đang dùng (nếu có)"
                          rows={4}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="treatmentHistory"
                        label="Lịch sử điều trị"
                      >
                        <TextArea
                          name="treatmentHistory"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.treatmentHistory}
                          placeholder="Nhập lịch sử điều trị (nếu có)"
                          rows={4}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={24}>
                      <Form.Item name="notes" label="Ghi chú">
                        <TextArea
                          name="notes"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.notes}
                          placeholder="Thêm ghi chú (nếu có)"
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
                        Lưu thông tin
                      </Button>
                    </div>
                  </Form.Item>
                </Form>
              )}
            </Formik>
          </Modal>
        </Card>
      </div>
    </div>
  );
};

export default HealthProfile;
