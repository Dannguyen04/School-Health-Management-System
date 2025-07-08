import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Input as AntInput, Modal, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { useAuth } from "../../context/authContext";
import api from "../../utils/api";
import {
  ErrorMessage,
  ErrorMessageDiv,
  Form,
  FormContainer,
  LargeButton,
  Title,
} from "./AuthStyles";

// Global style để loại bỏ viền, nền, bo góc của .ant-modal-content
const GlobalModalOverride = createGlobalStyle`
  .ant-modal-content {
    background: transparent !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    border: none !important;
  }
`;

export const AuthTemplate = ({ isOpen, onCloseModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { login, setScrollToServices } = useAuth();
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);

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
          navigate("/parent");
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
    <>
      <GlobalModalOverride />
      <Modal
        open={isOpen}
        onCancel={onCloseModal}
        footer={null}
        className="custom-modal"
        forceRender={true}
        width={400}
        centered
        styles={{
          mask: { background: "#f6f5f7" },
          body: {
            padding: 0,
            background: "transparent",
            borderRadius: 0,
            boxShadow: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        style={{
          padding: 0,
          margin: 0,
          maxWidth: "100vw",
          background: "transparent",
          boxShadow: "none",
          borderRadius: 0,
        }}
        modalRender={(modal) => (
          <div
            style={{
              background: "transparent",
              boxShadow: "none",
              padding: 0,
            }}
          >
            {modal}
          </div>
        )}
      >
        <FormContainer
          style={{
            minHeight: 0,
            width: "100%",
            maxWidth: 400,
            borderRadius: 28,
            padding: "38px 28px 28px 28px",
            boxShadow:
              "0 8px 32px rgba(54,174,154,0.10), 0 2px 12px 0 rgba(54,174,154,0.13)",
            background: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            <img
              src="/img/logo.png"
              alt="School Health Logo"
              style={{
                width: 60,
                height: 60,
                marginBottom: 10,
                objectFit: "contain",
              }}
            />
            <span
              style={{
                fontWeight: 700,
                fontSize: 20,
                color: "#36AE9A",
                marginBottom: 2,
                letterSpacing: 1,
              }}
            >
              SCHOOL HEALTH SYSTEM
            </span>
            <Title
              style={{
                fontSize: "1.7rem",
                marginBottom: 0,
                marginTop: 8,
                background: "linear-gradient(90deg, #36AE9A 0%, #36AE9A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Đăng nhập
            </Title>
          </div>
          <Form onSubmit={handleLogin}>
            {errors.general && (
              <ErrorMessageDiv>{errors.general}</ErrorMessageDiv>
            )}
            <AntInput
              size="large"
              prefix={
                <MailOutlined style={{ color: "#36AE9A", fontSize: 18 }} />
              }
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              type="email"
              style={{
                marginBottom: 18,
                borderRadius: 18,
                border: "1.5px solid #36AE9A33",
                background: "#f7f7fa",
                fontSize: 15,
                padding: "12px 16px",
                boxShadow: "0 2px 8px rgba(54,174,154,0.04)",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.border = "1.5px solid #36AE9A")}
              onBlur={(e) => (e.target.style.border = "1.5px solid #36AE9A33")}
              required
            />
            {errors.email && (
              <ErrorMessage style={{ marginBottom: 8 }}>
                {errors.email}
              </ErrorMessage>
            )}
            <AntInput.Password
              size="large"
              prefix={
                <LockOutlined style={{ color: "#36AE9A", fontSize: 18 }} />
              }
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu của bạn"
              style={{
                marginBottom: 28,
                borderRadius: 18,
                border: "1.5px solid #36AE9A33",
                background: "#f7f7fa",
                fontSize: 15,
                padding: "12px 16px",
                boxShadow: "0 2px 8px rgba(54,174,154,0.04)",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.border = "1.5px solid #36AE9A")}
              onBlur={(e) => (e.target.style.border = "1.5px solid #36AE9A33")}
              required
            />
            {errors.password && (
              <ErrorMessage style={{ marginBottom: 8 }}>
                {errors.password}
              </ErrorMessage>
            )}
            <LargeButton
              type="submit"
              style={{
                background: "linear-gradient(90deg, #36AE9A 0%, #36AE9A 100%)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1.1rem",
                borderRadius: 24,
                boxShadow: "0 4px 20px rgba(54,174,154,0.18)",
                letterSpacing: 1,
                transition: "background 0.2s, box-shadow 0.2s",
                textTransform: "uppercase",
                marginTop: 8,
              }}
            >
              Đăng nhập
            </LargeButton>
          </Form>
        </FormContainer>
      </Modal>
    </>
  );
};
