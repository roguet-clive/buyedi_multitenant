<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Fiche de Renseignements</title>
    <style>
        @page { margin: 20mm; size: A4; }
        body { font-family: 'Helvetica', sans-serif; font-size: 14px; color: #1a202c; }
        h1 { font-size: 20px; text-transform: uppercase; text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        h2 { font-size: 16px; background-color: #edf2f7; padding: 5px 10px; margin-top: 20px; border-left: 4px solid #4a5568; }
        
        .row { margin-bottom: 10px; }
        .label { font-weight: bold; display: inline-block; width: 140px; color: #4a5568; }
        .value { display: inline-block; font-weight: bold; }
        
        .photo-area { float: right; width: 35mm; height: 45mm; border: 1px solid #ccc; background: #eee; text-align: center; line-height: 45mm; color: #aaa; margin-top: -60px; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #cbd5e0; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #f7fafc; }
    </style>
</head>
<body>
    <div style="text-align: center; margin-bottom: 20px; font-size: 12px; text-transform: uppercase; font-weight: bold;">
        {{ $etablissement['nom'] }}<br>
        Année Scolaire {{ $inscription->anneeScolaire->nom }}
    </div>

    <h1>Fiche Individuelle de Renseignements</h1>

    <div class="photo-area">
        @if($eleve->photo)
            <img src="{{ public_path('storage/' . $eleve->photo) }}" style="width:100%; height:100%; object-fit:cover;">
        @else
            PHOTO
        @endif
    </div>

    <h2>1. Identité de l'Élève</h2>
    <div class="row"><span class="label">Matricule :</span> <span class="value">{{ $eleve->matricule }}</span></div>
    <div class="row"><span class="label">Nom :</span> <span class="value">{{ $eleve->user->nom }}</span></div>
    <div class="row"><span class="label">Prénom :</span> <span class="value">{{ $eleve->user->prenom }}</span></div>
    <div class="row"><span class="label">Classe :</span> <span class="value">{{ $inscription->classe->nom }}</span></div>
    <div class="row"><span class="label">Sexe :</span> <span class="value">{{ $eleve->sexe === 'M' ? 'Masculin' : 'Féminin' }}</span></div>
    <div class="row"><span class="label">Date de Naissance :</span> <span class="value">{{ $eleve->date_naissance ? $eleve->date_naissance->format('d/m/Y') : '-' }}</span></div>
    <div class="row"><span class="label">Lieu :</span> <span class="value">{{ $eleve->lieu_naissance ?? '-' }}</span></div>
    <div class="row"><span class="label">Email Personnel :</span> <span class="value">{{ $eleve->user->email }}</span></div>

    <h2>2. Responsables Légaux / Parents</h2>
    <table>
        <thead>
            <tr>
                <th>Lien de Parenté</th>
                <th>Nom & Prénom</th>
                <th>Téléphone</th>
                <th>Email</th>
            </tr>
        </thead>
        <tbody>
            @forelse($eleve->parents as $parent)
            <tr>
                <td>{{ $parent->pivot->lien }}</td>
                <td>{{ $parent->user->prenom }} {{ $parent->user->nom }}</td>
                <td>{{ $parent->telephone }}</td>
                <td>{{ $parent->user->email }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="4" style="text-align: center; color: #999;">Aucun parent enregistré</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <h2>3. Informations Médicales / Divers</h2>
    <div class="row">
        <span class="label" style="width: 100%;">Problème de santé particulier / Allergies :</span>
        <div style="border: 1px dashed #ccc; padding: 10px; margin-top: 5px; min-height: 40px;">
            {{ $eleve->probleme_particulier ?? 'RAS' }}
        </div>
    </div>

    <div style="margin-top: 50px; font-size: 12px; color: #718096; text-align: center;">
        Fiche générée le {{ now()->format('d/m/Y H:i') }} - Usage interne uniquement.
    </div>
</body>
</html>
