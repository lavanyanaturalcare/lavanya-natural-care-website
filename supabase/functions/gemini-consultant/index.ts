// =====================================================================
// ONZNATURAL — Secure Supabase Edge Function: Gemini Botanical AI
// Secure server-side execution with rate limiting, input sanitization,
// and strict verified product catalogue grounding.
// =====================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

// In-memory rate limiter per IP / session (window: 5 minutes, max 20 calls)
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

const checkRateLimit = (key: string): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || now > record.expiresAt) {
    rateLimitMap.set(key, { count: 1, expiresAt: now + 5 * 60 * 1000 });
    return true;
  }
  if (record.count >= 20) {
    return false;
  }
  record.count += 1;
  return true;
};

// ONZNATURAL Verified Product Catalogue Grounding
const ONZ_CATALOGUE = `
1. Neem & Tulsi Soap (ID: "neem-tulsi-soap" | Price: ₹99 | Net: 100 gm / 3.52 oz | Ingredients: Coconut, Mahua, Neem, Kokum Butter, Sunflower, Castor oils, Neem & Tulsi powder, Clay | Best For: Oily, Blemish-Prone Skin)
2. Kesuda Palash Soap (ID: "kesuda-palash-soap" | Price: ₹99 | Net: 100 gm / 3.52 oz | Ingredients: Coconut, Mahua, Kokum Butter, Sunflower, Castor oils, Kesuda Palash flower infusion | Best For: Sensitive, Sun-Exposed, Prickly Heat Skin)
3. Hibiscus Soap (ID: "hibiscus-soap" | Price: ₹99 | Net: 100 gm / 3.52 oz | Ingredients: Coconut, Mahua, Kokum Butter, Sunflower, Castor oils, Hibiscus powder, Clay | Best For: Normal to Dry, Mature, Dull Skin)
4. Ubtan Soap (ID: "ubtan-soap" | Price: ₹99 | Net: 100 gm / 3.52 oz | Ingredients: Coconut, Mahua, Sunflower, Castor oils, Besan, Haldi, Milk, Multani Mitti | Best For: All Skin Types, Tan Removal, Bridal Glow)
5. Charcoal Rice Soap (ID: "charcoal-rice-soap" | Price: ₹99 | Net: 100 gm / 3.52 oz | Ingredients: Coconut, Mahua, Kokum Butter, Sunflower, Castor oils, Activated Charcoal, Rice powder | Best For: Oily, Congested Pores)
6. Aparajita Body Lotion (ID: "aparajita-body-lotion" | Price: ₹599 | Net: 150 ml | Ingredients: Butterfly Pea flower extract, Sunflower & Rice Bran oils, Shea butter | Best For: Normal, Dry, Dull Skin)
7. Lavender Body Lotion (ID: "lavender-body-lotion" | Price: ₹599 | Net: 150 ml | Ingredients: French Lavender essential oil, Almond & Sunflower oils, Shea butter | Best For: Evening Relaxation, Dry Skin)
8. Honey Almond Body Lotion (ID: "honey-almond-body-lotion" | Price: ₹599 | Net: 150 ml | Ingredients: Pure Honey, Sweet Almond oil, Shea butter | Best For: Rough, Dry Skin)
9. Kesuda Body Lotion (ID: "kesuda-body-lotion" | Price: ₹599 | Net: 150 ml | Ingredients: Kesuda Palash flower infusion, Sunflower oil, Shea butter | Best For: Summer Heat, Sun-Exposed Skin)
10. Aparajita Body Cream (ID: "aparajita-body-cream" | Price: ₹399 | Net: 100 gm | Ingredients: Butterfly Pea distilled water, Sunflower & Rice Bran oils, Shea butter | Best For: Extremely Dry Body Skin)
11. Kesuda Palash Body Cream (ID: "kesuda-palash-body-cream" | Price: ₹399 | Net: 100 gm | Ingredients: Kesuda extract, Shea butter, Vitamin E | Best For: Dry, Sensitive, Sun-Stressed Skin)
12. Honey Almond Body Cream (ID: "honey-almond-body-cream" | Price: ₹399 | Net: 100 gm | Ingredients: Honey, Sweet Almond oil, Shea butter | Best For: Rough, Flaking Skin)
13. Neem Tulsi Face & Body Wash (ID: "face-body-wash-neem-tulsi" | Price: ₹599 | Net: 300 ml | Ingredients: Saponified Coconut, Mahua, Sunflower, Castor, Neem oils, Tulsi | Best For: Oily, Acne-Prone Face & Body)
14. Kesuda Face & Body Wash (ID: "face-body-wash-kesuda" | Price: ₹599 | Net: 300 ml | Ingredients: Saponified oils, Kesuda flower water, Glycerin | Best For: Heat-Sensitive, Normal Skin)
15. Lemon Hand Wash (ID: "hand-wash-lemon" | Price: ₹599 | Net: 300 ml | Ingredients: Saponified oils, Lemon essential oil, Glycerin | Best For: Frequent Handwashing)
16. Rice Aloe Face Cream (ID: "rice-aloe-face-cream" | Price: ₹399 | Net: 100 gm | Ingredients: Aloe Vera, Rice starch, Jojoba oil | Best For: Daily Facial Hydration, Brightening)
17. Natural Lip Balm (ID: "lip-balm" | Price: ₹70 | Net: 10 g | Ingredients: Coconut, Almond oils, Shea butter, Beeswax | Best For: Dry, Chapped Lips)
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: "Too many consultation requests. Please wait a moment before trying again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, message, history, language, quizAnswers, product1Id, product2Id } = await req.json();

    // Input length limit
    if (message && typeof message === 'string' && message.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Message exceeds maximum allowed length of 1000 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ 
          error: "AI service configuration is undergoing maintenance. Please consult our team directly on WhatsApp (+91 97267 39515).",
          maintenance: true 
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lang = language === 'hi' ? 'Hindi' : language === 'gu' ? 'Gujarati' : 'English';

    const systemPrompt = `You are 'ONZNATURAL Botanical AI', an artisanal cold-process skincare consultant for the brand 'ONZNATURAL' (Vadodara, Gujarat, India).
BRAND PHILOSOPHY: 100% plant-based oils, traditional Ayurvedic botanicals, artisanal cold-process curing, zero sulfates/parabens, retained natural vegetable glycerin.

MANDATORY CATALOGUE (STRICT GROUNDING — ONLY RECOMMEND PRODUCTS FROM THIS LIST, NEVER INVENT NEW NAMES, SIZES, OR PRICES):
${ONZ_CATALOGUE}

MEDICAL & SAFETY RULES:
1. NEVER diagnose skin conditions (eczema, psoriasis, dermatitis, cystic acne).
2. NEVER claim to cure or treat medical conditions.
3. NEVER guarantee results.
4. ALWAYS advise a 24-hour inner wrist patch test before full use.
5. If medical concern arises, politely suggest consulting a board-certified dermatologist.
6. Reply fluently in ${lang}.
7. Append JSON array of recommended product IDs at the very end in format: [RECOMMENDED_IDS: "id1", "id2"].`;

    let userPrompt = message || "";
    if (action === 'quiz' && quizAnswers) {
      userPrompt = `Please formulate a personalized ONZNATURAL routine for:
- Skin Type: ${quizAnswers.skinType}
- Primary Concern: ${quizAnswers.primaryConcern}
- Known Sensitivities: ${quizAnswers.knownSensitivity}
- Climate/Season: ${quizAnswers.climateSeason}
- Routine Preference: ${quizAnswers.routinePreference}
Language: ${lang}`;
    } else if (action === 'compare' && product1Id && product2Id) {
      userPrompt = `Compare these two ONZNATURAL products side-by-side in terms of key actives, skin benefits, price, and ideal skin types: "${product1Id}" and "${product2Id}".`;
    }

    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.slice(-8).forEach((h: any) => {
        contents.push({
          role: h.role === 'model' || h.role === 'ai' ? 'model' : 'user',
          parts: [{ text: h.text || h.message_content || '' }]
        });
      });
    }
    contents.push({ role: 'user', parts: [{ text: userPrompt }] });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
    const geminiResp = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1000
        }
      })
    });

    if (!geminiResp.ok) {
      const errText = await geminiResp.text();
      console.error("Gemini upstream error:", errText);
      return new Response(
        JSON.stringify({ error: "Upstream botanical service is currently busy. Please try again shortly." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await geminiResp.json();
    let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Thank you for reaching out to ONZNATURAL. How can we assist your skincare journey?";

    // Extract recommended product IDs
    const recommendedProductIds: string[] = [];
    const match = rawText.match(/\[RECOMMENDED_IDS:\s*([^\]]+)\]/i);
    if (match) {
      const idsRaw = match[1];
      const parsed = idsRaw.split(',').map((s: string) => s.replace(/["']/g, '').trim()).filter(Boolean);
      parsed.forEach((id: string) => {
        if (!recommendedProductIds.includes(id)) recommendedProductIds.push(id);
      });
      rawText = rawText.replace(/\[RECOMMENDED_IDS:[^\]]+\]/i, '').trim();
    }

    return new Response(
      JSON.stringify({
        text: rawText,
        recommendedProductIds
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please contact ONZNATURAL support." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
