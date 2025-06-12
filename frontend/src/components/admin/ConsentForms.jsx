import { CheckOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal, Select, Space, Table, Tag } from "antd";
import React, { useState } from "react";

const { Option } = Select;
const { TextArea } = Input;

const ConsentForms = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);

  // Mock data - replace with real data from API
  const [forms, setForms] = useState([
    {
      id: 1,
      studentName: "Alice Johnson",
      grade: "5A",
      formType: "MEDICAL_CONSENT",
      status: "pending",
      submittedDate: "2024-03-15",
      parentName: "Mary Johnson",
    },
    {
      id: 2,
      studentName: "Bob Smith",
      grade: "4B",
      formType: "MEDICATION_CONSENT",
      status: "approved",
      submittedDate: "2024-03-14",
      parentName: "John Smith",
    },
  ]);

  const columns = [
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Form Type",
      dataIndex: "formType",
      key: "formType",
      render: (type) => (
        <Tag
          color={
            type === "MEDICAL_CONSENT"
              ? "blue"
              : type === "MEDICATION_CONSENT"
              ? "green"
              : "default"
          }
        >
          {type.replace("_", " ")}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "approved"
              ? "green"
              : status === "pending"
              ? "orange"
              : "red"
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Submitted Date",
      dataIndex: "submittedDate",
      key: "submittedDate",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)}>
            View
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
              >
                Approve
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.id)}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleView = (form) => {
    setSelectedForm(form);
    setIsModalVisible(true);
  };

  const handleApprove = (formId) => {
    Modal.confirm({
      title: "Approve Consent Form",
      content: "Are you sure you want to approve this consent form?",
      onOk: () => {
        setForms(
          forms.map((form) =>
            form.id === formId ? { ...form, status: "approved" } : form
          )
        );
        message.success("Consent form approved successfully");
      },
    });
  };

  const handleReject = (formId) => {
    Modal.confirm({
      title: "Reject Consent Form",
      content: "Are you sure you want to reject this consent form?",
      onOk: () => {
        setForms(
          forms.map((form) =>
            form.id === formId ? { ...form, status: "rejected" } : form
          )
        );
        message.success("Consent form rejected successfully");
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Consent Forms</h1>
      </div>

      <Table
        columns={columns}
        dataSource={forms}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Consent Form Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedForm && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Student Name:</p>
                <p>{selectedForm.studentName}</p>
              </div>
              <div>
                <p className="font-semibold">Grade:</p>
                <p>{selectedForm.grade}</p>
              </div>
              <div>
                <p className="font-semibold">Parent Name:</p>
                <p>{selectedForm.parentName}</p>
              </div>
              <div>
                <p className="font-semibold">Form Type:</p>
                <p>{selectedForm.formType.replace("_", " ")}</p>
              </div>
              <div>
                <p className="font-semibold">Status:</p>
                <Tag
                  color={
                    selectedForm.status === "approved"
                      ? "green"
                      : selectedForm.status === "pending"
                      ? "orange"
                      : "red"
                  }
                >
                  {selectedForm.status.toUpperCase()}
                </Tag>
              </div>
              <div>
                <p className="font-semibold">Submitted Date:</p>
                <p>{selectedForm.submittedDate}</p>
              </div>
            </div>

            <div>
              <p className="font-semibold">Additional Notes:</p>
              <TextArea
                rows={4}
                placeholder="Add any additional notes here..."
                value={selectedForm.notes || ""}
                onChange={(e) => {
                  setSelectedForm({
                    ...selectedForm,
                    notes: e.target.value,
                  });
                }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConsentForms;
