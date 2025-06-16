import { CheckCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Input, Select, Table, Tag } from "antd";
import React, { useState } from "react";

const { Option } = Select;

const StudentList = () => {
  const [filters, setFilters] = useState({
    class: "",
    school: "",
    vaccinationStatus: "",
    healthCheckStatus: "",
  });

  // Mock data for demonstration
  const students = [
    {
      id: 1,
      name: "Nguyen Van A",
      class: "10A",
      school: "High School A",
      vaccinationStatus: "Complete",
      healthCheckStatus: "Complete",
    },
    {
      id: 2,
      name: "Tran Thi B",
      class: "9B",
      school: "High School A",
      vaccinationStatus: "Pending",
      healthCheckStatus: "Complete",
    },
    // Add more mock data as needed
  ];

  const columns = [
    {
      title: "Student Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Class",
      dataIndex: "class",
      key: "class",
      filters: [
        { text: "10A", value: "10A" },
        { text: "9B", value: "9B" },
      ],
      onFilter: (value, record) => record.class === value,
    },
    {
      title: "School",
      dataIndex: "school",
      key: "school",
    },
    {
      title: "Vaccination Status",
      dataIndex: "vaccinationStatus",
      key: "vaccinationStatus",
      render: (status) => (
        <Tag color={status === "Complete" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Health Check Status",
      dataIndex: "healthCheckStatus",
      key: "healthCheckStatus",
      render: (status) => (
        <Tag color={status === "Complete" ? "green" : "orange"}>{status}</Tag>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap gap-4 mb-4">
          <Select
            placeholder="Select Class"
            style={{ width: 200 }}
            onChange={(value) => setFilters({ ...filters, class: value })}
          >
            <Option value="10A">Class 10A</Option>
            <Option value="9B">Class 9B</Option>
          </Select>

          <Select
            placeholder="Select School"
            style={{ width: 200 }}
            onChange={(value) => setFilters({ ...filters, school: value })}
          >
            <Option value="High School A">High School A</Option>
            <Option value="High School B">High School B</Option>
          </Select>

          <Select
            placeholder="Vaccination Status"
            style={{ width: 200 }}
            onChange={(value) =>
              setFilters({ ...filters, vaccinationStatus: value })
            }
          >
            <Option value="Complete">Complete</Option>
            <Option value="Pending">Pending</Option>
          </Select>

          <Select
            placeholder="Health Check Status"
            style={{ width: 200 }}
            onChange={(value) =>
              setFilters({ ...filters, healthCheckStatus: value })
            }
          >
            <Option value="Complete">Complete</Option>
            <Option value="Pending">Pending</Option>
          </Select>

          <Input
            placeholder="Search student"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <div className="mt-4 flex justify-end">
          <Button type="primary" icon={<CheckCircleOutlined />}>
            Confirm Student List
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default StudentList;
