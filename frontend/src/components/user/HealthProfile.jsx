import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Typography,
  Upload,
  message,
} from "antd";
import { Formik } from "formik";
import { useState } from "react";
import * as Yup from "yup";

const { Title, Text } = Typography;
const { TextArea } = Input;

const validationSchema = Yup.object().shape({
  allergies: Yup.string().required("Vui lòng nhập thông tin dị ứng"),
  medicalConditions: Yup.string().required("Vui lòng nhập thông tin bệnh nền"),
  medications: Yup.string().required("Vui lòng nhập thông tin thuốc đang dùng"),
  bloodType: Yup.string().required("Vui lòng chọn nhóm máu"),
  emergencyContact: Yup.string().required(
    "Vui lòng nhập số điện thoại liên hệ khẩn cấp"
  ),
});

const HealthProfile = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Mock data - replace with actual API data
  const healthProfile = {
    allergies: "Không có",
    medicalConditions: "Không có",
    medications: "Không có",
    bloodType: "A+",
    emergencyContact: "0123456789",
    vision: "10/10",
    hearing: "Bình thường",
    specialNeeds: "Không có",
    lastCheckup: "2024-03-15",
    nextCheckup: "2024-09-15",
    medicalFiles: [
      {
        name: "Kết quả khám sức khỏe.pdf",
        url: "#",
      },
    ],
  };

  const initialValues = {
    allergies: healthProfile.allergies,
    medicalConditions: healthProfile.medicalConditions,
    medications: healthProfile.medications,
    bloodType: healthProfile.bloodType,
    emergencyContact: healthProfile.emergencyContact,
    medicalFiles: healthProfile.medicalFiles,
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Implement API call here
      console.log("Form values:", values);
      message.success("Cập nhật hồ sơ sức khỏe thành công");
      setIsEditModalVisible(false);
      setShowSuccess(true);
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật hồ sơ");
    } finally {
      setSubmitting(false);
    }
  };

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
          <Title level={2}>Hồ sơ sức khỏe</Title>
          <Text type="secondary">Thông tin sức khỏe của học sinh</Text>
        </div>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => setIsEditModalVisible(true)}
        >
          Cập nhật thông tin
        </Button>
      </div>

      {showSuccess && (
        <Alert
          message="Thông tin đã được cập nhật thành công!"
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Card>
        <Descriptions title="Thông tin cơ bản" bordered>
          <Descriptions.Item label="Dị ứng" span={3}>
            {healthProfile.allergies}
          </Descriptions.Item>
          <Descriptions.Item label="Bệnh nền" span={3}>
            {healthProfile.medicalConditions}
          </Descriptions.Item>
          <Descriptions.Item label="Thị lực">
            {healthProfile.vision}
          </Descriptions.Item>
          <Descriptions.Item label="Thính lực">
            {healthProfile.hearing}
          </Descriptions.Item>
          <Descriptions.Item label="Nhóm máu">
            {healthProfile.bloodType}
          </Descriptions.Item>
        </Descriptions>

        <Descriptions
          title="Thông tin liên hệ khẩn cấp"
          bordered
          style={{ marginTop: 24 }}
        >
          <Descriptions.Item label="Số điện thoại liên hệ khẩn cấp">
            {healthProfile.emergencyContact}
          </Descriptions.Item>
        </Descriptions>

        <Descriptions
          title="Thông tin bổ sung"
          bordered
          style={{ marginTop: 24 }}
        >
          <Descriptions.Item label="Thuốc đang dùng" span={3}>
            {healthProfile.medications}
          </Descriptions.Item>
          <Descriptions.Item label="Nhu cầu đặc biệt" span={3}>
            {healthProfile.specialNeeds}
          </Descriptions.Item>
          <Descriptions.Item label="Lần kiểm tra gần nhất">
            {healthProfile.lastCheckup}
          </Descriptions.Item>
          <Descriptions.Item label="Lần kiểm tra tiếp theo">
            {healthProfile.nextCheckup}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 24 }}>
          <Title level={4}>Tài liệu y tế</Title>
          <ul>
            {healthProfile.medicalFiles.map((file, index) => (
              <li key={index}>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Modal
        title="Cập nhật hồ sơ sức khỏe"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={800}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
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
                      touched.medicalConditions && errors.medicalConditions
                        ? "error"
                        : ""
                    }
                    help={touched.medicalConditions && errors.medicalConditions}
                  >
                    <TextArea
                      name="medicalConditions"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.medicalConditions}
                      placeholder="Nhập thông tin bệnh nền (nếu có)"
                      rows={4}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="vision" label="Thị lực">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="hearing" label="Thính lực">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Nhóm máu"
                    validateStatus={
                      touched.bloodType && errors.bloodType ? "error" : ""
                    }
                    help={touched.bloodType && errors.bloodType}
                  >
                    <Select
                      name="bloodType"
                      onChange={(value) => setFieldValue("bloodType", value)}
                      onBlur={handleBlur}
                      value={values.bloodType}
                      placeholder="Chọn nhóm máu"
                    >
                      <Select.Option value="A+">A+</Select.Option>
                      <Select.Option value="A-">A-</Select.Option>
                      <Select.Option value="B+">B+</Select.Option>
                      <Select.Option value="B-">B-</Select.Option>
                      <Select.Option value="AB+">AB+</Select.Option>
                      <Select.Option value="AB-">AB-</Select.Option>
                      <Select.Option value="O+">O+</Select.Option>
                      <Select.Option value="O-">O-</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Title level={4} style={{ marginTop: 24 }}>
                Thông tin liên hệ khẩn cấp
              </Title>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Số điện thoại liên hệ khẩn cấp"
                    validateStatus={
                      touched.emergencyContact && errors.emergencyContact
                        ? "error"
                        : ""
                    }
                    help={touched.emergencyContact && errors.emergencyContact}
                  >
                    <Input
                      name="emergencyContact"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.emergencyContact}
                      placeholder="Nhập số điện thoại"
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
                      touched.medications && errors.medications ? "error" : ""
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
                  <Form.Item name="specialNeeds" label="Nhu cầu đặc biệt">
                    <TextArea rows={2} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="lastCheckup" label="Lần kiểm tra gần nhất">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="nextCheckup" label="Lần kiểm tra tiếp theo">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Tài liệu y tế">
                <Upload
                  multiple
                  beforeUpload={() => false}
                  onChange={({ fileList }) =>
                    setFieldValue("medicalFiles", fileList)
                  }
                >
                  <Button icon={<UploadOutlined />}>Tải lên tài liệu</Button>
                </Upload>
              </Form.Item>

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
    </div>
  );
};

export default HealthProfile;
