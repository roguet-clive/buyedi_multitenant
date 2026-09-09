import { usePage } from '@inertiajs/react';

export default function ApplicationLogo(props) {
    const { etablissement } = usePage().props;
    const logoSrc = etablissement?.logo ? `/storage/${etablissement.logo}` : '/images/logo.png';

    return (
        <img
            src={logoSrc}
            alt={etablissement?.nom || "Logo Buyedi"}
            onError={(e) => {
                e.target.src = '/images/logo.png';
            }}
            {...props}
        />
    );
}

