import React, { useState } from "react";
import { Compass, User, Lock, Eye, EyeOff, AlertCircle, Loader2, Sun, Moon } from "lucide-react";

interface LoginProps {
  onLoginSuccess: () => void;
  districtName?: string;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export default function Login({ 
  onLoginSuccess, 
  districtName = "Pithoragarh",
  theme,
  onToggleTheme
}: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Credentials loaded from environment variables
  const VALID_USERNAME = import.meta.env.VITE_GEOPORTAL_USERNAME;
  const VALID_PASSWORD = import.meta.env.VITE_GEOPORTAL_PASSWORD;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      if (
        username.trim() === VALID_USERNAME &&
        password.trim() === VALID_PASSWORD
      ) {
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setError("Invalid username or password. Please try again.");
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto font-sans bg-transparent pointer-events-none">
      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/60 dark:border-slate-800/80 rounded-3xl shadow-2xl p-8 sm:p-10 select-none relative overflow-hidden transition-all duration-200 pointer-events-auto">
        
        {/* Top Badge Icon */}
        <div className="w-16 h-16 rounded-full bg-indigo-100/80 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-200/60 dark:border-indigo-800/40 shadow-inner">
          <Compass className="w-8 h-8" />
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 text-center">
          {districtName} Geoportal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs mx-auto mt-2 leading-relaxed font-medium">
          Authorized Access Only. Please sign in to explore interactive district maps & planners.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-1.5">
              USERNAME
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter username"
                className="w-full text-sm pl-10 pr-4 py-2.5 bg-slate-200/50 dark:bg-slate-800/60 border border-slate-300/60 dark:border-slate-700/60 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-1.5">
              PASSWORD
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter password"
                className="w-full text-sm pl-10 pr-10 py-2.5 bg-slate-200/50 dark:bg-slate-800/60 border border-slate-300/60 dark:border-slate-700/60 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all duration-150 cursor-pointer text-sm tracking-wide flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Explore Geoportal</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-300/40 dark:border-slate-800/60 text-center">
          <span className="text-[10px] font-extrabold tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase">
            {districtName.toUpperCase()} • GEOPORTAL
          </span>
        </div>
      </div>
    </div>
  );
}
