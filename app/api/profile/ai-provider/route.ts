import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encryptApiKey } from "@/lib/api-key-crypto";

const ALLOWED_PROVIDERS = ["gemini", "openai"] as const;

type Provider = (typeof ALLOWED_PROVIDERS)[number];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const action =
      body?.action ?? "save_key";

    const provider =
      body?.provider;

    if (
      provider !== "gemini" &&
      provider !== "openai"
    ) {
      return NextResponse.json(
        { error: "Invalid AI provider." },
        { status: 400 }
      );
    }

    /*
     * Switch the active provider without
     * changing the stored API key.
     */
    if (action === "switch_provider") {
      const { data: existingKey, error: keyError } =
        await supabase
          .from("user_api_keys")
          .select("id")
          .eq("user_id", user.id)
          .eq("provider", provider)
          .maybeSingle();

      if (keyError) {
        console.error(
          "Failed to check provider key:",
          keyError
        );

        return NextResponse.json(
          {
            error:
              "Failed to check provider configuration.",
          },
          { status: 500 }
        );
      }

      if (!existingKey) {
        return NextResponse.json(
          {
            error:
              `No ${provider === "openai" ? "OpenAI" : "Gemini"} API key is configured.`,
          },
          { status: 400 }
        );
      }

      const { error: profileError } =
        await supabase
          .from("profiles")
          .update({
            ai_provider: provider,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", user.id);

      if (profileError) {
        console.error(
          "Failed to switch AI provider:",
          profileError
        );

        return NextResponse.json(
          {
            error:
              "Failed to switch AI provider.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        provider,
      });
    }

    /*
     * Save a new API key.
     */
    if (action === "save_key") {
      const apiKey =
        typeof body?.apiKey === "string"
          ? body.apiKey.trim()
          : "";

      if (!apiKey) {
        return NextResponse.json(
          { error: "API key is required." },
          { status: 400 }
        );
      }

      if (apiKey.length < 10) {
        return NextResponse.json(
          { error: "Invalid API key." },
          { status: 400 }
        );
      }

      const encryptedKey =
        encryptApiKey(apiKey);

      const { error: keyError } =
        await supabase
          .from("user_api_keys")
          .upsert(
            {
              user_id: user.id,
              provider,
              api_key: encryptedKey,
              updated_at:
                new Date().toISOString(),
            },
            {
              onConflict:
                "user_id,provider",
            }
          );

      if (keyError) {
        console.error(
          "Failed to save AI API key:",
          keyError
        );

        return NextResponse.json(
          {
            error:
              "Failed to save API key.",
          },
          { status: 500 }
        );
      }

      /*
       * Saving a key automatically makes
       * that provider active.
       */
      const { error: profileError } =
        await supabase
          .from("profiles")
          .update({
            ai_provider: provider,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", user.id);

      if (profileError) {
        console.error(
          "Failed to update AI provider:",
          profileError
        );

        return NextResponse.json(
          {
            error:
              "API key saved, but provider update failed.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        provider,
      });
    }

    return NextResponse.json(
      { error: "Invalid action." },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "AI provider API error:",
      error
    );

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("ai_provider")
        .eq("id", user.id)
        .single();

    if (profileError) {
      console.error(
        "Failed to load AI provider:",
        profileError
      );

      return NextResponse.json(
        { error: "Failed to load AI provider." },
        { status: 500 }
      );
    }

    const { data: keys, error: keysError } =
      await supabase
        .from("user_api_keys")
        .select("provider")
        .eq("user_id", user.id);

    if (keysError) {
      console.error(
        "Failed to load API key status:",
        keysError
      );

      return NextResponse.json(
        { error: "Failed to load API key status." },
        { status: 500 }
      );
    }

    const configuredProviders =
      (keys ?? []).map(
        (key) => key.provider
      );

    return NextResponse.json({
      activeProvider:
        profile?.ai_provider ?? "gemini",

      configuredProviders,
    });
  } catch (error) {
    console.error(
      "AI provider GET error:",
      error
    );

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}