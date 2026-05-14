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
    defaultReturnWindowDays: { type: Number, default: 7 },

}, { timestamps: true });
export default mongoose.model("Settings", settingsSchema);