import Product from "../models/productModel.js";

export const getProducts = async (req, res) => {
    try {
        const { filter, collection } = req.query; //add collection
        let query = {};
        let sortOption = { createdAt: -1 };
        const limit = filter ? 8 : 0;

        if (filter === "new-arrivals") {
            sortOption = { createdAt: -1 };
        } else if (filter === "best-sellers") {
            sortOption = { sold: -1 };
        } else if (filter === "hot-sales") {
            query = { discount: { $gt: 0 } };
            sortOption = { discount: -1 };
        }

        //  Add collection filter
        if (collection) {
            query.collection = collection;
        }
        const products = await Product.find(query)
            .sort(sortOption)
            .limit(limit);

        res.status(200).json(products);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const addProduct = async (req, res) => {
    try {
        const { name, description, category, subCategory, brand, stock, img, images, discount, variants, collection } = req.body;

        const prices = variants?.map(v => v.price).filter(Boolean) || [];
        const computedPrice = prices.length ? Math.min(...prices) : 0;
        const computedStock = variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
        const colors = [...new Set(variants?.map(v => v.attributes?.color).filter(Boolean))];
        const sizes = [...new Set(variants?.map(v => v.attributes?.size).filter(Boolean))];

        const product = await Product.create({
            name,
            description,
            category,
            subCategory: subCategory || null,
            brand,
            img: images?.[0] || img || "",
            images: images || (img ? [img] : []),
            discount: discount || 0,
            variants: variants || [],
            price: computedPrice,
            stock: computedStock,
            colors,
            sizes,
            sold: 0,
            views: 0,
            collection: collection || "none"
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { variants, subCategory, collection, images, img, ...rest } = req.body;
        const updateData = {
            ...rest,
            subCategory: subCategory || null,
            collection: collection || "none",
            img: images?.[0] || img || "",        // ← ADD THIS
            images: images || (img ? [img] : []), // ← ADD THIS
        };

        if (variants) {
            updateData.variants = variants;
            updateData.price = Math.min(...variants.map(v => v.price).filter(Boolean));
            updateData.stock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
            updateData.colors = [...new Set(variants.map(v => v.attributes?.color).filter(Boolean))];
            updateData.sizes = [...new Set(variants.map(v => v.attributes?.size).filter(Boolean))];
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET single product (Updates views automatically)
export const getSingleProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Not found" });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// import Product from "../models/productModel.js";

// //  COMBINED GET PRODUCTS (Handles both All and Filters)
// export const getProducts = async (req, res) => {
//     try {
//         const { filter } = req.query;
//         let query = {};
//         let sortOption = { createdAt: -1 };

//         const limit = filter ? 8 : 0;

//         if (filter === "new-arrivals") {
//             sortOption = { createdAt: -1 };
//         }
//         else if (filter === "best-sellers") {
//             sortOption = { sold: -1 };
//         }
//         else if (filter === "hot-sales") {
//             query = { discount: { $gt: 0 } };
//             sortOption = { discount: -1 };
//         }
//         const products = await Product.find(query)
//             .sort(sortOption)
//             .limit(limit);

//         res.status(200).json(products);

//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// export const addProduct = async (req, res) => {
//     try {
//         const { name, description, category, subCategory, brand, stock, img, discount, variants } = req.body;
//         const prices = variants?.map(v => v.price).filter(Boolean) || [];
//         const colors = [...new Set(variants?.map(v => v.attributes?.color).filter(Boolean))];
//         const sizes = [...new Set(variants?.map(v => v.attributes?.size).filter(Boolean))];

//         const product = await Product.create({
//             name,
//             description,
//             category,
//             subCategory: subCategory || null,
//             brand,
//             img,
//             discount: discount || 0,
//             variants: variants || [],
//             price: computedprice,
//             stock: computedStock,
//             colors,
//             sizes,
//             sold: 0,
//             views: 0
//         });

//         res.status(201).json(product);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // GET single product (Updates views automatically)
// export const getSingleProduct = async (req, res) => {
//     try {
//         const product = await Product.findByIdAndUpdate(
//             req.params.id,
//             { $inc: { views: 1 } },
//             { new: true }
//         );

//         if (!product) {
//             return res.status(404).json({ message: "Not found" });
//         }
//         res.json(product);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
// //update
// export const updateProduct = async (req, res) => {
//     try {
//         const { variants, subCategory, ...rest } = req.body;
//         const updateData = { ...rest, subCategory: subCategory || null };

//         if (variants) {
//             updateData.variants = variants;
//             updateData.price = Math.min(...variants.map(v => v.price).filter(Boolean));
//             updateData.stock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
//             updateData.colors = [...new Set(variants.map(v => v.attributes?.color).filter(Boolean))];
//             updateData.sizes = [...new Set(variants.map(v => v.attributes?.size).filter(Boolean))];
//         }

//         const updatedProduct = await Product.findByIdAndUpdate(
//             req.params.id,
//             updateData,
//             { new: true, runValidators: true }
//         );

//         if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
//         res.json(updatedProduct);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
// // DELETE product
// export const deleteProduct = async (req, res) => {
//     try {
//         const product = await Product.findByIdAndDelete(req.params.id);
//         if (!product) return res.status(404).json({ message: "Product not found" });
//         res.json({ message: "Product deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };