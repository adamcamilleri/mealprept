'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import AuthModal from '@/components/quiz/AuthModal';

const SAMPLE_RECIPES = [
  {
    name: 'Crispy Honey Garlic Chicken Thighs',
    description:
      'Golden, sticky, and gone in minutes. Your family will ask for this every week.',
    cuisine: 'American',
    time: '25 min',
    servings: '4 servings',
  },
  {
    name: 'Loaded Burrito Bowls',
    description:
      'Everything you love about a burrito without the mess. Piled high and ready to devour.',
    cuisine: 'Mexican',
    time: '20 min',
    servings: '4 servings',
  },
  {
    name: 'Creamy Tuscan Chicken Pasta',
    description:
      'Sun dried tomatoes, spinach, and a garlic cream sauce that coats every bite.',
    cuisine: 'Italian',
    time: '25 min',
    servings: '4 servings',
  },
  {
    name: 'BBQ Pulled Pork Rice Bowls',
    description:
      'Slow cooked pork with tangy slaw on fluffy rice. Comfort food at its finest.',
    cuisine: 'American',
    time: '15 min active',
    servings: '4 servings',
  },
  {
    name: 'Garlic Butter Shrimp with Lemon Orzo',
    description:
      'Restaurant quality in under 20 minutes. The butter sauce is dangerously good.',
    cuisine: 'Mediterranean',
    time: '18 min',
    servings: '4 servings',
  },
];

function HomeContent() {
  const searchParams = useSearchParams();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  useEffect(() => {
    if (searchParams.get('signin') === 'true') {
      setAuthMode('signin');
      setShowAuth(true);
    } else if (searchParams.get('signup') === 'true') {
      setAuthMode('signup');
      setShowAuth(true);
    }
  }, [searchParams]);

  return (
    <div>
      {/* Section 1: Hero */}
      <section className="min-h-[90vh] flex items-center animate-fadeIn">
        <div className="max-w-6xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div>
            <p className="text-sm text-navy-500 mb-6 tracking-wide font-medium">Weekly meal plans, figured out</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-warmgray-800 tracking-tight leading-[1.08] mb-6">
              Stop asking<br />
              &quot;what&apos;s for<br />
              dinner?&quot;
            </h1>
            <p className="text-base sm:text-lg text-warmgray-400 max-w-md leading-relaxed mb-10">
              Tell us what your family loves eating. Get a week of recipes
              you&apos;ll actually look forward to, plus one combined grocery list.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/quiz"
                className="px-8 py-3.5 bg-navy-500 text-white font-semibold rounded-full hover:-translate-y-0.5 hover:bg-navy-600 transition-all text-sm"
              >
                Get started
              </a>
              <a
                href="#sample-plan"
                className="px-8 py-3.5 border-2 border-navy-500 text-navy-500 font-semibold rounded-full hover:bg-navy-500 hover:text-white transition-all text-sm"
              >
                See a sample plan
              </a>
            </div>
          </div>
          {/* Right: Visual - food emoji collage */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 rounded-3xl border-2 border-navy-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-6 p-8 text-6xl">
                  <span className="animate-fadeIn" style={{animationDelay: '0.1s'}}>🍜</span>
                  <span className="animate-fadeIn" style={{animationDelay: '0.2s'}}>🥗</span>
                  <span className="animate-fadeIn" style={{animationDelay: '0.3s'}}>🌮</span>
                  <span className="animate-fadeIn" style={{animationDelay: '0.4s'}}>🍛</span>
                  <span className="animate-fadeIn" style={{animationDelay: '0.5s'}}>🍝</span>
                  <span className="animate-fadeIn" style={{animationDelay: '0.6s'}}>🥘</span>
                  <span className="animate-fadeIn" style={{animationDelay: '0.7s'}}>🍣</span>
                  <span className="animate-fadeIn" style={{animationDelay: '0.8s'}}>🥩</span>
                  <span className="animate-fadeIn" style={{animationDelay: '0.9s'}}>🍔</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <span className="text-xs font-semibold text-coral-500 uppercase tracking-widest">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-warmgray-800 mt-3">
            Three steps. Dinner solved.
          </h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center bg-white rounded-2xl p-8 border-2 border-navy-500">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-bold text-warmgray-800 mb-2">Take the quiz</h3>
            <p className="text-sm text-warmgray-400">
              Pick your cuisines, proteins, and effort level. 60 seconds.
            </p>
          </div>
          <div className="text-center bg-white rounded-2xl p-8 border-2 border-navy-500">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="font-bold text-warmgray-800 mb-2">Get your plan</h3>
            <p className="text-sm text-warmgray-400">
              AI builds a week of recipes with overlapping ingredients to keep shopping simple.
            </p>
          </div>
          <div className="text-center bg-white rounded-2xl p-8 border-2 border-navy-500">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="font-bold text-warmgray-800 mb-2">Shop and cook</h3>
            <p className="text-sm text-warmgray-400">
              One combined grocery list. Check items off as you go.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Sample Plan */}
      <section id="sample-plan" className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-coral-500 uppercase tracking-widest">
            Sample Plan
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-warmgray-800 mt-3">
            Here&apos;s what you&apos;ll get
          </h2>
          <p className="text-warmgray-400 mt-3 text-sm">
            A sample plan for someone who picked American, Mexican, and Italian
          </p>
        </div>

        {/* Sample recipe cards - horizontal scroll */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
          {SAMPLE_RECIPES.map((recipe) => (
            <div
              key={recipe.name}
              className="bg-white rounded-2xl border-2 border-navy-500 p-4 transition-all duration-200 hover:bg-navy-50 flex flex-col h-52"
            >
              <h3 className="text-sm font-bold text-warmgray-800 leading-snug">
                {recipe.name}
              </h3>
              <p className="text-warmgray-400 text-xs mt-1 leading-relaxed flex-1">
                {recipe.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-auto pt-3">
                <span className="text-xs text-navy-500 bg-navy-50 px-2 py-0.5 rounded-md font-medium">
                  {recipe.cuisine}
                </span>
                <span className="text-xs text-warmgray-500 bg-warmgray-100/60 px-2 py-0.5 rounded-md font-medium">
                  {recipe.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Sample grocery list snippet */}
        <div className="bg-white rounded-2xl border-2 border-navy-500 p-6 sm:p-8 mb-10">
          <h3 className="text-xs font-semibold text-warmgray-400 uppercase tracking-[0.15em] mb-4">
            Combined Grocery List (preview)
          </h3>
          <div className="space-y-2.5">
            <div>
              <span className="text-sm font-semibold text-warmgray-700">Produce:</span>
              <span className="text-sm text-warmgray-500 ml-2">
                1 head garlic, 3 limes, 1 bunch cilantro, 1 bunch green onions, 1 bag baby spinach, 2 avocados, 1 bag coleslaw mix, 1 lemon, sun dried tomatoes
              </span>
            </div>
            <div>
              <span className="text-sm font-semibold text-warmgray-700">Protein:</span>
              <span className="text-sm text-warmgray-500 ml-2">
                8 chicken thighs (~1.5kg), 500g ground beef, 1kg pork shoulder, 500g shrimp
              </span>
            </div>
            <div>
              <span className="text-sm font-semibold text-warmgray-700">Pantry:</span>
              <span className="text-sm text-warmgray-500 ml-2">
                orzo pasta, rice, flour tortillas, honey, soy sauce, BBQ sauce, heavy cream
              </span>
            </div>
            <div>
              <span className="text-sm font-semibold text-warmgray-700">Spices:</span>
              <span className="text-sm text-warmgray-500 ml-2">
                cumin, chili powder, smoked paprika, Italian seasoning, garlic powder, black pepper
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="/quiz"
            className="inline-block px-8 py-3.5 bg-navy-500 text-white font-semibold rounded-full hover:bg-navy-600 hover:-translate-y-0.5 transition-all text-sm"
          >
            Want one customized for you? Takes 60 seconds.
          </a>
        </div>
      </section>

      {/* CTA before testimonials */}
      <section className="bg-navy-500 px-6 py-20 sm:py-28 text-center">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
          Ready to plan your week?
        </h2>
        <p className="text-navy-200 mb-8 text-sm">7 quick questions. Your personalized plan in under a minute.</p>
        <a
          href="/quiz"
          className="inline-block px-10 py-4 bg-white text-navy-500 font-semibold rounded-full hover:-translate-y-0.5 transition-all text-sm"
        >
          Get started
        </a>
      </section>

      {/* Section 5: About */}
      <section className="px-6 py-16 sm:py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-warmgray-400 text-sm">
            Built by a home cook who got tired of the same five dinners every week.
          </p>
        </div>
      </section>

      {/* Auth modal - triggered by ?signin=true redirect */}
      {showAuth && (
        <AuthModal
          defaultMode={authMode}
          onClose={() => {
            setShowAuth(false);
            window.history.replaceState({}, '', '/');
          }}
          onSuccess={() => {
            setShowAuth(false);
            window.history.replaceState({}, '', '/');
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
