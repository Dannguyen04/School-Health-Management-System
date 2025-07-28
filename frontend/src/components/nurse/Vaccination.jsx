import { CheckOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { nurseAPI } from "../../utils/api";

const { TextArea } = Input;
const { Title } = Typography;

const Vaccination = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [students, setStudents] = useState([]);
  const [displayedStudents, setDisplayedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vaccinationForm] = Form.useForm();
  const [reportForm] = Form.useForm(); // Thêm form riêng cho báo cáo
  const [searchForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [vaccinationReports, setVaccinationReports] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [batchNumberDisabled, setBatchNumberDisabled] = useState(false);
  const [campaignBatchNumber, setCampaignBatchNumber] = useState("");
  const [currentDoseLabel, setCurrentDoseLabel] = useState("");
  const [isViewReportModalVisible, setIsViewReportModalVisible] =
    useState(false);
  const [viewedVaccinationRecord, setViewedVaccinationRecord] = useState(null);
  const [studentVaccinationHistory, setStudentVaccinationHistory] = useState(
    []
  );

  // const getAuthToken = () => {
  //     return localStorage.getItem("token");
  // };

  // const getHeaders = () => ({
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${getAuthToken()}`,
  // });

  // Helper function to refresh all data for current campaign
  const refreshCampaignData = async () => {
    if (!selectedCampaign) return;

    try {
      await Promise.all([
        fetchStudentsForCampaign(selectedCampaign.id),
        fetchVaccinationReports(selectedCampaign.id),
      ]);

      // Cập nhật lại danh sách hiển thị nếu có bộ lọc
      const currentFilters = searchForm.getFieldsValue();
      if (
        Object.keys(currentFilters).some(
          (key) =>
            currentFilters[key] !== undefined &&
            currentFilters[key] !== null &&
            currentFilters[key] !== ""
        )
      ) {
        handleSearch(currentFilters);
      }
    } catch (error) {
      console.error("Error refreshing campaign data:", error);
    }
  };

  const getDoseLabel = (doseType) => {
    switch (doseType) {
      case "PRIMARY":
        return "Mũi cơ bản";
      case "BOOSTER":
        return "Mũi nhắc lại";
      case "CATCHUP":
        return "Mũi tiêm bù";
      case "ADDITIONAL":
        return "Mũi bổ sung";
      default:
        return "Mũi";
    }
  };

  // Custom validation function for reaction based on side effects
  const validateReaction = (_, value) => {
    const sideEffects = vaccinationForm.getFieldValue("sideEffects");

    // Nếu có tác dụng phụ nhưng chọn "Không có phản ứng"
    if (sideEffects && sideEffects.trim() !== "" && value === "NONE") {
      return Promise.reject(
        new Error('Nếu có tác dụng phụ thì không thể "Không có phản ứng"')
      );
    }

    // Nếu chọn phản ứng (khác NONE) nhưng không mô tả tác dụng phụ
    if (
      value &&
      value !== "NONE" &&
      (!sideEffects || sideEffects.trim() === "")
    ) {
      return Promise.reject(
        new Error("Vui lòng mô tả tác dụng phụ khi có phản ứng")
      );
    }

    return Promise.resolve();
  };

  // Custom validation function for side effects based on reaction
  const validateSideEffects = (_, value) => {
    const reaction = vaccinationForm.getFieldValue("reaction");

    // Nếu có mô tả tác dụng phụ nhưng chọn "Không có phản ứng"
    if (value && value.trim() !== "" && reaction === "NONE") {
      return Promise.reject(
        new Error('Nếu có tác dụng phụ thì không thể chọn "Không có phản ứng"')
      );
    }

    return Promise.resolve();
  };

  // Custom validation function for doseOrder
  const validateDoseOrder = (_, value) => {
    if (!value || value < 1) {
      return Promise.reject(new Error("Số mũi tiêm phải lớn hơn 0"));
    }

    // Kiểm tra doseType để áp dụng validation khác nhau
    const doseType = vaccinationForm.getFieldValue("doseType");

    if (!studentVaccinationHistory || studentVaccinationHistory.length === 0) {
      return Promise.resolve(); // Nếu chưa có lịch sử thì bỏ qua validation
    }
      return Promise.resolve(); // Nếu chưa có lịch sử thì bỏ qua validation
    }

    // Kiểm tra xem đã tiêm mũi này chưa (tránh tiêm trùng)
    const existingDose = studentVaccinationHistory.find(
      (record) => record.doseOrder === value
    );
    // Kiểm tra xem đã tiêm mũi này chưa (tránh tiêm trùng)
    const existingDose = studentVaccinationHistory.find(
      (record) => record.doseOrder === value
    );

    if (existingDose) {
      // Nếu đã tiêm mũi này rồi
      if (doseType === "CATCHUP" || doseType === "ADDITIONAL") {
        // Với CATCHUP/ADDITIONAL, cho phép tiêm lại (có thể là bổ sung)
        return Promise.resolve();
      } else {
        // Với PRIMARY/BOOSTER, không cho phép tiêm trùng
        return Promise.reject(
          new Error(
            `Học sinh đã tiêm mũi ${value} rồi (ngày ${new Date(
              existingDose.administeredDate
            ).toLocaleDateString(
              "vi-VN"
            )}). Không thể tiêm lại cùng một mũi với loại liều "${getDoseLabel(
              doseType
            )}".`
          )
        );
      }
    }
    if (existingDose) {
      // Nếu đã tiêm mũi này rồi
      if (doseType === "CATCHUP" || doseType === "ADDITIONAL") {
        // Với CATCHUP/ADDITIONAL, cho phép tiêm lại (có thể là bổ sung)
        return Promise.resolve();
      } else {
        // Với PRIMARY/BOOSTER, không cho phép tiêm trùng
        return Promise.reject(
          new Error(
            `Học sinh đã tiêm mũi ${value} rồi (ngày ${new Date(
              existingDose.administeredDate
            ).toLocaleDateString(
              "vi-VN"
            )}). Không thể tiêm lại cùng một mũi với loại liều "${getDoseLabel(
              doseType
            )}".`
          )
        );
      }
    }

    // Kiểm tra xem có tiêm ngược thứ tự không (ví dụ: muốn tiêm mũi 1 mà đã tiêm mũi 2, 3)
    const higherDoses = studentVaccinationHistory.filter(
      (record) => record.doseOrder > value
    );
    // Kiểm tra xem có tiêm ngược thứ tự không (ví dụ: muốn tiêm mũi 1 mà đã tiêm mũi 2, 3)
    const higherDoses = studentVaccinationHistory.filter(
      (record) => record.doseOrder > value
    );

    if (
      higherDoses.length > 0 &&
      doseType !== "CATCHUP" &&
      doseType !== "ADDITIONAL"
    ) {
      return Promise.reject(
        new Error(
          `Không thể tiêm mũi ${value} vì học sinh đã tiêm các mũi cao hơn: ${higherDoses
            .map((d) => d.doseOrder)
            .sort()
            .join(
              ", "
            )}. Nếu đây là tiêm bù, vui lòng chọn loại liều "Tiêm bù".`
        )
      );
    }
    if (
      higherDoses.length > 0 &&
      doseType !== "CATCHUP" &&
      doseType !== "ADDITIONAL"
    ) {
      return Promise.reject(
        new Error(
          `Không thể tiêm mũi ${value} vì học sinh đã tiêm các mũi cao hơn: ${higherDoses
            .map((d) => d.doseOrder)
            .sort()
            .join(
              ", "
            )}. Nếu đây là tiêm bù, vui lòng chọn loại liều "Tiêm bù".`
        )
      );
    }

    // Kiểm tra thứ tự mũi tiêm cho PRIMARY và BOOSTER
    if (value > 1 && doseType !== "CATCHUP" && doseType !== "ADDITIONAL") {
      const requiredPrevDose = studentVaccinationHistory.find(
        (record) => record.doseOrder === value - 1
      );
    // Kiểm tra thứ tự mũi tiêm cho PRIMARY và BOOSTER
    if (value > 1 && doseType !== "CATCHUP" && doseType !== "ADDITIONAL") {
      const requiredPrevDose = studentVaccinationHistory.find(
        (record) => record.doseOrder === value - 1
      );

      if (!requiredPrevDose) {
        return Promise.reject(
          new Error(
            `Phải tiêm mũi ${
              value - 1
            } trước khi tiêm mũi ${value}. Nếu học sinh đã tiêm mũi ${
              value - 1
            } ở nơi khác, vui lòng chọn loại liều "Tiêm bù" thay vì "${getDoseLabel(
              doseType
            )}".`
          )
        );
      }
    }
      if (!requiredPrevDose) {
        return Promise.reject(
          new Error(
            `Phải tiêm mũi ${
              value - 1
            } trước khi tiêm mũi ${value}. Nếu học sinh đã tiêm mũi ${
              value - 1
            } ở nơi khác, vui lòng chọn loại liều "Tiêm bù" thay vì "${getDoseLabel(
              doseType
            )}".`
          )
        );
      }
    }

    return Promise.resolve();
  };
    return Promise.resolve();
  };

  // Custom validation functions
  const validateBatchNumber = (_, value) => {
    if (!value || value.trim() === "") {
      return Promise.reject(new Error("Vui lòng nhập số lô vaccine"));
    }
  // Custom validation functions
  const validateBatchNumber = (_, value) => {
    if (!value || value.trim() === "") {
      return Promise.reject(new Error("Vui lòng nhập số lô vaccine"));
    }

    const trimmedValue = value.trim();
    const trimmedValue = value.trim();

    // Kiểm tra độ dài hợp lý (3-50 ký tự)
    if (trimmedValue.length < 3 || trimmedValue.length > 50) {
      return Promise.reject(new Error("Số lô phải có từ 3-50 ký tự"));
    }
    // Kiểm tra độ dài hợp lý (3-50 ký tự)
    if (trimmedValue.length < 3 || trimmedValue.length > 50) {
      return Promise.reject(new Error("Số lô phải có từ 3-50 ký tự"));
    }

    // Chỉ cho phép chữ cái, số, dấu gạch ngang và gạch dưới
    const batchPattern = /^[A-Z0-9\-_]+$/i;
    if (!batchPattern.test(trimmedValue)) {
      return Promise.reject(
        new Error(
          "Số lô chỉ được chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_)"
        )
      );
    }
    // Chỉ cho phép chữ cái, số, dấu gạch ngang và gạch dưới
    const batchPattern = /^[A-Z0-9\-_]+$/i;
    if (!batchPattern.test(trimmedValue)) {
      return Promise.reject(
        new Error(
          "Số lô chỉ được chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_)"
        )
      );
    }

    return Promise.resolve();
  };
    return Promise.resolve();
  };

  const validateAdministeredDate = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng chọn ngày tiêm"));
    }
  const validateAdministeredDate = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng chọn ngày tiêm"));
    }

    const selectedDate = value.toDate();
    const today = new Date();
    const campaignStart = selectedCampaign?.scheduledDate
      ? new Date(selectedCampaign.scheduledDate)
      : null;
    const campaignEnd = selectedCampaign?.deadline
      ? new Date(selectedCampaign.deadline)
      : null;
    const selectedDate = value.toDate();
    const today = new Date();
    const campaignStart = selectedCampaign?.scheduledDate
      ? new Date(selectedCampaign.scheduledDate)
      : null;
    const campaignEnd = selectedCampaign?.deadline
      ? new Date(selectedCampaign.deadline)
      : null;

    // Set time to start/end of day for accurate comparison
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );
    // Set time to start/end of day for accurate comparison
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );

    if (selectedDate < todayStart) {
      return Promise.reject(new Error("Không thể chọn ngày trong quá khứ"));
    }
    if (selectedDate < todayStart) {
      return Promise.reject(new Error("Không thể chọn ngày trong quá khứ"));
    }

    if (selectedDate > todayEnd) {
      return Promise.reject(new Error("Không thể chọn ngày trong tương lai"));
    }
    if (selectedDate > todayEnd) {
      return Promise.reject(new Error("Không thể chọn ngày trong tương lai"));
    }

    if (campaignStart && campaignEnd) {
      if (selectedDate < campaignStart || selectedDate > campaignEnd) {
        return Promise.reject(
          new Error("Ngày tiêm phải nằm trong thời gian chiến dịch")
        );
      }
    }
    if (campaignStart && campaignEnd) {
      if (selectedDate < campaignStart || selectedDate > campaignEnd) {
        return Promise.reject(
          new Error("Ngày tiêm phải nằm trong thời gian chiến dịch")
        );
      }
    }

    return Promise.resolve();
  };
    return Promise.resolve();
  };

  const validateDoseAmount = (_, value) => {
    if (!value || value <= 0) {
      return Promise.reject(new Error("Liều lượng phải lớn hơn 0"));
    }
  const validateDoseAmount = (_, value) => {
    if (!value || value <= 0) {
      return Promise.reject(new Error("Liều lượng phải lớn hơn 0"));
    }

    if (value > 2) {
      return Promise.reject(new Error("Liều lượng không được vượt quá 2ml"));
    }
    if (value > 2) {
      return Promise.reject(new Error("Liều lượng không được vượt quá 2ml"));
    }

    return Promise.resolve();
  };
    return Promise.resolve();
  };

  // Fetch active vaccination campaigns
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await nurseAPI.getVaccinationCampaigns();
      if (response.data.success) {
        setCampaigns(response.data.data || []);
      }
    } catch {
      message.error("Không thể tải danh sách chiến dịch tiêm chủng");
    } finally {
      setLoading(false);
    }
  };
  // Fetch active vaccination campaigns
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await nurseAPI.getVaccinationCampaigns();
      if (response.data.success) {
        setCampaigns(response.data.data || []);
      }
    } catch {
      message.error("Không thể tải danh sách chiến dịch tiêm chủng");
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for a specific campaign
  const fetchStudentsForCampaign = async (campaignId) => {
    try {
      setLoading(true);
      console.log("Fetching students for campaign:", campaignId); // Debug log
      const response = await nurseAPI.getStudentsForCampaign(campaignId);
      console.log("Full response:", response.data); // Debug log
      if (response.data.success) {
        // API trả về data.students thay vì data.data
        const students = response.data.data?.students || [];
        console.log("Students data:", students); // Debug log
        setStudents(students);
        setDisplayedStudents(students);
      }
    } catch (error) {
      console.error("Error fetching students:", error); // Debug log
      message.error("Không thể tải danh sách học sinh");
    } finally {
      setLoading(false);
    }
  };
  // Fetch students for a specific campaign
  const fetchStudentsForCampaign = async (campaignId) => {
    try {
      setLoading(true);
      console.log("Fetching students for campaign:", campaignId); // Debug log
      const response = await nurseAPI.getStudentsForCampaign(campaignId);
      console.log("Full response:", response.data); // Debug log
      if (response.data.success) {
        // API trả về data.students thay vì data.data
        const students = response.data.data?.students || [];
        console.log("Students data:", students); // Debug log
        setStudents(students);
        setDisplayedStudents(students);
      }
    } catch (error) {
      console.error("Error fetching students:", error); // Debug log
      message.error("Không thể tải danh sách học sinh");
    } finally {
      setLoading(false);
    }
  };

  // Fetch vaccination reports for a specific campaign
  const fetchVaccinationReports = async (campaignId) => {
    setReportLoading(true);
    try {
      const response = await nurseAPI.getVaccinationReport(campaignId);
      if (response.data.success) {
        console.log("Vaccination reports:", response.data.data);
  // Fetch vaccination reports for a specific campaign
  const fetchVaccinationReports = async (campaignId) => {
    setReportLoading(true);
    try {
      const response = await nurseAPI.getVaccinationReport(campaignId);
      if (response.data.success) {
        console.log("Vaccination reports:", response.data.data);

        // The backend returns { reports, vaccine } structure
        const reports = response.data.data?.reports || [];
        setVaccinationReports(reports);
        // The backend returns { reports, vaccine } structure
        const reports = response.data.data?.reports || [];
        setVaccinationReports(reports);

        // Lấy batchNumber đầu tiên có trong report (ưu tiên học sinh đã tiêm)
        const firstBatch = reports.find((r) => r.batchNumber);
        if (firstBatch && firstBatch.batchNumber) {
          setCampaignBatchNumber(firstBatch.batchNumber);
        } else {
          setCampaignBatchNumber("");
        }
      } else {
        setVaccinationReports([]);
        setCampaignBatchNumber("");
      }
    } catch {
      setVaccinationReports([]);
      setCampaignBatchNumber("");
    }
    setReportLoading(false);
  };
        // Lấy batchNumber đầu tiên có trong report (ưu tiên học sinh đã tiêm)
        const firstBatch = reports.find((r) => r.batchNumber);
        if (firstBatch && firstBatch.batchNumber) {
          setCampaignBatchNumber(firstBatch.batchNumber);
        } else {
          setCampaignBatchNumber("");
        }
      } else {
        setVaccinationReports([]);
        setCampaignBatchNumber("");
      }
    } catch {
      setVaccinationReports([]);
      setCampaignBatchNumber("");
    }
    setReportLoading(false);
  };

  // Perform vaccination
  const performVaccination = async (values) => {
    try {
      // Enhanced validation
      if (!values.administeredDate) {
        message.error("Vui lòng chọn ngày tiêm");
        return;
      }
  // Perform vaccination
  const performVaccination = async (values) => {
    try {
      // Enhanced validation
      if (!values.administeredDate) {
        message.error("Vui lòng chọn ngày tiêm");
        return;
      }

      if (!values.batchNumber?.trim()) {
        message.error("Vui lòng nhập số lô vaccine");
        return;
      }
      if (!values.batchNumber?.trim()) {
        message.error("Vui lòng nhập số lô vaccine");
        return;
      }

      // Tự động tính toán doseOrder dựa trên lịch sử tiêm chủng
      const nextDose = getNextRecommendedDose(
        selectedCampaign?.vaccine?.doseSchedules || [],
        studentVaccinationHistory
      );
      // Tự động tính toán doseOrder dựa trên lịch sử tiêm chủng
      const nextDose = getNextRecommendedDose(
        selectedCampaign?.vaccine?.doseSchedules || [],
        studentVaccinationHistory
      );

      if (!nextDose) {
        message.error(
          "Không thể xác định mũi tiêm tiếp theo. Vui lòng kiểm tra lại lịch sử tiêm chủng."
        );
        return;
      }
      if (!nextDose) {
        message.error(
          "Không thể xác định mũi tiêm tiếp theo. Vui lòng kiểm tra lại lịch sử tiêm chủng."
        );
        return;
      }

      // Show loading với cancel option
      const hideLoading = message.loading({
        content: "Đang thực hiện tiêm chủng...",
        duration: 0,
        key: "vaccination-loading",
      });
      // Show loading với cancel option
      const hideLoading = message.loading({
        content: "Đang thực hiện tiêm chủng...",
        duration: 0,
        key: "vaccination-loading",
      });

      const payload = {
        ...values,
        campaignId: selectedCampaign.id,
        studentId: selectedStudent.id,
        batchNumber: values.batchNumber.trim().toUpperCase(), // Chuẩn hóa batch number
        doseType: values.doseType,
        doseOrder: values.doseOrder,
        doseLabel: getDoseLabel(values.doseType),
        administeredDate: values.administeredDate
          ? values.administeredDate.format()
          : null,
      };

      console.log("Vaccination payload:", payload);
      console.log("Vaccination payload:", payload);

      const response = await nurseAPI.performVaccination(payload);
      const response = await nurseAPI.performVaccination(payload);

      hideLoading();
      hideLoading();

      if (response.data.success) {
        // Enhanced success message với chi tiết
        const successMsg = `Tiêm chủng thành công cho ${selectedStudent.fullName}!`;
        const nextDoseInfo = response.data.data?.nextDoseSuggestion
          ? ` Mũi tiếp theo: ${response.data.data.nextDoseSuggestion.doseOrder} (sau ${response.data.data.nextDoseSuggestion.minInterval} ngày)`
          : "";
      if (response.data.success) {
        // Enhanced success message với chi tiết
        const successMsg = `Tiêm chủng thành công cho ${selectedStudent.fullName}!`;
        const nextDoseInfo = response.data.data?.nextDoseSuggestion
          ? ` Mũi tiếp theo: ${response.data.data.nextDoseSuggestion.doseOrder} (sau ${response.data.data.nextDoseSuggestion.minInterval} ngày)`
          : "";

        message.success({
          content: successMsg + nextDoseInfo,
          duration: 8,
          key: "vaccination-success",
        });
        message.success({
          content: successMsg + nextDoseInfo,
          duration: 8,
          key: "vaccination-success",
        });

        setIsModalVisible(false);
        vaccinationForm.resetFields();
        setSelectedStudent(null);
        setStudentVaccinationHistory([]);
        setIsModalVisible(false);
        vaccinationForm.resetFields();
        setSelectedStudent(null);
        setStudentVaccinationHistory([]);

        // Lưu batchNumber và cập nhật dữ liệu
        const newBatchNumber =
          response.data.data?.batchNumber || values.batchNumber;
        if (newBatchNumber) {
          setCampaignBatchNumber(newBatchNumber.trim().toUpperCase());
        }
        // Lưu batchNumber và cập nhật dữ liệu
        const newBatchNumber =
          response.data.data?.batchNumber || values.batchNumber;
        if (newBatchNumber) {
          setCampaignBatchNumber(newBatchNumber.trim().toUpperCase());
        }

        await refreshCampaignData();
      }
    } catch (error) {
      // Enhanced error handling
      message.destroy("vaccination-loading"); // Đảm bảo loading được tắt
        await refreshCampaignData();
      }
    } catch (error) {
      // Enhanced error handling
      message.destroy("vaccination-loading"); // Đảm bảo loading được tắt

      const errorData = error.response?.data;
      let errorMessage = "Lỗi khi thực hiện tiêm chủng";
      const errorData = error.response?.data;
      let errorMessage = "Lỗi khi thực hiện tiêm chủng";

      // Specific error messages based on backend error codes
      if (errorData?.errorCode) {
        const errorMessages = {
          AGE_TOO_YOUNG: `Học sinh chưa đủ tuổi (hiện tại: ${errorData.details?.currentAge} tuổi, yêu cầu: ≥${errorData.details?.requiredAge} tuổi)`,
          AGE_TOO_OLD: `Học sinh đã quá tuổi (hiện tại: ${errorData.details?.currentAge} tuổi, yêu cầu: ≤${errorData.details?.maxAge} tuổi)`,
          DOSE_INTERVAL_TOO_SHORT: `Chưa đủ khoảng cách giữa các mũi tiêm (cần tối thiểu ${errorData.details?.requiredInterval} ngày)`,
          MAX_DOSE_EXCEEDED: `Học sinh đã tiêm đủ ${errorData.details?.maxDoses} mũi cho vaccine này`,
          INVALID_BATCH:
            "Số lô vaccine không hợp lệ hoặc không tồn tại trong hệ thống",
          BATCH_EXPIRED: `Lô vaccine đã hết hạn vào ${errorData.details?.expiryDate}`,
          DUPLICATE_VACCINATION: "Học sinh đã được tiêm trong chiến dịch này",
          NO_CONSENT: "Phụ huynh chưa đồng ý cho học sinh tiêm chủng",
          INVALID_DATE:
            "Ngày tiêm không hợp lệ (chỉ được tiêm trong ngày hôm nay)",
          VALIDATION_ERROR:
            "Dữ liệu nhập vào không hợp lệ, vui lòng kiểm tra lại",
        };
      // Specific error messages based on backend error codes
      if (errorData?.errorCode) {
        const errorMessages = {
          AGE_TOO_YOUNG: `Học sinh chưa đủ tuổi (hiện tại: ${errorData.details?.currentAge} tuổi, yêu cầu: ≥${errorData.details?.requiredAge} tuổi)`,
          AGE_TOO_OLD: `Học sinh đã quá tuổi (hiện tại: ${errorData.details?.currentAge} tuổi, yêu cầu: ≤${errorData.details?.maxAge} tuổi)`,
          DOSE_INTERVAL_TOO_SHORT: `Chưa đủ khoảng cách giữa các mũi tiêm (cần tối thiểu ${errorData.details?.requiredInterval} ngày)`,
          MAX_DOSE_EXCEEDED: `Học sinh đã tiêm đủ ${errorData.details?.maxDoses} mũi cho vaccine này`,
          INVALID_BATCH:
            "Số lô vaccine không hợp lệ hoặc không tồn tại trong hệ thống",
          BATCH_EXPIRED: `Lô vaccine đã hết hạn vào ${errorData.details?.expiryDate}`,
          DUPLICATE_VACCINATION: "Học sinh đã được tiêm trong chiến dịch này",
          NO_CONSENT: "Phụ huynh chưa đồng ý cho học sinh tiêm chủng",
          INVALID_DATE:
            "Ngày tiêm không hợp lệ (chỉ được tiêm trong ngày hôm nay)",
          VALIDATION_ERROR:
            "Dữ liệu nhập vào không hợp lệ, vui lòng kiểm tra lại",
        };

        errorMessage =
          errorMessages[errorData.errorCode] || errorData.error || errorMessage;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      }
        errorMessage =
          errorMessages[errorData.errorCode] || errorData.error || errorMessage;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      }

      message.error({
        content: errorMessage,
        duration: 10,
        key: "vaccination-error",
      });
      message.error({
        content: errorMessage,
        duration: 10,
        key: "vaccination-error",
      });

      console.error("Vaccination error:", error.response?.data || error);
    }
  };
      console.error("Vaccination error:", error.response?.data || error);
    }
  };

  // Thêm hàm chuyển đổi dữ liệu trước khi gửi lên backend
  const normalizeReportValues = (values) => {
    return {
      ...values,
      administeredDate: values.administeredDate
        ? values.administeredDate.format()
        : undefined,
      followUpRequired:
        values.followUpRequired === true || values.followUpRequired === "true",
      followUpDate: values.followUpDate
        ? values.followUpDate.format()
        : undefined,
    };
  };
  // Thêm hàm chuyển đổi dữ liệu trước khi gửi lên backend
  const normalizeReportValues = (values) => {
    return {
      ...values,
      administeredDate: values.administeredDate
        ? values.administeredDate.format()
        : undefined,
      followUpRequired:
        values.followUpRequired === true || values.followUpRequired === "true",
      followUpDate: values.followUpDate
        ? values.followUpDate.format()
        : undefined,
    };
  };

  // Report vaccination result
  const reportVaccinationResult = async (values) => {
    console.log("=== reportVaccinationResult called ===");
    console.log("Form values:", values);
    console.log("selectedStudent:", selectedStudent);
    console.log("selectedCampaign:", selectedCampaign);

    try {
      const normalized = normalizeReportValues(values);
      console.log("Normalized values:", normalized);

      // selectedStudent giờ là vaccinationRecord, cần lấy đúng ID
      const vaccinationRecordId = selectedStudent.id; // ID của vaccination record
      const studentId = selectedStudent.studentId; // ID của student

      console.log("IDs:", { vaccinationRecordId, studentId });

      const payload = {
        ...normalized,
        campaignId: selectedCampaign.id,
        studentId: studentId,
        vaccinationRecordId: vaccinationRecordId,
      };

      console.log("Gửi lên backend:", payload);

      // Gửi vaccination record ID thay vì student ID
      const response = await nurseAPI.reportVaccinationResult(
        vaccinationRecordId,
        normalized
      );

      console.log("Backend response:", response);

      if (response.data.success) {
        message.success("Đã báo cáo kết quả tiêm chủng");
        setIsReportModalVisible(false);
        setSelectedStudent(null);
        reportForm.resetFields();
        setCurrentDoseLabel("");

        // Cập nhật dữ liệu học sinh và báo cáo tiêm chủng
        await refreshCampaignData();
      } else {
        console.error("Backend returned error:", response.data);
        message.error(response.data.error || "Lỗi khi báo cáo kết quả");
      }
    } catch (error) {
      console.error("Error in reportVaccinationResult:", error);
      console.error("Error response:", error.response?.data);
      message.error(error.response?.data?.error || "Lỗi khi báo cáo kết quả");
    }
  };

  // Khi nurse chọn campaign, lấy batchNumber từ vaccinationReports (nếu có)
  const handleCampaignSelect = (campaign) => {
    setSelectedCampaign(campaign);
    fetchStudentsForCampaign(campaign.id);
    fetchVaccinationReports(campaign.id);
    setActiveTab("students");
    // Reset batchNumber khi chọn campaign mới
    setCampaignBatchNumber("");
  };

  // Helper function to get dose schedule display
  const getDoseScheduleDisplay = (doseSchedules = []) => {
    if (!doseSchedules || doseSchedules.length === 0) {
      return [];
    }

    return doseSchedules.map((dose) => {
      const studentDoseRecord = studentVaccinationHistory.find(
        (record) => record.doseOrder === dose.doseOrder
      );

      return {
        ...dose,
        isCompleted: !!studentDoseRecord,
        administeredDate: studentDoseRecord?.administeredDate,
        status: studentDoseRecord ? "completed" : "pending",
        isNextDose:
          !studentDoseRecord &&
          (dose.doseOrder === 1 ||
            studentVaccinationHistory.some(
              (record) => record.doseOrder === dose.doseOrder - 1
            )),
      };
    });
  };

  // Helper function to get next recommended dose
  const getNextRecommendedDose = (doseSchedules = [], studentHistory = []) => {
    if (!doseSchedules || doseSchedules.length === 0) {
      return null;
    }

    // Tìm mũi đầu tiên chưa được tiêm
    for (let i = 0; i < doseSchedules.length; i++) {
      const dose = doseSchedules[i];
      const isCompleted = studentHistory.some(
        (record) => record.doseOrder === dose.doseOrder
      );

      if (!isCompleted) {
        return {
          ...dose,
          isFirstDose: dose.doseOrder === 1,
          canAdminister:
            dose.doseOrder === 1 ||
            (dose.doseOrder > 1 &&
              studentHistory.some(
                (record) => record.doseOrder === dose.doseOrder - 1
              )),
        };
      }
    }

    return null;
  };

  // Helper function to check if student can receive next dose
  const canReceiveNextDose = (nextDose, studentHistory) => {
    if (!nextDose) return false;

    if (nextDose.doseOrder === 1) return true;

    // Kiểm tra mũi trước đã được tiêm chưa
    const previousDose = studentHistory.find(
      (record) => record.doseOrder === nextDose.doseOrder - 1
    );

    if (!previousDose) return false;

    // Kiểm tra khoảng cách tối thiểu
    const daysSinceLastDose = Math.floor(
      (new Date() - new Date(previousDose.administeredDate)) /
        (1000 * 60 * 60 * 24)
    );

    return daysSinceLastDose >= (nextDose.minInterval || 0);
  };

  // Fetch student vaccination history
  const fetchStudentVaccinationHistory = async (studentId, vaccineId) => {
    try {
      const response = await nurseAPI.getStudentVaccinationHistory(
        studentId,
        vaccineId
      );
      if (response.data.success) {
        setStudentVaccinationHistory(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching student vaccination history:", error);
      setStudentVaccinationHistory([]);
    }
  };

  // Khi mở modal tiêm cho học sinh
  const handlePerformVaccination = async (student) => {
    setSelectedStudent(student);

    // Fetch vaccination history for this student and vaccine
    if (selectedCampaign?.vaccine?.id) {
      await fetchStudentVaccinationHistory(
        student.id,
        selectedCampaign.vaccine.id
      );
    }

    // Ưu tiên lấy batchNumber từ state (vừa tiêm xong)
    let latestBatchNumber = campaignBatchNumber;
    // Nếu state chưa có, lấy từ vaccinationReports
    if (
      !latestBatchNumber &&
      vaccinationReports &&
      vaccinationReports.length > 0
    ) {
      const firstBatch = vaccinationReports.find((r) => r.batchNumber);
      if (firstBatch && firstBatch.batchNumber) {
        latestBatchNumber = firstBatch.batchNumber;
      }
    }

    // Tự động gợi ý mũi tiếp theo
    const nextDose = getNextRecommendedDose(
      selectedCampaign?.vaccine?.doseSchedules || [],
      studentVaccinationHistory
    );

    vaccinationForm.setFieldsValue({
      batchNumber: latestBatchNumber || "",
      administeredDate: null,
      doseOrder: nextDose?.doseOrder || 1,
      doseType:
        nextDose?.doseOrder === 1
          ? "PRIMARY"
          : nextDose?.doseOrder > 1
          ? "BOOSTER"
          : undefined,
      doseAmount: 0.5,
      notes: "",
    });

    setBatchNumberDisabled(!!latestBatchNumber); // Nếu đã có batchNumber thì disable
    setIsModalVisible(true);

    // Trigger validation để kiểm tra doseOrder sau khi có lịch sử vaccination
    setTimeout(() => {
      vaccinationForm.validateFields(["doseOrder"]);
    }, 100);
  };

  const handleReportResult = (vaccinationRecord) => {
    console.log("Vaccination record:", vaccinationRecord);

    // Kiểm tra dữ liệu vaccination record
    if (!vaccinationRecord) {
      message.error("Không tìm thấy thông tin tiêm chủng của học sinh này.");
      return;
    }

    // Kiểm tra trạng thái - vaccination record phải đã hoàn thành
    // Có thể là "COMPLETED" hoặc đã có administeredDate
    const isCompleted =
      vaccinationRecord.status === "COMPLETED" ||
      vaccinationRecord.administeredDate;

    if (!isCompleted) {
      message.warning("Chỉ có thể báo cáo kết quả cho học sinh đã tiêm chủng.");
      return;
    }

    setSelectedStudent(vaccinationRecord);
    setCurrentDoseLabel(getDoseLabel(vaccinationRecord.doseType) || "");

    // Set giá trị mặc định cho các trường đã nhập khi thực hiện tiêm
    reportForm.setFieldsValue({
      administeredDate: vaccinationRecord.administeredDate
        ? dayjs(vaccinationRecord.administeredDate)
        : null,
      doseType: vaccinationRecord.doseType || undefined,
      sideEffects: vaccinationRecord.sideEffects || "",
      reaction: vaccinationRecord.reaction || undefined,
      followUpRequired: vaccinationRecord.followUpRequired || false,
      followUpDate: vaccinationRecord.followUpDate
        ? dayjs(vaccinationRecord.followUpDate)
        : null,
      additionalNotes: vaccinationRecord.additionalNotes || "",
    });

    setIsReportModalVisible(true);
  };

  const handleSearch = (values) => {
    console.log(values);
    console.log(students);

    let filteredStudents = students;
    if (values.studentCode) {
      filteredStudents = filteredStudents.filter((student) =>
        student.studentCode
          .toLowerCase()
          .includes(values.studentCode.toLowerCase())
      );
    }
    if (values.grade) {
      filteredStudents = filteredStudents.filter(
        (student) => student.grade === values.grade
      );
    }
    if (values.consentStatus !== undefined) {
      filteredStudents = filteredStudents.filter(
        (student) => student.consentStatus === values.consentStatus
      );
    }
    setDisplayedStudents(filteredStudents);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setDisplayedStudents(students);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "SCHEDULED":
        return "processing";
      case "POSTPONED":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "COMPLETED":
        return "Đã tiêm";
      case "SCHEDULED":
        return "Đã lên lịch";
      case "POSTPONED":
        return "Hoãn";
      case "CANCELLED":
        return "Hủy";
      default:
        return "Chưa lên lịch";
    }
  };

  // Columns
  const campaignColumns = [
    { title: "Tên chiến dịch", dataIndex: "name", key: "name" },
    {
      title: "Vắc xin",
      key: "vaccineName",
      render: (_, record) =>
        record.vaccine && record.vaccine.name
          ? record.vaccine.name
          : "Không có",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "deadline",
      key: "deadline",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "ACTIVE" ? "green" : "default"}>
          {status === "ACTIVE" ? "Đang diễn ra" : "Đã kết thúc"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleCampaignSelect(record)}>
          Chọn chiến dịch
        </Button>
      ),
    },
  ];
          Chọn chiến dịch
        </Button>
      ),
    },
  ];

  const studentColumns = [
    { title: "Mã học sinh", dataIndex: "studentCode", key: "studentCode" },
    {
      title: "Tên học sinh",
      dataIndex: "fullName",
      key: "studentName",
      render: (_, record) => record.fullName || record.studentName || "",
    },
    { title: "Lớp", dataIndex: "class", key: "class" },
    {
      title: "Trạng thái chấp thuận",
      dataIndex: "consentStatus",
      key: "consentStatus",
      render: (consent, record) => {
        const tag = (
          <Tag
            color={
              consent === true
                ? "success"
                : consent === false
                ? "error"
                : "warning"
            }
          >
            {consent === true
              ? "Đã đồng ý"
              : consent === false
              ? "Từ chối"
              : "Chưa xác nhận"}
          </Tag>
        );
  const studentColumns = [
    { title: "Mã học sinh", dataIndex: "studentCode", key: "studentCode" },
    {
      title: "Tên học sinh",
      dataIndex: "fullName",
      key: "studentName",
      render: (_, record) => record.fullName || record.studentName || "",
    },
    { title: "Lớp", dataIndex: "class", key: "class" },
    {
      title: "Trạng thái chấp thuận",
      dataIndex: "consentStatus",
      key: "consentStatus",
      render: (consent, record) => {
        const tag = (
          <Tag
            color={
              consent === true
                ? "success"
                : consent === false
                ? "error"
                : "warning"
            }
          >
            {consent === true
              ? "Đã đồng ý"
              : consent === false
              ? "Từ chối"
              : "Chưa xác nhận"}
          </Tag>
        );

        // Hiển thị tooltip với lý do từ chối nếu có
        if (consent === false && record.consentReason) {
          return (
            <Tooltip
              title={`Lý do từ chối: ${record.consentReason}`}
              placement="top"
            >
              {tag}
            </Tooltip>
          );
        }
        // Hiển thị tooltip với lý do từ chối nếu có
        if (consent === false && record.consentReason) {
          return (
            <Tooltip
              title={`Lý do từ chối: ${record.consentReason}`}
              placement="top"
            >
              {tag}
            </Tooltip>
          );
        }

        return tag;
      },
    },
    {
      title: "Trạng thái tiêm",
      dataIndex: "vaccinationStatus",
      key: "vaccinationStatus",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Ngày tiêm",
      dataIndex: "administeredDate",
      key: "administeredDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "Chưa tiêm"),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => {
        // Tìm bản ghi tiêm chủng tương ứng trong vaccinationReports
        const vaccinationRecord = vaccinationReports.find(
          (r) => r.studentId === record.id || r.studentId === record.studentId
        );
        return (
          <Space>
            {record.consentStatus === true &&
              record.vaccinationStatus !== "COMPLETED" && (
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handlePerformVaccination(record)}
                  size="small"
                >
                  Thực hiện tiêm
                </Button>
              )}
            {record.vaccinationStatus === "COMPLETED" && vaccinationRecord ? (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleReportResult(vaccinationRecord)}
                  size="small"
                >
                  Cập nhật báo cáo
                </Button>
                <Button
                  icon={<SearchOutlined />}
                  onClick={() => handleViewReport(vaccinationRecord)}
                  size="small"
                >
                  Xem báo cáo
                </Button>
              </>
            ) : null}
          </Space>
        );
      },
    },
  ];
        return tag;
      },
    },
    {
      title: "Trạng thái tiêm",
      dataIndex: "vaccinationStatus",
      key: "vaccinationStatus",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Ngày tiêm",
      dataIndex: "administeredDate",
      key: "administeredDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "Chưa tiêm"),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => {
        // Tìm bản ghi tiêm chủng tương ứng trong vaccinationReports
        const vaccinationRecord = vaccinationReports.find(
          (r) => r.studentId === record.id || r.studentId === record.studentId
        );
        return (
          <Space>
            {record.consentStatus === true &&
              record.vaccinationStatus !== "COMPLETED" && (
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handlePerformVaccination(record)}
                  size="small"
                >
                  Thực hiện tiêm
                </Button>
              )}
            {record.vaccinationStatus === "COMPLETED" && vaccinationRecord ? (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleReportResult(vaccinationRecord)}
                  size="small"
                >
                  Cập nhật báo cáo
                </Button>
                <Button
                  icon={<SearchOutlined />}
                  onClick={() => handleViewReport(vaccinationRecord)}
                  size="small"
                >
                  Xem báo cáo
                </Button>
              </>
            ) : null}
          </Space>
        );
      },
    },
  ];

  const vaccinationReportColumns = [
    {
      title: "Mã học sinh",
      dataIndex: "studentCode",
      key: "studentCode",
      align: "center",
      width: 110,
    },
    {
      title: "Tên học sinh",
      dataIndex: "studentName",
      key: "studentName",
      align: "left",
      width: 140,
    },
    {
      title: "Lớp",
      dataIndex: "class",
      key: "class",
      align: "center",
      width: 70,
    },
    {
      title: "Ngày tiêm",
      dataIndex: "administeredDate",
      key: "administeredDate",
      align: "center",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Loại liều",
      dataIndex: "doseType",
      key: "doseType",
      align: "center",
      width: 120,
      render: (doseType) => {
        switch (doseType) {
          case "PRIMARY":
            return <Tag color="blue">Liều cơ bản</Tag>;
          case "BOOSTER":
            return <Tag color="green">Nhắc lại</Tag>;
          case "CATCHUP":
            return <Tag color="purple">Tiêm bù</Tag>;
          case "ADDITIONAL":
            return <Tag color="orange">Bổ sung</Tag>;
          default:
            return doseType || "-";
        }
      },
    },
    {
      title: "Tác dụng phụ",
      dataIndex: "sideEffects",
      key: "sideEffects",
      align: "left",
      width: 160,
      render: (val) => val || "-",
    },
    {
      title: "Phản ứng",
      dataIndex: "reaction",
      key: "reaction",
      align: "center",
      width: 120,
      render: (reaction) => {
        switch (reaction) {
          case "NONE":
            return <Tag color="green">Không có</Tag>;
          case "MILD":
            return <Tag color="gold">Nhẹ</Tag>;
          case "MODERATE":
            return <Tag color="orange">Vừa</Tag>;
          case "SEVERE":
            return <Tag color="red">Nặng</Tag>;
          default:
            return reaction || "-";
        }
      },
    },
    {
      title: "Cần theo dõi",
      dataIndex: "followUpRequired",
      key: "followUpRequired",
      align: "center",
      width: 120,
      render: (val) =>
        val ? (
          <Tag
            color="gold"
            style={{
              fontWeight: 600,
              fontSize: 14,
              padding: "2px 12px",
            }}
          >
            Có
          </Tag>
        ) : (
          <Tag
            color="default"
            style={{
              fontWeight: 600,
              fontSize: 14,
              padding: "2px 12px",
            }}
          >
            Không
          </Tag>
        ),
    },
    {
      title: "Ngày theo dõi",
      dataIndex: "followUpDate",
      key: "followUpDate",
      align: "center",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Ghi chú",
      dataIndex: "additionalNotes",
      key: "additionalNotes",
      align: "left",
      width: 120,
      render: (val) => val || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 110,
      render: (status) => {
        switch (status) {
          case "COMPLETED":
            return <Tag color="green">Đã tiêm</Tag>;
          case "SCHEDULED":
            return <Tag color="blue">Đã lên lịch</Tag>;
          case "POSTPONED":
            return <Tag color="orange">Hoãn</Tag>;
          case "CANCELLED":
            return <Tag color="red">Hủy</Tag>;
          default:
            return status || "-";
        }
      },
    },
  ];
  const vaccinationReportColumns = [
    {
      title: "Mã học sinh",
      dataIndex: "studentCode",
      key: "studentCode",
      align: "center",
      width: 110,
    },
    {
      title: "Tên học sinh",
      dataIndex: "studentName",
      key: "studentName",
      align: "left",
      width: 140,
    },
    {
      title: "Lớp",
      dataIndex: "class",
      key: "class",
      align: "center",
      width: 70,
    },
    {
      title: "Ngày tiêm",
      dataIndex: "administeredDate",
      key: "administeredDate",
      align: "center",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Loại liều",
      dataIndex: "doseType",
      key: "doseType",
      align: "center",
      width: 120,
      render: (doseType) => {
        switch (doseType) {
          case "PRIMARY":
            return <Tag color="blue">Liều cơ bản</Tag>;
          case "BOOSTER":
            return <Tag color="green">Nhắc lại</Tag>;
          case "CATCHUP":
            return <Tag color="purple">Tiêm bù</Tag>;
          case "ADDITIONAL":
            return <Tag color="orange">Bổ sung</Tag>;
          default:
            return doseType || "-";
        }
      },
    },
    {
      title: "Tác dụng phụ",
      dataIndex: "sideEffects",
      key: "sideEffects",
      align: "left",
      width: 160,
      render: (val) => val || "-",
    },
    {
      title: "Phản ứng",
      dataIndex: "reaction",
      key: "reaction",
      align: "center",
      width: 120,
      render: (reaction) => {
        switch (reaction) {
          case "NONE":
            return <Tag color="green">Không có</Tag>;
          case "MILD":
            return <Tag color="gold">Nhẹ</Tag>;
          case "MODERATE":
            return <Tag color="orange">Vừa</Tag>;
          case "SEVERE":
            return <Tag color="red">Nặng</Tag>;
          default:
            return reaction || "-";
        }
      },
    },
    {
      title: "Cần theo dõi",
      dataIndex: "followUpRequired",
      key: "followUpRequired",
      align: "center",
      width: 120,
      render: (val) =>
        val ? (
          <Tag
            color="gold"
            style={{
              fontWeight: 600,
              fontSize: 14,
              padding: "2px 12px",
            }}
          >
            Có
          </Tag>
        ) : (
          <Tag
            color="default"
            style={{
              fontWeight: 600,
              fontSize: 14,
              padding: "2px 12px",
            }}
          >
            Không
          </Tag>
        ),
    },
    {
      title: "Ngày theo dõi",
      dataIndex: "followUpDate",
      key: "followUpDate",
      align: "center",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Ghi chú",
      dataIndex: "additionalNotes",
      key: "additionalNotes",
      align: "left",
      width: 120,
      render: (val) => val || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 110,
      render: (status) => {
        switch (status) {
          case "COMPLETED":
            return <Tag color="green">Đã tiêm</Tag>;
          case "SCHEDULED":
            return <Tag color="blue">Đã lên lịch</Tag>;
          case "POSTPONED":
            return <Tag color="orange">Hoãn</Tag>;
          case "CANCELLED":
            return <Tag color="red">Hủy</Tag>;
          default:
            return status || "-";
        }
      },
    },
  ];

  // Tabs items
  const items = [
    {
      key: "campaigns",
      label: "Chiến dịch tiêm chủng",
      children: (
        <Card title="Chọn chiến dịch tiêm chủng">
          <Table
            dataSource={Array.isArray(campaigns) ? campaigns : []}
            columns={campaignColumns}
            rowKey="id"
            loading={loading}
            pagination={false}
          />
        </Card>
      ),
    },
    {
      key: "students",
      label: "Danh sách học sinh",
      children: selectedCampaign ? (
        <Card title="Danh sách học sinh">
          {/* Search Form */}
          <Form form={searchForm} onFinish={handleSearch} layout="vertical">
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item name="studentCode" label="Mã học sinh">
                  <Input placeholder="Nhập mã học sinh" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="grade" label="Lớp">
                  <Select placeholder="Chọn lớp" allowClear>
                    <Select.Option value="1">Lớp 1</Select.Option>
                    <Select.Option value="2">Lớp 2</Select.Option>
                    <Select.Option value="3">Lớp 3</Select.Option>
                    <Select.Option value="4">Lớp 4</Select.Option>
                    <Select.Option value="5">Lớp 5</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="consentStatus" label="Trạng thái chấp thuận">
                  <Select placeholder="Chọn trạng thái" allowClear>
                    <Select.Option value={true}>Đã đồng ý</Select.Option>
                    <Select.Option value={null}>Chưa xác nhận</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24} className="text-right">
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  htmlType="submit"
                  style={{ marginRight: 8 }}
                >
                  Tìm kiếm
                </Button>
                <Button onClick={handleReset}>Xóa bộ lọc</Button>
              </Col>
            </Row>
          </Form>
          <Divider />
          <Table
            dataSource={
              Array.isArray(displayedStudents) ? displayedStudents : []
            }
            columns={studentColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showQuickJumper: true }}
          />
        </Card>
      ) : (
        <Card>
          <div className="text-center text-gray-500">
            Vui lòng chọn chiến dịch trước
          </div>
        </Card>
      ),
    },
    {
      key: "reports",
      label: "Báo cáo tiêm chủng",
      children: selectedCampaign ? (
        <Card title="Danh sách báo cáo tiêm chủng">
          {/* Thêm alert/box cho học sinh cần theo dõi */}
          {(() => {
            const followUpCount = vaccinationReports.filter(
              (r) => r.followUpRequired
            ).length;
            return followUpCount > 0 ? (
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col>
                  <div
                    style={{
                      background: "#fffbe6",
                      border: "1px solid #ffe58f",
                      borderRadius: 4,
                      padding: "8px 16px",
                      color: "#faad14",
                      fontWeight: 500,
                      marginRight: 8,
                    }}
                  >
                    {followUpCount} học sinh cần theo dõi
                  </div>
                </Col>
              </Row>
            ) : null;
          })()}
          <Table
            dataSource={
              Array.isArray(vaccinationReports) ? vaccinationReports : []
            }
            columns={vaccinationReportColumns}
            rowKey="id"
            loading={reportLoading}
            locale={{
              emptyText: "Chưa có dữ liệu báo cáo tiêm chủng",
            }}
            pagination={{ pageSize: 10, showQuickJumper: true }}
            size="middle"
            bordered
            style={{ borderRadius: 8, overflow: "hidden" }}
          />
        </Card>
      ) : (
        <Card>
          <div className="text-center text-gray-500">
            Vui lòng chọn chiến dịch trước
          </div>
        </Card>
      ),
    },
  ];
  // Tabs items
  const items = [
    {
      key: "campaigns",
      label: "Chiến dịch tiêm chủng",
      children: (
        <Card title="Chọn chiến dịch tiêm chủng">
          <Table
            dataSource={Array.isArray(campaigns) ? campaigns : []}
            columns={campaignColumns}
            rowKey="id"
            loading={loading}
            pagination={false}
          />
        </Card>
      ),
    },
    {
      key: "students",
      label: "Danh sách học sinh",
      children: selectedCampaign ? (
        <Card title="Danh sách học sinh">
          {/* Search Form */}
          <Form form={searchForm} onFinish={handleSearch} layout="vertical">
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item name="studentCode" label="Mã học sinh">
                  <Input placeholder="Nhập mã học sinh" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="grade" label="Lớp">
                  <Select placeholder="Chọn lớp" allowClear>
                    <Select.Option value="1">Lớp 1</Select.Option>
                    <Select.Option value="2">Lớp 2</Select.Option>
                    <Select.Option value="3">Lớp 3</Select.Option>
                    <Select.Option value="4">Lớp 4</Select.Option>
                    <Select.Option value="5">Lớp 5</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="consentStatus" label="Trạng thái chấp thuận">
                  <Select placeholder="Chọn trạng thái" allowClear>
                    <Select.Option value={true}>Đã đồng ý</Select.Option>
                    <Select.Option value={null}>Chưa xác nhận</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24} className="text-right">
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  htmlType="submit"
                  style={{ marginRight: 8 }}
                >
                  Tìm kiếm
                </Button>
                <Button onClick={handleReset}>Xóa bộ lọc</Button>
              </Col>
            </Row>
          </Form>
          <Divider />
          <Table
            dataSource={
              Array.isArray(displayedStudents) ? displayedStudents : []
            }
            columns={studentColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showQuickJumper: true }}
          />
        </Card>
      ) : (
        <Card>
          <div className="text-center text-gray-500">
            Vui lòng chọn chiến dịch trước
          </div>
        </Card>
      ),
    },
    {
      key: "reports",
      label: "Báo cáo tiêm chủng",
      children: selectedCampaign ? (
        <Card title="Danh sách báo cáo tiêm chủng">
          {/* Thêm alert/box cho học sinh cần theo dõi */}
          {(() => {
            const followUpCount = vaccinationReports.filter(
              (r) => r.followUpRequired
            ).length;
            return followUpCount > 0 ? (
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col>
                  <div
                    style={{
                      background: "#fffbe6",
                      border: "1px solid #ffe58f",
                      borderRadius: 4,
                      padding: "8px 16px",
                      color: "#faad14",
                      fontWeight: 500,
                      marginRight: 8,
                    }}
                  >
                    {followUpCount} học sinh cần theo dõi
                  </div>
                </Col>
              </Row>
            ) : null;
          })()}
          <Table
            dataSource={
              Array.isArray(vaccinationReports) ? vaccinationReports : []
            }
            columns={vaccinationReportColumns}
            rowKey="id"
            loading={reportLoading}
            locale={{
              emptyText: "Chưa có dữ liệu báo cáo tiêm chủng",
            }}
            pagination={{ pageSize: 10, showQuickJumper: true }}
            size="middle"
            bordered
            style={{ borderRadius: 8, overflow: "hidden" }}
          />
        </Card>
      ) : (
        <Card>
          <div className="text-center text-gray-500">
            Vui lòng chọn chiến dịch trước
          </div>
        </Card>
      ),
    },
  ];

  useEffect(() => {
    fetchCampaigns();
  }, []);
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Hàm mở modal xem báo cáo
  const handleViewReport = (vaccinationRecord) => {
    setViewedVaccinationRecord(vaccinationRecord);
    setIsViewReportModalVisible(true);
  };
  // Hàm mở modal xem báo cáo
  const handleViewReport = (vaccinationRecord) => {
    setViewedVaccinationRecord(vaccinationRecord);
    setIsViewReportModalVisible(true);
  };

  // Component hiển thị phác đồ mũi tiêm
  const DoseScheduleDisplay = ({ doseSchedules, studentHistory }) => {
    const scheduleDisplay = getDoseScheduleDisplay(doseSchedules);
    const nextDose = getNextRecommendedDose(doseSchedules, studentHistory);
    const canReceive = canReceiveNextDose(nextDose, studentHistory);
  // Component hiển thị phác đồ mũi tiêm
  const DoseScheduleDisplay = ({ doseSchedules, studentHistory }) => {
    const scheduleDisplay = getDoseScheduleDisplay(doseSchedules);
    const nextDose = getNextRecommendedDose(doseSchedules, studentHistory);
    const canReceive = canReceiveNextDose(nextDose, studentHistory);

    if (!scheduleDisplay || scheduleDisplay.length === 0) {
      return (
        <Alert
          message="Không có thông tin phác đồ mũi tiêm"
          type="warning"
          showIcon
        />
      );
    }
    if (!scheduleDisplay || scheduleDisplay.length === 0) {
      return (
        <Alert
          message="Không có thông tin phác đồ mũi tiêm"
          type="warning"
          showIcon
        />
      );
    }

    return (
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            background: "#f6ffed",
            border: "1px solid #b7eb8f",
            borderRadius: 6,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              marginBottom: 8,
              color: "#389e0d",
            }}
          >
            📋 Phác đồ mũi tiêm
          </div>
          <div style={{ fontSize: 14, color: "#666" }}>
            Tổng cộng: {scheduleDisplay.length} mũi | Đã tiêm:{" "}
            {scheduleDisplay.filter((d) => d.isCompleted).length} mũi | Còn lại:{" "}
            {scheduleDisplay.filter((d) => !d.isCompleted).length} mũi
          </div>
        </div>
    return (
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            background: "#f6ffed",
            border: "1px solid #b7eb8f",
            borderRadius: 6,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              marginBottom: 8,
              color: "#389e0d",
            }}
          >
            📋 Phác đồ mũi tiêm
          </div>
          <div style={{ fontSize: 14, color: "#666" }}>
            Tổng cộng: {scheduleDisplay.length} mũi | Đã tiêm:{" "}
            {scheduleDisplay.filter((d) => d.isCompleted).length} mũi | Còn lại:{" "}
            {scheduleDisplay.filter((d) => !d.isCompleted).length} mũi
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 8,
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          {scheduleDisplay.map((dose) => (
            <div
              key={dose.doseOrder}
              style={{
                border:
                  dose.isNextDose && canReceive
                    ? "2px solid #1890ff"
                    : dose.isCompleted
                    ? "2px solid #52c41a"
                    : "2px solid #d9d9d9",
                borderRadius: 8,
                padding: 12,
                background:
                  dose.isNextDose && canReceive
                    ? "#e6f7ff"
                    : dose.isCompleted
                    ? "#f6ffed"
                    : "#fafafa",
                position: "relative",
              }}
            >
              {/* Badge trạng thái */}
              <div
                style={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  background: dose.isCompleted
                    ? "#52c41a"
                    : dose.isNextDose && canReceive
                    ? "#1890ff"
                    : "#d9d9d9",
                  color: "white",
                  borderRadius: "50%",
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                {dose.isCompleted
                  ? "✓"
                  : dose.isNextDose && canReceive
                  ? "→"
                  : "○"}
              </div>
        <div
          style={{
            display: "grid",
            gap: 8,
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          {scheduleDisplay.map((dose) => (
            <div
              key={dose.doseOrder}
              style={{
                border:
                  dose.isNextDose && canReceive
                    ? "2px solid #1890ff"
                    : dose.isCompleted
                    ? "2px solid #52c41a"
                    : "2px solid #d9d9d9",
                borderRadius: 8,
                padding: 12,
                background:
                  dose.isNextDose && canReceive
                    ? "#e6f7ff"
                    : dose.isCompleted
                    ? "#f6ffed"
                    : "#fafafa",
                position: "relative",
              }}
            >
              {/* Badge trạng thái */}
              <div
                style={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  background: dose.isCompleted
                    ? "#52c41a"
                    : dose.isNextDose && canReceive
                    ? "#1890ff"
                    : "#d9d9d9",
                  color: "white",
                  borderRadius: "50%",
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                {dose.isCompleted
                  ? "✓"
                  : dose.isNextDose && canReceive
                  ? "→"
                  : "○"}
              </div>

              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                Mũi {dose.doseOrder}
              </div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                Mũi {dose.doseOrder}
              </div>

              {dose.isCompleted ? (
                <div style={{ fontSize: 12, color: "#52c41a" }}>
                  ✓ Đã tiêm:{" "}
                  {dose.administeredDate
                    ? dayjs(dose.administeredDate).format("DD/MM/YYYY")
                    : "N/A"}
                </div>
              ) : dose.isNextDose && canReceive ? (
                <div
                  style={{
                    fontSize: 12,
                    color: "#1890ff",
                    fontWeight: 500,
                  }}
                >
                  → Mũi tiếp theo (có thể tiêm)
                </div>
              ) : dose.isNextDose && !canReceive ? (
                <div style={{ fontSize: 12, color: "#faad14" }}>
                  ⏳ Chưa đủ thời gian (cần {dose.minInterval || 0} ngày)
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "#999" }}>
                  ○ Chưa đến lượt
                </div>
              )}
              {dose.isCompleted ? (
                <div style={{ fontSize: 12, color: "#52c41a" }}>
                  ✓ Đã tiêm:{" "}
                  {dose.administeredDate
                    ? dayjs(dose.administeredDate).format("DD/MM/YYYY")
                    : "N/A"}
                </div>
              ) : dose.isNextDose && canReceive ? (
                <div
                  style={{
                    fontSize: 12,
                    color: "#1890ff",
                    fontWeight: 500,
                  }}
                >
                  → Mũi tiếp theo (có thể tiêm)
                </div>
              ) : dose.isNextDose && !canReceive ? (
                <div style={{ fontSize: 12, color: "#faad14" }}>
                  ⏳ Chưa đủ thời gian (cần {dose.minInterval || 0} ngày)
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "#999" }}>
                  ○ Chưa đến lượt
                </div>
              )}

              {!dose.isCompleted && dose.doseOrder > 1 && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#666",
                    marginTop: 4,
                  }}
                >
                  Khoảng cách: {dose.minInterval || 0}-
                  {dose.recommendedInterval || 0} ngày
                </div>
              )}
              {!dose.isCompleted && dose.doseOrder > 1 && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#666",
                    marginTop: 4,
                  }}
                >
                  Khoảng cách: {dose.minInterval || 0}-
                  {dose.recommendedInterval || 0} ngày
                </div>
              )}

              {dose.description && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#666",
                    marginTop: 4,
                    fontStyle: "italic",
                  }}
                >
                  {dose.description}
                </div>
              )}
            </div>
              {dose.description && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#666",
                    marginTop: 4,
                    fontStyle: "italic",
                  }}
                >
                  {dose.description}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Thông tin mũi tiếp theo */}
        {nextDose && (
          <Alert
            message={`Mũi tiếp theo: Mũi ${nextDose.doseOrder}`}
            description={
              canReceive
                ? "Học sinh có thể tiêm mũi này ngay bây giờ"
                : `Cần đợi thêm ${nextDose.minInterval || 0} ngày sau mũi ${
                    nextDose.doseOrder - 1
                  }`
            }
            type={canReceive ? "success" : "warning"}
            showIcon
            style={{ marginTop: 12 }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={2}>Thực hiện tiêm chủng</Title>
      </div>
      {selectedCampaign && (
        <Card
          title={`Chiến dịch: ${selectedCampaign.name}`}
          extra={
            <Button onClick={() => setSelectedCampaign(null)}>Đóng</Button>
          }
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Vắc xin">
              {selectedCampaign.vaccine && selectedCampaign.vaccine.name
                ? selectedCampaign.vaccine.name
                : "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {selectedCampaign.description || "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">
              {dayjs(selectedCampaign.scheduledDate).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày kết thúc">
              {dayjs(selectedCampaign.deadline).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  selectedCampaign.status === "ACTIVE" ? "green" : "default"
                }
              >
                {selectedCampaign.status === "ACTIVE"
                  ? "Đang diễn ra"
                  : "Đã kết thúc"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
          {selectedCampaign?.vaccine?.maxDoseCount && (
            <Alert
              message={`Vaccine này có tối đa ${selectedCampaign.vaccine.maxDoseCount} liều.`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
        </Card>
      )}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        size="large"
      />
      {/* Modal thực hiện tiêm chủng */}
      <Modal
        title="Thực hiện tiêm chủng"
        open={isModalVisible}
        onOk={() => vaccinationForm.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          vaccinationForm.resetFields();
          setSelectedStudent(null);
          setBatchNumberDisabled(false);
          setStudentVaccinationHistory([]);
        }}
        width={800}
      >
        {selectedStudent && (
          <div style={{ marginBottom: 16 }}>
            <Alert
              message={`Thực hiện tiêm chủng cho học sinh: ${
                selectedStudent.fullName || selectedStudent.studentName
              }`}
              description={`Mã học sinh: ${selectedStudent.studentCode} | Lớp: ${selectedStudent.class}`}
              type="info"
              showIcon
            />
          </div>
        )}

        {/* Hiển thị phác đồ mũi tiêm */}
        {selectedCampaign?.vaccine?.doseSchedules && (
          <DoseScheduleDisplay
            doseSchedules={selectedCampaign.vaccine.doseSchedules}
            studentHistory={studentVaccinationHistory}
          />
        )}

        {/* Thông báo về doseOrder tự động */}
        <Alert
          message="Thông tin mũi tiêm"
          description="Số mũi tiêm đã được tự động tính toán dựa trên lịch sử tiêm chủng của học sinh. Bạn có thể chỉnh sửa nếu cần thiết."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {/* Nút đổi số lô vaccine */}
        {batchNumberDisabled && (
          <div style={{ marginBottom: 12, textAlign: "right" }}>
            <Button type="dashed" onClick={() => setBatchNumberDisabled(false)}>
              Đổi số lô vaccine
            </Button>
          </div>
        )}

        <Form
          form={vaccinationForm}
          layout="vertical"
          onFinish={performVaccination}
        >
          <Form.Item
            name="administeredDate"
            label="Ngày tiêm"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn ngày tiêm",
              },
              {
                validator: validateAdministeredDate,
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              disabledDate={(current) => {
                // Disable past and future dates, only allow today
                const today = new Date();
                const todayStart = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate()
                );
                const todayEnd = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate(),
                  23,
                  59,
                  59
                );

                return (
                  current &&
                  (current.toDate() < todayStart || current.toDate() > todayEnd)
                );
              }}
              placeholder="Chọn ngày tiêm"
            />
          </Form.Item>
          <Form.Item
            name="doseOrder"
            label="Số mũi tiêm"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập số mũi tiêm",
              },
              {
                type: "number",
                min: 1,
                message: "Số mũi tiêm phải lớn hơn 0",
              },
              {
                validator: validateDoseOrder,
              },
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="Nhập số mũi tiêm"
              onChange={() => {
                // Trigger validation khi doseOrder thay đổi
                setTimeout(() => {
                  vaccinationForm.validateFields(["doseOrder"]);
                }, 100);
              }}
            />
          </Form.Item>
          <Form.Item
            name="doseType"
            label="Loại liều"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn loại liều",
              },
            ]}
          >
            <Select
              placeholder="Chọn loại liều"
              onChange={() => {
                // Trigger validation lại cho doseOrder khi doseType thay đổi
                vaccinationForm.validateFields(["doseOrder"]);
              }}
            >
              <Select.Option value="PRIMARY">Liều cơ bản</Select.Option>
              <Select.Option value="BOOSTER">Liều nhắc lại</Select.Option>
              <Select.Option value="CATCHUP">Tiêm bù</Select.Option>
              <Select.Option value="ADDITIONAL">Liều bổ sung</Select.Option>
              <Select.Option value="CATCHUP">Tiêm bù</Select.Option>
              <Select.Option value="ADDITIONAL">Liều bổ sung</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="doseAmount"
            label="Liều lượng"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập liều lượng",
              },
              {
                validator: validateDoseAmount,
              },
            ]}
            initialValue={0.5}
          >
            <InputNumber
              min={0.01}
              max={1.5}
              step={0.01}
              style={{ width: "100%" }}
              precision={2}
              addonAfter="ml"
            />
          </Form.Item>
          <Form.Item
            name="batchNumber"
            label="Số lô vaccine"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập số lô vaccine",
              },
              {
                validator: validateBatchNumber,
              },
            ]}
          >
            <Input
              placeholder="Nhập số lô vaccine (VD: LOT123, BATCH001, VAC-2024-001)"
              maxLength={50}
              disabled={batchNumberDisabled}
              style={{ textTransform: "uppercase" }}
              onChange={(e) => {
                // Auto uppercase
                const value = e.target.value.toUpperCase();
                vaccinationForm.setFieldValue("batchNumber", value);
              }}
            />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={3} placeholder="Ghi chú về quá trình tiêm chủng" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal báo cáo kết quả tiêm chủng */}
      <Modal
        title="Báo cáo kết quả tiêm chủng"
        open={isReportModalVisible}
        onOk={() => {
          console.log("=== Modal OK button clicked ===");
          console.log(
            "Form values before submit:",
            reportForm.getFieldsValue()
          );
          console.log(
            "Form is valid:",
            reportForm.getFieldsError().length === 0
          );
          reportForm.submit();
        }}
        onCancel={() => {
          setIsReportModalVisible(false);
          setSelectedStudent(null);
          reportForm.resetFields();
          setCurrentDoseLabel("");
        }}
        width={600}
        destroyOnHidden={true}
      >
        {selectedStudent && (
          <div style={{ marginBottom: 16 }}>
            <Alert
              message={`Báo cáo kết quả cho học sinh: ${selectedStudent.studentName}`}
              description={`Mã học sinh: ${selectedStudent.studentCode} | Lớp: ${selectedStudent.class}`}
              type="info"
              showIcon
            />
            {currentDoseLabel && (
              <Alert
                message={`Loại mũi: ${currentDoseLabel}`}
                type="success"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
          </div>
        )}
        {selectedStudent && (
          <div style={{ marginBottom: 12 }}>
            <Alert
              message={`Loại liều: ${(() => {
                switch (selectedStudent.doseType) {
                  case "PRIMARY":
                    return "Liều cơ bản";
                  case "BOOSTER":
                    return "Liều nhắc lại";
                  case "CATCHUP":
                    return "Tiêm bù";
                  case "ADDITIONAL":
                    return "Liều bổ sung";
                  default:
                    return selectedStudent.doseType || "Không xác định";
                }
              })()}`}
              type="success"
              showIcon
            />
          </div>
        )}
        <Form
          form={reportForm}
          layout="vertical"
          onFinish={reportVaccinationResult}
          onFinishFailed={(err) => {
            console.log("Form failed:", err);
            message.error("Vui lòng kiểm tra lại thông tin nhập vào");
          }}
        >
          <Form.Item
            name="administeredDate"
            label="Ngày tiêm (không thể thay đổi)"
          >
            <DatePicker disabled style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="doseType" label="Loại liều (không thể thay đổi)">
            <Select disabled style={{ width: "100%" }}>
              <Select.Option value="PRIMARY">Liều cơ bản</Select.Option>
              <Select.Option value="BOOSTER">Liều nhắc lại</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="sideEffects"
            label="Tác dụng phụ"
            rules={[
              {
                validator: validateSideEffects,
              },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Mô tả tác dụng phụ (nếu có)"
              onChange={() => {
                // Trigger validation for reaction field when side effects change
                reportForm.validateFields(["reaction"]);
              }}
            />
          </Form.Item>
          <Form.Item
            name="reaction"
            label="Phản ứng sau tiêm"
            rules={[
              {
                validator: validateReaction,
              },
            ]}
          >
            <Select
              placeholder="Chọn phản ứng"
              allowClear
              onChange={() => {
                // Trigger validation for side effects field when reaction changes
                reportForm.validateFields(["sideEffects"]);
              }}
            >
              <Select.Option value="NONE">Không có phản ứng</Select.Option>
              <Select.Option value="MILD">Phản ứng nhẹ</Select.Option>
              <Select.Option value="MODERATE">Phản ứng vừa</Select.Option>
              <Select.Option value="SEVERE">Phản ứng nặng</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="followUpRequired" label="Cần theo dõi">
            <Select placeholder="Chọn tình trạng theo dõi" allowClear>
              <Select.Option value={false}>Không cần</Select.Option>
              <Select.Option value={true}>Cần theo dõi</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="followUpDate" label="Ngày theo dõi">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="additionalNotes" label="Ghi chú bổ sung">
            <TextArea
              rows={3}
              placeholder="Ghi chú bổ sung về kết quả tiêm chủng"
            />
          </Form.Item>
        </Form>
      </Modal>
            )}
          </div>
        )}
        {selectedStudent && (
          <div style={{ marginBottom: 12 }}>
            <Alert
              message={`Loại liều: ${(() => {
                switch (selectedStudent.doseType) {
                  case "PRIMARY":
                    return "Liều cơ bản";
                  case "BOOSTER":
                    return "Liều nhắc lại";
                  case "CATCHUP":
                    return "Tiêm bù";
                  case "ADDITIONAL":
                    return "Liều bổ sung";
                  default:
                    return selectedStudent.doseType || "Không xác định";
                }
              })()}`}
              type="success"
              showIcon
            />
          </div>
        )}
        <Form
          form={reportForm}
          layout="vertical"
          onFinish={reportVaccinationResult}
          onFinishFailed={(err) => {
            console.log("Form failed:", err);
            message.error("Vui lòng kiểm tra lại thông tin nhập vào");
          }}
        >
          <Form.Item
            name="administeredDate"
            label="Ngày tiêm (không thể thay đổi)"
          >
            <DatePicker disabled style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="doseType" label="Loại liều (không thể thay đổi)">
            <Select disabled style={{ width: "100%" }}>
              <Select.Option value="PRIMARY">Liều cơ bản</Select.Option>
              <Select.Option value="BOOSTER">Liều nhắc lại</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="sideEffects"
            label="Tác dụng phụ"
            rules={[
              {
                validator: validateSideEffects,
              },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Mô tả tác dụng phụ (nếu có)"
              onChange={() => {
                // Trigger validation for reaction field when side effects change
                reportForm.validateFields(["reaction"]);
              }}
            />
          </Form.Item>
          <Form.Item
            name="reaction"
            label="Phản ứng sau tiêm"
            rules={[
              {
                validator: validateReaction,
              },
            ]}
          >
            <Select
              placeholder="Chọn phản ứng"
              allowClear
              onChange={() => {
                // Trigger validation for side effects field when reaction changes
                reportForm.validateFields(["sideEffects"]);
              }}
            >
              <Select.Option value="NONE">Không có phản ứng</Select.Option>
              <Select.Option value="MILD">Phản ứng nhẹ</Select.Option>
              <Select.Option value="MODERATE">Phản ứng vừa</Select.Option>
              <Select.Option value="SEVERE">Phản ứng nặng</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="followUpRequired" label="Cần theo dõi">
            <Select placeholder="Chọn tình trạng theo dõi" allowClear>
              <Select.Option value={false}>Không cần</Select.Option>
              <Select.Option value={true}>Cần theo dõi</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="followUpDate" label="Ngày theo dõi">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="additionalNotes" label="Ghi chú bổ sung">
            <TextArea
              rows={3}
              placeholder="Ghi chú bổ sung về kết quả tiêm chủng"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem báo cáo kết quả tiêm chủng */}
      <Modal
        title="Xem báo cáo kết quả tiêm chủng"
        open={isViewReportModalVisible}
        onCancel={() => {
          setIsViewReportModalVisible(false);
          setViewedVaccinationRecord(null);
        }}
        footer={null}
        width={600}
      >
        {viewedVaccinationRecord ? (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Tên học sinh">
              {viewedVaccinationRecord.studentName}
            </Descriptions.Item>
            <Descriptions.Item label="Mã học sinh">
              {viewedVaccinationRecord.studentCode}
            </Descriptions.Item>
            <Descriptions.Item label="Lớp">
              {viewedVaccinationRecord.class}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tiêm">
              {viewedVaccinationRecord.administeredDate
                ? dayjs(viewedVaccinationRecord.administeredDate).format(
                    "DD/MM/YYYY"
                  )
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Loại liều">
              {(() => {
                switch (viewedVaccinationRecord.doseType) {
                  case "PRIMARY":
                    return "Liều cơ bản";
                  case "BOOSTER":
                    return "Liều nhắc lại";
                  case "CATCHUP":
                    return "Tiêm bù";
                  case "ADDITIONAL":
                    return "Liều bổ sung";
                  default:
                    return viewedVaccinationRecord.doseType || "-";
                }
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Tác dụng phụ">
              {viewedVaccinationRecord.sideEffects || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Phản ứng">
              {(() => {
                switch (viewedVaccinationRecord.reaction) {
                  case "NONE":
                    return "Không có";
                  case "MILD":
                    return "Nhẹ";
                  case "MODERATE":
                    return "Vừa";
                  case "SEVERE":
                    return "Nặng";
                  default:
                    return viewedVaccinationRecord.reaction || "-";
                }
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Cần theo dõi">
              {viewedVaccinationRecord.followUpRequired ? "Có" : "Không"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày theo dõi">
              {viewedVaccinationRecord.followUpDate
                ? dayjs(viewedVaccinationRecord.followUpDate).format(
                    "DD/MM/YYYY"
                  )
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú bổ sung">
              {viewedVaccinationRecord.additionalNotes || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {(() => {
                switch (viewedVaccinationRecord.status) {
                  case "COMPLETED":
                    return "Đã tiêm";
                  case "SCHEDULED":
                    return "Đã lên lịch";
                  case "POSTPONED":
                    return "Hoãn";
                  case "CANCELLED":
                    return "Hủy";
                  default:
                    return viewedVaccinationRecord.status || "-";
                }
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Số lô vaccine">
              {viewedVaccinationRecord.batchNumber || "-"}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>
    </div>
  );
      {/* Modal xem báo cáo kết quả tiêm chủng */}
      <Modal
        title="Xem báo cáo kết quả tiêm chủng"
        open={isViewReportModalVisible}
        onCancel={() => {
          setIsViewReportModalVisible(false);
          setViewedVaccinationRecord(null);
        }}
        footer={null}
        width={600}
      >
        {viewedVaccinationRecord ? (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Tên học sinh">
              {viewedVaccinationRecord.studentName}
            </Descriptions.Item>
            <Descriptions.Item label="Mã học sinh">
              {viewedVaccinationRecord.studentCode}
            </Descriptions.Item>
            <Descriptions.Item label="Lớp">
              {viewedVaccinationRecord.class}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tiêm">
              {viewedVaccinationRecord.administeredDate
                ? dayjs(viewedVaccinationRecord.administeredDate).format(
                    "DD/MM/YYYY"
                  )
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Loại liều">
              {(() => {
                switch (viewedVaccinationRecord.doseType) {
                  case "PRIMARY":
                    return "Liều cơ bản";
                  case "BOOSTER":
                    return "Liều nhắc lại";
                  case "CATCHUP":
                    return "Tiêm bù";
                  case "ADDITIONAL":
                    return "Liều bổ sung";
                  default:
                    return viewedVaccinationRecord.doseType || "-";
                }
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Tác dụng phụ">
              {viewedVaccinationRecord.sideEffects || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Phản ứng">
              {(() => {
                switch (viewedVaccinationRecord.reaction) {
                  case "NONE":
                    return "Không có";
                  case "MILD":
                    return "Nhẹ";
                  case "MODERATE":
                    return "Vừa";
                  case "SEVERE":
                    return "Nặng";
                  default:
                    return viewedVaccinationRecord.reaction || "-";
                }
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Cần theo dõi">
              {viewedVaccinationRecord.followUpRequired ? "Có" : "Không"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày theo dõi">
              {viewedVaccinationRecord.followUpDate
                ? dayjs(viewedVaccinationRecord.followUpDate).format(
                    "DD/MM/YYYY"
                  )
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú bổ sung">
              {viewedVaccinationRecord.additionalNotes || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {(() => {
                switch (viewedVaccinationRecord.status) {
                  case "COMPLETED":
                    return "Đã tiêm";
                  case "SCHEDULED":
                    return "Đã lên lịch";
                  case "POSTPONED":
                    return "Hoãn";
                  case "CANCELLED":
                    return "Hủy";
                  default:
                    return viewedVaccinationRecord.status || "-";
                }
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Số lô vaccine">
              {viewedVaccinationRecord.batchNumber || "-"}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>
    </div>
  );
};

export default Vaccination;
