import { CalendarOutlined, HistoryOutlined } from "@ant-design/icons";
import { Card, Spin, Table, Tabs } from "antd";
import { useEffect, useState } from "react";

const { TabPane } = Tabs;

const dummyData = [
  {
    key: "1",
    date: "2025-06-15",
    type: "Vaccination",
    description: "COVID-19 Booster",
    status: "Scheduled",
  },
  {
    key: "2",
    date: "2025-05-01",
    type: "Checkup",
    description: "Annual Health Checkup",
    status: "Completed",
  },
];

const columns = [
  {
    title: "Ngày",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Loại",
    dataIndex: "type",
    key: "type",
  },
  {
    title: "Mô tả",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (text) => (
      <span
        className={`px-2 py-1 rounded text-white ${
          text === "Scheduled" ? "bg-blue-500" : "bg-green-500"
        }`}
      >
        {text === "Scheduled" ? "Sắp diễn ra" : "Hoàn tất"}
      </span>
    ),
  },
];

const VaccinationSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setRecords(dummyData);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-[60vh] flex justify-center items-start bg-[#f6fcfa] py-10">
      <div className="w-full max-w-3xl">
        <Card
          className="rounded-3xl shadow-lg border-0 mt-12"
          style={{
            background: "#fff",
            borderRadius: "1.5rem",
            boxShadow: "0px 3px 16px rgba(0,0,0,0.10)",
            padding: "2rem",
            marginTop: "3rem",
          }}
        >
          <h2 className="text-2xl font-bold text-[#36ae9a] mb-6 text-center">
            Lịch tiêm & khám của học sinh
          </h2>
          <Tabs defaultActiveKey="1" centered>
            <TabPane
              tab={
                <span>
                  <CalendarOutlined /> Lịch sắp tới
                </span>
              }
              key="1"
            >
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spin />
                </div>
              ) : (
                <Table
                  dataSource={records.filter((r) => r.status === "Scheduled")}
                  columns={columns}
                  pagination={false}
                  className="rounded-xl"
                />
              )}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <HistoryOutlined /> Lịch sử
                </span>
              }
              key="2"
            >
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spin />
                </div>
              ) : (
                <Table
                  dataSource={records.filter((r) => r.status === "Completed")}
                  columns={columns}
                  pagination={false}
                  className="rounded-xl"
                />
              )}
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default VaccinationSchedule;
