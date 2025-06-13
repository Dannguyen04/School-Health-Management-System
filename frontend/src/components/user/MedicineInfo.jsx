import { UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Upload,
  message,
} from "antd";
import { Formik } from "formik";
import * as Yup from "yup";

const { Title } = Typography;
const { TextArea } = Input;

const validationSchema = Yup.object().shape({
  medicineName: Yup.string().required("Vui lòng nhập tên thuốc"),
  dosage: Yup.string().required("Vui lòng nhập liều lượng"),
  frequency: Yup.string().required("Vui lòng nhập tần suất sử dụng"),
  instructions: Yup.string().required("Vui lòng nhập hướng dẫn sử dụng"),
  startDate: Yup.date().required("Vui lòng chọn ngày bắt đầu"),
  endDate: Yup.date().required("Vui lòng chọn ngày kết thúc"),
});

const MedicineInfo = () => {
  const initialValues = {
    medicineName: "",
    dosage: "",
    frequency: "",
    instructions: "",
    startDate: null,
    endDate: null,
    images: [],
    notes: "",
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Implement API call here
      console.log("Form values:", values);
      message.success("Gửi thông tin thuốc thành công");
      resetForm();
    } catch (error) {
      message.error("Có lỗi xảy ra khi gửi thông tin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <Title level={2}>Thông tin thuốc</Title>

      <Card className="mt-6">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setFieldValue,
          }) => (
            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="Tên thuốc"
                validateStatus={
                  touched.medicineName && errors.medicineName ? "error" : ""
                }
                help={touched.medicineName && errors.medicineName}
              >
                <Input
                  name="medicineName"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.medicineName}
                  placeholder="Nhập tên thuốc"
                />
              </Form.Item>

              <Form.Item
                label="Liều lượng"
                validateStatus={touched.dosage && errors.dosage ? "error" : ""}
                help={touched.dosage && errors.dosage}
              >
                <Input
                  name="dosage"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.dosage}
                  placeholder="Ví dụ: 1 viên/lần"
                />
              </Form.Item>

              <Form.Item
                label="Tần suất sử dụng"
                validateStatus={
                  touched.frequency && errors.frequency ? "error" : ""
                }
                help={touched.frequency && errors.frequency}
              >
                <Select
                  name="frequency"
                  onChange={(value) => setFieldValue("frequency", value)}
                  onBlur={handleBlur}
                  value={values.frequency}
                  placeholder="Chọn tần suất"
                >
                  <Select.Option value="once">1 lần/ngày</Select.Option>
                  <Select.Option value="twice">2 lần/ngày</Select.Option>
                  <Select.Option value="three">3 lần/ngày</Select.Option>
                  <Select.Option value="four">4 lần/ngày</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Hướng dẫn sử dụng"
                validateStatus={
                  touched.instructions && errors.instructions ? "error" : ""
                }
                help={touched.instructions && errors.instructions}
              >
                <TextArea
                  name="instructions"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.instructions}
                  placeholder="Nhập hướng dẫn sử dụng chi tiết"
                  rows={4}
                />
              </Form.Item>

              <Form.Item
                label="Thời gian sử dụng"
                validateStatus={
                  (touched.startDate && errors.startDate) ||
                  (touched.endDate && errors.endDate)
                    ? "error"
                    : ""
                }
                help={
                  (touched.startDate && errors.startDate) ||
                  (touched.endDate && errors.endDate)
                }
              >
                <Space>
                  <Form.Item
                    name="startDate"
                    noStyle
                    validateStatus={
                      touched.startDate && errors.startDate ? "error" : ""
                    }
                  >
                    <DatePicker
                      placeholder="Ngày bắt đầu"
                      onChange={(date) => setFieldValue("startDate", date)}
                      value={values.startDate}
                    />
                  </Form.Item>
                  <span>-</span>
                  <Form.Item
                    name="endDate"
                    noStyle
                    validateStatus={
                      touched.endDate && errors.endDate ? "error" : ""
                    }
                  >
                    <DatePicker
                      placeholder="Ngày kết thúc"
                      onChange={(date) => setFieldValue("endDate", date)}
                      value={values.endDate}
                    />
                  </Form.Item>
                </Space>
              </Form.Item>

              <Form.Item label="Hình ảnh thuốc">
                <Upload
                  multiple
                  beforeUpload={() => false}
                  onChange={({ fileList }) => setFieldValue("images", fileList)}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>Tải lên hình ảnh</Button>
                </Upload>
              </Form.Item>

              <Form.Item label="Ghi chú">
                <TextArea
                  name="notes"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.notes}
                  placeholder="Nhập ghi chú bổ sung (nếu có)"
                  rows={4}
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                  Gửi thông tin
                </Button>
              </Form.Item>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default MedicineInfo;
