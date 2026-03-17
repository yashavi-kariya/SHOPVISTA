// src/data/categoryData.js

import product2 from "../assets/img/product/w-jeans2.jpg";
import product3 from "../assets/img/product/product-3.jpg";
import product4 from "../assets/img/product/product-4.jpg";
import product6 from "../assets/img/product/product-6.jpg";

// ===============================
// CATEGORY DATA
// ===============================
export const categoryData = {
    women: {
        title: "Women's Fashion",
        banner: product2,
        products: [
            {
                id: 101,
                name: "jeans",
                price: 1000,
                images: [product2, product3, product4],
                colors: ["red", "blue", "black"],
                sizes: ["S", "M", "L", "XL"],
                rating: 4.5,
                description: "trendy jeans for women .",
                stock: 12,
                category: "women"
            },
            {
                id: 102,
                name: "Women's Stylish Top",
                price: 45,
                images: [product3, product4],
                colors: ["yellow", "white"],
                sizes: ["S", "M", "L"],
                rating: 4.0,
                description: "Trendy casual top suitable for all outings.",
                stock: 20,
                category: "women"
            }
        ]
    },

    men: {
        title: "Men's Fashion",
        banner: product4,
        products: [
            {
                id: 201,
                name: "Men's Jacket",
                price: 120,
                images: [product4, product6],
                colors: ["black", "grey"],
                sizes: ["M", "L", "XL"],
                rating: 4.7,
                description: "Warm and stylish jacket perfect for winter.",
                stock: 15,
                category: "men"
            },
            {
                id: 202,
                name: "Men's Formal Shirt",
                price: 55,
                images: [product6, product3],
                colors: ["white", "skyblue"],
                sizes: ["S", "M", "L"],
                rating: 4.3,
                description: "Comfortable and high-quality cotton shirt.",
                stock: 30,
                category: "men"
            }
        ]
    },

    bags: {
        title: "Bags & Luggage",
        banner: product3,
        products: [
            {
                id: 301,
                name: "Hand Bag",
                price: 80,
                images: [product3, product2],
                colors: ["brown", "black"],
                sizes: ["Standard"],
                rating: 4.2,
                description: "Elegant handbag perfect for daily use.",
                stock: 10,
                category: "bags"
            },
            {
                id: 302,
                name: "Travel Bag",
                price: 100,
                images: [product2, product4],
                colors: ["grey", "blue"],
                sizes: ["Standard"],
                rating: 4.4,
                description: "Spacious travel bag with multiple compartments.",
                stock: 18,
                category: "bags"
            }
        ]
    },

    shoes: {
        title: "Shoes Collection",
        banner: product6,
        products: [
            {
                id: 401,
                name: "Running Shoes",
                price: 90,
                images: [product6, product4],
                colors: ["black", "white"],
                sizes: ["7", "8", "9", "10"],
                rating: 4.6,
                description: "Lightweight & breathable running shoes.",
                stock: 25,
                category: "shoes"
            },
            {
                id: 402,
                name: "Casual Shoes",
                price: 75,
                images: [product4, product3],
                colors: ["blue", "grey"],
                sizes: ["6", "7", "8", "9"],
                rating: 4.1,
                description: "Comfortable casual shoes for daily use.",
                stock: 22,
                category: "shoes"
            }
        ]
    },

    accessories: {
        title: "Accessories",
        banner: product2,
        products: [
            {
                id: 501,
                name: "Premium Wrist Watch",
                price: 150,
                images: [product2, product6],
                colors: ["silver", "black"],
                sizes: ["Standard"],
                rating: 4.8,
                description: "Stylish stainless steel wrist watch.",
                stock: 8,
                category: "accessories"
            },
            {
                id: 502,
                name: "Sunglasses",
                price: 60,
                images: [product3, product4],
                colors: ["black", "brown"],
                sizes: ["Standard"],
                rating: 4.3,
                description: "UV-protected sunglasses with premium build.",
                stock: 16,
                category: "accessories"
            }
        ]
    }
};

// ===============================
// GLOBAL PRODUCT LIST — FLAT ARRAY
// ===============================
export const allProducts = Object.values(categoryData)
    .flatMap((cat) => cat.products)
    .map((product) => ({
        ...product,
        img: product.images[0] // first image = main thumbnail
    }));

// ===============================
// GET PRODUCT BY ID
// ===============================
export const getProductById = (id) => {
    for (let category in categoryData) {
        const product = categoryData[category].products.find(
            (item) => item.id === Number(id)
        );
        if (product) return product;
    }
    return null;
};