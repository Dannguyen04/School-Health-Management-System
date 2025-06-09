import { Search as SearchIcon } from "@mui/icons-material";
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
  InputAdornment,
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

const MedicineManagement = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [medicineData, setMedicineData] = useState({
    name: "",
    quantity: "",
    unit: "",
    expiryDate: null,
    supplier: "",
    category: "",
    status: "",
    notes: "",
  });

  // Mock data - replace with actual API data
  const medicines = [
    {
      id: 1,
      name: "Paracetamol",
      quantity: 100,
      unit: "Viên",
      expiryDate: "2024-12-31",
      supplier: "Công ty A",
      category: "Thuốc giảm đau",
      status: "Còn hàng",
      notes: "Thuốc hạ sốt",
    },
    {
      id: 2,
      name: "Vitamin C",
      quantity: 50,
      unit: "Hộp",
      expiryDate: "2024-10-15",
      supplier: "Công ty B",
      category: "Vitamin",
      status: "Sắp hết",
      notes: "Bổ sung vitamin",
    },
  ];

  const handleOpenDialog = (medicine = null) => {
    if (medicine) {
      setSelectedMedicine(medicine);
      setMedicineData({
        name: medicine.name,
        quantity: medicine.quantity,
        unit: medicine.unit,
        expiryDate: new Date(medicine.expiryDate),
        supplier: medicine.supplier,
        category: medicine.category,
        status: medicine.status,
        notes: medicine.notes,
      });
    } else {
      setSelectedMedicine(null);
      setMedicineData({
        name: "",
        quantity: "",
        unit: "",
        expiryDate: null,
        supplier: "",
        category: "",
        status: "",
        notes: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMedicine(null);
  };

  const handleSubmit = () => {
    // Add API call here to save/update medicine data
    handleCloseDialog();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Còn hàng":
        return "success";
      case "Sắp hết":
        return "warning";
      case "Hết hàng":
        return "error";
      default:
        return "default";
    }
  };

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quản lý thuốc và vật tư y tế
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Theo dõi và quản lý kho thuốc và vật tư y tế
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm thuốc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          sx={{ display: "flex", justifyContent: "flex-end" }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog()}
          >
            Thêm mới
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên thuốc</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell>Đơn vị</TableCell>
              <TableCell>Hạn sử dụng</TableCell>
              <TableCell>Nhà cung cấp</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ghi chú</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMedicines.map((medicine) => (
              <TableRow key={medicine.id}>
                <TableCell>{medicine.name}</TableCell>
                <TableCell>{medicine.quantity}</TableCell>
                <TableCell>{medicine.unit}</TableCell>
                <TableCell>{medicine.expiryDate}</TableCell>
                <TableCell>{medicine.supplier}</TableCell>
                <TableCell>{medicine.category}</TableCell>
                <TableCell>
                  <Chip
                    label={medicine.status}
                    color={getStatusColor(medicine.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{medicine.notes}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleOpenDialog(medicine)}
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
          {selectedMedicine ? "Chỉnh sửa thông tin thuốc" : "Thêm thuốc mới"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên thuốc"
                value={medicineData.name}
                onChange={(e) =>
                  setMedicineData({
                    ...medicineData,
                    name: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số lượng"
                type="number"
                value={medicineData.quantity}
                onChange={(e) =>
                  setMedicineData({
                    ...medicineData,
                    quantity: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Đơn vị"
                value={medicineData.unit}
                onChange={(e) =>
                  setMedicineData({
                    ...medicineData,
                    unit: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Hạn sử dụng"
                  value={medicineData.expiryDate}
                  onChange={(date) =>
                    setMedicineData({ ...medicineData, expiryDate: date })
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nhà cung cấp"
                value={medicineData.supplier}
                onChange={(e) =>
                  setMedicineData({
                    ...medicineData,
                    supplier: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={medicineData.category}
                  label="Danh mục"
                  onChange={(e) =>
                    setMedicineData({
                      ...medicineData,
                      category: e.target.value,
                    })
                  }
                >
                  <MenuItem value="Thuốc giảm đau">Thuốc giảm đau</MenuItem>
                  <MenuItem value="Vitamin">Vitamin</MenuItem>
                  <MenuItem value="Thuốc kháng sinh">Thuốc kháng sinh</MenuItem>
                  <MenuItem value="Vật tư y tế">Vật tư y tế</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={medicineData.status}
                  label="Trạng thái"
                  onChange={(e) =>
                    setMedicineData({
                      ...medicineData,
                      status: e.target.value,
                    })
                  }
                >
                  <MenuItem value="Còn hàng">Còn hàng</MenuItem>
                  <MenuItem value="Sắp hết">Sắp hết</MenuItem>
                  <MenuItem value="Hết hàng">Hết hàng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú"
                multiline
                rows={3}
                value={medicineData.notes}
                onChange={(e) =>
                  setMedicineData({
                    ...medicineData,
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
            {selectedMedicine ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MedicineManagement;
