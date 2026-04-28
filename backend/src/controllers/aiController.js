import { getAISuggestion } from "../utils/aiHelper.js";

export const customerSuggest = async (req, res) => {
    try {
        const { topic } = req.body;
        const systemPrompt = `You are a helpful assistant that writes concise, polite contact form messages for customers. 
Keep suggestions under 80 words. Be professional but friendly. Return only the message text, no quotes.`;

        const suggestion = await getAISuggestion(
            `Write a contact form message about: ${topic || "a general inquiry"}`,
            systemPrompt
        );
        res.json({ suggestion });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const adminSuggest = async (req, res) => {
    try {
        const { customerName, customerMessage } = req.body;
        const systemPrompt = `You are a customer support agent writing professional, empathetic replies to customer inquiries. 
Keep replies under 100 words. Be helpful and specific. Return only the reply text, no salutation or sign-off needed.`;

        const suggestion = await getAISuggestion(
            `Customer ${customerName} wrote: "${customerMessage}"\n\nWrite a helpful reply:`,
            systemPrompt
        );
        res.json({ suggestion });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};