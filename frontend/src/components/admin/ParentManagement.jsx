import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Row,
    Space,
    Spin,
    Table,
    Tag,
    Tooltip,
} from "antd";
import axios from "axios";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";

const ParentManagement = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingParent, setEditingParent] = useState(null);
    const [parents, setParents] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [filteredParents, setFilteredParents] = useState([]);
    const [searchForm] = Form.useForm();

    // Validation schema for parent form
    const parentValidationSchema = Yup.object().shape({
        name: Yup.string()
            .required("Vui lòng nhập tên phụ huynh")
            .min(2, "Tên phải có ít nhất 2 ký tự")
            .max(50, "Tên không được quá 50 ký tự"),
        email: Yup.string()
            .required("Vui lòng nhập email")
            .email("Email không hợp lệ"),
        phone: Yup.string()
            .required("Vui lòng nhập số điện thoại")
            .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"),
    });

    const fetchParents = async () => {
        setTableLoading(true);
        try {
            const authToken = localStorage.getItem("token");
            if (!authToken) {
                message.error(
                    "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
                );
                setTableLoading(false);
                return;
            }
            const response = await axios.get("/api/admin/parents", {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            const formattedParents = response.data.data.map((parent) => ({
                id: parent.id,
                name: parent.fullName,
                email: parent.email,
                phone: parent.phone,
                status: parent.isActive ? "active" : "inactive",
            }));
            setParents(formattedParents);
            setFilteredParents(formattedParents);
        } catch (error) {
            message.error(
                error.response?.data?.message ||
                    "Không thể tải danh sách phụ huynh"
            );
            console.error("Lỗi khi tải danh sách phụ huynh:", error);
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        fetchParents();
    }, []);

    const handleSearch = (values) => {
        const { name = "", email = "", phone = "" } = values;
        let filtered = [...parents];

        if (name.trim()) {
            filtered = filtered.filter((parent) =>
                parent.name?.toLowerCase().includes(name.trim().toLowerCase())
            );
        }
        if (email.trim()) {
            filtered = filtered.filter((parent) =>
                parent.email?.toLowerCase().includes(email.trim().toLowerCase())
            );
        }
        if (phone.trim()) {
            filtered = filtered.filter((parent) =>
                parent.phone?.toLowerCase().includes(phone.trim().toLowerCase())
            );
        }
        setFilteredParents(filtered);
    };

    const handleResetFilter = () => {
        searchForm.resetFields();
        setFilteredParents(parents);
    };

    const columns = [
        {
            title: "Tên",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "active" ? "green" : "red"}>
                    {status === "active" ? "Hoạt động" : "Không hoạt động"}
                </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            type="primary"
                            size="small"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xác nhận xóa phụ huynh"
                        description={`Bạn có chắc chắn muốn xóa phụ huynh "${record.name}"?`}
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okType="danger"
                    >
                        <Tooltip title="Xóa">
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleAdd = () => {
        setEditingParent(null);
        setIsModalVisible(true);
    };

    const handleEdit = (parent) => {
        setEditingParent(parent);
        setIsModalVisible(true);
    };

    const handleDelete = async (parentId) => {
        setTableLoading(true);
        try {
            const authToken = localStorage.getItem("token");
            // TODO: Đổi endpoint khi backend sẵn sàng
            await axios.delete(`/api/admin/parents/${parentId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            message.success("Xóa phụ huynh thành công");
            fetchParents();
        } catch (error) {
            message.error(
                error.response?.data?.message || "Không thể xóa phụ huynh"
            );
        } finally {
            setTableLoading(false);
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const authToken = localStorage.getItem("token");
            if (editingParent) {
                // Sửa phụ huynh
                // TODO: Đổi endpoint khi backend sẵn sàng
                await axios.put(
                    `/api/admin/parents/${editingParent.id}`,
                    values,
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );
                message.success("Cập nhật phụ huynh thành công");
            } else {
                // Thêm phụ huynh
                // TODO: Đổi endpoint khi backend sẵn sàng
                await axios.post("/api/admin/parents", values, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });
                message.success("Thêm phụ huynh thành công");
            }
            setIsModalVisible(false);
            resetForm();
            fetchParents();
        } catch (error) {
            message.error(
                error.response?.data?.message ||
                    "Không thể lưu thông tin phụ huynh"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setEditingParent(null);
    };

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                }}
            >
                <h2 style={{ fontWeight: 700, fontSize: 24, margin: 0 }}>
                    Quản lý phụ huynh
                </h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Thêm phụ huynh
                </Button>
            </div>
            <Card
                style={{ marginBottom: 16, background: "#fafafa" }}
                bodyStyle={{ padding: 20 }}
            >
                <Form
                    form={searchForm}
                    layout="vertical"
                    onFinish={handleSearch}
                    style={{ marginBottom: 0 }}
                >
                    <Row gutter={16} align="bottom">
                        <Col xs={24} sm={8} md={8} lg={8} xl={8}>
                            <Form.Item name="name" label="Tên phụ huynh">
                                <Input
                                    placeholder="Nhập tên phụ huynh"
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8} md={8} lg={8} xl={8}>
                            <Form.Item name="email" label="Email">
                                <Input placeholder="Nhập email" allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8} md={8} lg={8} xl={8}>
                            <Form.Item name="phone" label="Số điện thoại">
                                <Input
                                    placeholder="Nhập số điện thoại"
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                        <Col
                            xs={24}
                            sm={24}
                            md={24}
                            lg={24}
                            xl={24}
                            style={{ textAlign: "right" }}
                        >
                            <Space>
                                <Button onClick={handleResetFilter}>
                                    Xóa bộ lọc
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SearchOutlined />}
                                >
                                    Tìm kiếm
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </Card>
            <Spin spinning={tableLoading} tip="Đang tải...">
                <Table
                    columns={columns}
                    dataSource={filteredParents}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    style={{ marginTop: 16 }}
                />
            </Spin>
            <Modal
                title={editingParent ? "Sửa phụ huynh" : "Thêm phụ huynh"}
                open={isModalVisible}
                onCancel={handleModalCancel}
                footer={null}
                destroyOnClose
            >
                <Formik
                    initialValues={
                        editingParent || {
                            name: "",
                            email: "",
                            phone: "",
                        }
                    }
                    validationSchema={parentValidationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                    }) => (
                        <Form layout="vertical" onFinish={handleSubmit}>
                            <Form.Item
                                label="Tên phụ huynh"
                                validateStatus={
                                    touched.name && errors.name ? "error" : ""
                                }
                                help={touched.name && errors.name}
                            >
                                <Input
                                    name="name"
                                    value={values.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Nhập tên phụ huynh"
                                />
                            </Form.Item>
                            <Form.Item
                                label="Email"
                                validateStatus={
                                    touched.email && errors.email ? "error" : ""
                                }
                                help={touched.email && errors.email}
                            >
                                <Input
                                    name="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Nhập email"
                                />
                            </Form.Item>
                            <Form.Item
                                label="Số điện thoại"
                                validateStatus={
                                    touched.phone && errors.phone ? "error" : ""
                                }
                                help={touched.phone && errors.phone}
                            >
                                <Input
                                    name="phone"
                                    value={values.phone}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Nhập số điện thoại"
                                />
                            </Form.Item>
                            <div style={{ textAlign: "right", marginTop: 24 }}>
                                <Space>
                                    <Button onClick={handleModalCancel}>
                                        Hủy
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={isSubmitting}
                                    >
                                        {editingParent
                                            ? "Cập nhật"
                                            : "Thêm mới"}
                                    </Button>
                                </Space>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </div>
    );
};

export default ParentManagement;
