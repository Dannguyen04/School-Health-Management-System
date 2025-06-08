import { useAuth } from "../../context/authContext";

const AdminHeader = () => {
  const { user } = useAuth();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 32px",
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
        minHeight: 72,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
        <button
          style={{
            border: "none",
            background: "#f5f6fa",
            borderRadius: 8,
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <i
            className="fa-solid fa-bars"
            style={{ fontSize: 20, color: "#7b8191" }}
          />
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#f5f6fa",
            borderRadius: 12,
            padding: "0 16px",
            height: 48,
            minWidth: 340,
            flex: 1,
            maxWidth: 420,
          }}
        >
          <i
            className="fa-solid fa-magnifying-glass"
            style={{ fontSize: 18, color: "#7b8191", marginRight: 12 }}
          />
          <input
            type="text"
            placeholder="Search or type command..."
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 16,
              flex: 1,
              color: "#222",
            }}
          />
          <span
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: "2px 10px",
              marginLeft: 12,
              fontSize: 14,
              color: "#7b8191",
              border: "1px solid #e0e0e0",
            }}
          >
            ⌘ K
          </span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <button
          style={{
            border: "1px solid #e0e0e0",
            background: "#fff",
            borderRadius: "50%",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <i
            className="fa-regular fa-moon"
            style={{ fontSize: 20, color: "#7b8191" }}
          />
        </button>
        <div
          style={{
            position: "relative",
            border: "1px solid #e0e0e0",
            background: "#fff",
            borderRadius: "50%",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <i
            className="fa-regular fa-bell"
            style={{ fontSize: 20, color: "#7b8191" }}
          />
          <span
            style={{
              position: "absolute",
              top: 10,
              right: 12,
              width: 10,
              height: 10,
              background: "#ff7a00",
              borderRadius: "50%",
              border: "2px solid #fff",
            }}
          />
        </div>
        {/* User */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="avatar"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <span style={{ fontWeight: 600, color: "#222", fontSize: 18 }}>
            {user.name}
          </span>
          <i
            className="fa-solid fa-chevron-down"
            style={{ color: "#7b8191", fontSize: 16 }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
