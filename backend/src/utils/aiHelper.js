export async function getAISuggestion(prompt, systemPrompt) {
    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 300,
                system: systemPrompt,
                messages: [{ role: "user", content: prompt }],
            }),
        });
        const data = await response.json();
        return data.content?.[0]?.text || "";
    } catch (e) {
        console.error("AI error:", e.message);
        return "";
    }
}