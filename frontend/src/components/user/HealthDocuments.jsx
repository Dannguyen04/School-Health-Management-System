import {
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Space,
  Table,
  Typography,
  Upload,
  message,
} from "antd";
import React, { useState } from "react";

const { Title, Text } = Typography;
const { TextArea } = Input;

const HealthDocuments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDescription, setFileDescription] = useState("");
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Hồ sơ sức khỏe học sinh - Nguyễn Văn A",
      type: "Hồ sơ khám sức khỏe",
      date: "2023-10-26",
      fileUrl: "https://www.africau.edu/images/default/sample.pdf",
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

  const handleOpenUploadModal = () => {
    setOpenUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setOpenUploadModal(false);
    setSelectedFile(null);
    setFileDescription("");
  };

  const handleFileChange = (info) => {
    if (info.file.status === "done") {
      setSelectedFile(info.file.originFileObj);
      message.success(`${info.file.name} đã được chọn`);
    }
  };

  const handleUploadSubmit = () => {
    if (selectedFile) {
      console.log("Uploading file:", selectedFile.name);
      console.log("Description:", fileDescription);

      const newDocument = {
        id: documents.length + 1,
        name: selectedFile.name,
        type: "Khác",
        date: new Date().toISOString().slice(0, 10),
        fileUrl: URL.createObjectURL(selectedFile),
      };
      setDocuments([...documents, newDocument]);
      handleCloseUploadModal();
      message.success("Tài liệu đã được tải lên thành công");
    }
  };

  const handleViewDocument = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  const handleDeleteDocument = (id) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
    message.success("Tài liệu đã được xóa");
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      title: "Tên tài liệu",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Ngày tải lên",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Hành động",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDocument(record.fileUrl)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteDocument(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Quản lý Tài liệu Sức khỏe</Title>
        <Text type="secondary">
          Xem và quản lý các tài liệu liên quan đến sức khỏe của học sinh.
        </Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={16}>
          <Input
            placeholder="Tìm kiếm tài liệu..."
            value={searchQuery}
            onChange={handleSearchChange}
            prefix={<SearchOutlined />}
            size="large"
          />
        </Col>
        <Col xs={24} md={8}>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={handleOpenUploadModal}
            block
          >
            Tải lên Tài liệu mới
          </Button>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredDocuments}
          rowKey="id"
          scroll={{ y: 600 }}
        />
      </Card>

      <Modal
        title="Tải lên Tài liệu mới"
        open={openUploadModal}
        onCancel={handleCloseUploadModal}
        onOk={handleUploadSubmit}
        okText="Tải lên"
        cancelText="Hủy"
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Upload
            beforeUpload={() => false}
            onChange={handleFileChange}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Chọn tệp để tải lên</Button>
          </Upload>
          <TextArea
            placeholder="Mô tả tài liệu"
            value={fileDescription}
            onChange={(e) => setFileDescription(e.target.value)}
            rows={4}
          />
        </Space>
      </Modal>
    </div>
  );
};

export default HealthDocuments;
