import React, { createContext, useEffect, useState } from "react";

export const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
    const [compare, setCompare] = useState(() => {
        const saved = localStorage.getItem("compare");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("compare", JSON.stringify(compare));
    }, [compare]);

    const toggleCompare = (product) => {
        setCompare((prev) => {
            const exists = prev.find((p) => p.id === product.id);

            if (exists) {
                return prev.filter((p) => p.id !== product.id);
            } else {
                return [...prev, product];
            }
        });
    };

    const isInCompare = (id) => compare.some((p) => p.id === id);

    return (
        <CompareContext.Provider value={{ compare, toggleCompare, isInCompare }}>
            {children}
        </CompareContext.Provider>
    );
};