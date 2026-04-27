// import api from "api";
import api from "../api";

// const API_URL = "http://localhost:3001/api/products";


export const getProducts = async () => {
    try {
        const response = await api.get("http://localhost:3001/api/products");
        // console.log("Data from Backend:", response.data); // ADD THIS LOG
        return response.data;
    } catch (error) {
        console.error("Fetch Error:", error);
        return [];
    }
};
