// ============================================
// DevForge AI — Verify Email Page
// ============================================

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';

export default function VerifyEmail() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10">
        <Mail className="h-8 w-8 text-purple-400" />
      </div>
      <h1 className="text-2xl font-bold text-white">Verify your email</h1>
      <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
        We've sent a verification link to your email address.
        Please check your inbox and click the link to activate your account.
      </p>

      <div className="mt-8 space-y-3">
        <button className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors">
          Resend Verification Email
        </button>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
        >
          Continue to Sign In
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
}
