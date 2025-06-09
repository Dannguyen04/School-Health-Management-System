import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import React, { useState } from "react";

const MedicalEvents = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventData, setEventData] = useState({
    type: "",
    date: null,
    severity: "",
    description: "",
    action: "",
    status: "",
  });

  // Mock data - replace with actual API data
  const events = [
    {
      id: 1,
      type: "Tai nạn",
      date: "2024-03-15",
      severity: "Nhẹ",
      description: "Trượt ngã trong sân trường",
      action: "Sơ cứu và theo dõi",
      status: "Đã xử lý",
    },
    {
      id: 2,
      type: "Sốt",
      date: "2024-03-20",
      severity: "Trung bình",
      description: "Sốt cao 39 độ",
      action: "Cho uống thuốc hạ sốt",
      status: "Đang theo dõi",
    },
  ];

  const handleOpenDialog = (event = null) => {
    if (event) {
      setSelectedEvent(event);
      setEventData({
        type: event.type,
        date: new Date(event.date),
        severity: event.severity,
        description: event.description,
        action: event.action,
        status: event.status,
      });
    } else {
      setSelectedEvent(null);
      setEventData({
        type: "",
        date: null,
        severity: "",
        description: "",
        action: "",
        status: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  const handleSubmit = () => {
    // Add API call here to save/update event data
    handleCloseDialog();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Nhẹ":
        return "success";
      case "Trung bình":
        return "warning";
      case "Nặng":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã xử lý":
        return "success";
      case "Đang theo dõi":
        return "warning";
      case "Cần can thiệp":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sự kiện y tế
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý và theo dõi các sự kiện y tế trong trường học
        </Typography>
      </Box>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Báo cáo sự kiện
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Loại sự kiện</TableCell>
              <TableCell>Ngày xảy ra</TableCell>
              <TableCell>Mức độ</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Hành động</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.type}</TableCell>
                <TableCell>{event.date}</TableCell>
                <TableCell>
                  <Chip
                    label={event.severity}
                    color={getSeverityColor(event.severity)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{event.description}</TableCell>
                <TableCell>{event.action}</TableCell>
                <TableCell>
                  <Chip
                    label={event.status}
                    color={getStatusColor(event.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleOpenDialog(event)}>
                    Chỉnh sửa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedEvent
            ? "Chỉnh sửa sự kiện y tế"
            : "Báo cáo sự kiện y tế mới"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Loại sự kiện</InputLabel>
                <Select
                  value={eventData.type}
                  label="Loại sự kiện"
                  onChange={(e) =>
                    setEventData({
                      ...eventData,
                      type: e.target.value,
                    })
                  }
                >
                  <MenuItem value="Tai nạn">Tai nạn</MenuItem>
                  <MenuItem value="Sốt">Sốt</MenuItem>
                  <MenuItem value="Dị ứng">Dị ứng</MenuItem>
                  <MenuItem value="Chấn thương">Chấn thương</MenuItem>
                  <MenuItem value="Khác">Khác</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Ngày xảy ra"
                  value={eventData.date}
                  onChange={(date) => setEventData({ ...eventData, date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Mức độ</InputLabel>
                <Select
                  value={eventData.severity}
                  label="Mức độ"
                  onChange={(e) =>
                    setEventData({
                      ...eventData,
                      severity: e.target.value,
                    })
                  }
                >
                  <MenuItem value="Nhẹ">Nhẹ</MenuItem>
                  <MenuItem value="Trung bình">Trung bình</MenuItem>
                  <MenuItem value="Nặng">Nặng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={3}
                value={eventData.description}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    description: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Hành động đã thực hiện"
                multiline
                rows={2}
                value={eventData.action}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    action: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={eventData.status}
                  label="Trạng thái"
                  onChange={(e) =>
                    setEventData({
                      ...eventData,
                      status: e.target.value,
                    })
                  }
                >
                  <MenuItem value="Đã xử lý">Đã xử lý</MenuItem>
                  <MenuItem value="Đang theo dõi">Đang theo dõi</MenuItem>
                  <MenuItem value="Cần can thiệp">Cần can thiệp</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedEvent ? "Cập nhật" : "Báo cáo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MedicalEvents;
