import { useEffect, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';
import InputError from '@/Components/InputError';
import useTranslation from '@/Hooks/useTranslation';

export default function ResetPassword({ token, email: initialEmail }) {
  const { t } = useTranslation();
  const { etablissement } = usePage().props;
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    token: token,
    email: initialEmail || '',
    password: '',
    password_confirmation: '',
  });

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
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 font-sans bg-slate-100 dark:bg-slate-900">
      <Head title={t('reset_password_title', 'Réinitialisation du mot de passe - Buyedi')} />

      {/* MAIN CONTAINER (THE CARD) - 50/50 PROPORTIONS */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row shadow-blue-900/10 dark:shadow-black/40 my-auto"
      >
        {/* LEFT PANEL : INFORMATIVE (BLUE) */}
        <div className="md:w-1/2 p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between relative bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <svg className="w-40 h-40" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="50" />
            </svg>
          </div>

          <div className="relative z-10">
            <h1 className="text-2xl lg:text-3xl font-extrabold mb-1 text-white uppercase tracking-tight">
              SÉCURITÉ <span className="text-green-400">BUYEDI</span>
            </h1>
            <h2 className="text-xs sm:text-sm font-medium tracking-wide text-blue-200 uppercase mb-4 leading-relaxed">
              Nouveau mot de passe
            </h2>

            <p className="text-blue-100/90 text-xs sm:text-sm mb-6 leading-relaxed font-light">
              Choisissez un mot de passe robuste pour protéger vos données et celles de votre établissement scolaire.
            </p>

            {/* FEATURES ICONS */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-white/5 border border-white/10 group">
                <div className="w-8 h-8 rounded-full bg-blue-800/70 flex items-center justify-center mb-1.5 border border-blue-600/50 group-hover:border-green-400 transition-colors">
                  <ShieldCheck className="text-green-400 w-4 h-4" />
                </div>
                <span className="text-[11px] text-blue-200 font-medium leading-tight">Chiffrement Fort</span>
              </div>
              <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-white/5 border border-white/10 group">
                <div className="w-8 h-8 rounded-full bg-blue-800/70 flex items-center justify-center mb-1.5 border border-blue-600/50 group-hover:border-white transition-colors">
                  <KeyRound className="text-white w-4 h-4" />
                </div>
                <span className="text-[11px] text-blue-200 font-medium leading-tight">Accès Sécurisé</span>
              </div>
            </div>

            <p className="text-blue-200/80 text-xs leading-relaxed font-light mb-4 hidden sm:block">
              Conseil : Utilisez au moins 8 caractères combinant lettres majuscules, minuscules et chiffres.
            </p>
          </div>

          <div className="relative z-10 text-blue-400/80 text-[11px] pt-2 border-t border-white/10">
            © {new Date().getFullYear()} Buyedi — Distribué au niveau national.
          </div>
        </div>

        {/* RIGHT PANEL : FORM (WHITE) */}
        <div className="md:w-1/2 bg-white dark:bg-slate-900 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-10 relative">
          <div className="w-full max-w-sm relative z-10">
            {/* EMPLACEMENT LOGO CLIENT */}
            <div className="flex justify-center mb-3">
              <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 border-green-500/80 p-2 shadow-sm bg-white overflow-hidden">
                <img
                  src={etablissement?.logo ? `/storage/${etablissement.logo}` : '/images/logo.png'}
                  alt={etablissement?.nom || "Logo Établissement"}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    if (e.target.src.includes('/storage/')) {
                      e.target.src = '/images/logo.png';
                    } else {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }
                  }}
                />
                <span className="text-xs font-extrabold text-blue-900 hidden text-center leading-tight">
                  {etablissement?.sigle || 'LOGO'}
                </span>
              </div>
            </div>

            {/* Header Text */}
            <h2 className="text-xl font-bold text-center text-blue-950 dark:text-white mb-1">
              {t('reset_password_title', 'Nouveau mot de passe')}
            </h2>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 text-center uppercase tracking-wider mb-5">
              {etablissement?.nom || 'Réinitialisation'}
            </p>

            <form onSubmit={submit} className="space-y-3.5">
              {/* EMAIL */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-blue-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors text-sm"
                    placeholder="Votre adresse e-mail"
                    autoComplete="username"
                    required
                  />
                </div>
                <InputError message={errors.email} className="mt-1 ml-2 text-xs" />
              </div>

              {/* PASSWORD */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-blue-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors text-sm"
                    placeholder="Nouveau mot de passe"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <InputError message={errors.password} className="mt-1 ml-2 text-xs" />
              </div>

              {/* PASSWORD CONFIRMATION */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-blue-400" />
                  </div>
                  <input
                    id="password_confirmation"
                    type={showPasswordConfirmation ? 'text' : 'password'}
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors text-sm"
                    placeholder="Confirmer le mot de passe"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <InputError message={errors.password_confirmation} className="mt-1 ml-2 text-xs" />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-75 disabled:cursor-not-allowed shadow-md shadow-green-600/20"
                >
                  {processing ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    'Enregistrer le mot de passe'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
              <Link
                href={route('login')}
                className="text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

