import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthTemplate } from "../components/auth/AuthTemplate";

const AuthPage = () => {
    const [open, setOpen] = useState(true);
    const navigate = useNavigate();

    const handleClose = () => {
        setOpen(false);
        navigate("/");
    };

    return <AuthTemplate isOpen={open} onCloseModal={handleClose} />;
};

export default AuthPage;
