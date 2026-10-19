<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bulletin de Notes</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { width: 100%; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { width: 100px; float: left; }
        .school-info { text-align: center; }
        .student-info { width: 100%; margin-bottom: 20px; border: 1px solid #ccc; padding: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #999; padding: 8px; text-align: center; }
        th { background-color: #eee; }
        .text-left { text-align: left; }

        .signatures { margin-top: 40px; display: flex; justify-content: space-between; }
        .sig-box { width: 30%; float: left; text-align: center; height: 100px; border: 1px solid #eee; }
    </style>
</head>
<body>

    @include('documents.partials.footer', ['etablissement' => $etablissement])

    <div class="header">
        @if(!empty($etablissement['logo']))
            <img src="{{ $etablissement['logo'] }}" class="logo" alt="Logo">
        @endif
        <div class="school-info">
            <h1>{{ $etablissement['nom'] }}</h1>
            <p>{{ $etablissement['adresse'] }} | Tél: {{ $etablissement['telephone'] }}</p>
            <h2>BULLETIN DE NOTES</h2>
            <h3>{{ $bulletin['periode']->nom }} - {{ $bulletin['periode']->code }}</h3>
            <p>Année Scolaire : {{ $bulletin['inscription']->anneeScolaire->nom }}</p>
        </div>
        <div style="clear: both;"></div>
    </div>

    <div class="student-info">
        <table style="border: none;">
            <tr style="border: none;">
                <td style="border: none; text-align: left;">
                    <strong>Nom & Prénom :</strong> {{ $bulletin['inscription']->eleve->user->nom }} {{ $bulletin['inscription']->eleve->user->prenom }}<br>
                    <strong>Matricule :</strong> {{ $bulletin['inscription']->eleve->matricule }}<br>
                    <strong>Date de naissance :</strong> {{ $bulletin['inscription']->eleve->date_naissance }}
                </td>
                <td style="border: none; text-align: left;">
                    <strong>Classe :</strong> {{ $bulletin['inscription']->classe->nom }}<br>
                    <strong>Effectif :</strong> N/A<br>
                    <strong>Titulaire :</strong> N/A
                </td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th class="text-left" style="width: 30%;">Matière / Enseignant</th>
                <th style="width: 10%;">Coeff.</th>
                <th style="width: 10%;">Moyenne</th>
                <th style="width: 10%;">Points</th>
                <th style="width: 10%;">Rang</th>
                <th style="width: 10%;">Min/Max</th>
                <th style="width: 20%;">Appréciation</th>
            </tr>
        </thead>
        <tbody>
            @foreach($bulletin['lignes'] as $ligne)
            <tr>
                <td class="text-left">
                    <strong>{{ $ligne['matiere'] }}</strong><br>
                    <small><i>{{ $ligne['enseignant'] }}</i></small>
                </td>
                <td>{{ $ligne['coefficient'] }}</td>
                <td><strong>{{ $ligne['moyenne'] }}</strong></td>
                <td>{{ $ligne['points'] }}</td>
                <td>-</td> <!-- Rang matière à calculer si possible -->
                <td style="font-size: 10px;">{{ $ligne['min'] }} / {{ $ligne['max'] }}</td>
                <td class="text-left" style="font-size: 10px;">{{ $ligne['appreciation'] }}</td>
            </tr>
            @endforeach
            <tr style="background-color: #f9f9f9; font-weight: bold;">
                <td class="text-left">TOTAL GÉNÉRAL</td>
                <td>{{ $bulletin['total_coefficients'] }}</td>
                <td>{{ $bulletin['moyenne_generale'] }} / 20</td>
                <td>{{ $bulletin['total_points'] }}</td>
                <td colspan="3">{{ $bulletin['appreciation_generale'] }}</td>
            </tr>
        </tbody>
    </table>

    <div style="text-align: right; margin-bottom: 8px; font-size: 11px;">
        <strong>Fait à {{ $etablissement['ville'] ?? 'Libreville' }}, le {{ now()->format('d/m/Y') }}</strong>
    </div>

    <table style="width: 100%; border: none; margin-top: 5px; margin-bottom: 30px;">
        <tr style="border: none;">
            <td style="border: 1px solid #ccc; width: 30%; height: 80px; text-align: center; vertical-align: top; padding: 6px;">
                <strong style="font-size: 10px; text-transform: uppercase;">Signature des Parents</strong>
            </td>
            <td style="border: none; width: 5%;"></td>
            <td style="border: 1px solid #ccc; width: 30%; height: 80px; text-align: center; vertical-align: top; padding: 6px;">
                <strong style="font-size: 10px; text-transform: uppercase;">Le Titulaire</strong>
            </td>
            <td style="border: none; width: 5%;"></td>
            <td style="border: 1px solid #ccc; width: 30%; height: 80px; text-align: center; vertical-align: top; padding: 6px;">
                <strong style="font-size: 10px; text-transform: uppercase;">Le Chef d'Établissement</strong>
            </td>
        </tr>
    </table>

</body>
</html>
