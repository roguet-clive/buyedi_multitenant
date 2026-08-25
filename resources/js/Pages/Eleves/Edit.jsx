import React from 'react';
import EleveForm from './Create';
import { usePage } from '@inertiajs/react';

// Grâce à la nouvelle architecture propulsée par EleveForm dans Create.jsx, 
// nous pouvons réutiliser le même composant magnifique pour l'édition !
export default function EditEleve() {
  const { eleve } = usePage().props;

  // Rétrocompatibilité car les data peuvent être imbriquées selon le contrôleur
  const userData = eleve?.user || {};
  const eleveData = eleve || {};

  const normalizedEleve = {
    id: eleveData.id,
    nom: userData.nom || eleveData.nom,
    prenom: userData.prenom || eleveData.prenom,
    email: userData.email || eleveData.email,
    sexe: eleveData.sexe,
    date_naissance: eleveData.date_naissance,
    lieu_naissance: eleveData.lieu_naissance,
    probleme_particulier: eleveData.probleme_particulier,
    photo: eleveData.photo
  };

  return <EleveForm mode="edit" eleveInitial={normalizedEleve} />;
}