import { Button, Modal, message, Input as AntInput } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import api from "../../utils/api";
import {
  Form,
  FormContainer,
  Title,
  ErrorMessageDiv,
  ErrorMessage,
  LargeButton,
  Paragraph,
} from "./AuthStyles";
import { MailOutlined, LockOutlined } from '@ant-design/icons';

export const AuthTemplate = ({ isOpen, onCloseModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { login, setScrollToServices } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      if (response.data.success) {
        const { user, token } = response.data;
        login(user, token);
        message.success("Đăng nhập thành công");
        if (user.role === "ADMIN") {
          navigate("/admin");
        } else if (user.role === "SCHOOL_NURSE") {
          navigate("/nurse");
        } else if (user.role === "MANAGER") {
          navigate("/manager");
        } else {
          navigate("/user");
          setScrollToServices(true);
        }
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        if (
          error.response.data.error.includes("Invalid credentials") ||
          error.response.data.error.includes("Email and password are required")
        ) {
          setErrors({ email: "Thông tin đăng nhập không hợp lệ" });
        } else {
          setErrors({ general: error.response.data.error });
        }
      } else {
        setErrors({
          general: "Đã xảy ra lỗi không mong muốn trong quá trình đăng nhập.",
        });
      }
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onCloseModal}
      footer={null}
      className="custom-modal"
      forceRender={true}
      width={400}
      centered
      maskStyle={{ background: '#f6f5f7' }}
      bodyStyle={{
        padding: 0,
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      style={{
        padding: 0,
      }}
    >
      <FormContainer style={{ minHeight: 0, width: '100%', maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <Form onSubmit={handleLogin}>
          <Title>Đăng nhập</Title>
          <Paragraph>Chào mừng bạn quay lại! Vui lòng đăng nhập để tiếp tục.</Paragraph>
          {errors.general && (
            <ErrorMessageDiv>
              {errors.general}
            </ErrorMessageDiv>
          )}
          <AntInput
            size="large"
            prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            type="email"
            style={{ marginBottom: 16 }}
            required
          />
          <AntInput.Password
            size="large"
            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu của bạn"
            style={{ marginBottom: 8 }}
            required
          />
          {errors.email && (
            <ErrorMessage>
              {errors.email}
            </ErrorMessage>
          )}
          {errors.password && (
            <ErrorMessage>
              {errors.password}
            </ErrorMessage>
          )}
          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            <a href="/forgot-password" style={{ fontSize: 14 }}>Quên mật khẩu?</a>
          </div>
          <LargeButton htmlType="submit">Đăng nhập</LargeButton>
        </Form>
      </FormContainer>
    </Modal>
  );
};
