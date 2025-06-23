import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import validator from "validator";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(
  session({
    secret: "mySecretKey",
    resave: true,
    saveUninitialized: false,
  })
);

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Check email nhe
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Find user by email from request body
    const user = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    if (!user || user.password !== password) {
      console.error(
        !user
          ? `User not found: ${email}`
          : `Invalid password for user: ${email}`
      );
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res
      .header("auth-token", token)
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
        },
      });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Server error during login" });
  }
};

// Get user profile (protected route)
const getUserProfile = async (req, res) => {
  try {
    // User data is already attached by authenticateToken
    const user = req.user;

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Profile error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Server error fetching profile" });
  }
};

// Logout handler
const handleLogout = (req, res) => {
  req.session.destroy();
  return res.status(200).json({ success: true, message: "Logout successful" });
};

export { handleLogin, getUserProfile, handleLogout };
