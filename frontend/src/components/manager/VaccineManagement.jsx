import {
    DeleteOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    PlusOutlined,
    SearchOutlined,
    MinusCircleOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";
import axios from "axios";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";

const { TextArea } = Input;

const VaccineManagement = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedVaccine, setSelectedVaccine] = useState(null);
    const [vaccines, setVaccines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchForm] = Form.useForm();
    const [vaccineForm] = Form.useForm();
    const [filteredVaccines, setFilteredVaccines] = useState([]);
    const [errorModal, setErrorModal] = useState({
        visible: false,
        message: "",
    });
    const [detailModal, setDetailModal] = useState({
        visible: false,
        vaccine: null,
    });

    // Get auth token
    const getAuthToken = () => {
        return localStorage.getItem("token");
    };

    // API headers
    const getHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
    });

    // Fetch all vaccines
    const fetchVaccines = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/manager/vaccination", {
                headers: getHeaders(),
            });
            if (response.data.success) {
                setVaccines(response.data.data || []);
                setFilteredVaccines(response.data.data || []);
            } else {
                message.error(
                    response.data.error || "Không thể tải danh sách vaccine"
                );
            }
        } catch (error) {
            console.error("Error fetching vaccines:", error);
            message.error("Không thể tải danh sách vaccine");
        } finally {
            setLoading(false);
        }
    };

    // Create vaccine
    const createVaccine = async (data) => {
        try {
            const response = await axios.post(
                "/api/manager/vaccination",
                data,
                {
                    headers: getHeaders(),
                }
            );
            if (response.data.success) {
                message.success("Thêm vaccine thành công");
                fetchVaccines();
                return true;
            } else {
                message.error(response.data.error || "Không thể thêm vaccine");
                return false;
            }
        } catch (error) {
            console.error("Error creating vaccine:", error);
            message.error(
                error.response?.data?.error || "Không thể thêm vaccine"
            );
            return false;
        }
    };

    // Update vaccine
    const updateVaccine = async (id, data) => {
        try {
            const response = await axios.put(
                `/api/manager/vaccination/${id}`,
                data,
                {
                    headers: getHeaders(),
                }
            );
            if (response.data.success) {
                message.success("Cập nhật vaccine thành công");
                fetchVaccines();
                return true;
            } else {
                message.error(
                    response.data.error || "Không thể cập nhật vaccine"
                );
                return false;
            }
        } catch (error) {
            console.error("Error updating vaccine:", error);
            message.error(
                error.response?.data?.error || "Không thể cập nhật vaccine"
            );
            return false;
        }
    };

    // Delete vaccine
    const deleteVaccine = async (id) => {
        try {
            const response = await axios.delete(
                `/api/manager/vaccination/${id}`,
                {
                    headers: getHeaders(),
                }
            );
            if (response.data.success) {
                message.success("Xóa vaccine thành công");
                fetchVaccines();
                return true;
            } else {
                setErrorModal({
                    visible: true,
                    message: response.data.error || "Không thể xóa vaccine",
                });
                return false;
            }
        } catch (error) {
            console.error("Error deleting vaccine:", error);
            setErrorModal({
                visible: true,
                message: error.response?.data?.error || "Không thể xóa vaccine",
            });
            return false;
        }
    };

    // Load vaccines on component mount
    useEffect(() => {
        fetchVaccines();
    }, []);

    // Đảm bảo khi vaccines thay đổi (fetch lại), filteredVaccines cũng cập nhật
    useEffect(() => {
        setFilteredVaccines(vaccines);
    }, [vaccines]);

    const columns = [
        {
            title: "Tên vaccine",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Yêu cầu",
            dataIndex: "requirement",
            key: "requirement",
            render: (requirement) => (
                <Tag color={requirement === "REQUIRED" ? "red" : "blue"}>
                    {requirement === "REQUIRED" ? "Bắt buộc" : "Tùy chọn"}
                </Tag>
            ),
        },
        {
            title: "Nhà sản xuất",
            dataIndex: "manufacturer",
            key: "manufacturer",
        },
        {
            title: "Nguồn gốc",
            dataIndex: "origin",
            key: "origin",
        },
        {
            title: "Độ tuổi khuyến nghị",
            key: "recommendedAge",
            render: (record) => {
                if (record.minAge != null && record.maxAge != null) {
                    return `${record.minAge} - ${record.maxAge} tuổi`;
                } else if (record.minAge != null) {
                    return `Từ ${record.minAge} tuổi`;
                } else if (record.maxAge != null) {
                    return `Đến ${record.maxAge} tuổi`;
                } else {
                    return "Không có";
                }
            },
        },
        {
            title: "Tham khảo",
            dataIndex: "referenceUrl",
            key: "referenceUrl",
            render: (url) =>
                url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        Link
                    </a>
                ) : (
                    "Không có"
                ),
        },
        {
            title: "Số liều tối đa",
            dataIndex: "maxDoseCount",
            key: "maxDoseCount",
            align: "center",
            render: (val) => val || "-",
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() =>
                            setDetailModal({ visible: true, vaccine: record })
                        }
                        type="primary"
                        shape="round"
                        size="small"
                        style={{ fontWeight: 500 }}
                    >
                        Xem chi tiết
                    </Button>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    ></Button>
                    <Popconfirm
                        title="Xóa vaccine"
                        description={`Bạn có chắc chắn muốn xóa vaccine ${record.name}?`}
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okType="danger"
                    >
                        <Button danger icon={<DeleteOutlined />}></Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleEdit = (record) => {
        setSelectedVaccine(record);
        vaccineForm.setFieldsValue({
            ...record,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        await deleteVaccine(id);
    };

    const handleSearch = (values) => {
        const { name, requirement } = values;
        let filtered = vaccines;
        if (name) {
            filtered = filtered.filter((v) =>
                v.name?.trim().toLowerCase().includes(name.trim().toLowerCase())
            );
        }
        if (requirement) {
            filtered = filtered.filter((v) => v.requirement === requirement);
        }
        setFilteredVaccines(filtered);
    };

    // Xóa bộ lọc
    const handleResetFilters = () => {
        searchForm.resetFields();
        setFilteredVaccines(vaccines);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        vaccineForm.resetFields();
        setSelectedVaccine(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Quản lý vaccine</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalVisible(true)}
                >
                    Thêm vaccine
                </Button>
            </div>

            <Card>
                <Form
                    form={searchForm}
                    onFinish={handleSearch}
                    layout="vertical"
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={8}>
                            <Form.Item name="name" label="Tên vaccine">
                                <Input placeholder="Nhập tên vaccine" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="requirement" label="Yêu cầu">
                                <Select placeholder="Chọn yêu cầu">
                                    <Select.Option value="REQUIRED">
                                        Bắt buộc
                                    </Select.Option>
                                    <Select.Option value="OPTIONAL">
                                        Tùy chọn
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} className="text-right">
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    htmlType="submit"
                                >
                                    Tìm kiếm
                                </Button>
                                <Button onClick={handleResetFilters}>
                                    Xóa bộ lọc
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card>
                <Table
                    dataSource={filteredVaccines}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 5,
                        showQuickJumper: true,
                    }}
                />
            </Card>

            <Modal
                title={selectedVaccine ? "Sửa vaccine" : "Thêm vaccine"}
                open={isModalVisible}
                onCancel={handleModalCancel}
                width={600}
                footer={null}
            >
                <Formik
                    initialValues={
                        selectedVaccine
                            ? {
                                  name: selectedVaccine.name,
                                  requirement: selectedVaccine.requirement,
                                  manufacturer:
                                      selectedVaccine.manufacturer || "",
                                  origin: selectedVaccine.origin || "",
                                  referenceUrl:
                                      selectedVaccine.referenceUrl || "",
                                  description:
                                      selectedVaccine.description || "",
                                  sideEffects:
                                      selectedVaccine.sideEffects || "",
                                  contraindications:
                                      selectedVaccine.contraindications || "",
                                  minAge:
                                      selectedVaccine.minAge !== undefined &&
                                      selectedVaccine.minAge !== null
                                          ? selectedVaccine.minAge
                                          : "",
                                  maxAge:
                                      selectedVaccine.maxAge !== undefined &&
                                      selectedVaccine.maxAge !== null
                                          ? selectedVaccine.maxAge
                                          : "",
                                  maxDoseCount:
                                      selectedVaccine.maxDoseCount || 1,
                              }
                            : {
                                  name: "",
                                  requirement: "",
                                  manufacturer: "",
                                  origin: "",
                                  referenceUrl: "",
                                  description: "",
                                  sideEffects: "",
                                  contraindications: "",
                                  minAge: "",
                                  maxAge: "",
                                  maxDoseCount: 1,
                              }
                    }
                    enableReinitialize
                    validationSchema={Yup.object({
                        name: Yup.string().required(
                            "Vui lòng nhập tên vaccine"
                        ),
                        requirement: Yup.string().required(
                            "Vui lòng chọn yêu cầu"
                        ),
                        manufacturer: Yup.string().required(
                            "Vui lòng nhập nhà sản xuất"
                        ),
                        origin: Yup.string().required(
                            "Vui lòng nhập nguồn gốc"
                        ),
                        minAge: Yup.number()
                            .typeError("Vui lòng nhập tuổi tối thiểu")
                            .integer("Tuổi tối thiểu phải là số nguyên")
                            .min(0, "Tuổi tối thiểu không được âm")
                            .nullable(true)
                            .transform((value, originalValue) =>
                                originalValue === "" ? null : value
                            ),
                        maxAge: Yup.number()
                            .typeError("Vui lòng nhập tuổi tối đa")
                            .integer("Tuổi tối đa phải là số nguyên")
                            .min(0, "Tuổi tối đa không được âm")
                            .nullable(true)
                            .transform((value, originalValue) =>
                                originalValue === "" ? null : value
                            )
                            .test(
                                "max-greater-than-min",
                                "Tuổi tối đa phải lớn hơn hoặc bằng tuổi tối thiểu",
                                function (value) {
                                    const { minAge } = this.parent;
                                    if (value != null && minAge != null) {
                                        return value >= minAge;
                                    }
                                    return true;
                                }
                            ),
                        maxDoseCount: Yup.number()
                            .typeError("Vui lòng nhập số liều tối đa")
                            .integer("Số liều tối đa phải là số nguyên")
                            .min(1, "Số liều tối đa phải lớn hơn 0")
                            .required("Vui lòng nhập số liều tối đa"),
                    })}
                    onSubmit={async (values, { setSubmitting }) => {
                        const data = {
                            name: values.name,
                            requirement: values.requirement,
                            manufacturer: values.manufacturer,
                            origin: values.origin,
                            referenceUrl: values.referenceUrl || undefined,
                            description: values.description || undefined,
                            sideEffects: values.sideEffects || undefined,
                            contraindications:
                                values.contraindications || undefined,
                            minAge:
                                values.minAge !== ""
                                    ? Number(values.minAge)
                                    : undefined,
                            maxAge:
                                values.maxAge !== ""
                                    ? Number(values.maxAge)
                                    : undefined,
                            maxDoseCount: values.maxDoseCount,
                        };
                        let success = false;
                        if (selectedVaccine) {
                            success = await updateVaccine(
                                selectedVaccine.id,
                                data
                            );
                        } else {
                            success = await createVaccine(data);
                        }
                        setSubmitting(false);
                        if (success) {
                            setIsModalVisible(false);
                            vaccineForm.resetFields &&
                                vaccineForm.resetFields();
                            setSelectedVaccine(null);
                        }
                    }}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        setFieldValue,
                        isSubmitting,
                    }) => {
                        // State cho doseSchedules
                        const [doseSchedules, setDoseSchedules] = useState(
                            selectedVaccine && selectedVaccine.doseSchedules
                                ? selectedVaccine.doseSchedules
                                : [
                                      {
                                          doseOrder: 1,
                                          minInterval: 0,
                                          recommendedInterval: 0,
                                          description: "",
                                      },
                                  ]
                        );

                        // Thêm mũi tiêm mới
                        const addDose = () => {
                            const maxDoses = Number(values.maxDoseCount) || 1;
                            if (doseSchedules.length >= maxDoses) {
                                message.warning(
                                    `Không thể thêm mũi tiêm thứ ${
                                        doseSchedules.length + 1
                                    }. Số liều tối đa là ${maxDoses} mũi.`
                                );
                                return;
                            }
                            setDoseSchedules((prev) => [
                                ...prev,
                                {
                                    doseOrder: prev.length + 1,
                                    minInterval: 0,
                                    recommendedInterval: 0,
                                    description: "",
                                },
                            ]);
                        };
                        // Xóa mũi tiêm
                        const removeDose = (idx) => {
                            const maxDoses = Number(values.maxDoseCount) || 1;
                            if (
                                doseSchedules.length <= maxDoses &&
                                doseSchedules.length > 1
                            ) {
                                message.warning(
                                    `Không thể xóa mũi tiêm này. Cần đúng ${maxDoses} mũi tiêm theo số liều tối đa.`
                                );
                                return;
                            }
                            setDoseSchedules((prev) =>
                                prev
                                    .filter((_, i) => i !== idx)
                                    .map((item, i) => ({
                                        ...item,
                                        doseOrder: i + 1,
                                    }))
                            );
                        };
                        // Cập nhật trường của mũi tiêm
                        const updateDose = (idx, field, value) => {
                            setDoseSchedules((prev) =>
                                prev.map((item, i) =>
                                    i === idx
                                        ? {
                                              ...item,
                                              [field]: field.includes(
                                                  "Interval"
                                              )
                                                  ? Number(value)
                                                  : value,
                                          }
                                        : item
                                )
                            );
                        };

                        // Cập nhật khi maxDoseCount thay đổi
                        useEffect(() => {
                            const maxDoses = Number(values.maxDoseCount) || 1;
                            setDoseSchedules((prev) => {
                                // Nếu hiện tại ít hơn maxDoses, thêm mũi
                                if (prev.length < maxDoses) {
                                    const newSchedules = [...prev];
                                    for (
                                        let i = prev.length;
                                        i < maxDoses;
                                        i++
                                    ) {
                                        newSchedules.push({
                                            doseOrder: i + 1,
                                            minInterval: 0,
                                            recommendedInterval: 0,
                                            description: "",
                                        });
                                    }
                                    return newSchedules;
                                }
                                // Nếu hiện tại nhiều hơn maxDoses, cắt bớt
                                else if (prev.length > maxDoses) {
                                    return prev
                                        .slice(0, maxDoses)
                                        .map((item, i) => ({
                                            ...item,
                                            doseOrder: i + 1,
                                        }));
                                }
                                return prev;
                            });
                        }, [values.maxDoseCount]);

                        // Validate trước khi submit
                        const customHandleSubmit = (e) => {
                            e.preventDefault && e.preventDefault();

                            const maxDoses = Number(values.maxDoseCount) || 1;
                            if (doseSchedules.length !== maxDoses) {
                                message.error(
                                    `Số mũi tiêm trong phác đồ (${doseSchedules.length}) phải bằng số liều tối đa (${maxDoses})`
                                );
                                return;
                            }

                            // Validate các trường bắt buộc trong doseSchedules
                            const hasError = doseSchedules.some((ds) => {
                                if (
                                    ds.doseOrder > 1 &&
                                    (!ds.minInterval || ds.minInterval < 0)
                                ) {
                                    message.error(
                                        `Mũi ${ds.doseOrder}: Khoảng cách tối thiểu không được để trống hoặc âm`
                                    );
                                    return true;
                                }
                                if (
                                    ds.doseOrder > 1 &&
                                    (!ds.recommendedInterval ||
                                        ds.recommendedInterval < ds.minInterval)
                                ) {
                                    message.error(
                                        `Mũi ${ds.doseOrder}: Khoảng cách khuyến nghị phải lớn hơn hoặc bằng khoảng cách tối thiểu`
                                    );
                                    return true;
                                }
                                return false;
                            });

                            if (hasError) return;

                            // Thêm doseSchedules vào data trước khi submit
                            const formData = {
                                ...values,
                                doseSchedules: doseSchedules,
                            };

                            handleSubmit(formData);
                        };

                        useEffect(() => {
                            // Nếu edit vaccine, load lại doseSchedules
                            if (
                                selectedVaccine &&
                                selectedVaccine.doseSchedules
                            ) {
                                setDoseSchedules(selectedVaccine.doseSchedules);
                            }
                        }, [selectedVaccine]);

                        return (
                            <Form
                                layout="vertical"
                                onFinish={customHandleSubmit}
                            >
                                <Form.Item
                                    label="Tên vaccine"
                                    help={
                                        touched.name && errors.name
                                            ? errors.name
                                            : undefined
                                    }
                                    validateStatus={
                                        touched.name && errors.name
                                            ? "error"
                                            : undefined
                                    }
                                    required
                                >
                                    <Input
                                        name="name"
                                        value={values.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="Yêu cầu"
                                    help={
                                        touched.requirement &&
                                        errors.requirement
                                            ? errors.requirement
                                            : undefined
                                    }
                                    validateStatus={
                                        touched.requirement &&
                                        errors.requirement
                                            ? "error"
                                            : undefined
                                    }
                                    required
                                >
                                    <Select
                                        value={values.requirement}
                                        onChange={(val) =>
                                            setFieldValue("requirement", val)
                                        }
                                        onBlur={handleBlur}
                                        placeholder="Chọn yêu cầu"
                                    >
                                        <Select.Option value="REQUIRED">
                                            Bắt buộc
                                        </Select.Option>
                                        <Select.Option value="OPTIONAL">
                                            Tùy chọn
                                        </Select.Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    label="Nhà sản xuất"
                                    help={
                                        touched.manufacturer &&
                                        errors.manufacturer
                                            ? errors.manufacturer
                                            : undefined
                                    }
                                    validateStatus={
                                        touched.manufacturer &&
                                        errors.manufacturer
                                            ? "error"
                                            : undefined
                                    }
                                    required
                                >
                                    <Input
                                        name="manufacturer"
                                        value={values.manufacturer}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="Nguồn gốc"
                                    help={
                                        touched.origin && errors.origin
                                            ? errors.origin
                                            : undefined
                                    }
                                    validateStatus={
                                        touched.origin && errors.origin
                                            ? "error"
                                            : undefined
                                    }
                                    required
                                >
                                    <Input
                                        name="origin"
                                        value={values.origin}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Form.Item>
                                <Form.Item label="Đường dẫn tham khảo">
                                    <Input
                                        name="referenceUrl"
                                        value={values.referenceUrl}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Nhập link tham khảo (nếu có)"
                                    />
                                </Form.Item>
                                <Form.Item label="Mô tả">
                                    <TextArea
                                        name="description"
                                        value={values.description}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        rows={2}
                                        placeholder="Nhập mô tả (nếu có)"
                                    />
                                </Form.Item>
                                <Form.Item label="Tác dụng phụ">
                                    <TextArea
                                        name="sideEffects"
                                        value={values.sideEffects}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        rows={2}
                                        placeholder="Nhập tác dụng phụ (nếu có)"
                                    />
                                </Form.Item>
                                <Form.Item label="Chống chỉ định">
                                    <TextArea
                                        name="contraindications"
                                        value={values.contraindications}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        rows={2}
                                        placeholder="Nhập chống chỉ định (nếu có)"
                                    />
                                </Form.Item>
                                <Form.Item label="Độ tuổi khuyến nghị">
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 23,
                                        }}
                                    >
                                        <Input
                                            style={{ width: "45%" }}
                                            name="minAge"
                                            type="number"
                                            min={0}
                                            value={values.minAge}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Tuổi tối thiểu"
                                        />
                                        <span
                                            style={{
                                                fontSize: 18,
                                                userSelect: "none",
                                            }}
                                        >
                                            -
                                        </span>
                                        <Input
                                            style={{ width: "45%" }}
                                            name="maxAge"
                                            type="number"
                                            min={0}
                                            value={values.maxAge}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Tuổi tối đa"
                                        />
                                    </div>
                                    {touched.minAge && errors.minAge && (
                                        <div
                                            style={{
                                                color: "red",
                                                fontSize: 12,
                                            }}
                                        >
                                            {errors.minAge}
                                        </div>
                                    )}
                                    {touched.maxAge && errors.maxAge && (
                                        <div
                                            style={{
                                                color: "red",
                                                fontSize: 12,
                                            }}
                                        >
                                            {errors.maxAge}
                                        </div>
                                    )}
                                </Form.Item>
                                <Form.Item
                                    label="Số liều tối đa"
                                    help={
                                        touched.maxDoseCount &&
                                        errors.maxDoseCount
                                            ? errors.maxDoseCount
                                            : undefined
                                    }
                                    validateStatus={
                                        touched.maxDoseCount &&
                                        errors.maxDoseCount
                                            ? "error"
                                            : undefined
                                    }
                                    required
                                >
                                    <Input
                                        name="maxDoseCount"
                                        type="number"
                                        min={1}
                                        value={values.maxDoseCount}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Nhập số liều tối đa cho vaccine"
                                    />
                                </Form.Item>
                                <Form.Item label="Phác đồ mũi tiêm">
                                    <div
                                        style={{
                                            background: "#f8f9fa",
                                            padding: "16px",
                                            borderRadius: "8px",
                                            border: "1px solid #e9ecef",
                                            marginBottom: "16px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                marginBottom: "12px",
                                                color: "#6c757d",
                                                fontSize: "14px",
                                            }}
                                        >
                                            <strong>Hướng dẫn:</strong> Thiết
                                            lập lịch tiêm vaccine theo từng mũi.
                                            Khoảng cách tính bằng số ngày giữa
                                            các mũi tiêm.
                                        </div>

                                        {/* Header bảng */}
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns:
                                                    "60px 1fr 1fr 1fr 50px",
                                                gap: "8px",
                                                marginBottom: "8px",
                                                fontWeight: "bold",
                                                fontSize: "13px",
                                                color: "#495057",
                                            }}
                                        >
                                            <div>Mũi số</div>
                                            <div>Khoảng cách tối thiểu</div>
                                            <div>Khoảng cách khuyến nghị</div>
                                            <div>Ghi chú</div>
                                            <div>Thao tác</div>
                                        </div>

                                        {doseSchedules.map((ds, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "60px 1fr 1fr 1fr 50px",
                                                    gap: "8px",
                                                    marginBottom: "8px",
                                                    alignItems: "start",
                                                    padding: "8px",
                                                    background: "white",
                                                    borderRadius: "4px",
                                                    border: "1px solid #dee2e6",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        background: "#e3f2fd",
                                                        borderRadius: "20px",
                                                        height: "32px",
                                                        fontWeight: "bold",
                                                        color: "#1976d2",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    Mũi {ds.doseOrder}
                                                </div>

                                                <div style={{ minWidth: 0 }}>
                                                    <Input
                                                        size="small"
                                                        min={0}
                                                        type="number"
                                                        value={ds.minInterval}
                                                        onChange={(e) =>
                                                            updateDose(
                                                                idx,
                                                                "minInterval",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="0"
                                                        suffix="ngày"
                                                        style={{
                                                            textAlign: "center",
                                                            width: "100%",
                                                        }}
                                                    />
                                                    {idx > 0 && (
                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    "10px",
                                                                color: "#6c757d",
                                                                marginTop:
                                                                    "2px",
                                                                textAlign:
                                                                    "center",
                                                            }}
                                                        >
                                                            Tối thiểu sau mũi{" "}
                                                            {idx}
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ minWidth: 0 }}>
                                                    <Input
                                                        size="small"
                                                        min={0}
                                                        type="number"
                                                        value={
                                                            ds.recommendedInterval
                                                        }
                                                        onChange={(e) =>
                                                            updateDose(
                                                                idx,
                                                                "recommendedInterval",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="0"
                                                        suffix="ngày"
                                                        style={{
                                                            textAlign: "center",
                                                            width: "100%",
                                                        }}
                                                    />
                                                    {idx > 0 && (
                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    "10px",
                                                                color: "#6c757d",
                                                                marginTop:
                                                                    "2px",
                                                                textAlign:
                                                                    "center",
                                                            }}
                                                        >
                                                            Khuyến nghị sau mũi{" "}
                                                            {idx}
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ minWidth: 0 }}>
                                                    <Input
                                                        size="small"
                                                        value={ds.description}
                                                        onChange={(e) =>
                                                            updateDose(
                                                                idx,
                                                                "description",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder={`Ghi chú mũi ${ds.doseOrder}`}
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                    />
                                                </div>

                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "center",
                                                    }}
                                                >
                                                    {doseSchedules.length >
                                                        1 && (
                                                        <Button
                                                            icon={
                                                                <MinusCircleOutlined />
                                                            }
                                                            danger
                                                            size="small"
                                                            onClick={() =>
                                                                removeDose(idx)
                                                            }
                                                            title="Xóa mũi tiêm này"
                                                            style={{
                                                                minWidth:
                                                                    "32px",
                                                                width: "32px",
                                                                height: "32px",
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {doseSchedules.length <
                                            (Number(values.maxDoseCount) ||
                                                1) && (
                                            <Button
                                                type="dashed"
                                                onClick={addDose}
                                                style={{
                                                    width: "100%",
                                                    marginTop: "8px",
                                                    height: "40px",
                                                    borderStyle: "dashed",
                                                    borderColor: "#52c41a",
                                                }}
                                                icon={<PlusOutlined />}
                                            >
                                                Thêm mũi tiêm thứ{" "}
                                                {doseSchedules.length + 1}
                                            </Button>
                                        )}

                                        {/* Thêm thông báo validation vào đây */}
                                        <div
                                            style={{
                                                marginTop: "8px",
                                                padding: "8px",
                                                background:
                                                    doseSchedules.length ===
                                                    (Number(
                                                        values.maxDoseCount
                                                    ) || 1)
                                                        ? "#f6ffed"
                                                        : "#fff2e8",
                                                borderRadius: "4px",
                                                border: `1px solid ${
                                                    doseSchedules.length ===
                                                    (Number(
                                                        values.maxDoseCount
                                                    ) || 1)
                                                        ? "#b7eb8f"
                                                        : "#ffcc93"
                                                }`,
                                                fontSize: "12px",
                                                color:
                                                    doseSchedules.length ===
                                                    (Number(
                                                        values.maxDoseCount
                                                    ) || 1)
                                                        ? "#52c41a"
                                                        : "#fa8c16",
                                            }}
                                        >
                                            <strong>Trạng thái:</strong> Đã nhập{" "}
                                            {doseSchedules.length}/
                                            {Number(values.maxDoseCount) || 1}{" "}
                                            mũi tiêm
                                            {doseSchedules.length ===
                                            (Number(values.maxDoseCount) || 1)
                                                ? " ✅ Hoàn tất"
                                                : ` ⚠️ Cần thêm ${
                                                      (Number(
                                                          values.maxDoseCount
                                                      ) || 1) -
                                                      doseSchedules.length
                                                  } mũi`}
                                        </div>

                                        {/* Ví dụ minh họa */}
                                        <div
                                            style={{
                                                marginTop: "16px",
                                                padding: "12px",
                                                background: "#fff3cd",
                                                borderRadius: "6px",
                                                border: "1px solid #ffeaa7",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontWeight: "bold",
                                                    marginBottom: "8px",
                                                    color: "#856404",
                                                }}
                                            >
                                                💡 Ví dụ: Vaccine Hepatitis B
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "13px",
                                                    color: "#856404",
                                                }}
                                            >
                                                • <strong>Mũi 1:</strong> Tiêm
                                                ngay khi sinh (0 ngày)
                                                <br />• <strong>
                                                    Mũi 2:
                                                </strong>{" "}
                                                Tối thiểu 28 ngày, khuyến nghị
                                                30 ngày sau mũi 1<br />•{" "}
                                                <strong>Mũi 3:</strong> Tối
                                                thiểu 60 ngày, khuyến nghị 180
                                                ngày sau mũi 2
                                            </div>
                                        </div>
                                    </div>
                                </Form.Item>
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={isSubmitting}
                                        onClick={customHandleSubmit}
                                    >
                                        {selectedVaccine ? "Cập nhật" : "Thêm"}
                                    </Button>
                                    <Button
                                        style={{ marginLeft: 8 }}
                                        onClick={handleModalCancel}
                                    >
                                        Hủy
                                    </Button>
                                </Form.Item>
                            </Form>
                        );
                    }}
                </Formik>
            </Modal>

            {/* Modal xem chi tiết vaccine */}
            <Modal
                open={detailModal.visible}
                onCancel={() =>
                    setDetailModal({ visible: false, vaccine: null })
                }
                footer={null}
                width={700}
                title={null}
            >
                {detailModal.vaccine && (
                    <div>
                        <div style={{ marginBottom: 12 }}>
                            <Typography.Text
                                type="secondary"
                                style={{ fontSize: 16 }}
                            >
                                Chi tiết vaccine
                            </Typography.Text>
                            <Typography.Title level={3} style={{ margin: 0 }}>
                                {detailModal.vaccine.name}
                            </Typography.Title>
                            <Divider style={{ margin: "12px 0 0 0" }} />
                        </div>
                        <Divider orientation="left" style={{ marginTop: 16 }}>
                            Thông tin cơ bản
                        </Divider>
                        <Descriptions column={2} size="small" bordered>
                            <Descriptions.Item label="Yêu cầu">
                                <Tag
                                    color={
                                        detailModal.vaccine.requirement ===
                                        "REQUIRED"
                                            ? "red"
                                            : "blue"
                                    }
                                >
                                    {detailModal.vaccine.requirement ===
                                    "REQUIRED"
                                        ? "Bắt buộc"
                                        : "Tùy chọn"}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Nhà sản xuất">
                                {detailModal.vaccine.manufacturer}
                            </Descriptions.Item>
                            <Descriptions.Item label="Nguồn gốc">
                                {detailModal.vaccine.origin}
                            </Descriptions.Item>
                            <Descriptions.Item label="Độ tuổi khuyến nghị">
                                {detailModal.vaccine.minAge != null &&
                                detailModal.vaccine.maxAge != null
                                    ? `${detailModal.vaccine.minAge} - ${detailModal.vaccine.maxAge} tuổi`
                                    : detailModal.vaccine.minAge != null
                                    ? `Từ ${detailModal.vaccine.minAge} tuổi`
                                    : detailModal.vaccine.maxAge != null
                                    ? `Đến ${detailModal.vaccine.maxAge} tuổi`
                                    : "Không có"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tham khảo" span={2}>
                                {detailModal.vaccine.referenceUrl ? (
                                    <a
                                        href={detailModal.vaccine.referenceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {detailModal.vaccine.referenceUrl}
                                    </a>
                                ) : (
                                    "Không có"
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số liều tối đa">
                                {detailModal.vaccine.maxDoseCount || "-"}
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider orientation="left" style={{ marginTop: 16 }}>
                            Tác dụng phụ
                        </Divider>
                        <Typography.Paragraph
                            style={{ whiteSpace: "pre-line" }}
                        >
                            {detailModal.vaccine.sideEffects || "Không có"}
                        </Typography.Paragraph>
                        <Divider orientation="left" style={{ marginTop: 16 }}>
                            Chống chỉ định
                        </Divider>
                        <Typography.Paragraph
                            style={{ whiteSpace: "pre-line" }}
                        >
                            {detailModal.vaccine.contraindications ||
                                "Không có"}
                        </Typography.Paragraph>
                        <Divider orientation="left" style={{ marginTop: 16 }}>
                            Mô tả
                        </Divider>
                        <Typography.Paragraph
                            style={{ whiteSpace: "pre-line" }}
                        >
                            {detailModal.vaccine.description || "Không có"}
                        </Typography.Paragraph>
                        <Divider orientation="left" style={{ marginTop: 16 }}>
                            Phác đồ mũi tiêm
                        </Divider>
                        {Array.isArray(detailModal.vaccine.doseSchedules) &&
                        detailModal.vaccine.doseSchedules.length > 0 ? (
                            <table
                                style={{
                                    width: "100%",
                                    marginBottom: 16,
                                    borderCollapse: "collapse",
                                    background: "#f6fcfa",
                                    borderRadius: 6,
                                }}
                            >
                                <thead>
                                    <tr style={{ background: "#e6f7f1" }}>
                                        <th
                                            style={{
                                                padding: 6,
                                                border: "1px solid #e0e0e0",
                                            }}
                                        >
                                            Mũi số
                                        </th>
                                        <th
                                            style={{
                                                padding: 6,
                                                border: "1px solid #e0e0e0",
                                            }}
                                        >
                                            Khoảng cách tối thiểu (ngày)
                                        </th>
                                        <th
                                            style={{
                                                padding: 6,
                                                border: "1px solid #e0e0e0",
                                            }}
                                        >
                                            Khoảng cách khuyến nghị (ngày)
                                        </th>
                                        <th
                                            style={{
                                                padding: 6,
                                                border: "1px solid #e0e0e0",
                                            }}
                                        >
                                            Ghi chú
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailModal.vaccine.doseSchedules.map(
                                        (ds, idx) => (
                                            <tr key={idx}>
                                                <td
                                                    style={{
                                                        padding: 6,
                                                        border: "1px solid #e0e0e0",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {ds.doseOrder}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: 6,
                                                        border: "1px solid #e0e0e0",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {ds.minInterval}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: 6,
                                                        border: "1px solid #e0e0e0",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {ds.recommendedInterval}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: 6,
                                                        border: "1px solid #e0e0e0",
                                                    }}
                                                >
                                                    {ds.description || "-"}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ color: "#888", marginBottom: 16 }}>
                                Không có phác đồ mũi tiêm.
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {errorModal.visible && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                    onClick={() =>
                        setErrorModal({ visible: false, message: "" })
                    }
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "24px",
                            borderRadius: "8px",
                            maxWidth: "500px",
                            width: "90%",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3
                            style={{
                                color: "#ff4d4f",
                                marginBottom: "16px",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <ExclamationCircleOutlined
                                style={{ marginRight: 8 }}
                            />
                            Lỗi xóa vaccine
                        </h3>
                        <p style={{ marginBottom: "16px" }}>
                            {errorModal.message}
                        </p>
                        <Button
                            type="primary"
                            danger
                            onClick={() =>
                                setErrorModal({ visible: false, message: "" })
                            }
                        >
                            Đóng
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VaccineManagement;
