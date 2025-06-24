import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  message,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";

const { Title, Text } = Typography;

const requirementMap = {
  REQUIRED: "Bắt buộc",
  OPTIONAL: "Tùy chọn",
};

const doseMap = {
  FIRST: "Liều đầu tiên",
  SECOND: "Liều thứ hai",
  BOOSTER: "Liều nhắc lại",
};

const statusMap = {
  UNSCHEDULED: { color: "default", text: "Chưa lên lịch" },
  SCHEDULED: { color: "processing", text: "Đã lên lịch" },
  COMPLETED: { color: "success", text: "Đã tiêm" },
  POSTPONED: { color: "warning", text: "Hoãn" },
  CANCELLED: { color: "error", text: "Hủy" },
};

const VaccineConsentForm = () => {
  const [selectedChild, setSelectedChild] = useState("child1");

  // Mock data - replace with actual API data
  const children = [
    { value: "child1", label: "Nguyễn Văn A" },
    { value: "child2", label: "Nguyễn Văn B" },
  ];

  const [vaccines, setVaccines] = useState([
    {
      id: 1,
      name: "Vaccine Sởi - Rubella",
      requirement: "REQUIRED",
      expiredDate: "2024-12-31",
      status: "SCHEDULED",
      administeredDate: null,
      dose: "FIRST",
      sideEffects: "",
      notes: "Tiêm phòng cho trẻ lớp 1",
      parentConsent: null,
      consentDate: null,
      scheduledDate: "2024-06-15",
    },
    {
      id: 2,
      name: "Vaccine Cúm mùa",
      requirement: "OPTIONAL",
      expiredDate: "2024-11-30",
      status: "SCHEDULED",
      administeredDate: null,
      dose: "SECOND",
      sideEffects: "",
      notes: "Khuyến nghị cho trẻ có bệnh nền",
      parentConsent: true,
      consentDate: "2024-05-01",
      scheduledDate: "2024-06-20",
    },
    {
      id: 3,
      name: "Vaccine Viêm gan B",
      requirement: "REQUIRED",
      expiredDate: "2024-10-10",
      status: "SCHEDULED",
      administeredDate: null,
      dose: "BOOSTER",
      sideEffects: "",
      notes: "Liều nhắc lại cho trẻ lớp 5",
      parentConsent: false,
      consentDate: "2024-05-02",
      scheduledDate: "2024-06-25",
    },
  ]);

  const getConsentTag = (consent) => {
    if (consent === true) return <Tag color="success">Đã đồng ý</Tag>;
    if (consent === false) return <Tag color="error">Không đồng ý</Tag>;
    return <Tag color="warning">Chưa xác nhận</Tag>;
  };

  const handleConsent = (vaccineId, consent) => {
    setVaccines(
      vaccines.map((v) =>
        v.id === vaccineId
          ? {
              ...v,
              parentConsent: consent,
              consentDate: new Date().toISOString().slice(0, 10),
            }
          : v
      )
    );
    message.success(
      consent
        ? "Đã xác nhận đồng ý tiêm vaccine"
        : "Đã xác nhận không đồng ý tiêm vaccine"
    );
  };

  const columns = [
    {
      title: "Tên vaccine",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Loại liều",
      dataIndex: "dose",
      key: "dose",
      render: (dose) => doseMap[dose],
    },
    {
      title: "Yêu cầu",
      dataIndex: "requirement",
      key: "requirement",
      render: (req) => requirementMap[req],
    },
    {
      title: "Ngày dự kiến tiêm",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
      ),
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expiredDate",
      key: "expiredDate",
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Tác dụng phụ",
      dataIndex: "sideEffects",
      key: "sideEffects",
      render: (val) => val || "Không có",
    },
    {
      title: "Trạng thái xác nhận",
      dataIndex: "parentConsent",
      key: "parentConsent",
      render: getConsentTag,
    },
    {
      title: "Ngày xác nhận",
      dataIndex: "consentDate",
      key: "consentDate",
      render: (val) => val || "-",
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleConsent(record.id, true)}
            disabled={record.parentConsent !== null}
            size="small"
          >
            Đồng ý
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => handleConsent(record.id, false)}
            disabled={record.parentConsent !== null}
            size="small"
          >
            Không
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex justify-center items-start bg-[#f6fcfa] py-10">
      <div className="w-full max-w-5xl mx-auto px-4">
        <Card
          className="w-full rounded-3xl shadow-lg border-0 mt-12"
          style={{
            background: "#fff",
            borderRadius: "1.5rem",
            boxShadow: "0px 3px 16px rgba(0,0,0,0.10)",
            padding: "2rem",
            marginTop: "3rem",
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              marginBottom: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <Title level={2} className="!text-[#36ae9a] !mb-0">
                Xác nhận tiêm vaccine
              </Title>
              <Text type="secondary">
                Danh sách các đợt tiêm vaccine cho học sinh
              </Text>
            </div>
            <Select
              style={{ width: 200 }}
              value={selectedChild}
              onChange={setSelectedChild}
              options={children}
            />
          </div>
          <Table
            columns={columns}
            dataSource={vaccines}
            rowKey="id"
            pagination={false}
            bordered
            scroll={{ x: "max-content" }}
          />
        </Card>
      </div>
    </div>
  );
};

export default VaccineConsentForm;
