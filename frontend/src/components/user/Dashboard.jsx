import {
  Description,
  LocalHospital,
  MedicalServices,
  Vaccines,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const QuickLinkCard = ({ title, description, icon, path }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => navigate(path)}>
          Xem chi tiết
        </Button>
      </CardActions>
    </Card>
  );
};

const Dashboard = () => {
  const quickLinks = [
    {
      title: "Hồ sơ sức khỏe",
      description: "Cập nhật và xem thông tin sức khỏe của học sinh",
      icon: <MedicalServices color="primary" />,
      path: "/user/health-profile",
    },
    {
      title: "Tiêm chủng",
      description: "Quản lý lịch tiêm chủng và theo dõi tình trạng",
      icon: <Vaccines color="primary" />,
      path: "/user/vaccination",
    },
    {
      title: "Tài liệu sức khỏe",
      description: "Truy cập các tài liệu và hướng dẫn về sức khỏe",
      icon: <Description color="primary" />,
      path: "/user/health-documents",
    },
    {
      title: "Sự kiện y tế",
      description: "Xem và báo cáo các sự kiện y tế trong trường",
      icon: <LocalHospital color="primary" />,
      path: "/user/medical-events",
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Chào mừng đến với Hệ thống Y tế Trường học
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý và theo dõi sức khỏe học sinh một cách hiệu quả
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {quickLinks.map((link) => (
          <Grid item xs={12} sm={6} md={3} key={link.title}>
            <QuickLinkCard {...link} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Thông tin nhanh
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Lịch kiểm tra sức khỏe sắp tới
              </Typography>
              {/* Add calendar or upcoming events component here */}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Thông báo mới nhất
              </Typography>
              {/* Add notifications component here */}
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
