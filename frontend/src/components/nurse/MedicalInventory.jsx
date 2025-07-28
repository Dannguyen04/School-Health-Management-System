import { EyeOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Descriptions,
  Form,
  Image,
  Input,
  Modal,
  Table,
  Tag,
  Typography,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const unitLabel = {
  vien: "viên",
  ml: "ml",
  mg: "mg",
  khac: "Khác",
};

const statusMap = {
  APPROVED: "Đã duyệt",
  PENDING_APPROVAL: "Chờ duyệt",
  REJECTED: "Từ chối",
};
const treatmentStatusMap = {
  ONGOING: "Đang sử dụng",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã huỷ",
  STOPPED: "Đã dừng điều trị",
};
const frequencyMap = {
  once: "1 lần/ngày",
  twice: "2 lần/ngày",
  three: "3 lần/ngày",
  "as-needed": "Khi cần",
};
const usageNoteMap = {
  "after-meal": "Sau ăn",
  "before-meal": "Trước ăn",
  "with-water": "Uống với nước",
};
const typeMap = {
  "giam-dau": "Giảm đau",
  "khang-sinh": "Kháng sinh",
  "bo-sung": "Bổ sung",
  "ho-hap": "Hô hấp",
  khac: "Khác",
};

const MedicalInventory = () => {
  const [approvedData, setApprovedData] = useState([]);
  const [approvedDataRaw, setApprovedDataRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    studentName: "",
    parentName: "",
    medicationName: "",
  });

  // Lấy danh sách thuốc đã được phê duyệt
  const fetchApprovedMedications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/nurse/approved-medications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        const mapped = response.data.data.map((item) => ({
          ...item,
          medicationName: item.name,
          studentName: item.student?.user?.fullName || "-",
          parentName: item.parent?.user?.fullName || "-",
        }));
        setApprovedDataRaw(mapped);
        setApprovedData(mapped);
      }
    } catch {
      setApprovedData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedMedications();
  }, []);

  const handleSearch = () => {
    const normalize = (str) =>
      (str || "").replace(/\s+/g, " ").trim().toLowerCase();
    let data = approvedDataRaw;
    if (filters.studentName) {
      data = data.filter((item) =>
        normalize(item.studentName).includes(normalize(filters.studentName))
      );
    }
    if (filters.parentName) {
      data = data.filter((item) =>
        normalize(item.parentName).includes(normalize(filters.parentName))
      );
    }
    if (filters.medicationName) {
      data = data.filter((item) =>
        normalize(item.medicationName).includes(
          normalize(filters.medicationName)
        )
      );
    }
    setApprovedData(data);
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
        Thuốc phụ huynh gửi đã duyệt
      </h1>
      <Card style={{ marginBottom: 16 }}>
        <Form layout="inline" onFinish={handleSearch} initialValues={filters}>
          <Form.Item>
            <Input
              placeholder="Tên học sinh"
              value={filters.studentName}
              onChange={(e) =>
                setFilters((f) => ({ ...f, studentName: e.target.value }))
              }
              allowClear
            />
          </Form.Item>
          <Form.Item>
            <Input
              placeholder="Tên phụ huynh"
              value={filters.parentName}
              onChange={(e) =>
                setFilters((f) => ({ ...f, parentName: e.target.value }))
              }
              allowClear
            />
          </Form.Item>
          <Form.Item>
            <Input
              placeholder="Tên thuốc"
              value={filters.medicationName}
              onChange={(e) =>
                setFilters((f) => ({ ...f, medicationName: e.target.value }))
              }
              allowClear
            />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Tìm kiếm
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => {
              setFilters({
                studentName: "",
                parentName: "",
                medicationName: "",
              });
              setApprovedData(approvedDataRaw);
            }}
          >
            Xóa lọc
          </Button>
        </Form>
      </Card>
      <Card>
        <Table
          dataSource={approvedData}
          rowKey="id"
          loading={loading}
          columns={[
            {
              title: "Tên thuốc",
              dataIndex: "medicationName",
              key: "medicationName",
            },
            {
              title: "Học sinh",
              dataIndex: "studentName",
              key: "studentName",
            },
            {
              title: "Phụ huynh",
              dataIndex: "parentName",
              key: "parentName",
            },
            {
              title: "Liều lượng",
              dataIndex: "dosage",
              key: "dosage",
            },
            {
              title: "Số lượng",
              dataIndex: "stockQuantity",
              key: "stockQuantity",
            },
            {
              title: "Hướng dẫn",
              dataIndex: "instructions",
              key: "instructions",
              render: (text) => text || "-",
            },
            {
              title: "Giờ uống cụ thể",
              dataIndex: "customTimes",
              key: "customTimes",
              render: (times) =>
                Array.isArray(times) && times.length > 0
                  ? times.join(", ")
                  : "-",
            },
            {
              title: "Ngày duyệt",
              dataIndex: "updatedAt",
              key: "updatedAt",
              render: (date) =>
                date ? new Date(date).toLocaleDateString("vi-VN") : "-",
            },
            {
              title: "Chi tiết",
              key: "actions",
              render: (_, record) => (
                <Button
                  type="primary"
                  size="small"
                  shape="round"
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setSelected(record);
                    setModalVisible(true);
                  }}
                >
                  Xem chi tiết
                </Button>
              ),
            },
          ]}
          pagination={{ pageSize: 10 }}
        />
      </Card>
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={
          <Button type="primary" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>
        }
        title={selected?.name || selected?.medicationName || "Chi tiết vật tư"}
        width={800}
      >
        {selected && (
          <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
            {selected.image ? (
              <Image
                src={selected.image}
                alt="Ảnh thuốc"
                style={{
                  maxWidth: 220,
                  borderRadius: 12,
                  margin: "0 auto 16px auto",
                  display: "block",
                }}
                preview={true}
              />
            ) : (
              <div
                style={{
                  width: 220,
                  height: 120,
                  background: "#f5f5f5",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#aaa",
                  margin: "0 auto 16px auto",
                }}
              >
                Không có ảnh
              </div>
            )}
            <Typography.Title level={4} style={{ marginBottom: 0 }}>
              {selected.medicationName || selected.name}
            </Typography.Title>
            <div style={{ textAlign: "left", marginTop: 24 }}>
              <Typography.Title level={5}>
                Thông tin học sinh & phụ huynh
              </Typography.Title>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Tên học sinh">
                  {selected.student?.user?.fullName || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Mã học sinh">
                  {selected.student?.studentCode || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Lớp">
                  {selected.student?.class || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Phụ huynh">
                  {selected.parent?.user?.fullName || "-"}
                </Descriptions.Item>
              </Descriptions>
              <Typography.Title level={5} style={{ marginTop: 24 }}>
                Thông tin thuốc
              </Typography.Title>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Loại thuốc">
                  {typeMap[selected.type] || selected.type || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Liều lượng">
                  {selected.dosage || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Đơn vị">
                  <Tag color="green">
                    {unitLabel[selected.unit] || selected.unit || "-"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng">
                  {selected.stockQuantity || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Tần suất">
                  {frequencyMap[selected.frequency] ||
                    selected.frequency ||
                    "-"}
                </Descriptions.Item>
              </Descriptions>
              <Typography.Title level={5} style={{ marginTop: 24 }}>
                Thông tin cấp phát & ghi chú
              </Typography.Title>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Hướng dẫn">
                  {selected.instructions || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú sử dụng">
                  {usageNoteMap[selected.usageNote] ||
                    selected.usageNote ||
                    "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color="blue">
                    {statusMap[selected.status] || selected.status}
                  </Tag>
                  <Tag color="purple">
                    {treatmentStatusMap[selected.treatmentStatus] ||
                      selected.treatmentStatus}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian sử dụng">
                  {(selected.startDate
                    ? new Date(selected.startDate).toLocaleDateString("vi-VN")
                    : "-") +
                    " - " +
                    (selected.endDate
                      ? new Date(selected.endDate).toLocaleDateString("vi-VN")
                      : "-")}
                </Descriptions.Item>
                <Descriptions.Item label="Giờ uống cụ thể">
                  {Array.isArray(selected.customTimes) &&
                  selected.customTimes.length > 0
                    ? selected.customTimes.join(", ")
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {selected.createdAt
                    ? new Date(selected.createdAt).toLocaleDateString("vi-VN")
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày duyệt">
                  {selected.updatedAt
                    ? new Date(selected.updatedAt).toLocaleDateString("vi-VN")
                    : "-"}
                </Descriptions.Item>
                {Array.isArray(selected.warnings) &&
                  selected.warnings.length > 0 && (
                    <Descriptions.Item label="Cảnh báo">
                      {selected.warnings.map((w, i) => (
                        <Tag color="red" key={i}>
                          {w}
                        </Tag>
                      ))}
                    </Descriptions.Item>
                  )}
              </Descriptions>
            </div>
            {Array.isArray(selected.medicationAdministrationLogs) &&
              selected.medicationAdministrationLogs.length > 0 && (
                <>
                  <Typography.Title level={5} style={{ marginTop: 24 }}>
                    Lịch sử cấp phát
                  </Typography.Title>
                  <Table
                    dataSource={selected.medicationAdministrationLogs}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    columns={[
                      {
                        title: "Thời gian",
                        dataIndex: "givenAt",
                        key: "givenAt",
                        render: (v) =>
                          v ? new Date(v).toLocaleString("vi-VN") : "-",
                      },
                      {
                        title: "Liều đã cấp",
                        dataIndex: "dosageGiven",
                        key: "dosageGiven",
                      },
                      { title: "Ghi chú", dataIndex: "notes", key: "notes" },
                    ]}
                    style={{ marginTop: 8 }}
                  />
                </>
              )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicalInventory;
