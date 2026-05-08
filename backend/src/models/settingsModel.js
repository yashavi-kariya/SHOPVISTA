import mongoose from "mongoose";

const tierSchema = new mongoose.Schema({
    minCartValue: { type: Number, required: true },
    discountValue: { type: Number, required: true },
    prefix: { type: String, default: "SAVE-" },
}, { _id: false });

const settingsSchema = new mongoose.Schema({
    shippingCharge: { type: Number, default: 79 },
    freeShippingThreshold: { type: Number, default: 999 },
    lowStockThreshold: { type: Number, default: 5 },
    // couponTiers: {
    //     type: [tierSchema], default: [
    //         { minCartValue: 3000, discountValue: 10, prefix: "SAVE10-" },
    //         { minCartValue: 5000, discountValue: 20, prefix: "SAVE20-" },
    //         { minCartValue: 7000, discountValue: 30, prefix: "MEGA30-" },
    //     ]
    // },
}, { timestamps: true });
export default mongoose.model("Settings", settingsSchema);