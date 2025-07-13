import { HeartOutlined } from "@ant-design/icons";
import {
  Button,
  Descriptions,
  Divider,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const { Title } = Typography;

const HealthCheckupResults = () => {
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [checkupResults, setCheckupResults] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCheckup, setSelectedCheckup] = useState(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchCheckupResults();
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

  const fetchCheckupResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/parents/students/${selectedStudent}/health-checkups`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        const formattedResults = response.data.data.map((result, index) => ({
          key: index,
          raw: result,
          date: result.scheduledDate
            ? new Date(result.scheduledDate).toLocaleDateString()
            : "N/A",
          height: result.height ? `${result.height} cm` : "N/A",
          weight: result.weight ? `${result.weight} kg` : "N/A",
          bmi:
            result.height && result.weight
              ? (result.weight / (result.height / 100) ** 2).toFixed(1)
              : "N/A",
          vision:
            result.visionRightNoGlasses && result.visionLeftNoGlasses
              ? `${result.visionRightNoGlasses}/${result.visionLeftNoGlasses}`
              : "N/A",
          bloodPressure:
            result.systolicBP && result.diastolicBP
              ? `${result.systolicBP}/${result.diastolicBP} mmHg`
              : "N/A",
          notes: result.notes || "",
        }));
        setCheckupResults(formattedResults);
      } else {
        setCheckupResults([]);
      }
    } catch (error) {
      console.error("Error fetching checkup results:", error);
      message.error("Không thể lấy kết quả khám sức khỏe");
      setCheckupResults([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Ngày khám",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Chiến dịch",
      key: "campaign",
      render: (_, record) => record.raw.campaign?.name || "-",
    },
    {
      title: "Chiều cao",
      dataIndex: "height",
      key: "height",
    },
    {
      title: "Cân nặng",
      dataIndex: "weight",
      key: "weight",
    },
    {
      title: "BMI",
      dataIndex: "bmi",
      key: "bmi",
    },
    {
      title: "Thị lực",
      dataIndex: "vision",
      key: "vision",
    },
    {
      title: "Huyết áp",
      dataIndex: "bloodPressure",
      key: "bloodPressure",
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedCheckup(record.raw);
            setDetailModalVisible(true);
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6fcfa] flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6fcfa] ">
      <div className="w-full max-w-5xl mx-auto px-4 pt-24">
        {/* Header theo mẫu HealthProfile */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-full text-sm font-medium mb-2">
            <HeartOutlined className="text-[#36ae9a]" />
            <span>Quản lý sức khỏe học sinh</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Kết quả khám sức khỏe
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Xem lại kết quả các lần khám sức khỏe định kỳ của học sinh để theo
            dõi sự phát triển và phát hiện sớm các vấn đề.
          </p>
        </div>
        {/* Bỏ Card, chỉ giữ Select, Button và Table */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
          <Title
            level={2}
            className="!text-[#36ae9a] !mb-0 text-center md:text-left"
          >
            Kết quả khám sức khỏe
          </Title>
          <Space>
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
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={checkupResults}
          pagination={false}
          className="rounded-xl"
          style={{ padding: 12 }}
        />
      </div>
      {/* Modal xem chi tiết */}
      <Modal
        title="Chi tiết báo cáo khám sức khỏe"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedCheckup && (
          <div>
            <Typography.Title level={4} style={{ marginBottom: 0 }}>
              {selectedCheckup.studentName || ""}
            </Typography.Title>
            <Typography.Text
              type="secondary"
              style={{ display: "block", marginBottom: 4 }}
            >
              {selectedCheckup.campaign?.name && (
                <>
                  Chiến dịch: <b>{selectedCheckup.campaign.name}</b>
                  <br />
                </>
              )}
              Ngày khám:{" "}
              {selectedCheckup.scheduledDate
                ? new Date(selectedCheckup.scheduledDate).toLocaleDateString(
                    "vi-VN"
                  )
                : "N/A"}
            </Typography.Text>
            <Divider orientation="left">Thông tin cơ bản</Divider>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Chiều cao">
                {selectedCheckup.height
                  ? `${selectedCheckup.height} cm`
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Cân nặng">
                {selectedCheckup.weight
                  ? `${selectedCheckup.weight} kg`
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Mạch">
                {selectedCheckup.pulse || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Huyết áp tâm thu">
                {selectedCheckup.systolicBP || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Huyết áp tâm trương">
                {selectedCheckup.diastolicBP || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Phân loại thể lực">
                {(() => {
                  const map = {
                    EXCELLENT: "Xuất sắc",
                    GOOD: "Tốt",
                    AVERAGE: "Trung bình",
                    WEAK: "Yếu",
                  };
                  return (
                    map[selectedCheckup.physicalClassification] ||
                    selectedCheckup.physicalClassification ||
                    "N/A"
                  );
                })()}
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Thị lực</Divider>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Phải (không kính)">
                {selectedCheckup.visionRightNoGlasses || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Trái (không kính)">
                {selectedCheckup.visionLeftNoGlasses || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Phải (có kính)">
                {selectedCheckup.visionRightWithGlasses || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Trái (có kính)">
                {selectedCheckup.visionLeftWithGlasses || "N/A"}
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Thính lực</Divider>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Trái (bình thường)">
                {selectedCheckup.hearingLeftNormal || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Trái (thì thầm)">
                {selectedCheckup.hearingLeftWhisper || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Phải (bình thường)">
                {selectedCheckup.hearingRightNormal || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Phải (thì thầm)">
                {selectedCheckup.hearingRightWhisper || "N/A"}
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Răng miệng</Divider>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Răng hàm trên">
                {selectedCheckup.dentalUpperJaw || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Răng hàm dưới">
                {selectedCheckup.dentalLowerJaw || "N/A"}
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Đánh giá tổng thể</Divider>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Sức khỏe tổng thể">
                <Tag
                  color={
                    selectedCheckup.overallHealth === "NORMAL"
                      ? "green"
                      : selectedCheckup.overallHealth === "NEEDS_ATTENTION"
                      ? "orange"
                      : "red"
                  }
                >
                  {(() => {
                    const map = {
                      NORMAL: "Bình thường",
                      NEEDS_ATTENTION: "Cần chú ý",
                      REQUIRES_TREATMENT: "Cần điều trị",
                    };
                    return (
                      map[selectedCheckup.overallHealth] ||
                      selectedCheckup.overallHealth ||
                      "N/A"
                    );
                  })()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Cần theo dõi">
                {selectedCheckup.requiresFollowUp ? "Có" : "Không"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày theo dõi">
                {selectedCheckup.followUpDate
                  ? new Date(selectedCheckup.followUpDate).toLocaleDateString(
                      "vi-VN"
                    )
                  : ""}
              </Descriptions.Item>
              <Descriptions.Item label="Khuyến nghị">
                <Typography.Text strong>
                  {selectedCheckup.recommendations || "N/A"}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú lâm sàng" span={2}>
                {selectedCheckup.clinicalNotes || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú thêm" span={2}>
                {selectedCheckup.notes || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HealthCheckupResults;
