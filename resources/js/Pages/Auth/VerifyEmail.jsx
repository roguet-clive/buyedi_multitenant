import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import PrimaryButton from '@/Components/PrimaryButton';

export default function VerifyEmail({ status }) {
  const { post, processing } = useForm({});
  const [hovered, setHovered] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    post(route('verification.send'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-800 to-blue-700 flex items-center justify-center p-4">
      <Head title="Verify Email" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.5 }}
        className="w-full max-w-2xl bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12"
      >
        <motion.h1
          className="text-3xl font-bold text-white mb-6 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Verify Your Email
        </motion.h1>

        <p className="text-white/80 text-center mb-6">
          Thanks for signing up! Before getting started, could you verify
          your email address by clicking on the link we just emailed to you?
          If you didn't receive the email, we will gladly send you another.
        </p>

        <AnimatePresence>
          {status === 'verification-link-sent' && (
            <motion.div
              className="mb-6 font-medium text-sm text-green-300 text-center p-4 rounded-xl bg-green-900/20 border border-green-400/30"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              A new verification link has been sent to your email.
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={submit} className="space-y-6">
          <motion.div
            className="flex flex-col md:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <PrimaryButton
              type="submit"
              disabled={processing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full md:w-auto py-4 text-lg font-medium rounded-xl bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 hover:from-green-500 hover:via-yellow-400 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-green-500/20 border border-white/30"
            >
              {processing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mx-auto"
                />
              ) : (
                'Resend Verification Email'
              )}
            </PrimaryButton>

            <Link
              href={route('logout')}
              method="post"
              as="button"
              className="text-white/80 underline hover:text-yellow-300 text-lg font-medium rounded-xl transition-colors duration-300 px-4 py-3"
            >
              Log Out
            </Link>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
