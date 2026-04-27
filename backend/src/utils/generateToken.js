import jwt from "jsonwebtoken";

const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: "10d" }
    );
};

export default generateToken;