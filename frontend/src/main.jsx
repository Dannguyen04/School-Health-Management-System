import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/authContext.jsx";
import { ConfigProvider } from "antd";
import "./index.css";

createRoot(document.getElementById("root")).render(
    <ConfigProvider
        theme={{
            token: {
                colorPrimary: "#36ae9a",
                colorPrimaryBg: "#36ae9a",
                colorPrimaryBorder: "#36ae9a",
                colorPrimaryHover: "#2a8a7a",
                colorPrimaryActive: "#267e6e",
            },
            components: {
                Button: {
                    colorPrimary: "#36ae9a",
                    colorPrimaryBg: "#36ae9a",
                    colorPrimaryBorder: "#36ae9a",
                    colorPrimaryHover: "#2a8a7a",
                    colorPrimaryActive: "#267e6e",
                },
            },
        }}
    >
        <AuthProvider>
            <App />
        </AuthProvider>
    </ConfigProvider>
);
