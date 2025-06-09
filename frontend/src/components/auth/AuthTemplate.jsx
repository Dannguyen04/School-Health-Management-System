import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { Button, Modal } from "antd";
import axios from "axios";
import cn from "classnames";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
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
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });
      if (response.data.success) {
        login(response.data.user);
        localStorage.setItem("token", response.data.token);
        navigate(response.data.user.role === "admin" ? "/admin" : "/user");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        setError(error.response.data.error);
      } else {
        setError("Server Error");
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/auth/register", {
        name,
        email,
        password,
      });
      if (response.data.success) {
        const { user, token } = response.data;
        login(user);
        localStorage.setItem("token", token);
        navigate("/");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        setError(error.response.data.error);
      } else {
        setError("Server Error");
      }
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      console.log("Google login response:", response);
      const res = await axios.post("http://localhost:5000/auth/google-login", {
        credential: response.credential,
      });

      console.log("Backend response:", res.data);

      if (res.data.success) {
        login(res.data.user);
        localStorage.setItem("token", res.data.token);
        navigate(res.data.user.role === "admin" ? "/admin" : "/user");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError(
        error.response?.data?.error ||
          error.message ||
          "Google login failed. Please try again."
      );
    }
  };

  const handleGoogleError = (error) => {
    console.error("Google login error:", error);
    setError("Google login failed. Please try again.");
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
          {error && (
            <div
              style={{
                color: "red",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}
          <Form onSubmit={handleLogin}>
            <Title>Sign in</Title>
            <Input
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            <Input
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              type="password"
              required
            />
            <Paragraph>Forgot your password?</Paragraph>
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
              Sign in
            </Button>
            <Paragraph>or use your account</Paragraph>
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
          <Form onSubmit={handleRegister}>
            <Title>Create Account</Title>
            <Input
              placeholder="Enter your name"
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              placeholder="Enter your password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
              Sign Up
            </Button>
            <Paragraph>or use your email for registration</Paragraph>
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
              <Title>{signIn ? "Hello, Friend!" : "Welcome Back!"}</Title>
              <Paragraph>
                {signIn ? (
                  <>
                    Enter your personal details and start <br /> your journey
                    with us
                  </>
                ) : (
                  <>
                    To keep connected with us, please log in <br /> with your
                    personal info
                  </>
                )}
              </Paragraph>
              <GhostButton
                onClick={() => {
                  setSignIn(!signIn);
                  setError(null);
                }}
                className="!mt-20"
              >
                {signIn ? "Sign Up" : "Sign In"}
              </GhostButton>
            </OverlayPanel>
          </Overlay>
        </OverlayContainer>
      </FormContainer>
    </Modal>
  );
};
