import { createCipheriv, createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Provider = "gemini" | "openai";

function encryptApiKey(apiKey: string) {
  const secret = process.env.API_KEY_ENCRYPTION_SECRET;

  if (!secret) {
    throw new Error(
      "API_KEY_ENCRYPTION_SECRET is not configured."
    );
  }

  const encryptionKey = createHash("sha256")
    .update(secret)
    .digest();

  const iv = randomBytes(12);

  const cipher = createCipheriv(
    "aes-256-gcm",
    encryptionKey,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(apiKey, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export async function POST(request: Request) {
  try {
    // -----------------------------------------------------
    // Authentication
    // -----------------------------------------------------

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          valid: false,
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    // -----------------------------------------------------
    // Request
    // -----------------------------------------------------

    const body = await request.json();

    const provider = body.provider as Provider;

    const apiKey =
      typeof body.apiKey === "string"
        ? body.apiKey.trim()
        : "";

    if (
      provider !== "gemini" &&
      provider !== "openai"
    ) {
      return NextResponse.json(
        {
          valid: false,
          error: "Unsupported AI provider.",
        },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          valid: false,
          error: "Please enter your API key.",
        },
        { status: 400 }
      );
    }

    if (apiKey.length < 10) {
      return NextResponse.json(
        {
          valid: false,
          error: "The API key appears to be invalid.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------------
    // Validate provider key
    // -----------------------------------------------------

    let validationError = "";

    if (provider === "gemini") {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Reply with exactly: OK",
                  },
                ],
              },
            ],
          }),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const status = response.status;

        if (status === 401 || status === 403) {
          validationError =
            "This Gemini API key is invalid or not authorized.";
        } else if (status === 429) {
          validationError =
            "The Gemini API key is valid, but the provider reported a quota or rate-limit issue.";
        } else {
          validationError =
            "Gemini could not verify this API key right now. Please try again.";
        }
      }
    }

    if (provider === "openai") {
      const response = await fetch(
        "https://api.openai.com/v1/models",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const status = response.status;

        if (status === 401 || status === 403) {
          validationError =
            "This OpenAI API key is invalid or not authorized.";
        } else if (status === 429) {
          validationError =
            "The OpenAI API key is valid, but the provider reported a quota or rate-limit issue.";
        } else {
          validationError =
            "OpenAI could not verify this API key right now. Please try again.";
        }
      }
    }

    // -----------------------------------------------------
    // Validation failed
    // -----------------------------------------------------

    if (validationError) {
      return NextResponse.json({
        valid: false,
        provider,
        error: validationError,
      });
    }

    // -----------------------------------------------------
    // Encrypt the API key
    // -----------------------------------------------------

    const encryptedKey = encryptApiKey(apiKey);

    // -----------------------------------------------------
    // Check current Premium source
    // -----------------------------------------------------

    const { data: profile, error: profileReadError } =
      await supabase
        .from("profiles")
        .select("plan, premium_source")
        .eq("id", user.id)
        .single();

    if (profileReadError) {
      console.error(
        "Profile lookup error:",
        profileReadError
      );

      return NextResponse.json(
        {
          valid: false,
          error:
            "Unable to update your Premium status right now.",
        },
        { status: 500 }
      );
    }

    // -----------------------------------------------------
    // Save encrypted API key
    // -----------------------------------------------------

    const { error: keyError } = await supabase
      .from("user_api_keys")
      .upsert(
        {
          user_id: user.id,
          provider,
          encrypted_key: encryptedKey,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,provider",
        }
      );

    if (keyError) {
      console.error(
        "API key storage error:",
        keyError
      );

      return NextResponse.json(
        {
          valid: false,
          error:
            "The API key was verified, but EdgeCheck could not securely save it.",
        },
        { status: 500 }
      );
    }

    // -----------------------------------------------------
    // Upgrade to Premium
    // -----------------------------------------------------
    //
    // If the user already has Stripe Premium,
    // keep Stripe as the source.
    //

    if (
      profile.plan !== "premium" ||
      profile.premium_source !== "stripe"
    ) {
      const { error: planError } = await supabase
        .from("profiles")
        .update({
          plan: "premium",
          premium_source: "api_key",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (planError) {
        console.error(
          "Premium upgrade error:",
          planError
        );

        // Remove the saved key if Premium activation
        // failed, so we don't leave a partially completed
        // BYOK setup.
        await supabase
          .from("user_api_keys")
          .delete()
          .eq("user_id", user.id)
          .eq("provider", provider);

        return NextResponse.json(
          {
            valid: false,
            error:
              "The API key was verified, but Premium could not be activated.",
          },
          { status: 500 }
        );
      }
    }

    // -----------------------------------------------------
    // Success
    // -----------------------------------------------------

    return NextResponse.json({
      valid: true,
      provider,
      premium: true,
      premium_source:
        profile.premium_source === "stripe"
          ? "stripe"
          : "api_key",
      message:
        "API key verified and Premium activated.",
    });
  } catch (error) {
    console.error(
      "API key validation error:",
      error
    );

    return NextResponse.json(
      {
        valid: false,
        error:
          "Unable to verify the API key right now. Please try again.",
      },
      { status: 500 }
    );
  }
}