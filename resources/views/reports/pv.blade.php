<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Procès Verbal - {{ $classe->nom }}</title>
    <style>
        body { font-family: sans-serif; font-size: 10px; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .title { font-size: 16px; font-weight: bold; text-transform: uppercase; }
        .info { font-size: 12px; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #000; padding: 4px; text-align: center; }
        th { background-color: #f0f0f0; font-weight: bold; }
        .student-name { text-align: left; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .final-cols { font-weight: bold; background-color: #e0e0e0; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">PROCÈS VERBAL DES NOTES</div>
        <div class="info">
            Établissement: {{ $etablissement['nom'] ?? 'Buyedi' }} <br>
            Classe: {{ $classe->nom }} | Période: {{ $periode->nom }}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th rowspan="2" style="width: 20px;">N°</th>
                <th rowspan="2" class="student-name">Nom & Prénom</th>
                @foreach($matieres as $m)
                    <th title="{{ $m['nom'] }}">{{ substr($m['nom'], 0, 10) }}.<br><small>Cf:{{ $m['coeff'] }}</small></th>
                @endforeach
                <th rowspan="2" class="final-cols">Total<br>Points</th>
                <th rowspan="2" class="final-cols">Moyenne<br>/20</th>
                <th rowspan="2" class="final-cols">Rang</th>
                <th rowspan="2" class="final-cols">Décision</th>
            </tr>
            <tr>
                @foreach($matieres as $m)
                    <th>20</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($bulletins as $idx => $b)
                <tr>
                    <td>{{ $idx + 1 }}</td>
                    <td class="student-name">{{ $b['inscription']->eleve->user->nom }} {{ $b['inscription']->eleve->user->prenom }}</td>
                    
                    @foreach($matieres as $m)
                        @php
                            $ligne = collect($b['lignes'])->firstWhere('cours_id', $m['cours_id']);
                        @endphp
                        <td>
                            @if($ligne)
                                {{ number_format($ligne['moyenne'], 2) }}
                            @else
                                -
                            @endif
                        </td>
                    @endforeach
                    
                    <td class="final-cols">{{ number_format($b['total_points'], 2) }}</td>
                    <td class="final-cols">{{ number_format($b['moyenne_generale'], 2) }}</td>
                    <td class="final-cols">{{ $b['rang'] }}</td>
                    <td class="final-cols">{{ $b['decision'] ?? $b['appreciation_generale'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div style="margin-top: 25px; page-break-inside: avoid;">
        <div style="text-align: right; margin-bottom: 8px; font-size: 11px;">
            <strong>Fait à {{ $etablissement['ville'] ?? 'Libreville' }}, le {{ now()->format('d/m/Y') }}</strong>
        </div>

        <table style="width: 100%; border: none; margin-top: 5px;">
            <tr style="border: none;">
                <td style="border: 1px solid #999; width: 45%; height: 75px; text-align: center; vertical-align: top; padding: 6px;">
                    <strong style="text-transform: uppercase;">Le Président du Conseil / Titulaire</strong>
                </td>
                <td style="border: none; width: 10%;"></td>
                <td style="border: 1px solid #999; width: 45%; height: 75px; text-align: center; vertical-align: top; padding: 6px;">
                    <strong style="text-transform: uppercase;">Le Chef d'Établissement / La Direction</strong>
                </td>
            </tr>
        </table>

        <div style="text-align: center; font-size: 9px; color: #666; margin-top: 15px; border-top: 1px solid #ddd; padding-top: 5px;">
            Procès-Verbal officiel certifié • Progiciel BUYEDI • Édité le {{ date('d/m/Y à H:i') }}
        </div>
    </div>
</body>
</html>
