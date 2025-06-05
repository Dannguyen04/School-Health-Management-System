import bcypt from "bcrypt";
import dotenv from "dotenv";
import connectToDatabase from "./db/db.js";
import User from "./models/User.js";
dotenv.config();

const userRegister = async () => {
  connectToDatabase();
  try {
    const hashPassword = await bcypt.hash("admin", 10);
    const newUser = new User({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashPassword,
      role: "admin",
    });
    await newUser.save();
  } catch (error) {
    console.log(error);
  }
};

userRegister();
