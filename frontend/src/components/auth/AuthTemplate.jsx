import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { Button, Modal } from "antd";
import cn from "classnames";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import api from "../../utils/api";
import { Input } from "../Input";
import {
  Form,
  FormContainer,
  GhostButton,
  Overlay,
  OverlayContainer,
  OverlayPanel,
  Paragraph,
  SignInContainer,
  SignUpContainer,
  Title,
} from "./AuthStyles";

export const AuthTemplate = ({ isOpen, onCloseModal }) => {
  const [signIn, setSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      if (response.data.success) {
        const { user, token } = response.data;
        login(user, token);
        navigate("/");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        const backendError = error.response.data.error;
        if (backendError.includes("Password must be at least 8 characters")) {
          setErrors({ password: "Mật khẩu phải có ít nhất 8 ký tự" });
        } else if (
          backendError.includes("email") ||
          backendError.includes("User already exists")
        ) {
          setErrors({ email: "Email đã tồn tại trong hệ thống" });
        } else if (
          backendError.includes("Name, email and password are required")
        ) {
          setErrors({
            name: "Vui lòng nhập đầy đủ thông tin",
            email: "Vui lòng nhập đầy đủ thông tin",
            password: "Vui lòng nhập đầy đủ thông tin",
          });
        } else {
          setErrors({ general: backendError });
        }
      } else {
        setErrors({
          general: "Đã xảy ra lỗi không mong muốn trong quá trình đăng ký.",
        });
      }
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      console.log("Google login response:", response);
      const res = await api.post("/auth/google-login", {
        credential: response.credential,
      });

      console.log("Backend response:", res.data);

      if (res.data.success) {
        const { user, token } = res.data;
        login(user, token);
        if (user.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Google login error:", error);
      setErrors({
        general:
          error.response?.data?.error ||
          error.message ||
          "Đăng nhập bằng Google thất bại. Vui lòng thử lại.",
      });
    }
  };

  const handleGoogleError = (error) => {
    console.error("Google login error:", error);
    setErrors({ general: "Đăng nhập bằng Google thất bại. Vui lòng thử lại." });
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onCloseModal}
      footer={null}
      centered
      className="custom-modal"
      destroyOnHidden
      width={1200}
      styles={{
        body: {
          height: 580,
        },
      }}
    >
      <FormContainer
        className={cn({
          "signin-active": signIn,
          "signup-active": !signIn,
        })}
      >
        <SignInContainer className="sign-in-container">
          {errors.general && (
            <div
              style={{
                color: "red",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              {errors.general}
            </div>
          )}
          <Form onSubmit={handleLogin}>
            <Title>Đăng nhập</Title>
            <Input
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              required
            />
            {errors.email && (
              <p
                style={{
                  color: "#D8000C",
                  backgroundColor: "#FFD2D2",
                  border: "1px solid #D8000C",
                  padding: "5px 10px",
                  borderRadius: "3px",
                  fontSize: "13px",
                  marginTop: "5px",
                  fontWeight: "bold",
                }}
              >
                {errors.email}
              </p>
            )}
            <Input
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu của bạn"
              type="password"
              required
            />
            {errors.password && (
              <p
                style={{
                  color: "#D8000C",
                  backgroundColor: "#FFD2D2",
                  border: "1px solid #D8000C",
                  padding: "5px 10px",
                  borderRadius: "3px",
                  fontSize: "13px",
                  marginTop: "5px",
                  fontWeight: "bold",
                }}
              >
                {errors.password}
              </p>
            )}
            <Paragraph>Quên mật khẩu?</Paragraph>
            <Button
              htmlType="submit"
              style={{
                borderRadius: "20px",
                border: "1px solid #ff4b2b",
                backgroundColor: "#ff4b2b",
                color: "#fff",
                fontSize: "15px",
                fontWeight: "bold",
                padding: "24px 47px",
                letterSpacing: "1px",
                transition: "transform 80ms ease-in",
                marginTop: "10px",
                textTransform: "uppercase",
              }}
            >
              Đăng nhập
            </Button>
            <Paragraph>hoặc sử dụng tài khoản của bạn</Paragraph>
            <GoogleOAuthProvider clientId="576568259129-taaehj1ll63so5u0eiqg6qaoria61d86.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
              />
            </GoogleOAuthProvider>
          </Form>
        </SignInContainer>

        <SignUpContainer className="sign-up-container">
          {errors.general && (
            <div
              style={{
                color: "red",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              {errors.general}
            </div>
          )}
          <Form onSubmit={handleRegister}>
            <Title>Tạo tài khoản</Title>
            <Input
              placeholder="Nhập tên của bạn"
              onChange={(e) => setName(e.target.value)}
              required
            />
            {errors.name && (
              <p
                style={{
                  color: "#D8000C",
                  backgroundColor: "#FFD2D2",
                  border: "1px solid #D8000C",
                  padding: "5px 10px",
                  borderRadius: "3px",
                  fontSize: "13px",
                  marginTop: "5px",
                  fontWeight: "bold",
                }}
              >
                {errors.name}
              </p>
            )}
            <Input
              placeholder="Nhập email của bạn"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && (
              <p
                style={{
                  color: "#D8000C",
                  backgroundColor: "#FFD2D2",
                  border: "1px solid #D8000C",
                  padding: "5px 10px",
                  borderRadius: "3px",
                  fontSize: "13px",
                  marginTop: "5px",
                  fontWeight: "bold",
                }}
              >
                {errors.email}
              </p>
            )}
            <Input
              placeholder="Nhập mật khẩu của bạn"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && (
              <p
                style={{
                  color: "#D8000C",
                  backgroundColor: "#FFD2D2",
                  border: "1px solid #D8000C",
                  padding: "5px 10px",
                  borderRadius: "3px",
                  fontSize: "13px",
                  marginTop: "5px",
                  fontWeight: "bold",
                }}
              >
                {errors.password}
              </p>
            )}
            <Button
              htmlType="submit"
              style={{
                borderRadius: "20px",
                border: "1px solid #ff4b2b",
                backgroundColor: "#ff4b2b",
                color: "#fff",
                fontSize: "15px",
                fontWeight: "bold",
                padding: "24px 47px",
                letterSpacing: "1px",
                transition: "transform 80ms ease-in",
                marginTop: "10px",
                textTransform: "uppercase",
              }}
            >
              Đăng ký
            </Button>
            <Paragraph>hoặc sử dụng email để đăng ký</Paragraph>
            <GoogleOAuthProvider clientId="576568259129-taaehj1ll63so5u0eiqg6qaoria61d86.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
              />
            </GoogleOAuthProvider>
          </Form>
        </SignUpContainer>

        <OverlayContainer className="overlay-container">
          <Overlay className="overlay">
            <OverlayPanel className="overlay-panel">
              <Title>{signIn ? "Xin chào!" : "Chào mừng trở lại!"}</Title>
              <Paragraph>
                {signIn ? (
                  <>
                    Nhập thông tin cá nhân của bạn và bắt đầu <br /> hành trình
                    với chúng tôi
                  </>
                ) : (
                  <>
                    Để kết nối với chúng tôi, vui lòng đăng nhập <br /> bằng
                    thông tin cá nhân của bạn
                  </>
                )}
              </Paragraph>
              <GhostButton
                onClick={() => {
                  setSignIn(!signIn);
                  setErrors({});
                }}
                className="!mt-20"
              >
                {signIn ? "Đăng ký" : "Đăng nhập"}
              </GhostButton>
            </OverlayPanel>
          </Overlay>
        </OverlayContainer>
      </FormContainer>
    </Modal>
  );
};
