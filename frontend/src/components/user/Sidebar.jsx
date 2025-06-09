import {
  Article as ArticleIcon,
  Assessment as AssessmentIcon,
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  Medication as MedicationIcon,
  Person as PersonIcon,
  Vaccines as VaccinesIcon,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/user" },
  {
    text: "Hồ sơ sức khỏe",
    icon: <PersonIcon />,
    path: "/user/health-profile",
  },
  { text: "Tiêm chủng", icon: <VaccinesIcon />, path: "/user/vaccination" },
  {
    text: "Kiểm tra y tế",
    icon: <MedicalServicesIcon />,
    path: "/user/medical-checkup",
  },
  { text: "Báo cáo", icon: <AssessmentIcon />, path: "/user/reports" },
  { text: "Blog", icon: <ArticleIcon />, path: "/user/blog" },
  {
    text: "Tài liệu sức khỏe",
    icon: <DescriptionIcon />,
    path: "/user/health-documents",
  },
  {
    text: "Sự kiện y tế",
    icon: <LocalHospitalIcon />,
    path: "/user/medical-events",
  },
  {
    text: "Quản lý thuốc",
    icon: <MedicationIcon />,
    path: "/user/medicine-management",
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          mt: 8,
        },
      }}
    >
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "primary.light",
                  "&:hover": {
                    backgroundColor: "primary.light",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path
                      ? "primary.main"
                      : "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
};

export default Sidebar;
