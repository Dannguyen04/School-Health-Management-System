import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthTemplate } from "../components/auth/AuthTemplate";
import { message, Input, Button } from "antd";
import api from "../utils/api";
import { MailOutlined } from "@ant-design/icons";
import {
    FormContainer,
    Title,
    Paragraph,
    LargeButton,
} from "../components/auth/AuthStyles";

const AuthPage = () => {
    const [open, setOpen] = useState(true);
    const navigate = useNavigate();

    const handleClose = () => {
        setOpen(false);
        navigate("/");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Gửi request tới API quên mật khẩu (cần backend hỗ trợ)
            await api.post("/auth/forgot-password", { email });
            message.success("Vui lòng kiểm tra email để đặt lại mật khẩu!");
        } catch (err) {
            message.error("Không thể gửi yêu cầu. Vui lòng thử lại!");
        }
    };

    return <AuthTemplate isOpen={open} onCloseModal={handleClose} />;
};

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess("");
        setError("");
        try {
            await api.post("/auth/forgot-password", { email });
            setSuccess("Vui lòng kiểm tra email để đặt lại mật khẩu!");
        } catch (err) {
            setError("Không thể gửi yêu cầu. Vui lòng thử lại!");
        }
        setLoading(false);
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f6f5f7",
                padding: 0,
            }}
        >
            <FormContainer
                style={{
                    minHeight: 0,
                    width: "100%",
                    maxWidth: 400,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                }}
            >
                <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                    <Title>Quên mật khẩu</Title>
                    <Paragraph>
                        Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.
                    </Paragraph>
                    {success && (
                        <div
                            style={{
                                color: "#22c55e",
                                marginBottom: 16,
                                fontWeight: 500,
                            }}
                        >
                            {success}
                        </div>
                    )}
                    {error && (
                        <div
                            style={{
                                color: "#ef4444",
                                marginBottom: 16,
                                fontWeight: 500,
                            }}
                        >
                            {error}
                        </div>
                    )}
                    <Input
                        size="large"
                        prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
                        type="email"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            marginBottom: 20,
                            borderRadius: 12,
                            background: "#f7f7fa",
                            border: "2px solid #eee",
                        }}
                    />
                    <LargeButton
                        htmlType="submit"
                        disabled={loading}
                        style={{ marginTop: 0, opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                    </LargeButton>
                </form>
                <div style={{ marginTop: 24, textAlign: "center" }}>
                    <a
                        href="/auth"
                        style={{
                            color: "#ff416c",
                            fontWeight: 500,
                            fontSize: 15,
                        }}
                    >
                        Quay lại đăng nhập
                    </a>
                </div>
            </FormContainer>
        </div>
    );
}

export default AuthPage;
export { ForgotPassword };
