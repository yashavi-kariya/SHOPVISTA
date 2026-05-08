import Settings from "../models/settingsModel.js";

// Helper: always returns the single settings document, creating it if missing
const getOrCreateSettings = async () => {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    return settings;
};

// GET /api/settings  — public (used by Cart and Checkout)
export const getSettings = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching settings" });
    }
};
// PUT /api/settings  — admin only
export const updateSettings = async (req, res) => {
    try {
        const { shippingCharge, freeShippingThreshold, couponTiers } = req.body;

        const settings = await getOrCreateSettings();

        if (shippingCharge !== undefined) settings.shippingCharge = Number(shippingCharge);
        if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = Number(freeShippingThreshold);
        if (couponTiers !== undefined) settings.couponTiers = couponTiers;

        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: "Error updating settings" });
    }
};