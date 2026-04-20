const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a supportive personal goals coach who helps the user reflect on progress and refine their goals using the SMART framework (Specific, Measurable, Achievable, Relevant, Time-bound).

Behavior rules:
- Keep replies short, warm, and conversational (2-4 sentences max).
- Ask one focused follow-up question per turn when you need more info.
- When the user shares progress, acknowledge it specifically before responding.
- When you propose new goals or refinements, ALWAYS call the suggest_goals tool with 1-3 SMART-compliant goals. Don't list goals in plain text.
- Each suggested goal must be Specific, Measurable, Achievable, Relevant to what the user said, and Time-bound (include a deadline like "this month", "in 30 days", "by Friday").
- Categories must be one of: fitness, finance, health, personal.
- Targets must be measurable (e.g. "0/30 days", "$0/$500", "0/10 miles").
- Don't propose goals on every turn — only when the user is ready or asks for them.`;

const tools = [
  {
    type: "function",
    function: {
      name: "suggest_goals",
      description:
        "Suggest 1-3 new SMART goals for the user based on the conversation. Only call when proposing concrete goals.",
      parameters: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "Short conversational message to accompany the suggestions (1-2 sentences).",
          },
          goals: {
            type: "array",
            minItems: 1,
            maxItems: 3,
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "SMART goal title with deadline included" },
                category: { type: "string", enum: ["fitness", "finance", "health", "personal"] },
                target: { type: "string", description: "Measurable target like '0/30 days' or '$0/$500'" },
              },
              required: ["title", "category", "target"],
              additionalProperties: false,
            },
          },
        },
        required: ["message", "goals"],
        additionalProperties: false,
      },
    },
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, currentGoals } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const goalsContext = Array.isArray(currentGoals) && currentGoals.length
      ? `\n\nUser's current goals:\n${currentGoals
          .map((g: any) => `- [${g.category}] ${g.title} — ${g.progress}% (${g.target})`)
          .join("\n")}`
      : "\n\nUser has no goals yet.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + goalsContext },
          ...messages,
        ],
        tools,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;
    let reply = choice?.content || "";
    let suggestedGoals: any[] = [];

    const toolCall = choice?.tool_calls?.[0];
    if (toolCall?.function?.name === "suggest_goals") {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        if (args.message) reply = args.message;
        if (Array.isArray(args.goals)) suggestedGoals = args.goals;
      } catch (e) {
        console.error("Failed to parse tool args:", e);
      }
    }

    return new Response(JSON.stringify({ reply, suggestedGoals }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("goals-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
