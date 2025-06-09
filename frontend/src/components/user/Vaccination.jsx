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

const Vaccination = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [vaccinationData, setVaccinationData] = useState({
    vaccineName: "",
    date: null,
    status: "",
    notes: "",
  });

  // Mock data - replace with actual API data
  const vaccinations = [
    {
      id: 1,
      vaccineName: "Vaccine A",
      date: "2024-03-15",
      status: "Đã tiêm",
      nextDose: "2024-09-15",
      notes: "Không có phản ứng phụ",
    },
    {
      id: 2,
      vaccineName: "Vaccine B",
      date: "2024-02-01",
      status: "Chờ tiêm",
      nextDose: "2024-08-01",
      notes: "Cần xác nhận từ phụ huynh",
    },
  ];

  const handleOpenDialog = (vaccine = null) => {
    if (vaccine) {
      setSelectedVaccine(vaccine);
      setVaccinationData({
        vaccineName: vaccine.vaccineName,
        date: new Date(vaccine.date),
        status: vaccine.status,
        notes: vaccine.notes,
      });
    } else {
      setSelectedVaccine(null);
      setVaccinationData({
        vaccineName: "",
        date: null,
        status: "",
        notes: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVaccine(null);
  };

  const handleSubmit = () => {
    // Add API call here to save/update vaccination data
    handleCloseDialog();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã tiêm":
        return "success";
      case "Chờ tiêm":
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
          Quản lý tiêm chủng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Theo dõi và quản lý lịch tiêm chủng của học sinh
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
              <TableCell>Tên vaccine</TableCell>
              <TableCell>Ngày tiêm</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tiêm tiếp theo</TableCell>
              <TableCell>Ghi chú</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vaccinations.map((vaccine) => (
              <TableRow key={vaccine.id}>
                <TableCell>{vaccine.vaccineName}</TableCell>
                <TableCell>{vaccine.date}</TableCell>
                <TableCell>
                  <Chip
                    label={vaccine.status}
                    color={getStatusColor(vaccine.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{vaccine.nextDose}</TableCell>
                <TableCell>{vaccine.notes}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleOpenDialog(vaccine)}
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
          {selectedVaccine
            ? "Chỉnh sửa thông tin tiêm chủng"
            : "Thêm mới tiêm chủng"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên vaccine"
                value={vaccinationData.vaccineName}
                onChange={(e) =>
                  setVaccinationData({
                    ...vaccinationData,
                    vaccineName: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Ngày tiêm"
                  value={vaccinationData.date}
                  onChange={(date) =>
                    setVaccinationData({ ...vaccinationData, date })
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={vaccinationData.status}
                  label="Trạng thái"
                  onChange={(e) =>
                    setVaccinationData({
                      ...vaccinationData,
                      status: e.target.value,
                    })
                  }
                >
                  <MenuItem value="Đã tiêm">Đã tiêm</MenuItem>
                  <MenuItem value="Chờ tiêm">Chờ tiêm</MenuItem>
                  <MenuItem value="Đã hủy">Đã hủy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú"
                multiline
                rows={3}
                value={vaccinationData.notes}
                onChange={(e) =>
                  setVaccinationData({
                    ...vaccinationData,
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
            {selectedVaccine ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Vaccination;
