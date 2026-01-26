async function deepSeekChat(prompt) {
  const apiKey = "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"; // <--- put your key here
  const url = "https://api.deepseek.com/chat/completions";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`, // required auth
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        stream: false
      }),
    });

    // check for HTTP errors
    if (response.status === 401) {
      throw new Error("Unauthorized — API key invalid or missing.");
    }
    if (response.status === 403) {
      throw new Error("Forbidden — you might not have permission to this resource.");
    }
    if (response.status === 429) {
      throw new Error("Rate limit exceeded — slow down requests.");
    }
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.log("DeepSeek response:", data);
    return data;

  } catch (error) {
    console.error("DeepSeek API error:", error.message);
    return null;
  }
}

// Example usage:
deepSeekChat("Hello World!")
  .then(result => {
    if (result) {
      console.log("Assistant said:", result.choices?.[0]?.message?.content);
    }
  });
