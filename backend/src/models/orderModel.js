// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema(
//     {
//         billing: Object,
//         items: Array,
//         totalPrice: Number,
//         status: {
//             type: String,
//             default: "Pending"
//         }
//     },
//     { timestamps: true }
// );

// export default mongoose.model("Order", orderSchema);

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product", // ✅ FIX
                    required: true
                },
                price: Number,
                quantity: Number
            }
        ],

        totalAmount: Number,

        status: {
            type: String,
            default: "Processing"
        }

    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;