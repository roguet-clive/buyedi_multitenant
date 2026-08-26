import { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, ShieldCheck, MonitorSmartphone, Clock } from 'lucide-react';
import InputError from '@/Components/InputError';
import useTranslation from '@/Hooks/useTranslation';

export default function Login({ status, canResetPassword }) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  useEffect(() => {
    return () => {
      reset('password');
    };
  }, []);

  const submit = (e) => {
    e.preventDefault();
    post(route('login'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 font-sans bg-slate-100 dark:bg-slate-900">
      <Head title={t('login_title', 'Connexion - Buyedi')} />

      {/* MAIN CONTAINER (THE CARD) - 50/50 PROPORTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row shadow-blue-900/10 dark:shadow-black/50"
      >
        {/* LEFT PANEL : INFORMATIVE (BLUE) - EXACTLY 50% */}
        <div className="md:w-1/2 p-10 md:p-14 text-white flex flex-col justify-center relative bg-gradient-to-br from-blue-900 to-blue-950">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            {/* Décoration subtile en arrière-plan */}
            <svg className="w-48 h-48 text-white" viewBox="0 0 100 100" fill="currentColor"><path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm25 75H25V25h50v50z" /></svg>
          </div>

          <div className="relative z-10">
            <h1 className="text-3xl md:text-3xl font-extrabold mb-2 text-white uppercase">
              BIENVENUE SUR <span className="text-green-400">BUYEDI</span>
            </h1>
            <h2 className="text-sm md:text-base font-medium tracking-wide text-blue-200 uppercase mb-8 leading-relaxed">
              La solution complète de <br />gestion scolaire
            </h2>

            <p className="text-blue-100 text-sm md:text-base mb-12 leading-relaxed font-light">
              <strong className="text-green-400 font-semibold">Buyedi</strong> est une plateforme intégrée
              offrant des espaces dédiés pour les administrateurs,
              enseignants, parents et élèves.
            </p>

            {/* FEATURES ICONS */}
            <div className="flex items-start justify-between gap-2 mb-12">
              <div className="flex flex-col items-center text-center space-y-3 flex-1 group">
                <div className="w-10 h-10 rounded-full bg-blue-800/50 flex items-center justify-center border border-blue-700/50 group-hover:bg-blue-800 group-hover:border-green-400/50 transition-all">
                  <ShieldCheck className="text-green-400 w-5 h-5" />
                </div>
                <span className="text-[10px] sm:text-xs text-blue-200 font-medium">Sécurité renforcée</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 flex-1 group">
                <div className="w-10 h-10 rounded-full bg-blue-800/50 flex items-center justify-center border border-blue-700/50 group-hover:bg-blue-800 group-hover:border-white/30 transition-all">
                  <MonitorSmartphone className="text-white w-5 h-5" />
                </div>
                <span className="text-[10px] sm:text-xs text-blue-200 font-medium whitespace-nowrap">Interface intuitive</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 flex-1 group">
                <div className="w-10 h-10 rounded-full bg-blue-800/50 flex items-center justify-center border border-blue-700/50 group-hover:bg-blue-800 group-hover:border-white/30 transition-all">
                  <Clock className="text-white w-5 h-5" />
                </div>
                <span className="text-[10px] sm:text-xs text-blue-200 font-medium">Disponible 24/7</span>
              </div>
            </div>

            <p className="text-blue-200 text-xs md:text-sm leading-relaxed font-light mb-8">
              Notre système offre une <strong className="text-green-400 font-medium">gestion optimisée</strong> des cours,
              ressources pédagogiques et suivi des performances.
            </p>

            <div className="text-blue-400 text-[10px] md:text-xs mt-auto">
              © {new Date().getFullYear()} Buyedi - Distribué au niveau national.
            </div>
          </div>
        </div>

        {/* RIGHT PANEL : LOGIN FORM (WHITE) - EXACTLY 50% */}
        <div className="md:w-1/2 bg-white flex flex-col justify-center items-center p-8 sm:p-12 md:p-14 relative">

          <div className="w-full max-w-sm relative z-10">
            {/* Header Text */}
            <h2 className="text-2xl font-bold text-center text-blue-950 mb-8">Connexion</h2>

            {/* EMPLACEMENT LOGO CLIENT */}
            <div className="flex justify-center mb-10">
              <div className="flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 border-green-500 p-2 shadow-sm bg-white overflow-hidden">
                <img
                  src="/images/logo.png"
                  alt="Logo Buyedi"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
                <span className="text-xl font-extrabold text-blue-900 hidden text-center leading-tight">VOTRE<br />LOGO</span>
              </div>
            </div>

            <h3 className="text-center font-bold text-blue-900 mb-8">Administration Etablissement</h3>

            {status && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 border border-green-200 text-sm text-center">
                {status}
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              {/* EMAIL */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-blue-300" />
                  </div>
                  <input
                    id="email"
                    type="text"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-blue-200 rounded-[2rem] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors sm:text-sm"
                    placeholder="Identifiant ou e-mail"
                    autoComplete="username"
                    required
                  />
                </div>
                <InputError message={errors.email} className="mt-1 ml-4" />
              </div>

              {/* PASSWORD */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-300" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className="block w-full pl-11 pr-12 py-3.5 bg-white border border-blue-200 rounded-[2rem] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors sm:text-sm"
                    placeholder="Mot de passe"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <InputError message={errors.password} className="mt-1 ml-4" />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full flex justify-center py-3.5 px-4 rounded-[2rem] text-sm font-bold text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-75 disabled:cursor-not-allowed shadow-md shadow-green-500/30"
                >
                  {processing ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    "Login"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center space-y-5">
              {canResetPassword && (
                <div>
                  <Link
                    href={route('password.request')}
                    className="text-sm text-slate-500 font-medium hover:text-blue-900 transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              )}


            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}