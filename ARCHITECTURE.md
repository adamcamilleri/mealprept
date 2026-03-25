# NoChef - Architecture

## How Everything Connects

```
User opens site
    |
    v
Landing page (/) with Quiz
    |
    v (completes quiz)
    |
    +--> Not signed in --> /plan/preview (sessionStorage)
    |                          |
    |                          v (signs in)
    |                          Saves to Supabase --> /plans
    |
    +--> Signed in --> POST /api/generate-plan
                          |
                          v
                       Groq API (llama-3.3-70b)
                          |
                          v
                       Save to Supabase (taste_profiles + meal_plans + usage)
                          |
                          v
                       /plan/preview --> user views plan
```

## Data Flow

### Plan Generation
1. Quiz collects TasteProfile (cuisines, proteins, effort, etc.)
2. POST /api/generate-plan sends profile to Groq with system prompt
3. Groq returns JSON: planName, recipes[], groceryList[], prepOrder
4. Server saves taste_profile + meal_plan to Supabase
5. Client shows plan with PlanView component

### Subscription Check (every protected page load)
1. Server component calls supabase.from('subscriptions').select()
2. Passes subscription to client via hasProAccess()
3. hasProAccess checks: active = pro, canceled + period not expired = pro, else free
4. Settings page also calls /api/sync-subscription to get live Stripe status

### Stripe Payment
1. User clicks Upgrade --> POST /api/create-checkout
2. Redirects to Stripe Checkout
3. After payment --> redirects to /settings?session_id=xxx
4. Settings page calls POST /api/verify-checkout with session_id
5. verify-checkout checks Stripe, updates Supabase subscription to pro
6. UI updates in-place (no reload)

### Stripe Cancellation
1. User clicks Manage subscription --> POST /api/create-portal
2. Redirects to Stripe Customer Portal
3. User cancels --> Stripe sets cancel_at_period_end=true
4. User returns to /settings
5. Settings calls POST /api/sync-subscription
6. Sync reads Stripe, updates Supabase status to 'canceled' with period end date
7. hasProAccess() still returns true until period expires
8. UI shows amber notice: "Your Pro plan is canceled. You have access until [date]."

## Database Tables (Supabase)

| Table | Purpose | RLS |
|-------|---------|-----|
| taste_profiles | Quiz answers per user | Users own rows |
| meal_plans | Generated plans with full recipe data (JSONB) | Users own rows |
| subscriptions | Stripe customer/subscription IDs, plan type, status | Users read own, service role writes |
| usage | Tracks generate_plan actions for free tier limits | Users read own, service role inserts |

## Key Files

| File | Purpose |
|------|---------|
| lib/subscription.ts | hasProAccess() - single source of truth for pro checks |
| lib/groq.ts | AI prompt + Groq API call |
| lib/types.ts | TasteProfile, Recipe, MealPlan, GroceryItem interfaces |
| lib/fridge-data.ts | Shelf life database (100+ ingredients) |
| lib/supabase/server.ts | Server-side Supabase client |
| lib/supabase/client.ts | Browser-side Supabase client |
| lib/stripe.ts | Stripe client singleton |
| middleware.ts | Auth session refresh on protected routes |

## API Routes

| Route | Method | Auth | Pro | Purpose |
|-------|--------|------|-----|---------|
| /api/generate-plan | POST | Yes | No (2/mo free) | Generate meal plan from quiz |
| /api/swap-recipe | POST | Yes | Yes | Replace one recipe in plan |
| /api/create-checkout | POST | Yes | No | Start Stripe payment |
| /api/verify-checkout | POST | Yes | No | Confirm payment, upgrade to pro |
| /api/sync-subscription | POST | Yes | No | Check Stripe for current status |
| /api/create-portal | POST | Yes | No | Open Stripe billing portal |
| /api/check-subscription | GET | No | No | Return auth + pro status |
| /api/webhooks/stripe | POST | No* | No | Stripe event handler |
| /auth/callback | GET | No | No | OAuth redirect handler |

*Webhook uses Stripe signature verification instead of user auth
