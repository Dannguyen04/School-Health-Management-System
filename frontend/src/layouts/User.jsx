import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "../components/user/Header";
import Sidebar from "../components/user/Sidebar";

const User = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default User;
