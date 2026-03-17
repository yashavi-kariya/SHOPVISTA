import axios from "axios";

// const API_URL = "http://localhost:3001/api/products";


export const getProducts = async () => {
    try {
        const response = await axios.get("http://localhost:3001/api/products");
        // console.log("Data from Backend:", response.data); // ADD THIS LOG
        return response.data;
    } catch (error) {
        console.error("Fetch Error:", error);
        return [];
    }
};
