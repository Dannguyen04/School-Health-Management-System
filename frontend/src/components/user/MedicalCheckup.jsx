import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const MedicalCheckup = () => {
  const [openModal, setOpenModal] = useState(false);
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

  const handleOpenModal = (checkup = null) => {
    if (checkup) {
      setSelectedCheckup(checkup);
      setCheckupData({
        type: checkup.type,
        date: checkup.date ? dayjs(checkup.date) : null,
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
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCheckup(null);
    setCheckupData({
      type: "",
      date: null,
      status: "",
      results: "",
      notes: "",
    });
  };

  const handleSubmit = () => {
    // Add API call here to save/update checkup data
    console.log("Submitting checkup data:", checkupData);
    message.success("Thông tin kiểm tra đã được lưu thành công");
    handleCloseModal();
  };

  const getStatusTagColor = (status) => {
    switch (status) {
      case "Hoàn thành":
        return "green";
      case "Đã lên lịch":
        return "orange";
      case "Đã hủy":
        return "red";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Loại kiểm tra",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Ngày kiểm tra",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusTagColor(status)}>{status}</Tag>,
    },
    {
      title: "Kết quả",
      dataIndex: "results",
      key: "results",
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Thao tác",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleOpenModal(record)}>
            Chỉnh sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Kiểm tra y tế</Title>
        <Text type="secondary">Quản lý và theo dõi lịch kiểm tra sức khỏe</Text>
      </div>

      <Row justify="end" style={{ marginBottom: 24 }}>
        <Col>
          <Button type="primary" onClick={() => handleOpenModal()}>
            Thêm mới
          </Button>
        </Col>
      </Row>

      <Card>
        <Table columns={columns} dataSource={checkups} rowKey="id" />
      </Card>

      <Modal
        title={
          selectedCheckup ? "Chỉnh sửa thông tin kiểm tra" : "Thêm mới kiểm tra"
        }
        open={openModal}
        onCancel={handleCloseModal}
        onOk={handleSubmit}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Select
            placeholder="Loại kiểm tra"
            value={checkupData.type || undefined}
            onChange={(value) =>
              setCheckupData({ ...checkupData, type: value })
            }
            style={{ width: "100%" }}
          >
            <Option value="Kiểm tra sức khỏe định kỳ">
              Kiểm tra sức khỏe định kỳ
            </Option>
            <Option value="Kiểm tra thị lực">Kiểm tra thị lực</Option>
            <Option value="Kiểm tra thính lực">Kiểm tra thính lực</Option>
            <Option value="Kiểm tra răng miệng">Kiểm tra răng miệng</Option>
            <Option value="Khác">Khác</Option>
          </Select>
          <DatePicker
            placeholder="Ngày kiểm tra"
            value={checkupData.date}
            onChange={(date) => setCheckupData({ ...checkupData, date: date })}
            style={{ width: "100%" }}
          />
          <Select
            placeholder="Trạng thái"
            value={checkupData.status || undefined}
            onChange={(value) =>
              setCheckupData({ ...checkupData, status: value })
            }
            style={{ width: "100%" }}
          >
            <Option value="Hoàn thành">Hoàn thành</Option>
            <Option value="Đã lên lịch">Đã lên lịch</Option>
            <Option value="Đã hủy">Đã hủy</Option>
          </Select>
          <TextArea
            placeholder="Kết quả"
            value={checkupData.results}
            onChange={(e) =>
              setCheckupData({ ...checkupData, results: e.target.value })
            }
            rows={4}
          />
          <TextArea
            placeholder="Ghi chú"
            value={checkupData.notes}
            onChange={(e) =>
              setCheckupData({ ...checkupData, notes: e.target.value })
            }
            rows={4}
          />
        </Space>
      </Modal>
    </div>
  );
};

export default MedicalCheckup;
