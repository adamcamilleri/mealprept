# NoChef - Launch Blockers

## CRITICAL (fix before anyone pays you money)

### 1. /preps and /plans are duplicates
- /preps uses localStorage (lost when browser clears)
- /plans uses Supabase (persistent)
- DELETE /preps entirely, redirect to /plans
- Remove all localStorage plan storage from Quiz.tsx

### 2. Fridge data is localStorage only
- Users lose their fridge data if they clear browser
- Need Supabase table for fridge items
- Or accept this limitation for v1 and document it

### 3. Account deletion doesn't delete data
- "Delete account" button only signs the user out
- User data stays in Supabase forever
- Legal risk (GDPR, privacy laws)
- Need: cascade delete taste_profiles, meal_plans, subscriptions, usage

### 4. Annual price ID not configured
- NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID is empty
- If you show an annual option anywhere, it will break
- Either create the price in Stripe or hide the annual option

### 5. Subscription record created lazily
- No subscription row exists until first API call
- Manage subscription button breaks if no row exists
- Fix: create row on signup in auth callback

## HIGH PRIORITY (fix within first week)

### 6. No retry on AI generation failures
- If Groq is slow or errors, user gets a generic error
- Add 1 retry with 2s delay before showing error

### 7. New quiz fields not in DB schema
- mealStyles, favoriteDishes, leastFavorites added to quiz
- These fields don't exist in taste_profiles table
- They get passed to AI prompt (works) but aren't saved
- Run ALTER TABLE to add these columns

### 8. No error tracking
- If something breaks in production, you won't know
- Add Sentry free tier (5k errors/month)

## ACCEPTABLE FOR V1 LAUNCH
- Fridge in localStorage (works, just not cross-device)
- No password reset (users can re-register)
- No email confirmation
- Webhook as backup only (direct Stripe sync is primary)
- No structured SEO data
