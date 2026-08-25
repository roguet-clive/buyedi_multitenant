import { useEffect, useState } from "react";
import { Bell, Sun, Moon, Settings, User, LogOut, ChevronDown, Mail } from "lucide-react";
import useTranslation from "@/Hooks/useTranslation";
import { router, usePage, Link } from "@inertiajs/react";
import toast from "react-hot-toast";

export default function Header() {
  const { t, language, setLanguage } = useTranslation();
  // Destructure top-level counts, defaulting to 0
  const { auth, currentSchoolYear, unreadNotificationsCount: notifCount, unreadMessagesCount: msgCount } = usePage().props;

  // ✅ Define Permissions Helper
  const permissions = auth?.permissions || [];
  const can = (permission) => permissions.includes(permission);

  const unreadNotificationsCount = parseInt(notifCount || 0);
  const unreadMessagesCount = parseInt(msgCount || 0);
  const [darkMode, setDarkMode] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 🕒 Met à jour l'heure toutes les secondes
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔄 Actualisation automatique des notifications toutes les minutes
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      router.reload({
        only: ['unreadNotificationsCount', 'unreadMessagesCount'],
        preserveState: true,
        preserveScroll: true
      });
    }, 60000); // 60 secondes

    return () => clearInterval(pollingInterval);
  }, []);

  // 🌙 Dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // 🌐 Changement de langue
  const handleLangChange = (newLang) => {
    setLanguage(newLang);
    setShowLangDropdown(false);
    router.post("/lang", { locale: newLang }, {
      preserveScroll: true,
      onFinish: () => toast.success(t("lang_changed", "Langue changée !")),
    });
  };

  const formatDate = currentTime.toLocaleDateString(language, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formatTime = currentTime.toLocaleTimeString(language, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const schoolYear = currentSchoolYear;

  return (
    <header className="flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-4 shadow-md sticky top-0 z-50 bg-gradient-to-r from-green-500 via-yellow-400 to-blue-500 dark:from-green-800 dark:via-yellow-700 dark:to-blue-900 text-white">

      {/* 🔍 Recherche & Langue & Notifications */}
      <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-4 w-full md:w-auto mb-2 md:mb-0">
        <input
          type="text"
          placeholder={t("search_placeholder")}
          className="px-4 py-2 w-full md:w-64 rounded-lg border border-white/30 bg-white/20 text-white placeholder-white focus:ring-2 focus:ring-white outline-none"
        />

        {/* 🌍 Sélecteur de langue Custom */}
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/30 bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <img
              src={`/flags/${language}.svg`}
              alt={language}
              className="w-5 h-5 rounded-sm object-cover"
            />
            <span className="uppercase font-semibold">{language}</span>
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>

          {showLangDropdown && (
            <div className="absolute top-full mt-2 w-full min-w-[120px] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => handleLangChange('fr')}
                className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700"
              >
                <img src="/flags/fr.svg" alt="FR" className="w-5 h-5 rounded-sm shadow-sm" />
                <span className="font-medium">Français</span>
              </button>
              <button
                onClick={() => handleLangChange('en')}
                className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <img src="/flags/en.svg" alt="EN" className="w-5 h-5 rounded-sm shadow-sm" />
                <span className="font-medium">English</span>
              </button>
            </div>
          )}
        </div>

        {/* ✉️ Messages */}
        <Link
          href={route("communications.inbox")}
          className={`relative cursor-pointer group ${!can('voir_communications') && 'hidden'}`}
        >
          <Mail className="w-6 h-6 hover:text-blue-300 transition-colors group-hover:scale-110 duration-200" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1 z-50 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-800 shadow-md animate-bounce">
              {unreadMessagesCount}
            </span>
          )}
        </Link>

        {/* 🔔 Notifications */}
        <div className="relative cursor-pointer group">
          <Link href={route("notifications.index")}>
            <Bell className="w-6 h-6 hover:text-yellow-200 transition-colors group-hover:scale-110 duration-200" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 z-50 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-800 shadow-md animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 🕒 Date / Heure / Année scolaire */}
      <div className="text-center mb-2 md:mb-0 hidden md:block">
        <div className="text-sm font-medium opacity-90">{formatDate}</div>
        <div className="text-xs opacity-75 flex items-center justify-center gap-2">
          <span>{formatTime}</span>
          <span>•</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full border border-white/10">
            {t("school_year")}: {schoolYear?.nom || "N/A"}
          </span>
        </div>
      </div>

      {/* ⚙️ Dark mode + avatar + dropdown */}
      <div className="flex items-center gap-2 md:gap-4 relative">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all transform hover:scale-105"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* ✅ affichage du nom complet */}
        <span className="font-semibold hidden md:block text-sm">{auth?.user?.full_name || "Invité"}</span>

        <div className="relative">
          <img
            src={`https://ui-avatars.com/api/?name=${auth?.user?.full_name}&background=random&color=fff`}
            alt="avatar"
            className="rounded-full w-10 h-10 cursor-pointer border-2 border-white/50 hover:border-white transition-all shadow-sm"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          />
          {showUserDropdown && auth?.user && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl shadow-2xl overflow-hidden z-50 ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{auth.user.full_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{auth.user.email}</p>
              </div>
              <Link
                href={route('profile.edit')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setShowUserDropdown(false)}
              >
                <User className="w-4 h-4 text-gray-500" /> {t("profile", "Profil")}
              </Link>

              <div className="border-t border-gray-100 dark:border-gray-700"></div>
              <Link
                href={route('logout')}
                method="post"
                as="button"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" /> {t("logout", "Déconnexion")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
