# CLAUDE.md — Full Product Spec for mealprept

---

## WHAT TO BUILD

Build a complete, production-ready micro-SaaS web app called **mealprept**. 

mealprept is a meal prep planner that starts with what users actually enjoy eating — not calories or macros. Users take a short visual taste quiz, and the app generates a weekly meal prep plan with recipes they'll genuinely look forward to, plus a combined grocery list. 

The tagline: "Meal prep that doesn't suck."

This needs to be shippable. Not a prototype, not a demo — a real product that real people can sign up for and pay for.

---

## ARCHITECTURE DECISIONS (follow these exactly)

### Deployment
- **Platform**: Vercel (free tier)
- **Domain**: Deploy as a standalone Vercel project. Use the default *.vercel.app URL for now. Custom domain will be connected later.
- **NOT a mobile app**. This is a web app that works great on mobile browsers. No App Store needed.
- **This is its own standalone project** — not part of any other site or portfolio.

### Tech Stack
- **Framework**: Next.js 14+ with App Router (TypeScript)
- **Styling**: Tailwind CSS
- **Database**: Supabase (free tier — 500MB storage, 50k rows, built-in auth)
- **Auth**: Supabase Auth with Google OAuth + email/password
- **AI**: Groq API (free tier) using `llama-3.1-70b-versatile` model
  - Groq is OpenAI-compatible — use the `groq-sdk` npm package or just use the OpenAI SDK with base URL `https://api.groq.com/openai/v1`
  - Free tier: 30 requests/min, 14,400 requests/day — more than enough
  - No credit card required
- **Payments**: Stripe (integrate from the start, but can be toggled off initially)

### Environment Variables Needed
Create a `.env.local.example` file with all of these listed:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PRICE_ID=
NEXT_PUBLIC_APP_URL=
```

---

## PRODUCT SPEC

### Page Structure (keep it minimal)
```
/ ..................... Landing page + Quiz (same page)
/plan ................. Generated meal plan view (requires auth)  
/plans ................ Saved plans history (requires auth)
/settings ............. Account + subscription management
/api/generate-plan .... AI plan generation endpoint
/api/swap-recipe ...... Single recipe swap endpoint
/api/webhooks/stripe .. Stripe webhook handler
```

### The Quiz (this IS the landing page)

The landing page should have a brief hero section (2-3 lines max explaining what mealprept does), then immediately flow into the quiz. The quiz IS the product demo — people should be able to take it without signing up.

**Quiz steps (6 steps, one at a time, progress bar at top):**

**Step 1: "What cuisines do you love?" (multi-select, pick at least 1)**
Options as tappable cards with emoji:
- Mexican 🌮 | Korean 🍜 | Italian 🍝 | Indian 🍛
- Thai 🥘 | Japanese 🍣 | Comfort/American 🍔 | Mediterranean 🥗
- Chinese 🥡 | Middle Eastern 🧆

**Step 2: "Pick your go-to proteins" (multi-select, pick at least 1)**
- Chicken thighs 🍗 | Chicken breast 🐔 | Ground beef 🥩 | Steak 🥩
- Salmon 🐟 | Shrimp 🦐 | Tofu 🫘 | Eggs 🥚 | Pork 🐖 | Turkey 🦃

**Step 3: "How much cooking effort this week?" (single select)**
- "15 min max — keep it stupid simple" ⚡
- "30 min is fine" 🍳
- "I'll spend an hour if it's worth it" 👨‍🍳
- "Slow cooker / set and forget" 🫕

**Step 4: "Any ingredients you hate?" (multi-select, optional — can skip)**
- Mushrooms | Olives | Cilantro | Spicy food | Seafood | Dairy | Gluten | Nuts | Bell peppers | Onions
- Include a "None — I eat everything" option

**Step 5: "How many days of meal prep?" (single select)**
- 3 days | 4 days | 5 days

**Step 6: "Servings per meal?" (single select)**
- 1 | 2 | 3 | 4

**After quiz completion:**
- If NOT signed in → Show a teaser/preview of what the plan would look like (blurred or partial), with a prompt: "Sign up free to see your full plan" → Google OAuth or email signup → then generate the real plan
- If signed in → Generate the plan immediately and navigate to /plan

**Quiz UI requirements:**
- Cards should be large, tappable, with satisfying visual feedback on selection (border color change + subtle background tint)
- Smooth transitions between steps (no page reloads)
- Mobile-first design — this will mostly be used on phones
- Progress bar at top showing step X of 6
- Back button on steps 2-6
- "Next" button disabled until valid selection made
- Final step button says "Generate my plan ✨"

### The Plan Page (/plan)

This is the core product page. One screen, everything visible.

**Header section:**
- Fun auto-generated plan name (the AI should name each plan, e.g., "Spicy Korean comfort week" or "Mediterranean Sunday prep")
- Subtitle: "X recipes · Y servings each · one grocery run"
- "Regenerate entire plan" button

**Recipe cards (one per prep day):**
Each card shows:
- Recipe name (should sound delicious and appetizing, NOT clinical)
- One-line description that sells you on making it
- Active cooking time
- Expandable section with:
  - Full ingredient list with quantities
  - Numbered cooking steps (concise, not paragraphs)
  - Prep/storage tip (how it reheats, how long it keeps)
- "Swap this recipe ↻" button (calls AI to replace just this one, keeping ingredient overlap with the others)

**Combined grocery list section:**
- Organized by category: Produce, Protein, Dairy, Pantry, Spices
- Each item shows quantity and which recipes use it
- Checkboxes to mark items off
- "Copy list" button (copies as plain text to clipboard)
- Duplicate ingredients across recipes should be MERGED with combined quantities

**Prep day order section:**
- Brief paragraph from the AI explaining the most efficient order to cook everything on prep day
- E.g., "Start rice first. While it cooks, marinate the chicken. Press and cube tofu next..."

### Saved Plans (/plans)
- Simple list/grid of previously generated plans
- Show plan name, date created, number of recipes
- Click to view full plan again
- Delete button

### Settings (/settings)
- Account info
- Current plan (Free / Pro)
- Manage subscription (link to Stripe customer portal)
- Delete account

### Pricing / Paywall Logic

**Free tier:**
- Take the quiz unlimited times
- Generate 3 plans per month
- Save up to 5 plans
- Full grocery list

**Pro tier ($4.99/month or $39.99/year):**
- Unlimited plan generation
- Unlimited saved plans
- Swap individual recipes
- "Make it [dietary restriction]" — AI modifies any recipe (e.g., "make this dairy-free")
- "What can I substitute for [ingredient]?" — AI suggests swaps
- Export grocery list to clipboard

Use Stripe Checkout for payment. Create a customer portal for subscription management. Handle webhooks for subscription status changes.

---

## DATABASE SCHEMA (Supabase)

Run this SQL in Supabase SQL Editor to set up all tables:

```sql
-- Taste profiles
create table public.taste_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  cuisines text[] not null,
  proteins text[] not null,
  effort_level text not null,
  hard_nos text[] default '{}',
  prep_days integer not null,
  servings integer not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Meal plans
create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  profile_id uuid references public.taste_profiles(id) on delete set null,
  plan_name text not null,
  plan_data jsonb not null,
  created_at timestamptz default now()
);

-- User subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_type text default 'free' check (plan_type in ('free', 'pro')),
  status text default 'active' check (status in ('active', 'canceled', 'past_due')),
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Usage tracking (for free tier limits)
create table public.usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  action text not null,
  created_at timestamptz default now()
);

-- RLS policies
alter table public.taste_profiles enable row level security;
alter table public.meal_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage enable row level security;

create policy "Users can manage their own taste profiles"
  on public.taste_profiles for all
  using (auth.uid() = user_id);

create policy "Users can manage their own meal plans"
  on public.meal_plans for all
  using (auth.uid() = user_id);

create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can view their own usage"
  on public.usage for select
  using (auth.uid() = user_id);

create policy "Service role can manage subscriptions"
  on public.subscriptions for all
  using (true)
  with check (true);

create policy "Service role can insert usage"
  on public.usage for insert
  with check (true);

-- Function to count monthly usage
create or replace function public.get_monthly_usage(uid uuid)
returns integer as $$
  select count(*)::integer
  from public.usage
  where user_id = uid
    and action = 'generate_plan'
    and created_at >= date_trunc('month', now());
$$ language sql security definer;
```

---

## AI INTEGRATION (critical — this is the product's core)

### API Route: /api/generate-plan

Use Groq API with `llama-3.1-70b-versatile` model.

```typescript
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const completion = await groq.chat.completions.create({
  model: "llama-3.1-70b-versatile",
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(tasteProfile) }
  ],
  temperature: 0.8,
  max_tokens: 4000,
  response_format: { type: "json_object" }
});
```

**IMPORTANT**: Store the model name as a single constant at the top of the file so it's easy to swap later:
```typescript
const GROQ_MODEL = "llama-3.1-70b-versatile";
```

### THE SYSTEM PROMPT (use this exactly)

```
You are a meal prep expert and home cook who prioritizes TASTE and ENJOYMENT. You are NOT a nutritionist. You are NOT a diet planner. You are someone who genuinely loves food and wants to help people eat well without it feeling like a chore.

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

9. Generate the combined grocery list yourself with merged quantities. If two recipes use garlic, list "Garlic (1 head)" not two separate garlic entries. Group by category: Produce, Protein, Dairy/Eggs, Pantry Staples, Spices/Sauces.

Respond ONLY in valid JSON. No markdown, no backticks, no extra text.

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
          "amount": number,
          "unit": "string",
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
          "amount": "string — combined amount across all recipes",
          "usedIn": ["string — recipe names that use this ingredient"]
        }
      ]
    }
  ],
  "prepOrder": "string — 2-4 sentences explaining the most efficient order to cook everything on prep day"
}
```

### THE USER PROMPT BUILDER

```typescript
function buildUserPrompt(profile: TasteProfile): string {
  const effortMap: Record<string, string> = {
    'quick': '15 minutes max of active cooking. Dead simple.',
    'medium': 'Up to 30 minutes of active cooking.',
    'involved': 'Up to an hour. I enjoy cooking and want something rewarding.',
    'slowcooker': 'Slow cooker or set-and-forget style. Minimal active time.'
  };

  return `Create a ${profile.prepDays}-day meal prep plan.

This person's taste profile:
- Cuisines they love: ${profile.cuisines.join(', ')}
- Preferred proteins: ${profile.proteins.join(', ')}
- Cooking effort level: ${effortMap[profile.effortLevel]}
- Ingredients to NEVER include: ${profile.hardNos.length > 0 ? profile.hardNos.join(', ') : 'No restrictions — they eat everything'}
- Servings per recipe: ${profile.servings}

Create exactly ${profile.prepDays} recipes. Every recipe should sound genuinely appetizing — like something they'd be excited to eat, not something they're forcing themselves through. Share overlapping ingredients across recipes to keep the grocery list short.`;
}
```

### API Route: /api/swap-recipe

Same Groq setup, but with a modified prompt that includes the existing plan's recipes and asks for a single replacement that maintains ingredient overlap with the remaining recipes. Return only the new recipe object plus an updated groceryList.

---

## TYPES (lib/types.ts)

```typescript
export interface TasteProfile {
  id?: string;
  userId?: string;
  cuisines: string[];
  proteins: string[];
  effortLevel: 'quick' | 'medium' | 'involved' | 'slowcooker';
  hardNos: string[];
  prepDays: number;
  servings: number;
}

export interface Ingredient {
  item: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  activeTime: string;
  totalTime: string;
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
  storage: string;
}

export interface GroceryItem {
  item: string;
  amount: string;
  usedIn: string[];
}

export interface GroceryCategory {
  category: string;
  items: GroceryItem[];
}

export interface MealPlan {
  id?: string;
  userId?: string;
  profileId?: string;
  planName: string;
  recipes: Recipe[];
  groceryList: GroceryCategory[];
  prepOrder: string;
  createdAt?: string;
}
```

---

## UI / DESIGN DIRECTION

### Brand feel
- **Warm, approachable, slightly playful** — NOT clinical/health-app energy
- Think "your friend who's really good at meal prep" not "your nutritionist"
- Color palette: warm tones. Primary accent: a warm coral/orange or a rich teal-green. NOT blue (too corporate) or purple (too techy).
- Rounded corners, generous whitespace, friendly typography

### Typography
- Use a clean, friendly sans-serif from Google Fonts. Good options: DM Sans, Plus Jakarta Sans, or Nunito. NOT Inter (too generic).
- Headings: semi-bold (600), slightly larger
- Body: regular (400), comfortable reading size (16px base)

### Mobile-first
- Design for 375px width first, then scale up
- The quiz cards should be thumb-friendly (minimum 48px tap targets)
- The plan page should be a single scrollable column on mobile
- Grocery list checkboxes should be easy to tap

### Key visual details
- Quiz cards: white background, subtle border, colored border + light tint on selection (use the accent color)
- Recipe cards: clean white cards with subtle shadow or border
- Use the accent color sparingly — for CTAs, selected states, and the progress bar
- Loading state during plan generation: show a fun cooking-themed loading animation or message (e.g., "Chopping ingredients...", "Taste-testing your plan...", "Almost ready to serve...")

### Do NOT:
- Use stock photos of food
- Add calorie counts or macro information anywhere
- Make it look like a health/fitness app
- Use dark mode (keep v1 light only)
- Add any animations that slow down the experience

---

## ERROR HANDLING & EDGE CASES

1. **Groq rate limit hit (429)**: Show a friendly message: "We're cooking up a lot of plans right now! Try again in a minute." Implement exponential backoff with max 3 retries.

2. **Groq returns invalid JSON**: Retry once. If still invalid, show error with "Try generating again" button. Log the bad response for debugging.

3. **User hits free tier generation limit**: Show upgrade prompt. Don't let them generate. Check usage count BEFORE calling the AI.

4. **No auth on /plan or /plans**: Redirect to landing page with a "Sign in to view your plans" message.

5. **Supabase errors**: Generic "Something went wrong" with retry option. Never expose technical errors to users.

---

## FILE STRUCTURE

```
mealprept/
├── app/
│   ├── layout.tsx
│   ├── page.tsx            # Landing + Quiz
│   ├── plan/
│   │   └── page.tsx        # Latest generated plan
│   ├── plan/[id]/
│   │   └── page.tsx        # Specific saved plan
│   ├── plans/
│   │   └── page.tsx        # All saved plans
│   ├── settings/
│   │   └── page.tsx        # Account settings
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts    # Supabase auth callback
│   └── api/
│       ├── generate-plan/
│       │   └── route.ts
│       ├── swap-recipe/
│       │   └── route.ts
│       └── webhooks/
│           └── stripe/
│               └── route.ts
├── components/
│   ├── quiz/
│   │   ├── Quiz.tsx
│   │   ├── QuizStep.tsx
│   │   └── ChipGrid.tsx
│   ├── plan/
│   │   ├── PlanView.tsx
│   │   ├── RecipeCard.tsx
│   │   └── GroceryList.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Loading.tsx
│       └── UpgradePrompt.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── groq.ts
│   ├── stripe.ts
│   └── types.ts
├── middleware.ts
├── tailwind.config.ts
├── package.json
├── .env.local.example
└── CLAUDE.md
```

---

## SEO & METADATA

```typescript
export const metadata: Metadata = {
  title: 'mealprept — Meal prep that doesn\'t suck',
  description: 'Tell us what you actually love eating and we\'ll build you a weekly meal prep plan you\'ll look forward to. With a combined grocery list.',
  openGraph: {
    title: 'mealprept — Meal prep that doesn\'t suck',
    description: 'Personalized meal prep plans based on what you actually enjoy eating. Not macros. Not diets. Just food you\'ll love.',
    type: 'website',
  },
};
```

---

## LAUNCH READINESS CHECKLIST

Before deploying, make sure:
- [ ] Quiz works end-to-end without auth (can be taken anonymously)
- [ ] Auth flow works (Google OAuth + email)
- [ ] Plan generation returns valid, appetizing results
- [ ] Plan saves to database
- [ ] Saved plans are viewable at /plans
- [ ] Recipe swap works
- [ ] Grocery list copy-to-clipboard works
- [ ] Free tier usage tracking works (blocks after 3 plans/month)
- [ ] Stripe checkout flow works
- [ ] Stripe webhook updates subscription status
- [ ] Mobile responsive on all pages
- [ ] Loading states are present and not janky
- [ ] Error states are friendly, not technical
- [ ] Favicon and OG image are set
- [ ] .env.local.example file exists with all required vars listed

---

## IMPORTANT NOTES

1. **Groq, not OpenAI.** Use Groq for all AI calls. It's free and fast. Store the model name as a single constant so it's easy to swap later.

2. **Don't overbuild.** No dark mode, no i18n, no recipe sharing, no social features, no pantry tracking, no calorie counting. The product is: quiz → plan → grocery list. That's it.

3. **The AI prompt quality is everything.** The recipes need to sound GENUINELY DELICIOUS. If the AI returns boring meals like "Chicken and Rice Bowl" instead of "Crispy Garlic-Sesame Chicken over Coconut Rice with Quick-Pickled Cucumbers," the product fails. The system prompt above is carefully written — use it exactly.

4. **Mobile first.** Over 70% of users will be on their phones in the kitchen. Every tap target should be at minimum 44px. The grocery list checkboxes need to be easy to tap.

5. **The quiz IS the landing page.** Don't build a separate marketing page. The quiz itself is the hook. Someone lands on the site, immediately starts tapping their food preferences, gets invested, and then signs up to see their plan.

6. **Windows development.** This project is being developed on Windows. Use PowerShell-compatible commands. Do not use && to chain commands — run them separately or use ; as separator.