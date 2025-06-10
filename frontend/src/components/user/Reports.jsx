import {
  Box,
  Card,
  CardContent,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Reports = () => {
  const [timeRange, setTimeRange] = useState("month");

  // Mock data - replace with actual API data
  const vaccinationData = [
    { name: "Tháng 1", completed: 45, pending: 15 },
    { name: "Tháng 2", completed: 60, pending: 10 },
    { name: "Tháng 3", completed: 75, pending: 5 },
  ];

  const healthCheckupData = [
    { name: "Bình thường", value: 70 },
    { name: "Cần theo dõi", value: 20 },
    { name: "Cần can thiệp", value: 10 },
  ];

  const medicalEventsData = [
    { name: "Tai nạn", value: 5 },
    { name: "Sốt", value: 15 },
    { name: "Dị ứng", value: 3 },
    { name: "Khác", value: 2 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const summaryData = [
    {
      title: "Tổng số học sinh",
      value: "500",
      change: "+5%",
      trend: "up",
    },
    {
      title: "Đã tiêm chủng",
      value: "450",
      change: "+10%",
      trend: "up",
    },
    {
      title: "Sự kiện y tế",
      value: "25",
      change: "-5%",
      trend: "down",
    },
    {
      title: "Kiểm tra sức khỏe",
      value: "480",
      change: "+8%",
      trend: "up",
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Báo cáo và thống kê
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Theo dõi và phân tích dữ liệu sức khỏe học sinh
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {summaryData.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="h4" component="div">
                  {item.value}
                </Typography>
                <Typography
                  variant="body2"
                  color={item.trend === "up" ? "success.main" : "error.main"}
                >
                  {item.change} so với tháng trước
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Thời gian</InputLabel>
          <Select
            value={timeRange}
            label="Thời gian"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="week">Tuần này</MenuItem>
            <MenuItem value="month">Tháng này</MenuItem>
            <MenuItem value="quarter">Quý này</MenuItem>
            <MenuItem value="year">Năm nay</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tiến độ tiêm chủng
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vaccinationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" name="Đã tiêm" fill="#8884d8" />
                <Bar dataKey="pending" name="Chờ tiêm" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tình trạng sức khỏe
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={healthCheckupData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {healthCheckupData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sự kiện y tế
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={medicalEventsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {medicalEventsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Reports;
