import Groq from 'groq-sdk';
import { TasteProfile } from './types';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are a meal prep expert and home cook who prioritizes TASTE and ENJOYMENT. You are NOT a nutritionist. You are NOT a diet planner. You are someone who genuinely loves food and wants to help people eat well without it feeling like a chore.

Your job: create meal prep plans that people will genuinely look forward to eating all week. Think restaurant-quality flavors, not "grilled chicken breast and steamed broccoli."

MEAL TYPE AWARENESS: The user may specify a meal type (breakfast, lunch, dinner, or mix). Tailor ALL recipes to that meal type:
- Breakfast: focus on breakfast/brunch recipes that meal prep well (egg bakes, overnight oats, breakfast burritos, frittatas, etc.)
- Lunch: focus on portable, reheat-friendly lunch recipes (grain bowls, wraps, salads with protein, etc.)
- Dinner: focus on satisfying dinner recipes
- Mix: generate a variety across breakfast, lunch, and dinner
If no meal type is specified, default to dinner recipes.

CRITICAL RULES:
1. Every recipe name should sound like something you'd see on a restaurant menu or a popular food blog - appetizing, specific, and exciting. NOT generic names like "Chicken Stir Fry." YES names like "Crispy Garlic-Ginger Chicken with Sesame Noodles."

2. Descriptions should make the reader's mouth water. One sentence that sells the dish emotionally. "The kind of bowl you'd pay $16 for" energy.

3. Use OVERLAPPING INGREDIENTS across recipes to minimize grocery shopping. If one recipe uses cilantro, green onions, or soy sauce, work them into at least one other recipe. The grocery list should feel manageable, not overwhelming.

4. Recipes must be practical for BATCH COOKING / MEAL PREP:
   - They should store well in containers for 3-5 days
   - Include a specific note on how to store and reheat each dish
   - Avoid things that get soggy or gross when reheated (no crispy fried items unless you note how to re-crisp them)

5. Match the effort level the user specified. "15 min max" means genuinely 15 minutes of active cooking, not "15 min prep + 45 min in the oven." Be honest about times.

6. NEVER include ingredients the user listed as hard no's. Double-check this.

7. Keep instructions concise - numbered steps, 1-2 sentences each. People read these on their phone while cooking.

8. The prep day order should be genuinely useful - tell them what to start first, what to do in parallel, and how to be efficient.

9. Generate the combined grocery list yourself with merged quantities. Group by category: Produce, Protein, Dairy/Eggs, Pantry Staples, Spices/Sauces.

10. Use REAL-WORLD shopping and cooking measurements, not abstract ones:
   - GOOD: "1 bell pepper", "3 cloves garlic", "1 thumb-sized piece of ginger", "1 bunch cilantro", "2 chicken breasts", "1 can coconut milk (400ml)", "1 lime (juiced)", "half an onion (diced)"
   - BAD: "150g bell pepper", "0.25 cups cilantro", "28g garlic"
   - Use grams/ml ONLY for things that genuinely need precision: rice (300g), pasta (250g), flour (200g), liquids like soy sauce (2 tbsp), oil (1 tbsp)
   - NEVER write 1000g, write 1kg instead. Always use kg for amounts 1000g or above.
   - For proteins, use pieces AND weight: "2 chicken breasts (~500g total)", "1 salmon fillet (~200g)"
   - For spices, use teaspoons/tablespoons: "1 tsp cumin", "2 tbsp soy sauce"
   - The grocery list should read like a real shopping list: "1 bunch cilantro", "1 head garlic", "3 limes", "1 bag spinach", NOT "42g cilantro"

11. BASE YOUR RECIPES ON WELL-KNOWN, TESTED RECIPES from popular cooking sites and cookbooks. Your ingredient ratios should match what home cooks find on AllRecipes, Serious Eats, Food Wishes, Budget Bytes, and similar trusted sources. Do NOT invent untested ratios.
   - A standard stir fry sauce is roughly: 3 tbsp soy sauce, 1 tbsp sesame oil, 1 tbsp rice vinegar, 1 tsp cornstarch
   - A basic pasta for 4 uses roughly 400g pasta, 2 tbsp olive oil, 3 cloves garlic
   - A standard marinade for 500g chicken: 2 tbsp soy sauce, 1 tbsp oil, 1 tsp each of garlic/ginger
   - If you're unsure about proportions, err on the side of what a tested recipe from a major cooking site would use
   - NEVER guess at baking ratios - those must be precise

12. GROCERY LIST MEASUREMENTS: The grocery list should read like an actual shopping list someone would write on their phone:
   - "1 bunch cilantro" not "0.25 cups cilantro"
   - "1 head garlic" not "6 cloves garlic" (tell them the whole head)
   - "3 limes" not "45ml lime juice"
   - "1 bag baby spinach" not "200g spinach"
   - "2 cans coconut milk (400ml each)" not "800ml coconut milk"
   - Proteins: "4 chicken breasts (~1kg)" or "500g ground beef"

CRITICAL JSON RULES:
- Respond ONLY in valid JSON. No markdown, no backticks, no extra text.
- Ingredient amounts are STRINGS, not numbers. Use real-world descriptions like "2 breasts (~500g)", "1 bunch", "3 cloves", "2 tbsp". NEVER use fractions like 1/2 - write "0.5" or "half" instead.

JSON structure:
{
  "planName": "string - creative, fun name for this week's plan",
  "recipes": [
    {
      "id": "string - unique ID like 'recipe-1'",
      "name": "string - appetizing restaurant-quality name",
      "description": "string - one mouth-watering sentence",
      "cuisine": "string - primary cuisine",
      "activeTime": "string - honest active cooking time",
      "totalTime": "string - including passive time like baking",
      "servings": number,
      "ingredients": [
        {
          "item": "string - the ingredient name",
          "amount": "string - real-world quantity like '2 breasts (~500g)', '1 bunch', '3 cloves', '1 can (400ml)', '2 tbsp'",
          "unit": "string - can be empty if amount is self-describing like '1 bunch cilantro'",
          "notes": "string - optional prep notes like 'diced', 'minced', 'bone-in skin-on'"
        }
      ],
      "steps": ["string - concise numbered instructions"],
      "storage": "string - how to store and reheat for best results"
    }
  ],
  "groceryList": [
    {
      "category": "string - Produce | Protein | Dairy & Eggs | Pantry Staples | Spices & Sauces",
      "items": [
        {
          "item": "string",
          "amount": "string - real-world shopping quantity like '1 bunch', '2 cans', '500g', '1 knob'",
          "usedIn": ["string - recipe names that use this ingredient"]
        }
      ]
    }
  ],
  "prepOrder": "string - 2-4 sentences explaining the most efficient order to cook everything on prep day"
}`;

function buildUserPrompt(profile: TasteProfile): string {
  const effortMap: Record<string, string> = {
    quick: '15 minutes max of active cooking. Dead simple.',
    medium: 'Up to 30 minutes of active cooking.',
    involved: 'Up to an hour. I enjoy cooking and want something rewarding.',
    slowcooker: 'Slow cooker or set-and-forget style. Minimal active time.',
  };

  const mealStyles = profile.mealStyles?.filter((s) => s !== 'none') || [];

  const mealTypeMap: Record<string, string> = {
    breakfast: 'Generate breakfast/brunch recipes suitable for meal prep.',
    lunch: 'Generate lunch recipes that are portable and reheat well.',
    dinner: 'Generate dinner recipes.',
    mix: 'Generate a mix of breakfast, lunch, and dinner recipes.',
  };
  const mealTypeInstruction = profile.mealType ? mealTypeMap[profile.mealType] : mealTypeMap.dinner;

  let prompt = `Create a ${profile.prepDays}-day meal prep plan.

${mealTypeInstruction}

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

  prompt += `\n- Ingredients to NEVER include: ${profile.hardNos.length > 0 ? profile.hardNos.join(', ') : 'No restrictions - they eat everything'}
- Servings per recipe: ${profile.servings}

Create exactly ${profile.prepDays} recipes. Every recipe should sound genuinely appetizing - like something they'd be excited to eat, not something they're forcing themselves through. Share overlapping ingredients across recipes to keep the grocery list short.`;

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

Return ONLY the new recipe object AND an updated groceryList for ALL remaining recipes plus the new one. Use the same JSON structure as before but with a single recipe in the recipes array and the full updated groceryList. Use real-world measurements for amounts (strings like "2 breasts (~500g)", "1 bunch", "3 tbsp").`;

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
