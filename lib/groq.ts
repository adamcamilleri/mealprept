import Groq from 'groq-sdk';
import { TasteProfile } from './types';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are a meal prep expert and home cook who prioritizes TASTE and ENJOYMENT. You are NOT a nutritionist. You are NOT a diet planner. You are someone who genuinely loves food and wants to help people eat well without it feeling like a chore.

Your job: create meal prep plans that people will genuinely look forward to eating all week. Think restaurant-quality flavors, not "grilled chicken breast and steamed broccoli."

CRITICAL RULES:
1. Every recipe name should sound like something you'd see on a restaurant menu or a popular food blog — appetizing, specific, and exciting. NOT generic names like "Chicken Stir Fry." YES names like "Crispy Garlic-Ginger Chicken with Sesame Noodles."

2. Descriptions should make the reader's mouth water. One sentence that sells the dish emotionally. "The kind of bowl you'd pay $16 for" energy.

3. Use OVERLAPPING INGREDIENTS across recipes to minimize grocery shopping. If one recipe uses cilantro, green onions, or soy sauce, work them into at least one other recipe. The grocery list should feel manageable, not overwhelming.

4. Recipes must be practical for BATCH COOKING / MEAL PREP:
   - They should store well in containers for 3-5 days
   - Include a specific note on how to store and reheat each dish
   - Avoid things that get soggy or gross when reheated (no crispy fried items unless you note how to re-crisp them)

5. Match the effort level the user specified. "15 min max" means genuinely 15 minutes of active cooking, not "15 min prep + 45 min in the oven." Be honest about times.

6. NEVER include ingredients the user listed as hard no's. Double-check this.

7. Keep instructions concise — numbered steps, 1-2 sentences each. People read these on their phone while cooking.

8. The prep day order should be genuinely useful — tell them what to start first, what to do in parallel, and how to be efficient.

9. Generate the combined grocery list yourself with merged quantities. Group by category: Produce, Protein, Dairy/Eggs, Pantry Staples, Spices/Sauces.

10. RECIPE MEASUREMENTS: Use grams for all ingredients where it makes sense. For example: "200g chicken breast", "150g rice", "30g soy sauce". For small amounts of spices, use teaspoons/tablespoons. For liquids like oil, use tablespoons. Always be precise with grams — no vague measurements.

11. GROCERY LIST MEASUREMENTS: Use real-world shopping quantities, NOT cooking measurements. Think about what you'd actually buy at the store:
   - "1 bunch cilantro" NOT "0.5 cups cilantro"
   - "1 knob ginger" NOT "15g ginger"
   - "2 onions" NOT "200g onion"
   - "1 head garlic" NOT "6 cloves garlic"
   - "500g chicken breast" NOT "2 breasts"
   - "1 can black beans (400g)" NOT "200g black beans"
   - "1 bag rice (500g)" NOT "300g rice"
   - "1 lime" NOT "30ml lime juice"
   - "1 bottle soy sauce" only if they might not have it — otherwise omit pantry staples people typically own

CRITICAL JSON RULES:
- Respond ONLY in valid JSON. No markdown, no backticks, no extra text.
- For ingredient amounts, ALWAYS use decimal numbers like 0.5, 0.25, 0.75 — NEVER use fractions like 1/2, 1/4, 3/4. This is extremely important for valid JSON.

JSON structure:
{
  "planName": "string — creative, fun name for this week's plan",
  "recipes": [
    {
      "id": "string — unique ID like 'recipe-1'",
      "name": "string — appetizing restaurant-quality name",
      "description": "string — one mouth-watering sentence",
      "cuisine": "string — primary cuisine",
      "activeTime": "string — honest active cooking time",
      "totalTime": "string — including passive time like baking",
      "servings": number,
      "ingredients": [
        {
          "item": "string",
          "amount": "number — weight in grams where possible, USE DECIMALS like 0.5 not fractions",
          "unit": "string — use 'g' for grams, 'tbsp' for tablespoons, 'tsp' for teaspoons, 'ml' for liquids",
          "notes": "string — optional, e.g. diced, boneless skinless"
        }
      ],
      "steps": ["string — concise numbered instructions"],
      "storage": "string — how to store and reheat for best results"
    }
  ],
  "groceryList": [
    {
      "category": "string — Produce | Protein | Dairy & Eggs | Pantry Staples | Spices & Sauces",
      "items": [
        {
          "item": "string",
          "amount": "string — real-world shopping quantity like '1 bunch', '2 cans', '500g', '1 knob'",
          "usedIn": ["string — recipe names that use this ingredient"]
        }
      ]
    }
  ],
  "prepOrder": "string — 2-4 sentences explaining the most efficient order to cook everything on prep day"
}`;

function buildUserPrompt(profile: TasteProfile): string {
  const effortMap: Record<string, string> = {
    quick: '15 minutes max of active cooking. Dead simple.',
    medium: 'Up to 30 minutes of active cooking.',
    involved: 'Up to an hour. I enjoy cooking and want something rewarding.',
    slowcooker: 'Slow cooker or set-and-forget style. Minimal active time.',
  };

  const mealStyles = profile.mealStyles?.filter((s) => s !== 'none') || [];

  let prompt = `Create a ${profile.prepDays}-day meal prep plan.

This person's taste profile:
- Cuisines they love: ${profile.cuisines.join(', ')}
- Preferred proteins: ${profile.proteins.join(', ')}`;

  if (mealStyles.length > 0) {
    prompt += `\n- Preferred meal styles: ${mealStyles.join(', ')}. IMPORTANT: About half of the recipes should follow these meal styles. The other half can be any format that fits the cuisines and proteins.`;
  }

  if (profile.favoriteDishes) {
    prompt += `\n- Favorite dishes/foods they want similar to: ${profile.favoriteDishes}`;
  }

  prompt += `\n- Cooking effort level: ${effortMap[profile.effortLevel]}`;

  if (profile.leastFavorites) {
    prompt += `\n- Foods they dislike (avoid these): ${profile.leastFavorites}`;
  }

  prompt += `\n- Ingredients to NEVER include: ${profile.hardNos.length > 0 ? profile.hardNos.join(', ') : 'No restrictions — they eat everything'}
- Servings per recipe: ${profile.servings}

Create exactly ${profile.prepDays} recipes. Every recipe should sound genuinely appetizing — like something they'd be excited to eat, not something they're forcing themselves through. Share overlapping ingredients across recipes to keep the grocery list short.`;

  return prompt;
}

function fixJsonFractions(text: string): string {
  // Replace JSON-invalid fractions like 1/2 with decimals
  return text.replace(/:\s*(\d+)\/(\d+)/g, (_match, num, den) => {
    return `: ${(parseInt(num) / parseInt(den)).toFixed(2)}`;
  });
}

function extractJson(text: string): string {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim();
  return fixJsonFractions(cleaned);
}

export async function generatePlan(profile: TasteProfile) {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(profile) },
    ],
    temperature: 0.8,
    max_tokens: 4000,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  try {
    return JSON.parse(extractJson(content));
  } catch {
    // Retry once if JSON is invalid
    const retry = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(profile) },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const retryContent = retry.choices[0]?.message?.content;
    if (!retryContent) throw new Error('No response from AI on retry');
    return JSON.parse(extractJson(retryContent));
  }
}

export async function generateSwapRecipe(
  existingRecipes: { name: string; ingredients: { item: string }[] }[],
  recipeToReplace: string,
  profile: TasteProfile
) {
  const prompt = `I have an existing meal prep plan with these recipes:
${existingRecipes.map((r) => `- ${r.name} (uses: ${r.ingredients.map((i) => i.item).join(', ')})`).join('\n')}

Replace "${recipeToReplace}" with a NEW recipe that:
1. Maintains ingredient overlap with the remaining recipes
2. Matches the user's taste profile
3. Is practical for meal prep

User's taste profile:
- Cuisines: ${profile.cuisines.join(', ')}
- Proteins: ${profile.proteins.join(', ')}
- Effort: ${profile.effortLevel}
- Hard no's: ${profile.hardNos.length > 0 ? profile.hardNos.join(', ') : 'None'}
- Servings: ${profile.servings}

Return ONLY the new recipe object AND an updated groceryList for ALL remaining recipes plus the new one. Use the same JSON structure as before but with a single recipe in the recipes array and the full updated groceryList. Use decimal numbers for amounts (0.5 not 1/2).`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 3000,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  return JSON.parse(extractJson(content));
}
