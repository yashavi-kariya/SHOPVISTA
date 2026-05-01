import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        required: true
    },
    lastLogin: {
        type: Date,
        default: null
    },

    // ADD THESE USEFUL FIELDS

    // Profile
    phone: {
        type: String,
        default: null
    },
    avatar: {
        type: String,
        default: null
    },

    address: {
        street: { type: String, default: null },
        city: { type: String, default: null },
        state: { type: String, default: null },
        zip: { type: String, default: null },
        country: { type: String, default: "India" }
    },

    // Wishlist
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    ],

    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },

    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpire: {
        type: Date,
        default: null
    }

}, { timestamps: true });

export default mongoose.model("User", userSchema);