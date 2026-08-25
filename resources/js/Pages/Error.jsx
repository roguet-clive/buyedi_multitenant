import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Error({ status }) {
    const title = {
        503: 'Service Indisponible',
        500: 'Erreur Serveur',
        404: 'Page Introuvable',
        403: 'Accès Interdit',
    }[status] || 'Erreur Inconnue';

    const description = {
        503: 'Désolé, nous effectuons une maintenance. Veuillez réessayer plus tard.',
        500: 'Oups, quelque chose s\'est mal passé sur nos serveurs.',
        404: 'On dirait que vous séchez les cours... Cette page n\'existe pas (ou plus).',
        403: 'Désolé, vous n\'avez pas la permission d\'accéder à cette page.',
    }[status] || 'Une erreur inattendue s\'est produite.';

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Head title={title} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-xl w-full text-center"
            >
                <div className="relative mb-8">
                    {/* Big 404 Text Effect */}
                    <h1 className="text-9xl font-extrabold text-gray-200 select-none">
                        {status}
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-gray-800 bg-gray-100 px-4 rounded">
                            {title}
                        </span>
                    </div>
                </div>

                <p className="text-gray-600 text-lg mb-8">
                    {description}
                </p>

                <div className="flex justify-center gap-4">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition transform hover:-translate-y-1"
                    >
                        Retourner au Dashboard
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-50 transition transform hover:-translate-y-1"
                    >
                        Page Précédente
                    </button>
                </div>

                {/* Optional Illustration Area */}
                <div className="mt-12 opacity-50">
                    <svg className="w-full h-32 text-gray-300" viewBox="0 0 400 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 80 Q 200 20 350 80" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
                        <circle cx="50" cy="80" r="4" fill="currentColor" />
                        <circle cx="350" cy="80" r="4" fill="currentColor" />
                    </svg>
                </div>
            </motion.div>
        </div>
    );
}
