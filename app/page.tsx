import Quiz from '@/components/quiz/Quiz';

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
      {/* Hero */}
      <div className="text-center mb-14 animate-fadeIn">
        <p className="text-coral-500 font-semibold text-sm tracking-wide uppercase mb-3">
          Weekly meal prep, simplified
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-warmgray-800 tracking-tight leading-[1.1] mb-5">
          What&apos;s for dinner?
          <br />
          <span className="text-warmgray-400">We got you.</span>
        </h1>
        <p className="text-base sm:text-lg text-warmgray-500 max-w-lg mx-auto leading-relaxed">
          Tell us what your family loves eating. We&apos;ll build a week of
          recipes you&apos;ll actually look forward to, plus one grocery list.
        </p>
      </div>

      {/* Quiz */}
      <Quiz />
    </div>
  );
}
