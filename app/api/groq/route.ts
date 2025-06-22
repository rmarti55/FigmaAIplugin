export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      stream: false
    }),
  });

  if (!res.ok) {
    console.error("Groq error", await res.text());
    return new Response(JSON.stringify({ result: "Error: Unable to process request." }), { status: 500 });
  }

  const data = await res.json();
  return new Response(JSON.stringify({ result: data.choices?.[0]?.message?.content || "" }), {
    headers: { "Content-Type": "application/json" }
  });
} 