import { HeartOutlined } from "@ant-design/icons";
import { Button, Select, Spin, Table, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import VaccinationDetailModal from "../components/parent/VaccinationDetailModal";
import { parentAPI } from "../utils/api";

const { Title } = Typography;

const VaccinationHistory = () => {
  const [vaccinations, setVaccinations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  // Lấy danh sách con khi mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await parentAPI.getChildren();
        const childrenArr = res.data?.data || [];
        setChildren(
          childrenArr.map((child) => ({
            value: child.studentId,
            label: child.fullName,
            class: child.class,
          }))
        );
        // Chọn mặc định là con đầu tiên nếu có
        if (childrenArr.length > 0) {
          setSelectedChild(childrenArr[0].studentId);
        }
      } catch {
        setChildren([]); // ignore error
      }
    };
    fetchChildren();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!selectedChild) {
          setVaccinations([]);
          setLoading(false);
          return;
        }
        const res = await parentAPI.getVaccinationHistory(selectedChild);
        if (res.data.success) setVaccinations(res.data.data);
      } catch {
        // ignore error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedChild]);

  const columns = [
    {
      title: "Ngày tiêm",
      dataIndex: "administeredDate",
      key: "administeredDate",
      align: "center",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Tên chiến dịch",
      dataIndex: ["campaign", "name"],
      key: "campaignName",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Loại liều",
      dataIndex: "dose",
      key: "dose",
      align: "center",
      width: 120,
      render: (dose) => {
        switch (dose) {
          case "FIRST":
            return "Liều đầu tiên";
          case "SECOND":
            return "Liều thứ hai";
          case "BOOSTER":
            return "Liều nhắc lại";
          default:
            return dose;
        }
      },
    },
    {
      title: "Y tá thực hiện",
      dataIndex: ["nurse", "user", "fullName"],
      key: "nurseName",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setSelected(record);
            setModalVisible(true);
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6fcfa]">
      <div className="w-full max-w-5xl mx-auto px-4 pt-24">
        {/* Header theo mẫu HealthProfile */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-full text-sm font-medium mb-2">
            <HeartOutlined className="text-[#36ae9a]" />
            <span>Quản lý sức khỏe học sinh</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Lịch sử tiêm chủng
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Xem lại toàn bộ lịch sử tiêm chủng của học sinh để theo dõi quá
            trình bảo vệ sức khỏe.
          </p>
        </div>
        {/* Bỏ Card, chỉ giữ Select và Table */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
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
            value={selectedChild}
            onChange={setSelectedChild}
            placeholder="Chọn học sinh"
            size="large"
          >
            {children.map((child) => (
              <Select.Option
                key={child.value}
                value={child.value}
                className="!py-3 !px-5 !text-lg hover:bg-[#e8f5f2]"
                style={{ display: "flex", alignItems: "center", gap: 14 }}
              >
                <span className="font-semibold text-gray-800 truncate max-w-[140px]">
                  {child.label} - {child.class}
                </span>
              </Select.Option>
            ))}
          </Select>
        </div>
        {loading ? (
          <div style={{ padding: "24px", textAlign: "center" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={vaccinations}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} bản ghi`,
            }}
            className="rounded-xl"
            style={{ padding: 12 }}
          />
        )}
      </div>
      <VaccinationDetailModal
        visible={modalVisible}
        vaccination={selected}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default VaccinationHistory;
