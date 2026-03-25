export default function Footer() {
  return (
    <footer className="border-t border-warmgray-100/60">
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-warmgray-300 text-xs tracking-wide">
          no<span className="text-coral-300">chef</span>
          <span className="mx-2 text-warmgray-200">&middot;</span>
          Dinner, figured out.
        </p>
        <a
          href="#how-it-works"
          className="text-xs text-warmgray-400 hover:text-warmgray-600 transition-colors font-medium"
        >
          How it works
        </a>
      </div>
    </footer>
  );
}
