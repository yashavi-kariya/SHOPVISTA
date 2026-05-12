import api from "../api";
export const getProducts = async () => {
    try {
        const response = await api.get("/api/products");
        return response.data;
    } catch (error) {
        console.error("Fetch Error:", error);
        return [];
    }
};
