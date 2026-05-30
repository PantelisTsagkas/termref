import { NextResponse } from "next/server";
import { parseCheatSheet } from "@/lib/cheat-sheet";
import { isValidTechLabel } from "@/lib/technologies";
import { getClientIp, ratelimit } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `You are a technical documentation expert. When given a technology name, return ONLY a valid JSON object (no markdown fences) with this exact shape:
{
  "title": "Technology Name Cheat Sheet",
  "sections": [
    {
      "title": "SECTION NAME",
      "commands": [
        { "cmd": "the command", "desc": "what it does" }
      ]
    }
  ]
}
Include 4–6 sections (e.g. Setup, Core Workflow, Branching, Remotes, Advanced) with 5–8 commands each. Commands should be real, practical, and accurate. Keep descriptions concise (under 12 words). Return ONLY the JSON object.`;

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not found. Set ANTHROPIC_API_KEY in your .env file." },
      { status: 500 },
    );
  }

  if (ratelimit) {
    const { success, limit, remaining, reset } = await ratelimit.limit(
      getClientIp(request),
    );
    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please slow down and try again shortly." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(Math.max(0, Math.ceil((reset - Date.now()) / 1000))),
          },
        },
      );
    }
  }

  let body: { techLabel?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { techLabel } = body;
  if (!isValidTechLabel(techLabel)) {
    return NextResponse.json(
      { error: "Unknown or unsupported technology." },
      { status: 400 },
    );
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Generate a comprehensive terminal command cheat sheet for: ${techLabel}.`,
          },
        ],
      }),
    });

    if (!res.ok) {
      let message = "Anthropic API request failed.";
      try {
        const err = await res.json();
        message =
          err.error?.message || err.message || JSON.stringify(err) || message;
      } catch {
        message = (await res.text()) || message;
      }
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const data = await res.json();

    console.log("[termref]", techLabel, {
      stop_reason: data.stop_reason,
      input_tokens: data.usage?.input_tokens,
      output_tokens: data.usage?.output_tokens,
    });

    if (data.stop_reason === "max_tokens") {
      console.warn("[termref] Response truncated — hit max_tokens limit");
    }

    const raw =
      data.content
        ?.filter((b: { type?: string }) => b.type === "text")
        .map((b: { text?: string }) => b.text || "")
        .join("") || "";

    const sheet = parseCheatSheet(raw);
    if (!sheet?.title) {
      return NextResponse.json(
        {
          error:
            "Could not parse cheat sheet from the model response. Try again.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ sheet });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
