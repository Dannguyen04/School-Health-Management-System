import { Card, List, message, Spin, Typography } from "antd";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";

const { Text, Title } = Typography;

const NotificationDisplay = ({ userId, type }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, type]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = { userId };
      if (type) {
        params.type = type;
      }
      const response = await axios.get("/api/parents/notifications", {
        params,
      });
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      message.error("Không thể lấy danh sách thông báo");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "24px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card style={{ marginTop: 24 }}>
      <Title level={4}>Thông báo của bạn</Title>
      {notifications.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.title}
                description={
                  <>
                    <Text>{item.message}</Text>
                    <br />
                    <Text type="secondary">
                      Trạng thái: {item.status} -{" "}
                      {moment(item.createdAt).format("DD/MM/YYYY HH:mm")}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <div style={{ textAlign: "center", padding: "24px" }}>
          <Text type="secondary">Không có thông báo nào.</Text>
        </div>
      )}
    </Card>
  );
};

export default NotificationDisplay;
