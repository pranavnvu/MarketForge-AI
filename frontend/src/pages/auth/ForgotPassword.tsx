// ============================================
// DevForge AI — Forgot Password Page
// ============================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Check your email</h1>
        <p className="mt-2 text-sm text-slate-400">
          We've sent a password reset link to <strong className="text-white">{email}</strong>
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">Reset password</h1>
        <p className="mt-1 text-sm text-slate-400">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              required
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
        >
          Send Reset Link
        </motion.button>
      </form>

      <p className="mt-6 text-center">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
