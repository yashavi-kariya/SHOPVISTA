// import api from "api";
import api from "../api";

// const API_URL = "/api/products";


export const getProducts = async () => {
    try {
        const response = await api.get("/api/products");
        // console.log("Data from Backend:", response.data); // ADD THIS LOG
        return response.data;
    } catch (error) {
        console.error("Fetch Error:", error);
        return [];
    }
};
