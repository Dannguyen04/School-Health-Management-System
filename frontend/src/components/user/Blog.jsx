import { SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import React, { useState } from "react";

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [openModal, setOpenModal] = useState(false);

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

  const handleOpenModal = (article) => {
    setSelectedArticle(article);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedArticle(null);
  };

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Blog sức khỏe</Title>
        <Text type="secondary">
          Cập nhật thông tin và kiến thức về sức khỏe
        </Text>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Input
          placeholder="Tìm kiếm bài viết..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          prefix={<SearchOutlined />}
          size="large"
        />
      </div>

      <Row gutter={[24, 24]}>
        {filteredArticles.map((article) => (
          <Col xs={24} md={12} key={article.id}>
            <Card
              hoverable
              cover={
                <img
                  alt={article.title}
                  src={article.image}
                  style={{ height: 200, objectFit: "cover" }}
                />
              }
              actions={[
                <Button type="primary" onClick={() => handleOpenModal(article)}>
                  Đọc thêm
                </Button>,
              ]}
            >
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Space>
                  <Tag color="blue">{article.category}</Tag>
                  <Tag>{article.date}</Tag>
                </Space>
                <Title level={4} style={{ margin: 0 }}>
                  {article.title}
                </Title>
                <Text type="secondary">{article.summary}</Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {selectedArticle?.title}
            </Title>
            <Space style={{ marginTop: 8 }}>
              <Tag color="blue">{selectedArticle?.category}</Tag>
              <Tag>{selectedArticle?.date}</Tag>
            </Space>
          </div>
        }
        open={openModal}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedArticle && (
          <div>
            <img
              src={selectedArticle.image}
              alt={selectedArticle.title}
              style={{
                width: "100%",
                height: "auto",
                marginBottom: 20,
                borderRadius: 8,
              }}
            />
            <Paragraph style={{ whiteSpace: "pre-line" }}>
              {selectedArticle.content}
            </Paragraph>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Blog;
