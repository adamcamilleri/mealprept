# NoChef - Shipping Plan

## Today: Fix the 5 blockers and ship

### Step 1: Remove /preps duplication (30 min)
- Delete app/preps/ directory entirely
- Remove localStorage plan saves from Quiz.tsx
- Update Header.tsx: change "My Preps" link to point to /plans
- All saved plans go through Supabase only

### Step 2: Fix account deletion (15 min)
- Actually delete user data: taste_profiles, meal_plans, subscriptions, usage
- Then sign out and redirect

### Step 3: Create subscription on signup (15 min)
- In auth/callback/route.ts, after exchanging code for session
- Insert a default subscription row (plan_type: 'free', status: 'active')
- This prevents "no subscription found" errors

### Step 4: Hide annual option or create Stripe price (10 min)
- If not ready: remove annual option from UI
- If ready: create price in Stripe, set NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID

### Step 5: Add quiz fields to DB (10 min)
- ALTER TABLE taste_profiles ADD COLUMN meal_styles text[] DEFAULT '{}';
- ALTER TABLE taste_profiles ADD COLUMN favorite_dishes text DEFAULT '';
- ALTER TABLE taste_profiles ADD COLUMN least_favorites text DEFAULT '';

### Step 6: Deploy and test (30 min)
- Push to GitHub
- Vercel auto-deploys
- Test: signup -> quiz -> generate -> save -> view -> upgrade -> cancel -> delete account
- Test on mobile

## This Week: Growth

### Day 1-2: Content
- Record 30-second screen recording of quiz + plan generation
- Post to r/mealprep, r/EatCheapAndHealthy, r/MealPrepSunday
- Title: "I built a free tool that plans your meals based on what you actually like eating"
- Post at 9am EST Tuesday or Wednesday (peak Reddit traffic)

### Day 3: Product Hunt
- Create listing with screenshots
- Tagline: "Tell us what you love eating. We plan the week."
- Schedule for 12:01am PT on a Tuesday

### Day 4-5: Iterate
- Check Supabase for how many users signed up
- Check Stripe for any conversions
- Read Reddit comments for feedback
- Fix top complaint immediately

## Revenue Targets
- Week 1: 500 signups, 5 paid ($20 MRR)
- Month 1: 2000 signups, 50 paid ($200 MRR)
- Month 3: 10000 signups, 300 paid ($1200 MRR)

## Cost Structure
- Vercel: Free tier (until you exceed bandwidth)
- Supabase: Free tier (500MB, 50k rows)
- Groq: Free tier (14,400 requests/day)
- Stripe: 2.9% + $0.30 per transaction
- Domain: ~$12/year when ready
- Total monthly cost at launch: $0
