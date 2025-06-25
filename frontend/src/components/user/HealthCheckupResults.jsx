
import { DownloadOutlined, PrinterOutlined } from "@ant-design/icons";
import { Button, Card, Select, Space, Table, Typography, message } from "antd";
import { useState } from "react";

const { Title } = Typography;

const HealthCheckupResults = () => {
  const [selectedChild, setSelectedChild] = useState("child1");

  // Mock data - replace with actual API data
  const children = [
    { value: "child1", label: "Nguyễn Văn A" },
    { value: "child2", label: "Nguyễn Văn B" },
  ];

  const checkupResults = [
    {
      key: "1",
      date: "2024-03-15",
      height: "150 cm",
      weight: "45 kg",
      bmi: "20",
      vision: "10/10",
      bloodPressure: "110/70",
      notes: "Sức khỏe tốt",
    },
    {
      key: "2",
      date: "2023-09-15",
      height: "148 cm",
      weight: "43 kg",
      bmi: "19.6",
      vision: "10/10",
      bloodPressure: "108/68",
      notes: "Sức khỏe tốt",
    },
  ];

  const columns = [
    {
      title: "Ngày khám",
      dataIndex: "date",
      key: "date",
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
  ];

  const handleDownload = () => {
    message.success("Đang tải xuống kết quả khám sức khỏe...");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f6fcfa] ">
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
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <Title
              level={2}
              className="!text-[#36ae9a] !mb-0 text-center md:text-left"
            >
              Kết quả khám sức khỏe
            </Title>
            <Space>
              <Select
                style={{ width: 200 }}
                value={selectedChild}
                onChange={setSelectedChild}
                options={children}
              />
              <Button icon={<DownloadOutlined />} onClick={handleDownload}>
                Tải xuống
              </Button>
              <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                In
              </Button>
            </Space>
          </div>
          <Table
            columns={columns}
            dataSource={checkupResults}
            pagination={false}
            className="rounded-xl"
          />
        </Card>
      </div>
    </div>
  );
};

export default HealthCheckupResults;
