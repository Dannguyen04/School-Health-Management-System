import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  UploadFile as UploadFileIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

const HealthDocuments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDescription, setFileDescription] = useState("");
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Hồ sơ sức khỏe học sinh - Nguyễn Văn A",
      type: "Hồ sơ khám sức khỏe",
      date: "2023-10-26",
      fileUrl: "https://www.africau.edu/images/default/sample.pdf", // Placeholder for a file URL
    },
    {
      id: 2,
      name: "Giấy chứng nhận tiêm chủng - Trần Thị B",
      type: "Giấy tiêm chủng",
      date: "2024-01-10",
      fileUrl: "https://www.africau.edu/images/default/sample.pdf",
    },
  ]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleOpenUploadDialog = () => {
    setOpenUploadDialog(true);
  };

  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false);
    setSelectedFile(null);
    setFileDescription("");
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadSubmit = () => {
    if (selectedFile) {
      // Here you would typically handle the file upload to a server
      console.log("Uploading file:", selectedFile.name);
      console.log("Description:", fileDescription);

      const newDocument = {
        id: documents.length + 1,
        name: selectedFile.name,
        type: "Khác", // Or determine type based on file extension
        date: new Date().toISOString().slice(0, 10),
        fileUrl: URL.createObjectURL(selectedFile), // Create a temporary URL for preview
      };
      setDocuments([...documents, newDocument]);
      handleCloseUploadDialog();
    }
  };

  const handleViewDocument = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  const handleDeleteDocument = (id) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quản lý Tài liệu Sức khỏe
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Xem và quản lý các tài liệu liên quan đến sức khỏe của học sinh.
        </Typography>
      </Box>

      <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm tài liệu..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<UploadFileIcon />}
            fullWidth
            onClick={handleOpenUploadDialog}
          >
            Tải lên Tài liệu mới
          </Button>
        </Grid>
      </Grid>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="health documents table">
            <TableHead>
              <TableRow>
                <TableCell>Tên tài liệu</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Ngày tải lên</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocuments.map((document) => (
                <TableRow hover key={document.id}>
                  <TableCell>{document.name}</TableCell>
                  <TableCell>{document.type}</TableCell>
                  <TableCell>{document.date}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleViewDocument(document.fileUrl)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleDeleteDocument(document.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={openUploadDialog}
        onClose={handleCloseUploadDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tải lên Tài liệu mới</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mb: 2 }}
            >
              {selectedFile ? selectedFile.name : "Chọn tệp để tải lên"}
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            <TextField
              label="Mô tả tài liệu"
              fullWidth
              multiline
              rows={4}
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>Hủy</Button>
          <Button onClick={handleUploadSubmit} variant="contained">
            Tải lên
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HealthDocuments;
