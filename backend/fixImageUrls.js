import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Product from "./src/models/productModel.js";

const fixUrls = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const products = await Product.find({});
    console.log(`Total products: ${products.length}`);

    // Show first product to see its structure
    if (products.length > 0) {
        console.log("First product:", JSON.stringify(products[0], null, 2));
    }

    process.exit();
};

fixUrls();