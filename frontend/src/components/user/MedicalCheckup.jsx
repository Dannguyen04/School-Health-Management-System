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

const MedicalCheckup = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCheckup, setSelectedCheckup] = useState(null);
  const [checkupData, setCheckupData] = useState({
    type: "",
    date: null,
    status: "",
    results: "",
    notes: "",
  });

  // Mock data - replace with actual API data
  const checkups = [
    {
      id: 1,
      type: "Kiểm tra sức khỏe định kỳ",
      date: "2024-03-15",
      status: "Hoàn thành",
      results: "Bình thường",
      notes: "Không có vấn đề sức khỏe",
    },
    {
      id: 2,
      type: "Kiểm tra thị lực",
      date: "2024-04-01",
      status: "Đã lên lịch",
      results: "Chờ kết quả",
      notes: "Cần đeo kính",
    },
  ];

  const handleOpenDialog = (checkup = null) => {
    if (checkup) {
      setSelectedCheckup(checkup);
      setCheckupData({
        type: checkup.type,
        date: new Date(checkup.date),
        status: checkup.status,
        results: checkup.results,
        notes: checkup.notes,
      });
    } else {
      setSelectedCheckup(null);
      setCheckupData({
        type: "",
        date: null,
        status: "",
        results: "",
        notes: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCheckup(null);
  };

  const handleSubmit = () => {
    // Add API call here to save/update checkup data
    handleCloseDialog();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Hoàn thành":
        return "success";
      case "Đã lên lịch":
        return "warning";
      case "Đã hủy":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Kiểm tra y tế
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý và theo dõi lịch kiểm tra sức khỏe
        </Typography>
      </Box>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Thêm mới
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Loại kiểm tra</TableCell>
              <TableCell>Ngày kiểm tra</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Kết quả</TableCell>
              <TableCell>Ghi chú</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {checkups.map((checkup) => (
              <TableRow key={checkup.id}>
                <TableCell>{checkup.type}</TableCell>
                <TableCell>{checkup.date}</TableCell>
                <TableCell>
                  <Chip
                    label={checkup.status}
                    color={getStatusColor(checkup.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{checkup.results}</TableCell>
                <TableCell>{checkup.notes}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleOpenDialog(checkup)}
                  >
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
          {selectedCheckup
            ? "Chỉnh sửa thông tin kiểm tra"
            : "Thêm mới kiểm tra"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Loại kiểm tra</InputLabel>
                <Select
                  value={checkupData.type}
                  label="Loại kiểm tra"
                  onChange={(e) =>
                    setCheckupData({
                      ...checkupData,
                      type: e.target.value,
                    })
                  }
                >
                  <MenuItem value="Kiểm tra sức khỏe định kỳ">
                    Kiểm tra sức khỏe định kỳ
                  </MenuItem>
                  <MenuItem value="Kiểm tra thị lực">Kiểm tra thị lực</MenuItem>
                  <MenuItem value="Kiểm tra thính lực">
                    Kiểm tra thính lực
                  </MenuItem>
                  <MenuItem value="Kiểm tra răng miệng">
                    Kiểm tra răng miệng
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Ngày kiểm tra"
                  value={checkupData.date}
                  onChange={(date) => setCheckupData({ ...checkupData, date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={checkupData.status}
                  label="Trạng thái"
                  onChange={(e) =>
                    setCheckupData({
                      ...checkupData,
                      status: e.target.value,
                    })
                  }
                >
                  <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
                  <MenuItem value="Đã lên lịch">Đã lên lịch</MenuItem>
                  <MenuItem value="Đã hủy">Đã hủy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Kết quả"
                value={checkupData.results}
                onChange={(e) =>
                  setCheckupData({
                    ...checkupData,
                    results: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú"
                multiline
                rows={3}
                value={checkupData.notes}
                onChange={(e) =>
                  setCheckupData({
                    ...checkupData,
                    notes: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedCheckup ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MedicalCheckup;
