import Quiz from '@/components/quiz/Quiz';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-warmgray-800 mb-4">
          What&apos;s for dinner? We got you.
        </h1>
        <p className="text-lg text-warmgray-500 max-w-xl mx-auto">
          Tell us what your family loves eating. We&apos;ll plan the week
          so you don&apos;t have to think about it — recipes you&apos;ll
          actually look forward to, plus a combined grocery list.
        </p>
      </div>

      {/* Quiz */}
      <Quiz />
    </div>
  );
}
