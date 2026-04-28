console.log("API KEY loaded:", !!process.env.ANTHROPIC_API_KEY);
export async function getAISuggestion(prompt, systemPrompt) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: "llama-3.1-8b-instant", // free model
            max_tokens: 300,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
        }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
}