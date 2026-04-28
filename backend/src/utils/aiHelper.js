export async function getAISuggestion(prompt, systemPrompt) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: "claude-sonnet-4-5",
            max_tokens: 300,
            system: systemPrompt,
            messages: [{ role: "user", content: prompt }],
        }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || "";
}