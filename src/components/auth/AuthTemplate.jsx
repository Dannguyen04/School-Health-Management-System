import { Button, Modal } from "antd";
import axios from "axios";
import cn from "classnames";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
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
  SocialButton,
  SocialContainer,
  Title,
} from "./AuthStyles";

// Import necessary hooks from react-query and react-hook-form

export const AuthTemplate = ({ isOpen, onCloseModal }) => {
  const [signIn, setSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );
      if (response.data.success) {
        login(response.data.user);
        localStorage.setItem("token", response.data.token);
        if (response.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        setError(error.response.data.success);
      } else {
        setError("Server Error");
      }
    }
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
        className={cn({ "signin-active": signIn, "signup-active": !signIn })}
      >
        <SignInContainer className="sign-in-container">
          {error && <p className="text-red-500">{error}</p>}
          <Form onSubmit={handleSubmit}>
            <Title>Sign in</Title>
            <SocialContainer>
              <SocialButton>
                <i className="fa-brands fa-facebook-f"></i>{" "}
              </SocialButton>
              <SocialButton>
                <i className="fab fa-google-plus-g"></i>
              </SocialButton>
              <SocialButton>
                <i className="fab fa-linkedin-in"></i>
              </SocialButton>
            </SocialContainer>
            <Paragraph>or use your account</Paragraph>
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
          </Form>
        </SignInContainer>
        <SignUpContainer className="sign-up-container">
          <Form>
            <Title>Create Account</Title>
            <SocialContainer>
              <SocialButton>
                <i className="fa-brands fa-facebook-f"></i>
              </SocialButton>
              <SocialButton>
                <i className="fab fa-google-plus-g"></i>
              </SocialButton>
              <SocialButton>
                <i className="fab fa-linkedin-in"></i>
              </SocialButton>
            </SocialContainer>
            <Paragraph>or use your email for registration</Paragraph>
            {/* Update Input fields for Sign Up - adjust names as per your schema */}
            <Input placeholder="Enter your name" />
            <Input placeholder="Enter your phone number" />
            <Input placeholder="Enter your email" />
            <Input placeholder="Enter your password" />
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
                onClick={() => setSignIn(!signIn)}
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
