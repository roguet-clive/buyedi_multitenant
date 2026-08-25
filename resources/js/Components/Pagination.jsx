
import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (links.length === 3) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {links.map((link, i) => {
                if (link.url === null) {
                    return (
                        <div
                            key={i}
                            className="px-3 py-1 rounded bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 border dark:border-gray-700"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }
                return (
                    <Link
                        key={i}
                        href={link.url}
                        preserveScroll
                        preserveState
                        className={`px-3 py-1 rounded ${link.active
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-white"
                            }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
}
