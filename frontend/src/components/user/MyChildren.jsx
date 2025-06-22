import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parentAPI } from '../../utils/api';
import { useAuth } from '../../context/authContext';

const MyChildren = () => {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchChildren = async () => {
            if (!user) {
                setError('Vui lòng đăng nhập để xem thông tin.');
                setLoading(false);
                return;
            }
            try {
                const response = await parentAPI.getMyChildren();
                setChildren(response.data);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải danh sách học sinh.');
                setLoading(false);
            }
        };

        fetchChildren();
    }, [user]);

    if (loading) {
        return <div className="p-4">Đang tải...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Các con của tôi</h1>
            {children.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {children.map((child) => (
                        <div key={child.studentId} className="bg-white p-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold">{child.fullName}</h2>
                            <p>Ngày sinh: {new Date(child.dateOfBirth).toLocaleDateString()}</p>
                            <p>Giới tính: {child.gender}</p>
                            <Link
                                to={`/user/health-profile?studentId=${child.studentId}`}
                                className="text-blue-500 hover:underline mt-2 inline-block"
                            >
                                Xem hồ sơ sức khỏe
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Không tìm thấy thông tin con của bạn.</p>
            )}
        </div>
    );
};

export default MyChildren; 