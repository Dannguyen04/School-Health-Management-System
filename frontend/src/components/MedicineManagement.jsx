import React, { useState } from 'react';
import { Table, Tag, Button, Modal, Form, Input, message, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const MedicineManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API data
  const [medicines, setMedicines] = useState([
    {
      id: 1,
      studentName: 'John Doe',
      medicineName: 'Paracetamol',
      dosage: '1 tablet',
      frequency: 'twice',
      startDate: '2024-03-20',
      endDate: '2024-03-25',
      status: 'pending',
      administrationTimes: ['08:00', '16:00'],
      specialInstructions: 'Take after meals',
    },
    // Add more mock data as needed
  ]);

  const columns = [
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Medicine',
      dataIndex: 'medicineName',
      key: 'medicineName',
    },
    {
      title: 'Dosage',
      dataIndex: 'dosage',
      key: 'dosage',
    },
    {
      title: 'Schedule',
      key: 'schedule',
      render: (_, record) => (
        <div>
          <div>Start: {record.startDate}</div>
          <div>End: {record.endDate}</div>
          <div>Times: {record.administrationTimes.join(', ')}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'pending' ? 'orange' : status === 'completed' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleAdministerMedicine(record)}
            disabled={record.status === 'completed'}
          >
            Administer
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => handleRejectMedicine(record)}
            disabled={record.status !== 'pending'}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdministerMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    setIsModalVisible(true);
  };

  const handleRejectMedicine = async (medicine) => {
    try {
      setLoading(true);
      // TODO: Add API call to reject medicine
      message.success('Medicine rejected successfully');
      // Update local state
      setMedicines(medicines.map(m => 
        m.id === medicine.id ? { ...m, status: 'rejected' } : m
      ));
    } catch (error) {
      message.error('Failed to reject medicine');
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      // TODO: Add API call to record medicine administration
      message.success('Medicine administration recorded successfully');
      // Update local state
      setMedicines(medicines.map(m => 
        m.id === selectedMedicine.id ? { ...m, status: 'completed' } : m
      ));
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to record medicine administration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Medicine Management</h2>
      <Table
        columns={columns}
        dataSource={medicines}
        rowKey="id"
        className="bg-white rounded-lg shadow"
      />

      <Modal
        title="Record Medicine Administration"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="notes"
            label="Administration Notes"
            rules={[{ required: true, message: 'Please enter administration notes' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter any notes about the medicine administration" />
          </Form.Item>
          <Form.Item
            name="administeredBy"
            label="Administered By"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input placeholder="Enter your name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicineManagement; 