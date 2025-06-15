import React, { useState } from 'react';
import { Form, Input, DatePicker, TimePicker, Button, message, Select } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const MedicineSubmission = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      // Format dates and times
      const formattedValues = {
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        administrationTimes: values.administrationTimes.map(time => time.format('HH:mm')),
      };

      // TODO: Add API call to save medicine submission
      console.log('Medicine submission:', formattedValues);
      
      message.success('Medicine submitted successfully!');
      form.resetFields();
    } catch (error) {
      message.error('Failed to submit medicine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Submit Medicine for Student</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="space-y-4"
      >
        <Form.Item
          name="studentName"
          label="Student Name"
          rules={[{ required: true, message: 'Please enter student name' }]}
        >
          <Input placeholder="Enter student name" />
        </Form.Item>

        <Form.Item
          name="medicineName"
          label="Medicine Name"
          rules={[{ required: true, message: 'Please enter medicine name' }]}
        >
          <Input placeholder="Enter medicine name" />
        </Form.Item>

        <Form.Item
          name="dosage"
          label="Dosage"
          rules={[{ required: true, message: 'Please enter dosage' }]}
        >
          <Input placeholder="e.g., 1 tablet, 5ml, etc." />
        </Form.Item>

        <Form.Item
          name="frequency"
          label="Frequency"
          rules={[{ required: true, message: 'Please select frequency' }]}
        >
          <Select placeholder="Select frequency">
            <Option value="once">Once a day</Option>
            <Option value="twice">Twice a day</Option>
            <Option value="thrice">Three times a day</Option>
            <Option value="custom">Custom</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="administrationTimes"
          label="Administration Times"
          rules={[{ required: true, message: 'Please select administration times' }]}
        >
          <TimePicker.RangePicker format="HH:mm" />
        </Form.Item>

        <Form.Item
          name="startDate"
          label="Start Date"
          rules={[{ required: true, message: 'Please select start date' }]}
        >
          <DatePicker />
        </Form.Item>

        <Form.Item
          name="endDate"
          label="End Date"
          rules={[{ required: true, message: 'Please select end date' }]}
        >
          <DatePicker />
        </Form.Item>

        <Form.Item
          name="specialInstructions"
          label="Special Instructions"
        >
          <TextArea rows={4} placeholder="Enter any special instructions for medicine administration" />
        </Form.Item>

        <Form.Item
          name="allergies"
          label="Known Allergies"
        >
          <TextArea rows={2} placeholder="List any known allergies" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} className="w-full">
            Submit Medicine
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default MedicineSubmission; 