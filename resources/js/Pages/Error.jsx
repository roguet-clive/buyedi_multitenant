import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
  ShieldAlert, 
  Search, 
  Clock, 
  AlertTriangle, 
  Wrench, 
  Lock, 
  ZapOff,
  Home, 
  ArrowLeft, 
  RefreshCw 
} from 'lucide-react';

export default function Error({ status = 404 }) {
  const ERROR_META = {
    401: {
      title: 'Authentification Requise',
      badge: 'Erreur 401 • Non autorisé',
      color: 'from-indigo-500 to-blue-600',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      icon: Lock,
      description: "Vous devez vous connecter à votre compte pour accéder à cet espace de travail.",
      primaryAction: { label: 'Se connecter', href: '/login' },
    },
    403: {
      title: 'Accès Non Autorisé',
      badge: 'Erreur 403 • Accès interdit',
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: ShieldAlert,
      description: "Désolé, votre rôle actuel ne vous accorde pas les privilèges nécessaires pour afficher cette page.",
      primaryAction: { label: 'Tableau de bord', href: '/dashboard' },
    },
    404: {
      title: 'Page Introuvable',
      badge: 'Erreur 404 • Page manquante',
      color: 'from-blue-500 to-cyan-600',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: Search,
      description: "L'adresse demandée est inexistante ou a été déplacée. Vérifiez l'URL ou revenez à l'accueil.",
      primaryAction: { label: 'Tableau de bord', href: '/dashboard' },
    },
    419: {
      title: 'Session Expirée',
      badge: 'Erreur 419 • Expiration',
      color: 'from-violet-500 to-purple-600',
      badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      icon: Clock,
      description: "Votre session de connexion a expiré en raison d'une inactivité prolongée.",
      primaryAction: { label: 'Actualiser la page', action: 'reload' },
    },
    429: {
      title: 'Trop de Requêtes',
      badge: 'Erreur 429 • Ralentissement',
      color: 'from-rose-500 to-pink-600',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      icon: ZapOff,
      description: "Vous avez formulé trop de demandes en peu de temps. Veuillez patienter quelques instants.",
      primaryAction: { label: 'Réessayer', action: 'reload' },
    },
    500: {
      title: 'Erreur Serveur',
      badge: 'Erreur 500 • Incident interne',
      color: 'from-red-500 to-rose-600',
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
      icon: AlertTriangle,
      description: "Une défaillance inattendue s'est produite de notre côté. Nos services ont été informés.",
      primaryAction: { label: "Retour à l'accueil", href: '/' },
    },
    503: {
      title: 'Service en Maintenance',
      badge: 'Erreur 503 • Maintenance',
      color: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: Wrench,
      description: "Une opération de maintenance technique est en cours pour améliorer votre expérience.",
      primaryAction: { label: 'Vérifier la disponibilité', action: 'reload' },
    },
  };

  const current = ERROR_META[status] || {
    title: `Erreur ${status}`,
    badge: `Code d'erreur ${status}`,
    color: 'from-indigo-500 to-blue-600',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    icon: AlertTriangle,
    description: "Une erreur imprévue est survenue.",
    primaryAction: { label: "Retour à l'accueil", href: '/' },
  };

  const IconComponent = current.icon;

  const handleAction = () => {
    if (current.primaryAction.action === 'reload') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      <Head title={`${current.title} (${status}) - Buyedi`} />

      {/* Halo lumineux d'arrière-plan */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-900/90 to-slate-950"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full py-6 px-6 sm:px-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-blue-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-lg text-white">
              B
            </div>
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight">Buyedi</span>
            <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Système Scolaire</span>
          </div>
        </Link>

        <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
          Accueil &rarr;
        </Link>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-7 sm:p-10 border border-slate-700/60 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-indigo-500 to-blue-500"></div>

          {/* Icon Badge */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-700/50 border border-slate-600/50 flex items-center justify-center shadow-inner">
              <IconComponent className="w-10 h-10 text-indigo-400" />
            </div>
          </div>

          <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border ${current.badgeColor}`}>
            {current.badge}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
            {current.title}
          </h1>

          <p className="text-slate-400 text-sm sm:text-base mb-8 max-w-sm mx-auto leading-relaxed">
            {current.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {current.primaryAction.href ? (
              <Link 
                href={current.primaryAction.href}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r ${current.color} text-white font-bold text-sm shadow-lg transition-all active:scale-95`}
              >
                <Home className="w-4 h-4" />
                <span>{current.primaryAction.label}</span>
              </Link>
            ) : (
              <button 
                onClick={handleAction}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r ${current.color} text-white font-bold text-sm shadow-lg transition-all active:scale-95`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>{current.primaryAction.label}</span>
              </button>
            )}

            <button 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-600 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Page précédente</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Buyedi. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
