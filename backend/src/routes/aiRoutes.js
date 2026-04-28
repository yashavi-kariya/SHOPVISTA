import express from "express";
import { customerSuggest, adminSuggest } from "../controllers/aiController.js";

const router = express.Router();

router.post("/customer-suggest", customerSuggest);
router.post("/admin-suggest", adminSuggest);

export default router;