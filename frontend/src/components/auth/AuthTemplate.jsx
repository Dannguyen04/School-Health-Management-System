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
    const [errors, setErrors] = useState({});
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrors({});
        try {
            const response = await axios.post(
                "http://localhost:5000/auth/login",
                {
                    email,
                    password,
                }
            );
            if (response.data.success) {
                login(response.data.user);
                localStorage.setItem("token", response.data.token);
                if (response.data.user.role === "ADMIN") {
                    navigate("/admin");
                } else if (response.data.user.role === "SCHOOL_NURSE") {
                    navigate("/nurse");
                } else navigate("/user");
            }
        } catch (error) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.error
            ) {
                if (
                    error.response.data.error.includes("Invalid credentials") ||
                    error.response.data.error.includes(
                        "Email and password are required"
                    )
                ) {
                    setErrors({ email: error.response.data.error });
                } else {
                    setErrors({ general: error.response.data.error });
                }
            } else {
                setErrors({
                    general: "An unexpected error occurred during login.",
                });
            }
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrors({});
        try {
            const response = await axios.post(
                "http://localhost:5000/auth/register",
                {
                    name,
                    email,
                    password,
                }
            );
            if (response.data.success) {
                const { user, token } = response.data;
                login(user);
                localStorage.setItem("token", token);
                navigate("/");
            }
        } catch (error) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.error
            ) {
                const backendError = error.response.data.error;
                if (
                    backendError.includes(
                        "Password must be at least 8 characters"
                    )
                ) {
                    setErrors({ password: backendError });
                } else if (
                    backendError.includes("email") ||
                    backendError.includes("User already exists")
                ) {
                    setErrors({ email: backendError });
                } else if (
                    backendError.includes(
                        "Name, email and password are required"
                    )
                ) {
                    setErrors({
                        name: backendError,
                        email: backendError,
                        password: backendError,
                    });
                } else {
                    setErrors({ general: backendError });
                }
            } else {
                setErrors({
                    general:
                        "An unexpected error occurred during registration.",
                });
            }
        }
    };

    const handleGoogleSuccess = async (response) => {
        try {
            console.log("Google login response:", response);
            const res = await axios.post(
                "http://localhost:5000/auth/google-login",
                {
                    credential: response.credential,
                }
            );

            console.log("Backend response:", res.data);

            if (res.data.success) {
                login(res.data.user);
                localStorage.setItem("token", res.data.token);
                navigate(res.data.user.role === "ADMIN" ? "/admin" : "/user");
            }
        } catch (error) {
            console.error("Google login error:", error);
            setErrors({
                general:
                    error.response?.data?.error ||
                    error.message ||
                    "Google login failed. Please try again.",
            });
        }
    };

    const handleGoogleError = (error) => {
        console.error("Google login error:", error);
        setErrors({ general: "Google login failed. Please try again." });
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
                        <Title>Sign in</Title>
                        <Input
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
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
                            placeholder="Enter your password"
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
                        <Title>Create Account</Title>
                        <Input
                            placeholder="Enter your name"
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
                            placeholder="Enter your email"
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
                            placeholder="Enter your password"
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
                            Sign Up
                        </Button>
                        <Paragraph>
                            or use your email for registration
                        </Paragraph>
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
                            <Title>
                                {signIn ? "Hello, Friend!" : "Welcome Back!"}
                            </Title>
                            <Paragraph>
                                {signIn ? (
                                    <>
                                        Enter your personal details and start{" "}
                                        <br /> your journey with us
                                    </>
                                ) : (
                                    <>
                                        To keep connected with us, please log in{" "}
                                        <br /> with your personal info
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
                                {signIn ? "Sign Up" : "Sign In"}
                            </GhostButton>
                        </OverlayPanel>
                    </Overlay>
                </OverlayContainer>
            </FormContainer>
        </Modal>
    );
};
