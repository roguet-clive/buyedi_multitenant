import { useEffect, useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ResetPassword({ token, email: initialEmail }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    token: token,
    email: initialEmail || '',
    password: '',
    password_confirmation: '',
  });

  const [activeInput, setActiveInput] = useState(null);

  useEffect(() => {
    return () => reset('password', 'password_confirmation');
  }, []);

  const submit = (e) => {
    e.preventDefault();
    post(route('password.store'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-800 to-blue-700 flex items-center justify-center p-4">
      <Head title="Reset Password" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.5 }}
        className="w-full max-w-2xl bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12"
      >
        <motion.h1
          className="text-3xl font-bold text-white mb-8 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Reset Your Password
        </motion.h1>

        <form onSubmit={submit} className="space-y-6">
          {/* Email */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onFocus={() => setActiveInput('email')}
            onBlur={() => setActiveInput(null)}
          >
            <div className="relative">
              <label
                htmlFor="email"
                className={`absolute left-4 transition-all duration-300 ${
                  activeInput === 'email' || data.email
                    ? 'top-2 text-xs text-green-300 font-medium'
                    : 'top-4 text-sm text-white/70'
                }`}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="Your email"
                className="w-full px-4 pt-7 pb-3 rounded-xl bg-white/5 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-green-400/50 border border-white/10 text-lg backdrop-blur-sm transition-all duration-300"
              />
            </div>
            <InputError message={errors.email} className="mt-2 text-yellow-300 text-base" />
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onFocus={() => setActiveInput('password')}
            onBlur={() => setActiveInput(null)}
          >
            <div className="relative">
              <label
                htmlFor="password"
                className={`absolute left-4 transition-all duration-300 ${
                  activeInput === 'password' || data.password
                    ? 'top-2 text-xs text-yellow-300 font-medium'
                    : 'top-4 text-sm text-white/70'
                }`}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                placeholder="New password"
                className="w-full px-4 pt-7 pb-3 rounded-xl bg-white/5 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-yellow-400/50 border border-white/10 text-lg backdrop-blur-sm transition-all duration-300"
              />
            </div>
            <InputError message={errors.password} className="mt-2 text-yellow-300 text-base" />
          </motion.div>

          {/* Confirm Password */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            onFocus={() => setActiveInput('password_confirmation')}
            onBlur={() => setActiveInput(null)}
          >
            <div className="relative">
              <label
                htmlFor="password_confirmation"
                className={`absolute left-4 transition-all duration-300 ${
                  activeInput === 'password_confirmation' || data.password_confirmation
                    ? 'top-2 text-xs text-blue-300 font-medium'
                    : 'top-4 text-sm text-white/70'
                }`}
              >
                Confirm Password
              </label>
              <input
                id="password_confirmation"
                type="password"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                placeholder="Confirm password"
                className="w-full px-4 pt-7 pb-3 rounded-xl bg-white/5 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-400/50 border border-white/10 text-lg backdrop-blur-sm transition-all duration-300"
              />
            </div>
            <InputError
              message={errors.password_confirmation}
              className="mt-2 text-yellow-300 text-base"
            />
          </motion.div>

          {/* Bouton submit */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PrimaryButton
              type="submit"
              className="w-full py-4 text-lg font-medium rounded-xl bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 hover:from-green-500 hover:via-yellow-400 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-green-500/20 border border-white/30"
              disabled={processing}
            >
              {processing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mx-auto"
                />
              ) : (
                'Reset Password'
              )}
            </PrimaryButton>
          </motion.div>

          <motion.div
            className="text-center mt-6 text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Link
              href={route('login')}
              className="text-yellow-300 hover:text-yellow-200 font-medium transition-colors duration-300"
            >
              Back to Login
            </Link>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
