import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import {
  Descriptions,
  Divider,
  message,
  Modal,
  Select,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const { Title } = Typography;

const VaccinationHistory = () => {
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [detailModal, setDetailModal] = useState({
    visible: false,
    record: null,
  });

  const columns = [
    {
      title: "Ngày tiêm",
      dataIndex: "date",
      key: "date",
      width: 120,
    },
    {
      title: "Tên vaccine",
      dataIndex: "vaccineName",
      key: "vaccineName",
      width: 200,
      ellipsis: true,
      render: (text) => <Tooltip title={text}>{text}</Tooltip>,
    },
    {
      title: "Loại vaccine",
      dataIndex: "vaccineType",
      key: "vaccineType",
      width: 150,
    },
    {
      title: "Liều lượng",
      dataIndex: "dosage",
      key: "dosage",
      width: 120,
    },
    {
      title: "Đợt tiêm",
      dataIndex: "doseNumber",
      key: "doseNumber",
      width: 100,
      render: (text) => `Mũi ${text}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => {
        let color = status === "COMPLETED" ? "success" : "processing";
        let icon =
          status === "COMPLETED" ? (
            <CheckCircleOutlined />
          ) : (
            <ClockCircleOutlined />
          );
        let text = status === "COMPLETED" ? "Đã hoàn thành" : "Đang chờ";

        return (
          <Tag icon={icon} color={color}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
      render: (text) => <Tooltip title={text}>{text || "—"}</Tooltip>,
    },
    {
      title: "Chi tiết",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <a onClick={() => setDetailModal({ visible: true, record })}>
          Xem chi tiết
        </a>
      ),
    },
  ];

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchVaccinationHistory();
    }
  }, [selectedStudent]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/parents/my-children", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setChildren(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedStudent(response.data.data[0].studentId);
        }
      }
    } catch (error) {
      console.error("Error fetching children:", error);
      message.error("Không thể lấy danh sách học sinh");
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccinationHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/parents/vaccination-history/${selectedStudent}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        const formattedHistory = response.data.data.map((record, index) => ({
          key: record.id || index,
          date: new Date(record.vaccinationDate).toLocaleDateString(),
          vaccineName: record.vaccine?.name || "",
          vaccineType: record.vaccine?.type || "",
          dosage: record.dosage || "",
          doseNumber: record.doseNumber || 1,
          status: record.status || "PENDING",
          notes: record.notes || "",
        }));
        setVaccinations(formattedHistory);
      } else {
        setVaccinations([]);
      }
    } catch (error) {
      console.error("Error fetching vaccination history:", error);
      message.error("Không thể lấy lịch sử tiêm chủng");
      setVaccinations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !vaccinations.length) {
    return (
      <div className="min-h-screen bg-[#f6fcfa] flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6fcfa]">
      <div className="w-full max-w-5xl mx-auto px-4 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <HeartOutlined className="text-[#36ae9a]" />
            <span>Quản lý sức khỏe học sinh</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Lịch sử tiêm chủng
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Xem lại toàn bộ lịch sử tiêm chủng của học sinh để theo dõi và đảm
            bảo đầy đủ các mũi tiêm cần thiết.
          </p>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <Title
            level={2}
            className="!text-[#36ae9a] !mb-0 text-center md:text-left"
          >
            Lịch sử tiêm chủng
          </Title>
          <Select
            style={{ width: 320, minWidth: 220 }}
            dropdownStyle={{
              borderRadius: 18,
              boxShadow: "0 8px 32px rgba(54, 174, 154, 0.15)",
            }}
            dropdownClassName="custom-student-dropdown"
            value={selectedStudent}
            onChange={setSelectedStudent}
            placeholder="Chọn học sinh"
            size="large"
          >
            {children.map((child) => (
              <Select.Option
                key={child.studentId}
                value={child.studentId}
                className="!py-3 !px-5 !text-lg hover:bg-[#e8f5f2]"
                style={{ display: "flex", alignItems: "center", gap: 14 }}
              >
                <span className="font-semibold text-gray-800 truncate max-w-[140px]">
                  {child.fullName} - {child.class}
                </span>
              </Select.Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={vaccinations}
          pagination={{
            pageSize: 10,
            position: ["bottomCenter"],
            showSizeChanger: false,
          }}
          className="rounded-xl"
          style={{ padding: 12 }}
          loading={loading}
        />
        {/* Modal xem chi tiết vaccine */}
        <Modal
          title="Chi tiết lịch sử tiêm chủng"
          open={detailModal.visible}
          onCancel={() => setDetailModal({ visible: false, record: null })}
          footer={null}
          width={700}
        >
          {detailModal.record && (
            <>
              <Divider orientation="left">Thông tin tiêm chủng</Divider>
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Tên vaccine">
                  {detailModal.record.vaccineName || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Loại vaccine">
                  {detailModal.record.vaccineType || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Liều lượng">
                  {detailModal.record.dosage || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Mũi tiêm">
                  Mũi {detailModal.record.doseNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tiêm">
                  {detailModal.record.date || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {detailModal.record.status === "COMPLETED" ? (
                    <Tag color="success">Đã hoàn thành</Tag>
                  ) : (
                    <Tag color="processing">Đang chờ</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú" span={2}>
                  {detailModal.record.notes || "-"}
                </Descriptions.Item>
              </Descriptions>
              <Divider orientation="left">Thông tin vaccine</Divider>
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Nhà sản xuất">
                  {detailModal.record.vaccine?.manufacturer || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Xuất xứ">
                  {detailModal.record.vaccine?.origin || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Độ tuổi khuyến nghị">
                  {detailModal.record.vaccine?.recommendedAge || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Yêu cầu">
                  {detailModal.record.vaccine?.requirement || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả" span={2}>
                  {detailModal.record.vaccine?.description || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Tác dụng phụ" span={2}>
                  {detailModal.record.vaccine?.sideEffects || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Chống chỉ định" span={2}>
                  {detailModal.record.vaccine?.contraindications || "-"}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default VaccinationHistory;
