import { Search as SearchIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Mock data - replace with actual API data
  const articles = [
    {
      id: 1,
      title: "Cách phòng tránh bệnh cúm mùa",
      summary:
        "Bài viết cung cấp thông tin về cách phòng tránh bệnh cúm mùa cho học sinh",
      image: "https://source.unsplash.com/random/800x600/?flu",
      category: "Sức khỏe",
      date: "2024-03-15",
      content: `Bệnh cúm mùa là một bệnh truyền nhiễm phổ biến, đặc biệt trong môi trường học đường. 
      Bài viết này sẽ cung cấp các thông tin hữu ích về cách phòng tránh bệnh cúm mùa cho học sinh.

      1. Tiêm phòng cúm định kỳ
      2. Rửa tay thường xuyên
      3. Đeo khẩu trang khi cần thiết
      4. Giữ gìn vệ sinh cá nhân
      5. Tăng cường sức đề kháng`,
    },
    {
      id: 2,
      title: "Dinh dưỡng cho học sinh",
      summary:
        "Hướng dẫn về chế độ dinh dưỡng phù hợp cho học sinh ở các lứa tuổi",
      image: "https://source.unsplash.com/random/800x600/?nutrition",
      category: "Dinh dưỡng",
      date: "2024-03-10",
      content: `Dinh dưỡng đóng vai trò quan trọng trong sự phát triển của học sinh. 
      Bài viết này sẽ cung cấp thông tin về chế độ dinh dưỡng phù hợp.

      1. Các nhóm thực phẩm cần thiết
      2. Khẩu phần ăn hợp lý
      3. Thời gian ăn uống khoa học
      4. Lời khuyên về dinh dưỡng`,
    },
  ];

  const handleOpenDialog = (article) => {
    setSelectedArticle(article);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedArticle(null);
  };

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Blog sức khỏe
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Cập nhật thông tin và kiến thức về sức khỏe
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm bài viết..."
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
      </Box>

      <Grid container spacing={3}>
        {filteredArticles.map((article) => (
          <Grid item xs={12} md={6} key={article.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={article.image}
                alt={article.title}
              />
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={article.category}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip label={article.date} variant="outlined" size="small" />
                </Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  {article.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {article.summary}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleOpenDialog(article)}
                >
                  Đọc thêm
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedArticle && (
          <>
            <DialogTitle>
              <Typography variant="h5">{selectedArticle.title}</Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={selectedArticle.category}
                  color="primary"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={selectedArticle.date}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  style={{
                    width: "100%",
                    height: "auto",
                    marginBottom: "20px",
                  }}
                />
                <Typography variant="body1" style={{ whiteSpace: "pre-line" }}>
                  {selectedArticle.content}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Blog;
