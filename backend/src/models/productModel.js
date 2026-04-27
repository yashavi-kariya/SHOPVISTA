import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
    attributes: {
        color: { type: String, required: true },
        size: { type: String, required: true }
    },

    price: {
        type: Number,
        required: true
    },

    stock: {
        type: Number,
        required: true,
        default: 0
    },

    image: {
        type: String,
        default: ""
    }

}, { _id: true });

// const productSchema = new mongoose.Schema({
//     name: { type: String, required: true },

//     price: { type: Number, required: true }, // lowest variant price

//     description: { type: String },

//     category: { type: String, required: true },

//     subCategory: {
//         type: String,
//         enum: [
//             null, "",
//             "Top Wear",
//             "Bottom Wear",
//             "Casual Wear",
//             "Formal Wear",
//             "Ethnic Wear",
//             "Western Wear",
//             "School Wear"
//         ],
//         default: null
//     },

//     brand: { type: String },

//     stock: { type: Number, default: 0 }, // total stock

//     img: { type: String },

//     colors: [String],

//     sizes: [String],

//     variants: [variantSchema],
//     collection: {
//         type: String,
//         default: "none"
//     },

//     views: { type: Number, default: 0 },

//     sold: { type: Number, default: 0 },

//     discount: { type: Number, default: 0 }

// }, { timestamps: true });
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    img: String,           // ← keep for backwards compat (first image)
    images: {
        type: [String],      // ← NEW: array of image URLs
        default: []
    },
    category: String,
    subCategory: String,
    brand: String,
    discount: Number,
    collection: { type: String, default: "none" },
    price: Number,
    stock: Number,
    variants: [
        {
            attributes: {
                color: String,
                size: String,
            },
            price: Number,
            stock: Number,
            image: String,
        }
    ],
});

const Product = mongoose.model("Product", productSchema);

export default Product;