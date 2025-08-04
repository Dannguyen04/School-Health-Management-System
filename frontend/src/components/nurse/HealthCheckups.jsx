import {
  EyeOutlined,
  MessageOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Steps,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { ErrorMessage, Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { nurseAPI } from "../../utils/api";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// Yup schema validate - nhất quán với backend
const checkupSchema = Yup.object().shape({
  studentGender: Yup.string().nullable(),
  scheduledDate: Yup.date().required("Vui lòng chọn ngày khám"),
  height: Yup.number()
    .positive("Chiều cao phải là số dương")
    .min(50, "Chiều cao không hợp lệ (50-250cm)")
    .max(250, "Chiều cao không hợp lệ (50-250cm)")
    .required("Vui lòng nhập chiều cao"),
  weight: Yup.number()
    .positive("Cân nặng phải là số dương")
    .min(10, "Cân nặng không hợp lệ (10-200kg)")
    .max(200, "Cân nặng không hợp lệ (10-200kg)")
    .required("Vui lòng nhập cân nặng"),
  pulse: Yup.number()
    .positive("Mạch phải là số dương")
    .min(40, "Mạch không hợp lệ (40-200)")
    .max(200, "Mạch không hợp lệ (40-200)")
    .required("Vui lòng nhập mạch"),
  systolicBP: Yup.number()
    .positive("Huyết áp tâm thu phải là số dương")
    .min(60, "Huyết áp tâm thu không hợp lệ (60-250)")
    .max(250, "Huyết áp tâm thu không hợp lệ (60-250)")
    .required("Vui lòng nhập huyết áp tâm thu"),
  diastolicBP: Yup.number()
    .positive("Huyết áp tâm trương phải là số dương")
    .min(30, "Huyết áp tâm trương không hợp lệ (30-150)")
    .max(150, "Huyết áp tâm trương không hợp lệ (30-150)")
    .required("Vui lòng nhập huyết áp tâm trương"),
  physicalClassification: Yup.string()
    .oneOf(["EXCELLENT", "GOOD", "AVERAGE", "WEAK"])
    .required("Chọn phân loại"),
  visionRightNoGlasses: Yup.mixed()
    .test("vision-validation", "Thị lực không được là số âm", function (value) {
      if (typeof value === "number") {
        return value >= 0;
      }
      return true;
    })
    .test(
      "vision-validation",
      "Thị lực không được chỉ chứa chữ cái",
      function (value) {
        if (typeof value === "string" && /^[a-zA-Z]+$/.test(value)) {
          return false;
        }
        return true;
      }
    )
    .test(
      "vision-validation",
      "Thị lực không được chứa emoji",
      function (value) {
        if (
          typeof value === "string" &&
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
            value
          )
        ) {
          return false;
        }
        return true;
      }
    )
    .test("vision-validation", "Thị lực phải từ 0-10", function (value) {
      if (typeof value === "number") {
        return value >= 0 && value <= 10;
      }
      if (typeof value === "string") {
        // Kiểm tra nếu là số thập phân (VD: 10/10, 1.5)
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          return numValue >= 0 && numValue <= 10;
        }
        // Kiểm tra format 10/10
        if (/^\d+\/\d+$/.test(value)) {
          const parts = value.split("/");
          const numerator = parseFloat(parts[0]);
          const denominator = parseFloat(parts[1]);
          if (!isNaN(numerator) && !isNaN(denominator) && denominator > 0) {
            const ratio = numerator / denominator;
            return ratio >= 0 && ratio <= 10;
          }
        }
        // Cho phép text như "Bình thường", "Tốt", etc.
        return true;
      }
      return true;
    })
    .required("Vui lòng nhập thị lực mắt phải (không kính)"),
  visionLeftNoGlasses: Yup.mixed()
    .test("vision-validation", "Thị lực không được là số âm", function (value) {
      if (typeof value === "number") {
        return value >= 0;
      }
      return true;
    })
    .test(
      "vision-validation",
      "Thị lực không được chỉ chứa chữ cái",
      function (value) {
        if (typeof value === "string" && /^[a-zA-Z]+$/.test(value)) {
          return false;
        }
        return true;
      }
    )
    .test(
      "vision-validation",
      "Thị lực không được chứa emoji",
      function (value) {
        if (
          typeof value === "string" &&
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
            value
          )
        ) {
          return false;
        }
        return true;
      }
    )
    .test("vision-validation", "Thị lực phải từ 0-10", function (value) {
      if (typeof value === "number") {
        return value >= 0 && value <= 10;
      }
      if (typeof value === "string") {
        // Kiểm tra nếu là số thập phân (VD: 10/10, 1.5)
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          return numValue >= 0 && numValue <= 10;
        }
        // Kiểm tra format 10/10
        if (/^\d+\/\d+$/.test(value)) {
          const parts = value.split("/");
          const numerator = parseFloat(parts[0]);
          const denominator = parseFloat(parts[1]);
          if (!isNaN(numerator) && !isNaN(denominator) && denominator > 0) {
            const ratio = numerator / denominator;
            return ratio >= 0 && ratio <= 10;
          }
        }
        // Cho phép text như "Bình thường", "Tốt", etc.
        return true;
      }
      return true;
    })
    .required("Vui lòng nhập thị lực mắt trái (không kính)"),
  visionRightWithGlasses: Yup.mixed()
    .test("vision-validation", "Thị lực không được là số âm", function (value) {
      if (typeof value === "number") {
        return value >= 0;
      }
      return true;
    })
    .test(
      "vision-validation",
      "Thị lực không được chỉ chứa chữ cái",
      function (value) {
        if (typeof value === "string" && /^[a-zA-Z]+$/.test(value)) {
          return false;
        }
        return true;
      }
    )
    .test(
      "vision-validation",
      "Thị lực không được chứa emoji",
      function (value) {
        if (
          typeof value === "string" &&
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
            value
          )
        ) {
          return false;
        }
        return true;
      }
    )
    .test("vision-validation", "Thị lực phải từ 0-10", function (value) {
      if (typeof value === "number") {
        return value >= 0 && value <= 10;
      }
      if (typeof value === "string") {
        // Kiểm tra nếu là số thập phân (VD: 10/10, 1.5)
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          return numValue >= 0 && numValue <= 10;
        }
        // Kiểm tra format 10/10
        if (/^\d+\/\d+$/.test(value)) {
          const parts = value.split("/");
          const numerator = parseFloat(parts[0]);
          const denominator = parseFloat(parts[1]);
          if (!isNaN(numerator) && !isNaN(denominator) && denominator > 0) {
            const ratio = numerator / denominator;
            return ratio >= 0 && ratio <= 10;
          }
        }
        // Cho phép text như "Bình thường", "Tốt", etc.
        return true;
      }
      return true;
    })
    .required("Vui lòng nhập thị lực mắt phải (có kính)"),
  visionLeftWithGlasses: Yup.mixed()
    .test("vision-validation", "Thị lực không được là số âm", function (value) {
      if (typeof value === "number") {
        return value >= 0;
      }
      return true;
    })
    .test(
      "vision-validation",
      "Thị lực không được chỉ chứa chữ cái",
      function (value) {
        if (typeof value === "string" && /^[a-zA-Z]+$/.test(value)) {
          return false;
        }
        return true;
      }
    )
    .test(
      "vision-validation",
      "Thị lực không được chứa emoji",
      function (value) {
        if (
          typeof value === "string" &&
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
            value
          )
        ) {
          return false;
        }
        return true;
      }
    )
    .test("vision-validation", "Thị lực phải từ 0-10", function (value) {
      if (typeof value === "number") {
        return value >= 0 && value <= 10;
      }
      if (typeof value === "string") {
        // Kiểm tra nếu là số thập phân (VD: 10/10, 1.5)
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          return numValue >= 0 && numValue <= 10;
        }
        // Kiểm tra format 10/10
        if (/^\d+\/\d+$/.test(value)) {
          const parts = value.split("/");
          const numerator = parseFloat(parts[0]);
          const denominator = parseFloat(parts[1]);
          if (!isNaN(numerator) && !isNaN(denominator) && denominator > 0) {
            const ratio = numerator / denominator;
            return ratio >= 0 && ratio <= 10;
          }
        }
        // Cho phép text như "Bình thường", "Tốt", etc.
        return true;
      }
      return true;
    })
    .required("Vui lòng nhập thị lực mắt trái (có kính)"),
  hearingLeftNormal: Yup.mixed()
    .test(
      "hearing-validation",
      "Thính lực không được là số âm",
      function (value) {
        if (typeof value === "number") {
          return value >= 0;
        }
        return true;
      }
    )
    .test(
      "hearing-validation",
      "Thính lực không được chứa emoji",
      function (value) {
        if (
          typeof value === "string" &&
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
            value
          )
        ) {
          return false;
        }
        return true;
      }
    )
    .test("hearing-validation", "Thính lực phải từ 0-10", function (value) {
      if (typeof value === "number") {
        return value >= 0 && value <= 10;
      }
      if (typeof value === "string") {
        // Kiểm tra nếu là số thập phân (VD: 10/10, 1.5)
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          return numValue >= 0 && numValue <= 10;
        }
        // Kiểm tra format 10/10
        if (/^\d+\/\d+$/.test(value)) {
          const parts = value.split("/");
          const numerator = parseFloat(parts[0]);
          const denominator = parseFloat(parts[1]);
          if (!isNaN(numerator) && !isNaN(denominator) && denominator > 0) {
            const ratio = numerator / denominator;
            return ratio >= 0 && ratio <= 10;
          }
        }
        // Cho phép text như "Bình thường", "Tốt", etc.
        return true;
      }
      return true;
    })
    .required("Vui lòng nhập thính lực tai trái (bình thường)"),
  hearingLeftWhisper: Yup.mixed()
    .test(
      "hearing-validation",
      "Thính lực không được là số âm",
      function (value) {
        if (typeof value === "number") {
          return value >= 0;
        }
        return true;
      }
    )
    .test(
      "hearing-validation",
      "Thính lực không được chứa emoji",
      function (value) {
        if (
          typeof value === "string" &&
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
            value
          )
        ) {
          return false;
        }
        return true;
      }
    )
    .test("hearing-validation", "Thính lực phải từ 0-10", function (value) {
      if (typeof value === "number") {
        return value >= 0 && value <= 10;
      }
      if (typeof value === "string") {
        // Kiểm tra nếu là số thập phân (VD: 10/10, 1.5)
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          return numValue >= 0 && numValue <= 10;
        }
        // Kiểm tra format 10/10
        if (/^\d+\/\d+$/.test(value)) {
          const parts = value.split("/");
          const numerator = parseFloat(parts[0]);
          const denominator = parseFloat(parts[1]);
          if (!isNaN(numerator) && !isNaN(denominator) && denominator > 0) {
            const ratio = numerator / denominator;
            return ratio >= 0 && ratio <= 10;
          }
        }
        // Cho phép text như "Bình thường", "Tốt", etc.
        return true;
      }
      return true;
    })
    .required("Vui lòng nhập thính lực tai trái (thì thầm)"),
  hearingRightNormal: Yup.mixed()
    .test(
      "hearing-validation",
      "Thính lực không được là số âm",
      function (value) {
        if (typeof value === "number") {
          return value >= 0;
        }
        return true;
      }
    )
    .test(
      "hearing-validation",
      "Thính lực không được chứa emoji",
      function (value) {
        if (
          typeof value === "string" &&
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
            value
          )
        ) {
          return false;
        }
        return true;
      }
    )
    .test("hearing-validation", "Thính lực phải từ 0-10", function (value) {
      if (typeof value === "number") {
        return value >= 0 && value <= 10;
      }
      if (typeof value === "string") {
        // Kiểm tra nếu là số thập phân (VD: 10/10, 1.5)
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          return numValue >= 0 && numValue <= 10;
        }
        // Kiểm tra format 10/10
        if (/^\d+\/\d+$/.test(value)) {
          const parts = value.split("/");
          const numerator = parseFloat(parts[0]);
          const denominator = parseFloat(parts[1]);
          if (!isNaN(numerator) && !isNaN(denominator) && denominator > 0) {
            const ratio = numerator / denominator;
            return ratio >= 0 && ratio <= 10;
          }
        }
        // Cho phép text như "Bình thường", "Tốt", etc.
        return true;
      }
      return true;
    })
    .required("Vui lòng nhập thính lực tai phải (bình thường)"),
  hearingRightWhisper: Yup.mixed()
    .test(
      "hearing-validation",
      "Thính lực không được là số âm",
      function (value) {
        if (typeof value === "number") {
          return value >= 0;
        }
        return true;
      }
    )
    .test(
      "hearing-validation",
      "Thính lực không được chứa emoji",
      function (value) {
        if (
          typeof value === "string" &&
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
            value
          )
        ) {
          return false;
        }
        return true;
      }
    )
    .test("hearing-validation", "Thính lực phải từ 0-10", function (value) {
      if (typeof value === "number") {
        return value >= 0 && value <= 10;
      }
      if (typeof value === "string") {
        // Kiểm tra nếu là số thập phân (VD: 10/10, 1.5)
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          return numValue >= 0 && numValue <= 10;
        }
        // Kiểm tra format 10/10
        if (/^\d+\/\d+$/.test(value)) {
          const parts = value.split("/");
          const numerator = parseFloat(parts[0]);
          const denominator = parseFloat(parts[1]);
          if (!isNaN(numerator) && !isNaN(denominator) && denominator > 0) {
            const ratio = numerator / denominator;
            return ratio >= 0 && ratio <= 10;
          }
        }
        // Cho phép text như "Bình thường", "Tốt", etc.
        return true;
      }
      return true;
    })
    .required("Vui lòng nhập thính lực tai phải (thì thầm)"),
  dentalUpperJaw: Yup.string()
    .min(2, "Kết quả răng hàm trên phải có ít nhất 2 ký tự")
    .max(100, "Kết quả răng hàm trên không được quá 100 ký tự")
    .test(
      "dental-validation",
      "Kết quả răng hàm trên không được chứa emoji",
      function (value) {
        if (
          typeof value === "string" &&
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
            value
          )
        ) {
          return false;
        }
        return true;
      }
    )
    .test(
      "dental-validation",
      "Kết quả răng hàm trên phải là text, không được chỉ chứa số",
      function (value) {
        if (typeof value === "string" && /^[0-9\s]+$/.test(value)) {
          return false;
        }
        return true;
      }
    )
    .required("Vui lòng nhập kết quả răng hàm trên"),
  dentalLowerJaw: Yup.string()
    .min(2, "Kết quả răng hàm dưới phải có ít nhất 2 ký tự")
    .max(100, "Kết quả răng hàm dưới không được quá 100 ký tự")
    .test(
      "dental-validation",
      "Kết quả răng hàm dưới không được chứa emoji",
      function (value) {
        if (
          typeof value === "string" &&
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
            value
          )
        ) {
          return false;
        }
        return true;
      }
    )
    .test(
      "dental-validation",
      "Kết quả răng hàm dưới phải là text, không được chỉ chứa số",
      function (value) {
        if (typeof value === "string" && /^[0-9\s]+$/.test(value)) {
          return false;
        }
        return true;
      }
    )
    .required("Vui lòng nhập kết quả răng hàm dưới"),
  clinicalNotes: Yup.string()
    .min(3, "Ghi chú lâm sàng phải có ít nhất 3 ký tự")
    .max(500, "Ghi chú lâm sàng không được quá 500 ký tự")
    .test(
      "clinical-validation",
      "Ghi chú lâm sàng không được chứa emoji",
      function (value) {
        if (
          typeof value === "string" &&
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
            value
          )
        ) {
          return false;
        }
        return true;
      }
    )
    .test(
      "clinical-validation",
      "Ghi chú lâm sàng phải là text, không được chỉ chứa số",
      function (value) {
        if (typeof value === "string" && /^[0-9\s]+$/.test(value)) {
          return false;
        }
        return true;
      }
    )
    .required("Vui lòng nhập ghi chú lâm sàng"),
  // Khám sinh dục - Nam
  maleGenitalPenis: Yup.string()
    .when("studentGender", {
      is: (val) => val === "Nam" || val === "male",
      then: (schema) => schema.required("Vui lòng nhập trạng thái dương vật"),
      otherwise: (schema) => schema.nullable(),
    }),
  maleGenitalTesticles: Yup.string()
    .when("studentGender", {
      is: (val) => val === "Nam" || val === "male",
      then: (schema) => schema.required("Vui lòng nhập trạng thái tinh hoàn"),
      otherwise: (schema) => schema.nullable(),
    }),
  malePubertySigns: Yup.string()
    .when("studentGender", {
      is: (val) => val === "Nam" || val === "male",
      then: (schema) => schema.required("Vui lòng nhập dấu hiệu dậy thì"),
      otherwise: (schema) => schema.nullable(),
    }),
  malePubertyAge: Yup.number()
    .min(8, "Tuổi dậy thì phải từ 8-18")
    .max(18, "Tuổi dậy thì phải từ 8-18")
    .when("studentGender", {
      is: (val) => val === "Nam" || val === "male",
      then: (schema) => schema.when("malePubertySigns", {
        is: "STARTING",
        then: (schema) => schema.required("Vui lòng nhập tuổi bắt đầu dậy thì"),
        otherwise: (schema) => schema.nullable(),
      }),
      otherwise: (schema) => schema.nullable(),
    }),
  // Khám sinh dục - Nữ
  femaleGenitalExternal: Yup.string()
    .when("studentGender", {
      is: (val) => val === "Nữ" || val === "female",
      then: (schema) => schema.required("Vui lòng nhập tình trạng cơ quan sinh dục ngoài"),
      otherwise: (schema) => schema.nullable(),
    }),
  femaleGenitalExternalOther: Yup.string()
    .when("studentGender", {
      is: "Nữ",
      then: (schema) => schema.when("femaleGenitalExternal", {
        is: "OTHER",
        then: (schema) => schema.required("Vui lòng nhập tình trạng bất thường khác"),
        otherwise: (schema) => schema.nullable(),
      }),
      otherwise: (schema) => schema.nullable(),
    }),
  femaleMenstruation: Yup.string()
    .when("studentGender", {
      is: (val) => val === "Nữ" || val === "female",
      then: (schema) => schema.required("Vui lòng nhập tình trạng kinh nguyệt"),
      otherwise: (schema) => schema.nullable(),
    }),
  femaleMenstruationAge: Yup.number()
    .min(8, "Tuổi có kinh phải từ 8-18")
    .max(18, "Tuổi có kinh phải từ 8-18")
    .when("studentGender", {
      is: "Nữ",
      then: (schema) => schema.when("femaleMenstruation", {
        is: "YES",
        then: (schema) => schema.required("Vui lòng nhập tuổi có kinh lần đầu"),
        otherwise: (schema) => schema.nullable(),
      }),
      otherwise: (schema) => schema.nullable(),
    }),
  femaleMenstrualCycle: Yup.string()
    .when("studentGender", {
      is: (val) => val === "Nữ" || val === "female",
      then: (schema) => schema.required("Vui lòng nhập chu kỳ kinh nguyệt"),
      otherwise: (schema) => schema.nullable(),
    }),
  femaleMenstrualCycleOther: Yup.string()
    .when("studentGender", {
      is: "Nữ",
      then: (schema) => schema.when("femaleMenstrualCycle", {
        is: "OTHER",
        then: (schema) => schema.required("Vui lòng nhập tình trạng khác"),
        otherwise: (schema) => schema.nullable(),
      }),
      otherwise: (schema) => schema.nullable(),
    }),
  // Khám tâm lý
  psychologicalEmotion: Yup.string().required("Vui lòng nhập tình trạng tình cảm - cảm xúc"),
  psychologicalCommunication: Yup.string().required("Vui lòng nhập tình trạng giao tiếp - quan hệ xã hội"),
  psychologicalBehavior: Yup.string().required("Vui lòng nhập tình trạng hành vi - ứng xử"),
  psychologicalConcentration: Yup.string().required("Vui lòng nhập tình trạng tập trung - chú ý"),
  overallHealth: Yup.string()
    .oneOf(["NORMAL", "NEEDS_ATTENTION", "REQUIRES_TREATMENT"])
    .required("Chọn trạng thái"),
  recommendations: Yup.string(),
  requiresFollowUp: Yup.boolean().required("Chọn"),
  followUpDate: Yup.date().nullable(),
  notes: Yup.string(),
});

// Helper function để xác định trạng thái tư vấn
const getConsultationStatus = (report) => {
  if (report.consultationStart && report.consultationEnd) {
    const now = dayjs();
    const start = dayjs(report.consultationStart);
    const end = dayjs(report.consultationEnd);

    if (now.isBefore(start)) {
      return { status: "SCHEDULED", text: "Đã đặt lịch", color: "blue" };
    } else if (now.isAfter(end)) {
      return { status: "COMPLETED", text: "Đã tư vấn", color: "green" };
    } else {
      return { status: "IN_PROGRESS", text: "Đang tư vấn", color: "orange" };
    }
  }
  return { status: "NOT_SCHEDULED", text: "Chưa đặt", color: "default" };
};

const HealthCheckups = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [checkupModal, setCheckupModal] = useState(false);
  const [checkupStudent, setCheckupStudent] = useState(null);
  const [checkupForm] = Form.useForm();
  const [detailReport, setDetailReport] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editInitialValues, setEditInitialValues] = useState(null);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [consultModalVisible, setConsultModalVisible] = useState(false);
  const [consultReport, setConsultReport] = useState(null);
  const [consultRange, setConsultRange] = useState([]);
  const [consultLoading, setConsultLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedAllSteps, setHasCompletedAllSteps] = useState(false);
  const [searchForm] = Form.useForm();
  const [displayedStudents, setDisplayedStudents] = useState([]);

  // Function to generate step schemas based on campaign configuration and parent consent
  const getStepSchemas = () => {
    const baseSchemas = [
      Yup.object({
        studentGender: checkupSchema.fields.studentGender,
        scheduledDate: checkupSchema.fields.scheduledDate,
        height: checkupSchema.fields.height,
        weight: checkupSchema.fields.weight,
        pulse: checkupSchema.fields.pulse,
        systolicBP: checkupSchema.fields.systolicBP,
        diastolicBP: checkupSchema.fields.diastolicBP,
      }),
      Yup.object({
        visionRightNoGlasses: checkupSchema.fields.visionRightNoGlasses,
        visionLeftNoGlasses: checkupSchema.fields.visionLeftNoGlasses,
        visionRightWithGlasses: checkupSchema.fields.visionRightWithGlasses,
        visionLeftWithGlasses: checkupSchema.fields.visionLeftWithGlasses,
      }),
      Yup.object({
        hearingLeftNormal: checkupSchema.fields.hearingLeftNormal,
        hearingLeftWhisper: checkupSchema.fields.hearingLeftWhisper,
        hearingRightNormal: checkupSchema.fields.hearingRightNormal,
        hearingRightWhisper: checkupSchema.fields.hearingRightWhisper,
      }),
      Yup.object({
        dentalUpperJaw: checkupSchema.fields.dentalUpperJaw,
        dentalLowerJaw: checkupSchema.fields.dentalLowerJaw,
      }),
    ];
    
    const optionalSchemas = [];
    
    // Add optional schemas based on campaign configuration and parent consent
    if (selectedCampaign?.optionalExaminations?.includes("GENITAL") && 
        checkupStudent?.parentConsent?.includes("GENITAL")) {
      optionalSchemas.push(Yup.object({
        studentGender: checkupSchema.fields.studentGender,
        maleGenitalPenis: checkupSchema.fields.maleGenitalPenis,
        maleGenitalTesticles: checkupSchema.fields.maleGenitalTesticles,
        malePubertySigns: checkupSchema.fields.malePubertySigns,
        malePubertyAge: checkupSchema.fields.malePubertyAge,
        femaleGenitalExternal: checkupSchema.fields.femaleGenitalExternal,
        femaleGenitalExternalOther: checkupSchema.fields.femaleGenitalExternalOther,
        femaleMenstruation: checkupSchema.fields.femaleMenstruation,
        femaleMenstruationAge: checkupSchema.fields.femaleMenstruationAge,
        femaleMenstrualCycle: checkupSchema.fields.femaleMenstrualCycle,
        femaleMenstrualCycleOther: checkupSchema.fields.femaleMenstrualCycleOther,
      }));
    }
    
    if (selectedCampaign?.optionalExaminations?.includes("PSYCHOLOGICAL") && 
        checkupStudent?.parentConsent?.includes("PSYCHOLOGICAL")) {
      optionalSchemas.push(Yup.object({
        psychologicalEmotion: checkupSchema.fields.psychologicalEmotion,
        psychologicalCommunication: checkupSchema.fields.psychologicalCommunication,
        psychologicalBehavior: checkupSchema.fields.psychologicalBehavior,
        psychologicalConcentration: checkupSchema.fields.psychologicalConcentration,
      }));
    }
    
    const finalSchemas = [
      Yup.object({
        studentGender: checkupSchema.fields.studentGender,
        physicalClassification: checkupSchema.fields.physicalClassification,
        overallHealth: checkupSchema.fields.overallHealth,
        requiresFollowUp: checkupSchema.fields.requiresFollowUp,
        followUpDate: checkupSchema.fields.followUpDate,
        recommendations: checkupSchema.fields.recommendations,
        clinicalNotes: checkupSchema.fields.clinicalNotes,
        notes: checkupSchema.fields.notes,
      }),
      checkupSchema,
    ];
    
    return [...baseSchemas, ...optionalSchemas, ...finalSchemas];
  };

  const stepSchemas = getStepSchemas();

  // Function to get step number for each examination type
  const getStepNumber = (examinationType) => {
    const baseSteps = 4; // Thông tin cơ bản, thị lực, thính lực, răng hàm mặt
    
    if (examinationType === 'GENITAL') {
      return baseSteps;
    }
    
    if (examinationType === 'PSYCHOLOGICAL') {
      return baseSteps + (selectedCampaign?.optionalExaminations?.includes("GENITAL") && 
                         checkupStudent?.parentConsent?.includes("GENITAL") ? 1 : 0);
    }
    
    return -1; // Not found
  };

  // Function to generate step titles based on campaign configuration and parent consent
  const getStepTitles = () => {
    const baseSteps = [
      "Thông tin cơ bản",
      "Khám thị lực",
      "Khám thính lực",
      "Khám răng hàm mặt",
    ];
    
    const optionalSteps = [];
    
    // Add optional steps based on campaign configuration and parent consent
    // Luôn gửi cả 2 loại khám tùy chọn về phụ huynh
    if (selectedCampaign?.optionalExaminations?.includes("GENITAL") && 
        checkupStudent?.parentConsent?.includes("GENITAL")) {
      optionalSteps.push("Khám sinh dục");
    }
    
    if (selectedCampaign?.optionalExaminations?.includes("PSYCHOLOGICAL") && 
        checkupStudent?.parentConsent?.includes("PSYCHOLOGICAL")) {
      optionalSteps.push("Khám tâm lý");
    }
    
    const finalSteps = [
      "Kết luận & Khuyến nghị",
      "Hoàn thành",
    ];
    
    return [...baseSteps, ...optionalSteps, ...finalSteps];
  };

  // Step titles for the form wizard
  const stepTitles = getStepTitles();

  // Fetch danh sách campaign khi vào trang
  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const response = await nurseAPI.getAllMedicalCampaigns();
        if (response.data.success) {
          setCampaigns(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        message.error("Không thể tải danh sách chiến dịch");
      }
      setLoading(false);
    };
    fetchCampaigns();
  }, []);

  // Khi chọn campaign, fetch chi tiết campaign và danh sách học sinh phù hợp
  const handleSelectCampaign = async (campaign) => {
    setLoading(true);
    try {
      // Lấy chi tiết campaign
      const resCampaign = await nurseAPI.getMedicalCampaignById(campaign.id);
      if (!resCampaign.data.success) {
        throw new Error("Không thể tải chi tiết chiến dịch");
      }
      const campaignDetail = resCampaign.data.data;
      setSelectedCampaign(campaignDetail);

      // Lấy danh sách học sinh cho campaign này
      const studentsResponse = await nurseAPI.getStudentsForMedicalCampaign(
        campaign.id
      );
      if (!studentsResponse.data.success) {
        throw new Error("Không thể tải danh sách học sinh");
      }
      const studentsData = studentsResponse.data.data || [];
      setStudents(studentsData);
      setDisplayedStudents(studentsData); // Reset displayed students

      // Lấy danh sách báo cáo khám sức khỏe của campaign này
      const resReports = await nurseAPI.getMedicalChecksByCampaign(campaign.id);
      if (resReports.data.success) {
        setReports(resReports.data.data || []);
      } else {
        setReports([]);
      }
      setActiveTab("students");
    } catch (error) {
      console.error("Error selecting campaign:", error);
      message.error(error.message || "Không thể tải dữ liệu chiến dịch");
      setStudents([]);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Khi bấm Khám sức khỏe
  const handleCreateCheckup = (student) => {
    setCheckupStudent(student);
    setCheckupModal(true);
    checkupForm.resetFields();
    setCurrentStep(0);
    setHasCompletedAllSteps(false);
  };

  // Khi bấm xem chi tiết báo cáo
  const handleViewDetail = (report) => {
    setDetailReport(report);
    setDetailModalVisible(true);
  };

  // Khi bấm chỉnh sửa báo cáo
  const handleEditReport = (report) => {
    setEditInitialValues({
      studentGender: report.student?.gender || null,
      scheduledDate: report.scheduledDate ? dayjs(report.scheduledDate) : null,
      height: report.height,
      weight: report.weight,
      pulse: report.pulse,
      systolicBP: report.systolicBP,
      diastolicBP: report.diastolicBP,
      physicalClassification: report.physicalClassification,
      visionRightNoGlasses: report.visionRightNoGlasses,
      visionLeftNoGlasses: report.visionLeftNoGlasses,
      visionRightWithGlasses: report.visionRightWithGlasses,
      visionLeftWithGlasses: report.visionLeftWithGlasses,
      hearingLeftNormal: report.hearingLeftNormal,
      hearingLeftWhisper: report.hearingLeftWhisper,
      hearingRightNormal: report.hearingRightNormal,
      hearingRightWhisper: report.hearingRightWhisper,
      dentalUpperJaw: report.dentalUpperJaw,
      dentalLowerJaw: report.dentalLowerJaw,
      // Khám sinh dục - Nam
      maleGenitalPenis: report.maleGenitalPenis || "",
      maleGenitalTesticles: report.maleGenitalTesticles || "",
      malePubertySigns: report.malePubertySigns || "",
      malePubertyAge: report.malePubertyAge || null,
      // Khám sinh dục - Nữ
      femaleGenitalExternal: report.femaleGenitalExternal || "",
      femaleGenitalExternalOther: report.femaleGenitalExternalOther || "",
      femaleMenstruation: report.femaleMenstruation || "",
      femaleMenstruationAge: report.femaleMenstruationAge || null,
      femaleMenstrualCycle: report.femaleMenstrualCycle || "",
      femaleMenstrualCycleOther: report.femaleMenstrualCycleOther || "",
      // Khám tâm lý
      psychologicalEmotion: report.psychologicalEmotion || "",
      psychologicalCommunication: report.psychologicalCommunication || "",
      psychologicalBehavior: report.psychologicalBehavior || "",
      psychologicalConcentration: report.psychologicalConcentration || "",
      clinicalNotes: report.clinicalNotes,
      overallHealth: report.overallHealth,
      recommendations: report.recommendations,
      requiresFollowUp: report.requiresFollowUp,
      followUpDate: report.followUpDate ? dayjs(report.followUpDate) : null,
      notes: report.notes,
    });
    setDetailModalVisible(false);
    setEditModalVisible(true);
  };

  // Hàm mở modal gửi kết quả & đặt lịch tư vấn
  const handleOpenConsultModal = (report) => {
    // Kiểm tra xem đã có lịch tư vấn chưa
    if (report.consultationStart && report.consultationEnd) {
      Modal.confirm({
        title: "Lịch tư vấn đã tồn tại",
        content: `Học sinh này đã có lịch tư vấn từ ${dayjs(
          report.consultationStart
        ).format("DD/MM/YYYY HH:mm")} đến ${dayjs(
          report.consultationEnd
        ).format("DD/MM/YYYY HH:mm")}. Bạn có muốn thay đổi lịch không?`,
        okText: "Thay đổi lịch",
        cancelText: "Hủy",
        onOk: () => {
          setConsultReport(report);
          setConsultRange([
            dayjs(report.consultationStart),
            dayjs(report.consultationEnd),
          ]);
          setConsultModalVisible(true);
        },
      });
      return;
    }

    setConsultReport(report);
    setConsultRange([]);
    setConsultModalVisible(true);
  };

  // Hàm gửi kết quả & lịch tư vấn
  const handleSendConsult = async () => {
    if (!consultRange.length) {
      message.error("Vui lòng chọn khoảng thời gian tư vấn");
      return;
    }

    const [start, end] = consultRange;
    const now = dayjs();

    // Validate thời gian không được trong quá khứ
    if (start.isBefore(now)) {
      message.error("Thời gian bắt đầu không được trong quá khứ");
      return;
    }

    if (end.isBefore(now)) {
      message.error("Thời gian kết thúc không được trong quá khứ");
      return;
    }

    // Validate thời gian kết thúc phải sau thời gian bắt đầu
    if (end.isBefore(start) || end.isSame(start)) {
      message.error("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    // Validate thời gian tư vấn tối thiểu (1 giờ)
    const duration = end.diff(start, "minute");
    if (duration < 60) {
      message.error("Thời gian tư vấn phải ít nhất 1 giờ");
      return;
    }

    // Validate dữ liệu trước khi gửi
    if (!consultReport || !consultReport.id) {
      message.error("Dữ liệu báo cáo không hợp lệ");
      return;
    }

    console.log("Consult report:", consultReport); // Debug log

    setConsultLoading(true);
    try {
      // Format dữ liệu thời gian đúng định dạng ISO string
      const consultationData = {
        consultationStart: start.toISOString(),
        consultationEnd: end.toISOString(),
      };

      console.log("Sending consultation data:", consultationData); // Debug log
      console.log("Medical check ID:", consultReport.id); // Debug log

      const response = await nurseAPI.scheduleMedicalCheckConsultation(
        consultReport.id,
        consultationData
      );

      console.log("Response:", response); // Debug log

      if (response.data.success) {
        // Cập nhật ngay lập tức trong state thay vì refetch
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.id === consultReport.id
              ? {
                  ...report,
                  consultationStart: start.toDate(),
                  consultationEnd: end.toDate(),
                }
              : report
          )
        );

        message.success(
          `Đã đặt lịch tư vấn thành công cho ${consultReport.student?.fullName}! 
           Thông báo đã được gửi đến phụ huynh.`,
          5
        );

        setConsultModalVisible(false);
        setConsultReport(null);
        setConsultRange([]);
      } else {
        // Xử lý trường hợp response.success = false
        console.error("Response success false:", response.data); // Debug log
        message.error(
          response.data?.error || "Đặt lịch tư vấn thất bại, vui lòng thử lại"
        );
      }
    } catch (err) {
      console.error("Consultation error:", err); // Debug log
      console.error("Error response:", err.response); // Debug log

      // Xử lý các loại lỗi khác nhau
      if (err.response?.status === 400) {
        message.error(
          err.response?.data?.error ||
            "Dữ liệu không hợp lệ, vui lòng kiểm tra lại"
        );
      } else if (err.response?.status === 404) {
        message.error("Không tìm thấy báo cáo khám sức khỏe");
      } else if (err.response?.status === 500) {
        message.error("Lỗi server, vui lòng thử lại sau");
      } else {
        message.error(
          err.response?.data?.error ||
            "Đặt lịch tư vấn thất bại, vui lòng thử lại"
        );
      }
    }
    setConsultLoading(false);
  };

  // Hàm tìm kiếm học sinh
  const handleSearch = (values) => {
    let filteredStudents = [...students];

    if (values.studentCode) {
      filteredStudents = filteredStudents.filter((student) =>
        student.studentCode
          ?.toLowerCase()
          .includes(values.studentCode.toLowerCase())
      );
    }

    if (values.grade) {
      filteredStudents = filteredStudents.filter(
        (student) => student.grade === values.grade
      );
    }

    if (values.status !== undefined) {
      filteredStudents = filteredStudents.filter((student) => {
        const report = reports.find((r) => r.studentId === student.id);
        if (values.status === "completed") {
          return report && report.status === "COMPLETED";
        } else if (values.status === "pending") {
          return !report || report.status !== "COMPLETED";
        }
        return true;
      });
    }

    setDisplayedStudents(filteredStudents);
  };

  // Hàm reset search
  const handleReset = () => {
    searchForm.resetFields();
    setDisplayedStudents(students);
  };

  // Table columns chỉ cho students
  const studentColumns = [
    {
      title: "Mã học sinh",
      dataIndex: "studentCode",
      key: "studentCode",
      align: "center",
      width: 110,
    },
    {
      title: "Tên học sinh",
      dataIndex: "fullName",
      key: "fullName",
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
      title: "Khối",
      dataIndex: "grade",
      key: "grade",
      align: "center",
      width: 70,
    },
    {
      title: "Đồng ý khám tùy chọn",
      key: "parentConsent",
      align: "center",
      width: 150,
      render: (_, record) => {
        if (!selectedCampaign?.optionalExaminations?.length) {
          return <span style={{ color: "#999" }}>Không có</span>;
        }
        
        const consent = record.parentConsent || [];
        const optionalExams = selectedCampaign.optionalExaminations;
        
        if (consent.length === 0) {
          return <Tag color="red">Chưa đồng ý</Tag>;
        }
        
        if (consent.length === optionalExams.length) {
          return <Tag color="green">Đồng ý tất cả</Tag>;
        }
        
        return (
          <div>
            {optionalExams.map(exam => (
              <Tag 
                key={exam} 
                color={consent.includes(exam) ? "green" : "red"}
                style={{ marginBottom: 2 }}
              >
                {exam === "GENITAL" ? "Sinh dục" : "Tâm lý"}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      align: "center",
      width: 120,
      render: (_, record) => {
        const report = reports.find((r) => r.studentId === record.id);
        if (report) {
          return (
            <Tag color={report.status === "COMPLETED" ? "green" : "orange"}>
              {report.status === "COMPLETED" ? "Hoàn thành" : "Chưa hoàn thành"}
            </Tag>
          );
        }
        return <Tag color="orange">Chưa hoàn thành</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      width: 150,
      render: (_, record) => {
        const report = reports.find((r) => r.studentId === record.id);
        if (report) {
          return (
            <Button
              type="default"
              icon={<EyeOutlined />}
              shape="round"
              size="small"
              style={{
                color: "#1677ff",
                borderColor: "#1677ff",
                fontWeight: 500,
              }}
              onClick={() => handleViewDetail(report)}
            >
              Chi tiết
            </Button>
          );
        }
        // Kiểm tra xem có cần đồng ý của phụ huynh không
        const needsParentConsent = selectedCampaign?.optionalExaminations?.length > 0;
        const hasParentConsent = record.parentConsent && record.parentConsent.length > 0;
        
        if (needsParentConsent && !hasParentConsent) {
          return (
            <Button 
              type="default" 
              disabled
              title="Cần chờ phụ huynh đồng ý khám tùy chọn"
            >
              Chờ đồng ý
            </Button>
          );
        }
        
        return (
          <Button type="primary" onClick={() => handleCreateCheckup(record)}>
            Khám sức khỏe
          </Button>
        );
      },
    },
  ];

  // Table columns cho campaign
  const campaignColumns = [
    { title: "Tên chiến dịch", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Ngày bắt đầu",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      render: (date) => date && new Date(date).toLocaleDateString(),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "deadline",
      key: "deadline",
      render: (date) => date && new Date(date).toLocaleDateString(),
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
        <Button type="primary" onClick={() => handleSelectCampaign(record)}>
          Chọn chiến dịch
        </Button>
      ),
    },
  ];

  const reportColumns = [
    {
      title: "Mã học sinh",
      dataIndex: ["student", "studentCode"],
      key: "studentCode",
      align: "center",
      width: 110,
    },
    {
      title: "Tên học sinh",
      dataIndex: ["student", "fullName"],
      key: "fullName",
      align: "left",
      width: 140,
    },
    {
      title: "Lớp",
      dataIndex: ["student", "class"],
      key: "class",
      align: "center",
      width: 70,
    },
    {
      title: "Ngày khám",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      align: "center",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 120,
      render: (status) => (
        <Tag color={status === "COMPLETED" ? "green" : "orange"}>
          {status === "COMPLETED" ? "Hoàn thành" : "Đã lên lịch"}
        </Tag>
      ),
    },
    {
      title: "Sức khỏe tổng thể",
      dataIndex: "overallHealth",
      key: "overallHealth",
      align: "center",
      width: 140,
      render: (health) => {
        const statusMap = {
          NORMAL: { text: "Bình thường", color: "green" },
          NEEDS_ATTENTION: { text: "Cần chú ý", color: "orange" },
          REQUIRES_TREATMENT: { text: "Cần điều trị", color: "red" },
        };
        const status = statusMap[health] || {
          text: health,
          color: "default",
        };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: "Trạng thái tư vấn",
      key: "consultationStatus",
      align: "center",
      width: 120,
      render: (_, record) => {
        const status = getConsultationStatus(record);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      width: 200,
      render: (_, record) => {
        const isNeedConsult =
          record.overallHealth === "NEEDS_ATTENTION" ||
          record.overallHealth === "REQUIRES_TREATMENT";
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Button
              type="default"
              icon={<EyeOutlined />}
              shape="round"
              size="small"
              style={{
                color: "#1677ff",
                borderColor: "#1677ff",
                fontWeight: 500,
              }}
              onClick={() => handleViewDetail(record)}
            >
              Chi tiết
            </Button>
            {isNeedConsult && (
              <Button
                type="primary"
                icon={<MessageOutlined />}
                shape="round"
                size="small"
                onClick={() => handleOpenConsultModal(record)}
                disabled={record.consultationStart && record.consultationEnd}
                style={{
                  backgroundColor:
                    record.consultationStart && record.consultationEnd
                      ? "#d9d9d9"
                      : undefined,
                }}
              >
                {record.consultationStart && record.consultationEnd
                  ? "Đã đặt lịch"
                  : "Đặt lịch tư vấn"}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // Tabs items với styling cải thiện
  const items = [
    {
      key: "campaigns",
      label: "Chiến dịch khám sức khỏe",
      children: (
        <Card title="Chọn chiến dịch khám sức khỏe">
          <Table
            columns={campaignColumns}
            dataSource={campaigns}
            rowKey="id"
            loading={loading}
            pagination={false}
            size="middle"
            style={{ borderRadius: 8, overflow: "hidden" }}
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
                <Form.Item name="grade" label="Khối">
                  <Select placeholder="Chọn khối" allowClear>
                    <Select.Option value="1">Khối 1</Select.Option>
                    <Select.Option value="2">Khối 2</Select.Option>
                    <Select.Option value="3">Khối 3</Select.Option>
                    <Select.Option value="4">Khối 4</Select.Option>
                    <Select.Option value="5">Khối 5</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="status" label="Trạng thái khám">
                  <Select placeholder="Chọn trạng thái" allowClear>
                    <Select.Option value="completed">
                      Đã hoàn thành
                    </Select.Option>
                    <Select.Option value="pending">
                      Chưa hoàn thành
                    </Select.Option>
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
            columns={studentColumns}
            dataSource={
              displayedStudents.length > 0 ? displayedStudents : students
            }
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showQuickJumper: true }}
            size="middle"
            style={{ borderRadius: 8, overflow: "hidden" }}
            locale={{
              emptyText: "Chưa có dữ liệu học sinh",
            }}
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
      label: "Báo cáo khám sức khỏe",
      children: selectedCampaign ? (
        <Card title="Danh sách báo cáo khám sức khỏe">
          {/* Alert cho học sinh cần theo dõi */}
          {(() => {
            const followUpCount = reports.filter(
              (r) => r.requiresFollowUp
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
            columns={reportColumns}
            dataSource={reports}
            rowKey="id"
            loading={loading}
            locale={{
              emptyText: "Chưa có dữ liệu báo cáo khám sức khỏe",
            }}
            pagination={{ pageSize: 10, showQuickJumper: true }}
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Typography.Title level={2}>
          Khám sức khỏe theo chiến dịch
        </Typography.Title>
      </div>
      {selectedCampaign && (
        <Card
          title={`Chiến dịch: ${selectedCampaign.name}`}
          extra={
            <Button onClick={() => setSelectedCampaign(null)}>Đóng</Button>
          }
        >
          <Descriptions bordered column={2}>
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
        </Card>
      )}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        size="large"
      />

      {/* Modal tư vấn */}
      <Modal
        title={
          <div>
            <div>Đặt lịch tư vấn</div>
            <div
              style={{ fontSize: "14px", color: "#666", fontWeight: "normal" }}
            >
              {consultReport?.student?.fullName} -{" "}
              {consultReport?.student?.studentCode}
            </div>
          </div>
        }
        open={consultModalVisible}
        onOk={handleSendConsult}
        onCancel={() => setConsultModalVisible(false)}
        confirmLoading={consultLoading}
        okText="Đặt lịch"
        cancelText="Hủy"
        width={600}
      >
        <div>
          {/* Alert tình trạng sức khỏe */}
          {consultReport && (
            <Alert
              message={`Tình trạng: ${
                consultReport.overallHealth === "NEEDS_ATTENTION"
                  ? "Cần chú ý"
                  : "Cần điều trị"
              }`}
              type={
                consultReport.overallHealth === "NEEDS_ATTENTION"
                  ? "warning"
                  : "error"
              }
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Ghi chú lâm sàng */}
          {consultReport?.clinicalNotes && (
            <Form.Item label="Ghi chú lâm sàng">
              <TextArea
                value={consultReport.clinicalNotes}
                readOnly
                rows={2}
                style={{ backgroundColor: "#f5f5f5" }}
              />
            </Form.Item>
          )}

          {/* Chọn thời gian tư vấn */}
          <Form.Item label="Chọn khoảng thời gian tư vấn" required>
            <RangePicker
              value={consultRange}
              onChange={setConsultRange}
              showTime
              format="DD/MM/YYYY HH:mm"
              placeholder={["Từ ngày/giờ", "Đến ngày/giờ"]}
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
              style={{ width: "100%" }}
            />
            <div style={{ fontSize: "12px", color: "#666", marginTop: 4 }}>
              * Thời gian tư vấn tối thiểu 1 giờ
            </div>
          </Form.Item>
        </div>
      </Modal>

      {/* Modal nhập báo cáo khám sức khỏe */}
      <Modal
        title={`Khám sức khỏe: ${checkupStudent?.fullName || ""}`}
        open={checkupModal}
        onCancel={() => {
          setCheckupModal(false);
          setCheckupStudent(null);
          setCurrentStep(0);
        }}
        footer={null}
        width={1100}
      >
        <Formik
          initialValues={{
            studentGender: checkupStudent?.gender || null,
            scheduledDate: null,
            height: null,
            weight: null,
            pulse: null,
            systolicBP: null,
            diastolicBP: null,
            physicalClassification: "",
            visionRightNoGlasses: null,
            visionLeftNoGlasses: null,
            visionRightWithGlasses: null,
            visionLeftWithGlasses: null,
            hearingLeftNormal: null,
            hearingLeftWhisper: null,
            hearingRightNormal: null,
            hearingRightWhisper: null,
            dentalUpperJaw: "",
            dentalLowerJaw: "",
            // Khám sinh dục - Nam
            maleGenitalPenis: "",
            maleGenitalTesticles: "",
            malePubertySigns: "",
            malePubertyAge: null,
            // Khám sinh dục - Nữ
            femaleGenitalExternal: "",
            femaleGenitalExternalOther: "",
            femaleMenstruation: "",
            femaleMenstruationAge: null,
            femaleMenstrualCycle: "",
            femaleMenstrualCycleOther: "",
            // Khám tâm lý
            psychologicalEmotion: "",
            psychologicalCommunication: "",
            psychologicalBehavior: "",
            psychologicalConcentration: "",
            clinicalNotes: "",
            overallHealth: "",
            recommendations: "",
            requiresFollowUp: false,
            followUpDate: null,
            notes: "",
          }}
          enableReinitialize
          validationSchema={stepSchemas[currentStep]}
          validateOnChange={true}
          validateOnBlur={true}
          onSubmit={async (
            values,
            { setSubmitting, resetForm, setFieldError }
          ) => {
              // Chỉ submit khi ở step cuối
              if (currentStep !== stepTitles.length - 1) {
              setSubmitting(false);
              return;
            }
            // Submit cuối cùng
            if (!selectedCampaign || !checkupStudent) return;
            try {
              await nurseAPI.createMedicalCheck({
                ...values,
                studentId: checkupStudent.id,
                campaignId: selectedCampaign.id,
              });
              message.success("Tạo báo cáo khám sức khỏe thành công");
              setCheckupModal(false);
              setCheckupStudent(null);
              setCurrentStep(0);
              // Refetch lại danh sách báo cáo
              const resReports = await nurseAPI.getMedicalChecksByCampaign(
                selectedCampaign.id
              );
              setReports(resReports.data.data || []);
              resetForm();
            } catch (err) {
              const backendMsg = err.response?.data?.error;
              if (
                backendMsg &&
                backendMsg.includes(
                  "Ngày khám phải nằm trong thời gian của chiến dịch"
                )
              ) {
                setFieldError("scheduledDate", backendMsg);
                message.error(backendMsg);
              } else {
                message.error(backendMsg || "Tạo báo cáo thất bại");
              }
            }
            setSubmitting(false);
          }}
        >
          {({
            values,
            setFieldValue,
            isSubmitting,
            handleSubmit,
            validateForm,
            setFieldError,
            setFieldTouched,
          }) => (
            <form onSubmit={handleSubmit}>
              <Steps
                current={currentStep}
                size="small"
                style={{ marginBottom: 24 }}
              >
                {stepTitles.map((title, idx) => (
                  <Steps.Step key={idx} title={title} />
                ))}
              </Steps>
              {/* Bước 1: Thông tin cơ bản */}
              {currentStep === 0 && (
                <>
                  <Divider orientation="left">Thông tin cơ bản</Divider>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Ngày khám"
                    required
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      value={values.scheduledDate}
                      onChange={(date) => setFieldValue("scheduledDate", date)}
                    />
                    <ErrorMessage
                      name="scheduledDate"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Chiều cao (cm)"
                    required
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      value={values.height}
                      onChange={(v) => setFieldValue("height", v)}
                    />
                    <ErrorMessage
                      name="height"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Cân nặng (kg)"
                    required
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      value={values.weight}
                      onChange={(v) => setFieldValue("weight", v)}
                    />
                    <ErrorMessage
                      name="weight"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Mạch"
                    required
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      value={values.pulse}
                      onChange={(v) => setFieldValue("pulse", v)}
                    />
                    <ErrorMessage
                      name="pulse"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Huyết áp tâm thu"
                    required
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      value={values.systolicBP}
                      onChange={(v) => setFieldValue("systolicBP", v)}
                    />
                    <ErrorMessage
                      name="systolicBP"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Huyết áp tâm trương"
                    required
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      value={values.diastolicBP}
                      onChange={(v) => setFieldValue("diastolicBP", v)}
                    />
                    <ErrorMessage
                      name="diastolicBP"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                </>
              )}
              {/* Bước 2: Thị lực */}
              {currentStep === 1 && (
                <>
                  <Divider orientation="left">Thị lực</Divider>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Phải (không kính)"
                    required
                  >
                    <Input
                      placeholder="Nhập thị lực (VD: 10/10, 1.5, Bình thường)"
                      style={{ width: "100%" }}
                      value={values.visionRightNoGlasses}
                      onChange={(e) =>
                        setFieldValue("visionRightNoGlasses", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="visionRightNoGlasses"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Trái (không kính)"
                    required
                  >
                    <Input
                      placeholder="Nhập thị lực (VD: 10/10, 1.5, Bình thường)"
                      style={{ width: "100%" }}
                      value={values.visionLeftNoGlasses}
                      onChange={(e) =>
                        setFieldValue("visionLeftNoGlasses", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="visionLeftNoGlasses"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Phải (có kính)"
                    required
                  >
                    <Input
                      placeholder="Nhập thị lực (VD: 10/10, 1.5, Bình thường)"
                      style={{ width: "100%" }}
                      value={values.visionRightWithGlasses}
                      onChange={(e) =>
                        setFieldValue("visionRightWithGlasses", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="visionRightWithGlasses"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Trái (có kính)"
                    required
                  >
                    <Input
                      placeholder="Nhập thị lực (VD: 10/10, 1.5, Bình thường)"
                      style={{ width: "100%" }}
                      value={values.visionLeftWithGlasses}
                      onChange={(e) =>
                        setFieldValue("visionLeftWithGlasses", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="visionLeftWithGlasses"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                </>
              )}
              {/* Bước 3: Thính lực */}
              {currentStep === 2 && (
                <>
                  <Divider orientation="left">Thính lực</Divider>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Trái (bình thường)"
                    required
                  >
                    <Input
                      placeholder="Nhập thính lực (VD: 8, Bình thường)"
                      style={{ width: "100%" }}
                      value={values.hearingLeftNormal}
                      onChange={(e) =>
                        setFieldValue("hearingLeftNormal", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="hearingLeftNormal"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Trái (thì thầm)"
                    required
                  >
                    <Input
                      placeholder="Nhập thính lực (VD: 8, Bình thường)"
                      style={{ width: "100%" }}
                      value={values.hearingLeftWhisper}
                      onChange={(e) =>
                        setFieldValue("hearingLeftWhisper", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="hearingLeftWhisper"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Phải (bình thường)"
                    required
                  >
                    <Input
                      placeholder="Nhập thính lực (VD: 8, Bình thường)"
                      style={{ width: "100%" }}
                      value={values.hearingRightNormal}
                      onChange={(e) =>
                        setFieldValue("hearingRightNormal", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="hearingRightNormal"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Phải (thì thầm)"
                    required
                  >
                    <Input
                      placeholder="Nhập thính lực (VD: 8, Bình thường)"
                      style={{ width: "100%" }}
                      value={values.hearingRightWhisper}
                      onChange={(e) =>
                        setFieldValue("hearingRightWhisper", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="hearingRightWhisper"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                </>
              )}
              {/* Bước 4: Răng miệng */}
              {currentStep === 3 && (
                <>
                  <Divider orientation="left">Răng miệng</Divider>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Răng hàm trên"
                    required
                  >
                    <Input
                      placeholder="Nhập kết quả khám răng hàm trên (VD: Tốt, Sâu răng, Cần điều trị)"
                      value={values.dentalUpperJaw}
                      onChange={(e) =>
                        setFieldValue("dentalUpperJaw", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="dentalUpperJaw"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Răng hàm dưới"
                    required
                  >
                    <Input
                      placeholder="Nhập kết quả khám răng hàm dưới (VD: Tốt, Sâu răng, Cần điều trị)"
                      value={values.dentalLowerJaw}
                      onChange={(e) =>
                        setFieldValue("dentalLowerJaw", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="dentalLowerJaw"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                </>
              )}
              {/* Bước khám sinh dục */}
              {currentStep === getStepNumber('GENITAL') && 
               selectedCampaign?.optionalExaminations?.includes("GENITAL") && 
               checkupStudent?.parentConsent?.includes("GENITAL") && (
                <>
                  <Divider orientation="left">Khám sinh dục</Divider>
                  
                 
                 
                  
                  {/* Khám sinh dục nam */}
                  {(checkupStudent?.gender === "Nam" || checkupStudent?.gender === "male") && (
                    <Card title="Đối với học sinh nam" size="small" style={{ marginBottom: 16 }}>
                      <Row>
                        <Col span={24}>
                          <Form.Item 
                            label="Dương vật" 
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                          >
                            <Input
                              placeholder="Nhập trạng thái dương vật (VD: Bình thường, Dài bao quy đầu)"
                              value={values.maleGenitalPenis}
                              onChange={(e) => setFieldValue("maleGenitalPenis", e.target.value)}
                            />
                            <ErrorMessage
                              name="maleGenitalPenis"
                              component="div"
                              className="text-red-500 text-xs"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={24}>
                          <Form.Item 
                            label="Tinh hoàn"
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                          >
                            <Input
                              placeholder="Nhập trạng thái tinh hoàn (VD: Hai bên bình thường, Ẩn tinh hoàn)"
                              value={values.maleGenitalTesticles}
                              onChange={(e) => setFieldValue("maleGenitalTesticles", e.target.value)}
                            />
                            <ErrorMessage
                              name="maleGenitalTesticles"
                              component="div"
                              className="text-red-500 text-xs"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={24}>
                          <Form.Item 
                            label="Dấu hiệu dậy thì"
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                          >
                            <Input
                              placeholder="Nhập dấu hiệu dậy thì (VD: Chưa, Đang bắt đầu)"
                              value={values.malePubertySigns}
                              onChange={(e) => setFieldValue("malePubertySigns", e.target.value)}
                            />
                            <ErrorMessage
                              name="malePubertySigns"
                              component="div"
                              className="text-red-500 text-xs"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      {values.malePubertySigns === "Đang bắt đầu" && (
                        <Row>
                          <Col span={24}>
                            <Form.Item 
                              label="Tuổi bắt đầu"
                              labelCol={{ span: 6 }}
                              wrapperCol={{ span: 18 }}
                            >
                              <InputNumber
                                style={{ width: "100%" }}
                                placeholder="Tuổi bắt đầu"
                                min={8}
                                max={18}
                                value={values.malePubertyAge}
                                onChange={(v) => setFieldValue("malePubertyAge", v)}
                              />
                              <ErrorMessage
                                name="malePubertyAge"
                                component="div"
                                className="text-red-500 text-xs"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      )}
                    </Card>
                  )}

                  {/* Khám sinh dục nữ */}
                  {(checkupStudent?.gender === "Nữ" || checkupStudent?.gender === "female") && (
                    <Card title="Đối với học sinh nữ" size="small">
                      <Row>
                        <Col span={24}>
                          <Form.Item 
                            label="Tình trạng cơ quan sinh dục ngoài"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 16 }}
                          >
                            <Input
                              placeholder="Nhập tình trạng cơ quan sinh dục ngoài (VD: Bình thường, Viêm đỏ)"
                              value={values.femaleGenitalExternal}
                              onChange={(e) => setFieldValue("femaleGenitalExternal", e.target.value)}
                            />
                            <ErrorMessage
                              name="femaleGenitalExternal"
                              component="div"
                              className="text-red-500 text-xs"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={24}>
                          <Form.Item 
                            label="Có kinh nguyệt chưa?"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 16 }}
                          >
                            <Input
                              placeholder="Nhập tình trạng kinh nguyệt (VD: Có, Chưa)"
                              value={values.femaleMenstruation}
                              onChange={(e) => setFieldValue("femaleMenstruation", e.target.value)}
                            />
                            <ErrorMessage
                              name="femaleMenstruation"
                              component="div"
                              className="text-red-500 text-xs"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      {values.femaleMenstruation === "Có" && (
                        <Row>
                          <Col span={24}>
                            <Form.Item 
                              label="Tuổi có kinh lần đầu"
                              labelCol={{ span: 8 }}
                              wrapperCol={{ span: 16 }}
                            >
                              <InputNumber
                                style={{ width: "100%" }}
                                placeholder="Tuổi có kinh lần đầu"
                                min={8}
                                max={18}
                                value={values.femaleMenstruationAge}
                                onChange={(v) => setFieldValue("femaleMenstruationAge", v)}
                              />
                              <ErrorMessage
                                name="femaleMenstruationAge"
                                component="div"
                                className="text-red-500 text-xs"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      )}
                      <Row>
                        <Col span={24}>
                          <Form.Item 
                            label="Chu kỳ kinh nguyệt"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 16 }}
                          >
                            <Input
                              placeholder="Nhập chu kỳ kinh nguyệt (VD: Đều, Không đều, Có đau bụng kinh)"
                              value={values.femaleMenstrualCycle}
                              onChange={(e) => setFieldValue("femaleMenstrualCycle", e.target.value)}
                            />
                            <ErrorMessage
                              name="femaleMenstrualCycle"
                              component="div"
                              className="text-red-500 text-xs"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  )}

                  {/* Hiển thị cho trường hợp không có giới tính */}
                  {!checkupStudent?.gender && !["Nam", "Nữ", "male", "female"].includes(checkupStudent?.gender) && (
                    <Card title="Khám sinh dục" size="small">
                      <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>
                        <p>Vui lòng chọn học sinh để hiển thị form khám sinh dục phù hợp</p>
                        <p>Giới tính học sinh: {checkupStudent?.gender || 'Chưa có thông tin'}</p>
                      </div>
                    </Card>
                  )}
                </>
              )}
              {/* Bước khám tâm lý */}
              {currentStep === getStepNumber('PSYCHOLOGICAL') && 
               selectedCampaign?.optionalExaminations?.includes("PSYCHOLOGICAL") && 
               checkupStudent?.parentConsent?.includes("PSYCHOLOGICAL") && (
                <>
                  <Divider orientation="left">Khám tâm lý</Divider>
                  
                  <Card title="Đánh giá tâm lý học sinh" size="small">
                    <Row>
                      <Col span={24}>
                        <Form.Item 
                          label="Tình cảm – cảm xúc"
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                        >
                          <Input
                            placeholder="Nhập tình trạng tình cảm - cảm xúc (VD: Bình thường, Hay lo lắng, Hay buồn bã)"
                            value={values.psychologicalEmotion}
                            onChange={(e) => setFieldValue("psychologicalEmotion", e.target.value)}
                          />
                          <ErrorMessage
                            name="psychologicalEmotion"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <Form.Item 
                          label="Giao tiếp – quan hệ xã hội"
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                        >
                          <Input
                            placeholder="Nhập tình trạng giao tiếp - quan hệ xã hội (VD: Giao tiếp bình thường, Ngại nói rụt rè)"
                            value={values.psychologicalCommunication}
                            onChange={(e) => setFieldValue("psychologicalCommunication", e.target.value)}
                          />
                          <ErrorMessage
                            name="psychologicalCommunication"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <Form.Item 
                          label="Hành vi – ứng xử"
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                        >
                          <Input
                            placeholder="Nhập tình trạng hành vi - ứng xử (VD: Nghe lời hợp tác, Hay chống đối bướng bỉnh)"
                            value={values.psychologicalBehavior}
                            onChange={(e) => setFieldValue("psychologicalBehavior", e.target.value)}
                          />
                          <ErrorMessage
                            name="psychologicalBehavior"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <Form.Item 
                          label="Tập trung – chú ý"
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                        >
                          <Input
                            placeholder="Nhập tình trạng tập trung - chú ý (VD: Tập trung tốt, Dễ mất tập trung)"
                            value={values.psychologicalConcentration}
                            onChange={(e) => setFieldValue("psychologicalConcentration", e.target.value)}
                          />
                          <ErrorMessage
                            name="psychologicalConcentration"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </>
              )}
              {/* Bước đánh giá tổng thể */}
              {currentStep === stepTitles.length - 2 && (
                <>
                  <Divider orientation="left">Đánh giá tổng thể</Divider>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Phân loại thể lực"
                    required
                  >
                    <Select
                      value={values.physicalClassification}
                      onChange={(v) =>
                        setFieldValue("physicalClassification", v)
                      }
                    >
                      <Option value="EXCELLENT">Xuất sắc</Option>
                      <Option value="GOOD">Tốt</Option>
                      <Option value="AVERAGE">Trung bình</Option>
                      <Option value="WEAK">Yếu</Option>
                    </Select>
                    <ErrorMessage
                      name="physicalClassification"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Sức khỏe tổng thể"
                    required
                  >
                    <Select
                      value={values.overallHealth}
                      onChange={(v) => setFieldValue("overallHealth", v)}
                    >
                      <Option value="NORMAL">Bình thường</Option>
                      <Option value="NEEDS_ATTENTION">Cần chú ý</Option>
                      <Option value="REQUIRES_TREATMENT">Cần điều trị</Option>
                    </Select>
                    <ErrorMessage
                      name="overallHealth"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Cần theo dõi"
                    required
                  >
                    <Select
                      value={values.requiresFollowUp}
                      onChange={(v) => setFieldValue("requiresFollowUp", v)}
                    >
                      <Option value={false}>Không</Option>
                      <Option value={true}>Có</Option>
                    </Select>
                    <ErrorMessage
                      name="requiresFollowUp"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Ngày theo dõi"
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      value={values.followUpDate}
                      onChange={(date) => setFieldValue("followUpDate", date)}
                    />
                    <ErrorMessage
                      name="followUpDate"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Khuyến nghị"
                  >
                    <Input.TextArea
                      rows={2}
                      value={values.recommendations}
                      onChange={(e) =>
                        setFieldValue("recommendations", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="recommendations"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Ghi chú lâm sàng"
                    required
                  >
                    <Input.TextArea
                      placeholder="Nhập ghi chú lâm sàng chi tiết về tình trạng sức khỏe của học sinh"
                      rows={2}
                      value={values.clinicalNotes}
                      onChange={(e) =>
                        setFieldValue("clinicalNotes", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="clinicalNotes"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </Form.Item>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    label="Ghi chú thêm"
                  >
                    <Input.TextArea
                      rows={2}
                      value={values.notes}
                      onChange={(e) => setFieldValue("notes", e.target.value)}
                    />
                  </Form.Item>
                </>
              )}
              {/* Bước xem lại thông tin */}
              {currentStep === stepTitles.length - 1 && (
                <>
                  <Divider orientation="left">Xem lại thông tin</Divider>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {/* Thông tin cơ bản */}
                    <Card
                      title="Thông tin cơ bản"
                      extra={
                        <Button onClick={() => setCurrentStep(0)}>
                          Chỉnh sửa
                        </Button>
                      }
                      size="small"
                    >
                      <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Ngày khám">
                          {values.scheduledDate
                            ? dayjs(values.scheduledDate).format("DD/MM/YYYY")
                            : ""}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chiều cao">
                          {values.height} cm
                        </Descriptions.Item>
                        <Descriptions.Item label="Cân nặng">
                          {values.weight} kg
                        </Descriptions.Item>
                        <Descriptions.Item label="Mạch">
                          {values.pulse}
                        </Descriptions.Item>
                        <Descriptions.Item label="Huyết áp tâm thu">
                          {values.systolicBP}
                        </Descriptions.Item>
                        <Descriptions.Item label="Huyết áp tâm trương">
                          {values.diastolicBP}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                    {/* Thị lực */}
                    <Card
                      title="Thị lực"
                      extra={
                        <Button onClick={() => setCurrentStep(1)}>
                          Chỉnh sửa
                        </Button>
                      }
                      size="small"
                    >
                      <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Phải (không kính)">
                          {values.visionRightNoGlasses}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trái (không kính)">
                          {values.visionLeftNoGlasses}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phải (có kính)">
                          {values.visionRightWithGlasses}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trái (có kính)">
                          {values.visionLeftWithGlasses}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                    {/* Thính lực */}
                    <Card
                      title="Thính lực"
                      extra={
                        <Button onClick={() => setCurrentStep(2)}>
                          Chỉnh sửa
                        </Button>
                      }
                      size="small"
                    >
                      <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Trái (bình thường)">
                          {values.hearingLeftNormal}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trái (thì thầm)">
                          {values.hearingLeftWhisper}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phải (bình thường)">
                          {values.hearingRightNormal}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phải (thì thầm)">
                          {values.hearingRightWhisper}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                    {/* Răng miệng */}
                    <Card
                      title="Răng miệng"
                      extra={
                        <Button onClick={() => setCurrentStep(3)}>
                          Chỉnh sửa
                        </Button>
                      }
                      size="small"
                    >
                      <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Răng hàm trên">
                          {values.dentalUpperJaw}
                        </Descriptions.Item>
                        <Descriptions.Item label="Răng hàm dưới">
                          {values.dentalLowerJaw}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                    {/* Khám sinh dục */}
                    {selectedCampaign?.optionalExaminations?.includes("GENITAL") && 
                     checkupStudent?.parentConsent?.includes("GENITAL") && (
                      <Card
                        title="Khám sinh dục"
                        extra={
                          <Button onClick={() => setCurrentStep(getStepNumber('GENITAL'))}>
                            Chỉnh sửa
                          </Button>
                        }
                        size="small"
                      >
                      {checkupStudent?.gender === "Nam" ? (
                        <Descriptions column={2} size="small" bordered>
                          <Descriptions.Item label="Dương vật">
                            {(() => {
                              const map = {
                                NORMAL: "Bình thường",
                                LONG_FORESKIN: "Dài bao quy đầu",
                                TIGHT_FORESKIN: "Hẹp bao quy đầu",
                              };
                              return map[values.maleGenitalPenis] || "-";
                            })()}
                          </Descriptions.Item>
                          <Descriptions.Item label="Tinh hoàn">
                            {(() => {
                              const map = {
                                NORMAL: "Hai bên bình thường",
                                UNDESCENDED: "Ẩn tinh hoàn",
                                SWOLLEN_PAINFUL: "Sưng/đau",
                              };
                              return map[values.maleGenitalTesticles] || "-";
                            })()}
                          </Descriptions.Item>
                          <Descriptions.Item label="Dấu hiệu dậy thì">
                            {(() => {
                              const map = {
                                NOT_STARTED: "Chưa",
                                STARTING: "Đang bắt đầu",
                              };
                              return map[values.malePubertySigns] || "-";
                            })()}
                          </Descriptions.Item>
                          <Descriptions.Item label="Tuổi bắt đầu dậy thì">
                            {values.malePubertyAge ? `${values.malePubertyAge} tuổi` : "-"}
                          </Descriptions.Item>
                        </Descriptions>
                      ) : checkupStudent?.gender === "Nữ" ? (
                        <Descriptions column={2} size="small" bordered>
                          <Descriptions.Item label="Tình trạng cơ quan sinh dục ngoài">
                            {(() => {
                              const map = {
                                NORMAL: "Bình thường",
                                RED_INFLAMED: "Viêm đỏ",
                                ABNORMAL_DISCHARGE: "Tiết dịch bất thường",
                                OTHER: values.femaleGenitalExternalOther || "Bất thường khác",
                              };
                              return map[values.femaleGenitalExternal] || "-";
                            })()}
                          </Descriptions.Item>
                          <Descriptions.Item label="Có kinh nguyệt chưa?">
                            {(() => {
                              const map = {
                                YES: "Có",
                                NO: "Chưa",
                              };
                              return map[values.femaleMenstruation] || "-";
                            })()}
                          </Descriptions.Item>
                          <Descriptions.Item label="Tuổi có kinh lần đầu">
                            {values.femaleMenstruationAge ? `${values.femaleMenstruationAge} tuổi` : "-"}
                          </Descriptions.Item>
                          <Descriptions.Item label="Chu kỳ kinh nguyệt">
                            {(() => {
                              const map = {
                                REGULAR: "Đều",
                                IRREGULAR: "Không đều",
                                PAINFUL: "Có đau bụng kinh",
                                OTHER: values.femaleMenstrualCycleOther || "Khác",
                              };
                              return map[values.femaleMenstrualCycle] || "-";
                            })()}
                          </Descriptions.Item>
                        </Descriptions>
                      ) : (
                        <Descriptions column={2} size="small" bordered>
                          <Descriptions.Item label="Không có thông tin khám sinh dục">-</Descriptions.Item>
                        </Descriptions>
                      )}
                      </Card>
                    )}
                    {/* Khám tâm lý */}
                    {selectedCampaign?.optionalExaminations?.includes("PSYCHOLOGICAL") && 
                     checkupStudent?.parentConsent?.includes("PSYCHOLOGICAL") && (
                      <Card
                        title="Khám tâm lý"
                        extra={
                          <Button onClick={() => setCurrentStep(getStepNumber('PSYCHOLOGICAL'))}>
                            Chỉnh sửa
                          </Button>
                        }
                        size="small"
                      >
                      <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Tình cảm – cảm xúc">
                          {values.psychologicalEmotion || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giao tiếp – quan hệ xã hội">
                          {values.psychologicalCommunication || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Hành vi – ứng xử">
                          {values.psychologicalBehavior || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tập trung – chú ý">
                          {values.psychologicalConcentration || "-"}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                    )}
                    {/* Đánh giá tổng thể */}
                    <Card
                      title="Đánh giá tổng thể"
                      extra={
                        <Button onClick={() => setCurrentStep(stepTitles.length - 2)}>
                          Chỉnh sửa
                        </Button>
                      }
                      size="small"
                    >
                      <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Phân loại thể lực">
                          {(() => {
                            const map = {
                              EXCELLENT: "Xuất sắc",
                              GOOD: "Tốt",
                              AVERAGE: "Trung bình",
                              WEAK: "Yếu",
                            };
                            return (
                              map[values.physicalClassification] ||
                              values.physicalClassification
                            );
                          })()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Sức khỏe tổng thể">
                          {(() => {
                            const map = {
                              NORMAL: "Bình thường",
                              NEEDS_ATTENTION: "Cần chú ý",
                              REQUIRES_TREATMENT: "Cần điều trị",
                            };
                            return (
                              map[values.overallHealth] || values.overallHealth
                            );
                          })()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cần theo dõi">
                          {values.requiresFollowUp ? "Có" : "Không"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày theo dõi">
                          {values.followUpDate
                            ? dayjs(values.followUpDate).format("DD/MM/YYYY")
                            : ""}
                        </Descriptions.Item>
                        <Descriptions.Item label="Khuyến nghị">
                          {values.recommendations}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghi chú lâm sàng">
                          {values.clinicalNotes}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghi chú thêm">
                          {values.notes}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </div>
                </>
              )}
              <div className="flex justify-end mt-4">
                {currentStep > 0 && (
                  <Button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    style={{ marginRight: 8 }}
                    disabled={isSubmitting}
                  >
                    Quay lại
                  </Button>
                )}
                {currentStep < stepTitles.length - 1 && (
                  <Button
                    type="primary"
                    onClick={async () => {
                      // Validate logic cho từng step
                      if (currentStep === 0) {
                        // Validate ngày khám trong khoảng campaign
                        if (
                          values.scheduledDate &&
                          (values.scheduledDate.isBefore(
                            dayjs(selectedCampaign.scheduledDate),
                            "day"
                          ) ||
                            values.scheduledDate.isAfter(
                              dayjs(selectedCampaign.deadline),
                              "day"
                            ))
                        ) {
                          setFieldError(
                            "scheduledDate",
                            "Ngày khám phải nằm trong thời gian của chiến dịch"
                          );
                          message.error(
                            "Ngày khám phải nằm trong thời gian của chiến dịch"
                          );
                          return;
                        }
                      }
                      // Validate step 4: Khám sinh dục (không bắt buộc)
                      // Bỏ validation dựa theo giới tính để form có thể hoạt động tự do
                      // Validate step 5: Nếu cần theo dõi thì phải nhập ngày theo dõi
                      if (currentStep === 5) {
                        if (
                          values.requiresFollowUp === true &&
                          !values.followUpDate
                        ) {
                          setFieldError(
                            "followUpDate",
                            "Vui lòng nhập ngày theo dõi khi chọn cần theo dõi"
                          );
                          message.error(
                            "Vui lòng nhập ngày theo dõi khi chọn cần theo dõi"
                          );
                          return;
                        }
                        // Validate ngày theo dõi phải sau ngày khám
                        if (
                          values.requiresFollowUp === true &&
                          values.followUpDate &&
                          values.scheduledDate &&
                          !values.followUpDate.isAfter(
                            values.scheduledDate,
                            "day"
                          )
                        ) {
                          setFieldError(
                            "followUpDate",
                            "Ngày theo dõi phải sau ngày khám"
                          );
                          message.error("Ngày theo dõi phải sau ngày khám");
                          return;
                        }
                      }
                      // Validate bằng Yup và để Formik tự động hiển thị lỗi
                      const stepErrs = await validateForm();
                      if (Object.keys(stepErrs).length === 0) {
                        // Nếu đã hoàn thành tất cả steps trước đó và đang edit từ step cuối
                        if (hasCompletedAllSteps && currentStep < 5) {
                          setCurrentStep(6); // Nhảy thẳng về step cuối
                        } else {
                          setCurrentStep(currentStep + 1);
                          // Đánh dấu đã hoàn thành tất cả steps khi đến step cuối
                          if (currentStep === 5) {
                            setHasCompletedAllSteps(true);
                          }
                        }
                      } else {
                        // Đánh dấu tất cả các trường có lỗi là "touched" để hiển thị lỗi
                        Object.keys(stepErrs).forEach((fieldName) => {
                          setFieldTouched(fieldName, true, false);
                        });
                        // Hiển thị lỗi đầu tiên
                        const firstError = Object.values(stepErrs)[0];
                        if (firstError) {
                          message.error(firstError);
                        }
                      }
                    }}
                    loading={isSubmitting}
                  >
                    Tiếp
                  </Button>
                )}
                {currentStep === stepTitles.length - 1 && (
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                  >
                    Xác nhận & Lưu
                  </Button>
                )}
              </div>
            </form>
          )}
        </Formik>
      </Modal>

      {/* Modal xem chi tiết báo cáo khám sức khỏe */}
      <Modal
        title="Chi tiết báo cáo khám sức khỏe"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={
          detailReport ? (
            <Button
              type="primary"
              onClick={() => handleEditReport(detailReport)}
            >
              Chỉnh sửa
            </Button>
          ) : null
        }
        width={800}
      >
        {detailReport && (
          <div>
            <Typography.Title level={4} style={{ marginBottom: 0 }}>
              {detailReport.student?.fullName || ""}
            </Typography.Title>
            <Typography.Text
              type="secondary"
              style={{ display: "block", marginBottom: 4 }}
            >
              {detailReport.campaign?.name && (
                <>
                  Chiến dịch: <b>{detailReport.campaign.name}</b>
                  <br />
                </>
              )}
              Ngày khám:{" "}
              {detailReport.scheduledDate
                ? dayjs(detailReport.scheduledDate).format("DD/MM/YYYY")
                : "N/A"}
            </Typography.Text>
            <Divider orientation="left">Thông tin cơ bản</Divider>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Chiều cao">
                {detailReport.height ? `${detailReport.height} cm` : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Cân nặng">
                {detailReport.weight ? `${detailReport.weight} kg` : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Mạch">
                {detailReport.pulse || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Huyết áp tâm thu">
                {detailReport.systolicBP || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Huyết áp tâm trương">
                {detailReport.diastolicBP || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Phân loại thể lực">
                {(() => {
                  const map = {
                    EXCELLENT: "Xuất sắc",
                    GOOD: "Tốt",
                    AVERAGE: "Trung bình",
                    WEAK: "Yếu",
                  };
                  return (
                    map[detailReport.physicalClassification] ||
                    detailReport.physicalClassification ||
                    "N/A"
                  );
                })()}
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Thị lực</Divider>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Phải (không kính)">
                {detailReport.visionRightNoGlasses || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Trái (không kính)">
                {detailReport.visionLeftNoGlasses || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Phải (có kính)">
                {detailReport.visionRightWithGlasses || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Trái (có kính)">
                {detailReport.visionLeftWithGlasses || "N/A"}
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Thính lực</Divider>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Trái (bình thường)">
                {detailReport.hearingLeftNormal || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Trái (thì thầm)">
                {detailReport.hearingLeftWhisper || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Phải (bình thường)">
                {detailReport.hearingRightNormal || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Phải (thì thầm)">
                {detailReport.hearingRightWhisper || "N/A"}
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Răng miệng</Divider>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Răng hàm trên">
                {detailReport.dentalUpperJaw || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Răng hàm dưới">
                {detailReport.dentalLowerJaw || "N/A"}
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Khám sinh dục</Divider>
            {detailReport.student?.gender === "Nam" ? (
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Dương vật">
                  {(() => {
                    const map = {
                      NORMAL: "Bình thường",
                      LONG_FORESKIN: "Dài bao quy đầu",
                      TIGHT_FORESKIN: "Hẹp bao quy đầu",
                    };
                    return map[detailReport.maleGenitalPenis] || "-";
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="Tinh hoàn">
                  {(() => {
                    const map = {
                      NORMAL: "Hai bên bình thường",
                      UNDESCENDED: "Ẩn tinh hoàn",
                      SWOLLEN_PAINFUL: "Sưng/đau",
                    };
                    return map[detailReport.maleGenitalTesticles] || "-";
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="Dấu hiệu dậy thì">
                  {(() => {
                    const map = {
                      NOT_STARTED: "Chưa",
                      STARTING: "Đang bắt đầu",
                    };
                    return map[detailReport.malePubertySigns] || "-";
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="Tuổi bắt đầu dậy thì">
                  {detailReport.malePubertyAge ? `${detailReport.malePubertyAge} tuổi` : "-"}
                </Descriptions.Item>
              </Descriptions>
            ) : detailReport.student?.gender === "Nữ" ? (
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Tình trạng cơ quan sinh dục ngoài">
                  {(() => {
                    const map = {
                      NORMAL: "Bình thường",
                      RED_INFLAMED: "Viêm đỏ",
                      ABNORMAL_DISCHARGE: "Tiết dịch bất thường",
                      OTHER: detailReport.femaleGenitalExternalOther || "Bất thường khác",
                    };
                    return map[detailReport.femaleGenitalExternal] || "-";
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="Có kinh nguyệt chưa?">
                  {(() => {
                    const map = {
                      YES: "Có",
                      NO: "Chưa",
                    };
                    return map[detailReport.femaleMenstruation] || "-";
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="Tuổi có kinh lần đầu">
                  {detailReport.femaleMenstruationAge ? `${detailReport.femaleMenstruationAge} tuổi` : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Chu kỳ kinh nguyệt">
                  {(() => {
                    const map = {
                      REGULAR: "Đều",
                      IRREGULAR: "Không đều",
                      PAINFUL: "Có đau bụng kinh",
                      OTHER: detailReport.femaleMenstrualCycleOther || "Khác",
                    };
                    return map[detailReport.femaleMenstrualCycle] || "-";
                  })()}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Không có thông tin khám sinh dục">-</Descriptions.Item>
              </Descriptions>
            )}
            {selectedCampaign?.optionalExaminations?.includes("PSYCHOLOGICAL") && 
             detailReport?.parentConsent?.includes("PSYCHOLOGICAL") && (
              <>
                <Divider orientation="left">Khám tâm lý</Divider>
                <Descriptions column={2} size="small" bordered>
                  <Descriptions.Item label="Tình cảm – cảm xúc">
                    {detailReport.psychologicalEmotion || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giao tiếp – quan hệ xã hội">
                    {detailReport.psychologicalCommunication || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Hành vi – ứng xử">
                    {detailReport.psychologicalBehavior || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tập trung – chú ý">
                    {detailReport.psychologicalConcentration || "-"}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
            <Divider orientation="left">Đánh giá tổng thể</Divider>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Sức khỏe tổng thể">
                <Tag
                  color={
                    detailReport.overallHealth === "NORMAL"
                      ? "green"
                      : detailReport.overallHealth === "NEEDS_ATTENTION"
                      ? "orange"
                      : "red"
                  }
                >
                  {(() => {
                    const map = {
                      NORMAL: "Bình thường",
                      NEEDS_ATTENTION: "Cần chú ý",
                      REQUIRES_TREATMENT: "Cần điều trị",
                    };
                    return (
                      map[detailReport.overallHealth] ||
                      detailReport.overallHealth ||
                      "N/A"
                    );
                  })()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Cần theo dõi">
                {detailReport.requiresFollowUp ? "Có" : "Không"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày theo dõi">
                {detailReport.followUpDate
                  ? dayjs(detailReport.followUpDate).format("DD/MM/YYYY")
                  : ""}
              </Descriptions.Item>
              <Descriptions.Item label="Khuyến nghị">
                <Typography.Text strong>
                  {detailReport.recommendations || "N/A"}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú lâm sàng" span={2}>
                {detailReport.clinicalNotes || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú thêm" span={2}>
                {detailReport.notes || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Modal cập nhật báo cáo khám sức khỏe */}
      <Modal
        title="Cập nhật báo cáo khám sức khỏe"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={800}
      >
        {editInitialValues && (
          <Formik
            initialValues={editInitialValues}
            validationSchema={checkupSchema}
            enableReinitialize
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                await nurseAPI.updateMedicalCheckResults(
                  detailReport.id,
                  values
                );
                message.success("Cập nhật báo cáo thành công");
                setEditModalVisible(false);
                // Refetch lại danh sách báo cáo
                const resReports = await nurseAPI.getMedicalChecksByCampaign(
                  selectedCampaign.id
                );
                setReports(resReports.data.data || []);
                resetForm();
              } catch (err) {
                message.error(
                  err.response?.data?.error || "Cập nhật báo cáo thất bại"
                );
              }
              setSubmitting(false);
            }}
          >
            {({ values, setFieldValue, isSubmitting, handleSubmit }) => (
              <form onSubmit={handleSubmit}>
                {selectedCampaign?.optionalExaminations?.includes("PSYCHOLOGICAL") && 
                 detailReport?.parentConsent?.includes("PSYCHOLOGICAL") && (
                  <>
                    <Divider orientation="left">Khám tâm lý</Divider>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Tình cảm – cảm xúc"
                  required
                >
                  <Input
                    placeholder="Nhập tình trạng tình cảm - cảm xúc"
                    value={values.psychologicalEmotion}
                    onChange={(e) => setFieldValue("psychologicalEmotion", e.target.value)}
                  />
                  <ErrorMessage
                    name="psychologicalEmotion"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Giao tiếp – quan hệ xã hội"
                  required
                >
                  <Input
                    placeholder="Nhập tình trạng giao tiếp - quan hệ xã hội"
                    value={values.psychologicalCommunication}
                    onChange={(e) => setFieldValue("psychologicalCommunication", e.target.value)}
                  />
                  <ErrorMessage
                    name="psychologicalCommunication"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Hành vi – ứng xử"
                  required
                >
                  <Input
                    placeholder="Nhập tình trạng hành vi - ứng xử"
                    value={values.psychologicalBehavior}
                    onChange={(e) => setFieldValue("psychologicalBehavior", e.target.value)}
                  />
                  <ErrorMessage
                    name="psychologicalBehavior"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Tập trung – chú ý"
                  required
                >
                  <Input
                    placeholder="Nhập tình trạng tập trung - chú ý"
                    value={values.psychologicalConcentration}
                    onChange={(e) => setFieldValue("psychologicalConcentration", e.target.value)}
                  />
                  <ErrorMessage
                    name="psychologicalConcentration"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                </>
                )}
                <Divider orientation="left">Đánh giá tổng thể</Divider>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Sức khỏe tổng thể"
                  required
                >
                  <Select
                    value={values.overallHealth}
                    onChange={(v) => setFieldValue("overallHealth", v)}
                  >
                    <Option value="NORMAL">Bình thường</Option>
                    <Option value="NEEDS_ATTENTION">Cần chú ý</Option>
                    <Option value="REQUIRES_TREATMENT">Cần điều trị</Option>
                  </Select>
                  <ErrorMessage
                    name="overallHealth"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Cần theo dõi"
                  required
                >
                  <Select
                    value={values.requiresFollowUp}
                    onChange={(v) => setFieldValue("requiresFollowUp", v)}
                  >
                    <Option value={false}>Không</Option>
                    <Option value={true}>Có</Option>
                  </Select>
                  <ErrorMessage
                    name="requiresFollowUp"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Ngày theo dõi"
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    value={values.followUpDate}
                    onChange={(date) => setFieldValue("followUpDate", date)}
                  />
                  <ErrorMessage
                    name="followUpDate"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Khuyến nghị"
                >
                  <Input.TextArea
                    rows={2}
                    value={values.recommendations}
                    onChange={(e) =>
                      setFieldValue("recommendations", e.target.value)
                    }
                  />
                  <ErrorMessage
                    name="recommendations"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Ghi chú lâm sàng"
                  required
                >
                  <Input.TextArea
                    rows={2}
                    value={values.clinicalNotes}
                    onChange={(e) =>
                      setFieldValue("clinicalNotes", e.target.value)
                    }
                  />
                  <ErrorMessage
                    name="clinicalNotes"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  label="Ghi chú thêm"
                >
                  <Input.TextArea
                    rows={2}
                    value={values.notes}
                    onChange={(e) => setFieldValue("notes", e.target.value)}
                  />
                </Form.Item>
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setEditModalVisible(false);
                    }}
                    style={{ marginRight: 8 }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                  >
                    Lưu báo cáo
                  </Button>
                </div>
              </form>
            )}
          </Formik>
        )}
      </Modal>
    </div>
  );
};

export default HealthCheckups;
