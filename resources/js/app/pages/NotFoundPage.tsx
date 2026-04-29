import React from 'react';
import { Link } from 'react-router';
import { Home, Trophy, SearchX } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#050B1A] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Glowing 404 */}
        <div
          className="text-[120px] font-black leading-none mb-4 select-none"
          style={{
            background: 'linear-gradient(135deg, #00C8F8, #0066CC)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 40px #00C8F840)',
          }}
        >
          404
        </div>

        <div className="flex justify-center mb-5">
          <div className="p-4 rounded-2xl bg-[#0D1F3C] border border-[#1E3A5C]">
            <SearchX size={36} className="text-[#64748B]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-[#94A3B8] mb-8">
          The page you're looking for doesn't exist or has been moved. Head back to safety!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
              bg-[#00C8F8] text-[#050B1A] hover:bg-[#00B0D8] transition-all duration-200
              shadow-lg shadow-[#00C8F8]/25"
          >
            <Home size={16} />
            Go Home
          </Link>
          <Link
            to="/tournaments"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
              border border-[#1E3A5C] text-[#94A3B8] hover:text-white hover:border-[#00C8F8]/50
              hover:bg-[#0A1628] transition-all duration-200"
          >
            <Trophy size={16} />
            View Tournaments
          </Link>
        </div>
      </div>
    </div>
  );
}
