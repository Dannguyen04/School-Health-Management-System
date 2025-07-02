import React from "react";
import NotificationToast from "./NotificationToast";

/**
 * NotificationToastList
 * @param {Array} notifications - Mảng các object notification
 * @param {Function} onClose - Hàm gọi khi toast đóng, nhận vào id notification
 * @param {Function} onMarkAsRead - Hàm gọi khi đánh dấu đã đọc, nhận vào id notification
 * @param {Object} actionButtons - Object: { [id]: ReactNode } để truyền button riêng cho từng toast (nếu cần)
 * @param {Object} studentIds - Object: { [id]: studentId } để truyền studentId riêng cho từng toast (nếu cần)
 */
const NotificationToastList = ({
    notifications = [],
    onClose = () => {},
    onMarkAsRead = () => {},
    actionButtons = {},
    studentIds = {},
}) => {
    // Hiển thị toast xếp dọc, toast mới ở trên cùng
    return (
        <div
            style={{
                position: "fixed",
                top: 20,
                right: 20,
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 12,
                pointerEvents: "none", // Để toast không che các element khác, pointerEvents sẽ bật lại ở từng toast
            }}
        >
            {notifications.map((notification, idx) => (
                <div
                    key={notification.id || idx}
                    style={{
                        marginTop: idx === 0 ? 0 : 8,
                        pointerEvents: "auto", // Cho phép tương tác từng toast
                    }}
                >
                    <NotificationToast
                        notification={notification}
                        onClose={() => onClose(notification.id)}
                        onMarkAsRead={() => onMarkAsRead(notification.id)}
                        actionButton={actionButtons[notification.id]}
                        studentId={studentIds[notification.id]}
                    />
                </div>
            ))}
        </div>
    );
};

export default NotificationToastList;
