import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Typography,
} from "antd";
import { useState } from "react";

const { Title, Text } = Typography;
const { TextArea } = Input;

const HealthProfile = () => {
  const [form] = Form.useForm();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (values) => {
    console.log(values);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Hồ sơ sức khỏe</Title>
        <Text type="secondary">Cập nhật thông tin sức khỏe của học sinh</Text>
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
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            allergies: "",
            chronicDiseases: "",
            vision: "",
            hearing: "",
            bloodType: "",
            emergencyContact: "",
            emergencyPhone: "",
            medications: "",
            specialNeeds: "",
            lastCheckup: null,
            nextCheckup: null,
          }}
        >
          <Title level={4}>Thông tin cơ bản</Title>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item name="allergies" label="Dị ứng">
                <TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="chronicDiseases" label="Bệnh mãn tính">
                <TextArea rows={2} />
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
              <Form.Item name="bloodType" label="Nhóm máu">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Title level={4} style={{ marginTop: 24 }}>
            Thông tin liên hệ khẩn cấp
          </Title>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item name="emergencyContact" label="Người liên hệ">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="emergencyPhone" label="Số điện thoại">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Title level={4} style={{ marginTop: 24 }}>
            Thông tin bổ sung
          </Title>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item name="medications" label="Thuốc đang sử dụng">
                <TextArea rows={2} />
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

          <Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 24,
              }}
            >
              <Button type="primary" htmlType="submit" size="large">
                Lưu thông tin
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default HealthProfile;
