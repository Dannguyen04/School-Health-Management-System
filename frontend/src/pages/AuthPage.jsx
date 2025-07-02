import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthTemplate } from "../components/auth/AuthTemplate";

const AuthPage = () => {
    const [open, setOpen] = useState(true);
    const [signIn, setSignIn] = useState(true);
    const navigate = useNavigate();

    const handleClose = () => {
        setOpen(false);
        if (window.innerWidth <= 768) {
            setSignIn(false);
        } else {
            setSignIn(true);
        }
        navigate("/");
    };

    return <AuthTemplate isOpen={open} onCloseModal={handleClose} signIn={signIn} setSignIn={setSignIn} />;
};

export default AuthPage;
