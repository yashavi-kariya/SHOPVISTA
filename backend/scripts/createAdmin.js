import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

const createAdmin = async () => {
    await mongoose.connect(process.env.MONGO_URL);

    const existing = await User.findOne({ email: "admin@shopvista.com" });
    if (existing) {
        console.log("Admin already exists");
        process.exit();
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await User.create({
        name: "Admin5",
        email: "admin05@shopvista.com",
        password: hashedPassword,
        role: "admin"
    });

    console.log(" Admin created successfully");
    process.exit();
};

createAdmin(); 
