<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Emploi du Temps - {{ $titre }}</title>
    <style>
        @page {
            margin: 15mm 15mm 15mm 15mm;
            size: A4 landscape;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #1e293b;
            font-size: 11px;
            line-height: 1.2;
            margin: 0;
            padding: 0;
        }
        
        /* En-tête */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .header-left {
            width: 25%;
            vertical-align: middle;
        }
        .header-center {
            width: 50%;
            text-align: center;
            vertical-align: middle;
        }
        .header-right {
            width: 25%;
            text-align: right;
            vertical-align: middle;
            font-size: 9px;
            color: #475569;
        }
        
        .school-name {
            font-size: 16px;
            font-weight: bold;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 2px 0;
        }
        .school-sub {
            font-size: 10px;
            color: #64748b;
            margin: 0;
        }
        .doc-title {
            font-size: 15px;
            font-weight: 800;
            color: #1e1b4b;
            text-transform: uppercase;
            margin-top: 4px;
            letter-spacing: 1px;
        }
        .doc-subtitle {
            font-size: 11px;
            font-weight: 600;
            color: #4338ca;
        }

        /* Grille Emploi du Temps */
        .schedule-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
            table-layout: fixed;
        }
        .schedule-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 6px 4px;
            text-align: center;
            border: 1px solid #334155;
        }
        .schedule-table td {
            border: 1px solid #cbd5e1;
            padding: 3px;
            vertical-align: top;
            height: 40px;
            font-size: 9px;
        }
        .schedule-table td.time-col {
            background-color: #f8fafc;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
            color: #334155;
            width: 55px;
            font-size: 9px;
        }

        /* Boîte de cours */
        .course-card {
            background-color: #eef2ff;
            border-left: 3px solid #4f46e5;
            padding: 4px 5px;
            border-radius: 4px;
            margin-bottom: 2px;
        }
        .course-matiere {
            font-weight: bold;
            font-size: 10px;
            color: #1e1b4b;
            margin-bottom: 2px;
        }
        .course-time {
            font-size: 8px;
            font-weight: bold;
            color: #4338ca;
        }
        .course-info {
            font-size: 8px;
            color: #334155;
            margin-top: 1px;
        }
        .course-salle {
            display: inline-block;
            background-color: #e2e8f0;
            color: #1e293b;
            padding: 1px 3px;
            border-radius: 2px;
            font-size: 7.5px;
            font-weight: bold;
        }

        /* Pied de page et signature */
        .footer-table {
            width: 100%;
            margin-top: 15px;
            border-collapse: collapse;
        }
        .footer-note {
            font-size: 8.5px;
            color: #64748b;
            font-style: italic;
        }
        .signature-box {
            text-align: right;
            font-size: 10px;
            font-weight: bold;
        }
        .signature-line {
            height: 35px;
        }
    </style>
</head>
<body>

    <!-- En-tête -->
    <table class="header-table">
        <tr>
            <td class="header-left">
                @if(!empty($etablissement['logo']) && file_exists($etablissement['logo']))
                    <img src="{{ $etablissement['logo'] }}" style="max-height: 45px; width: auto;" alt="Logo">
                @else
                    <div style="font-size: 18px; font-weight: 900; color: #4338ca;">BUYEDI</div>
                @endif
            </td>
            <td class="header-center">
                <div class="school-name">{{ $etablissement['nom'] }}</div>
                <div class="doc-title">EMPLOI DU TEMPS</div>
                <div class="doc-subtitle">{{ $titre }} &bull; Année Scolaire {{ $anneeScolaire->nom ?? date('Y') }}</div>
            </td>
            <td class="header-right">
                <div><strong>Date :</strong> {{ now()->format('d/m/Y') }}</div>
                <div>{{ $etablissement['telephone'] ?? '' }}</div>
                <div>{{ $etablissement['email'] ?? '' }}</div>
            </td>
        </tr>
    </table>

    <!-- Grille de l'emploi du temps -->
    <table class="schedule-table">
        <thead>
            <tr>
                <th style="width: 55px;">Heure</th>
                @foreach($jours as $j)
                    <th>{{ $j }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($heures as $h)
                <tr>
                    <td class="time-col">
                        {{ sprintf('%02d:00', $h) }}<br>
                        <span style="color: #94a3b8; font-size: 7.5px;">{{ sprintf('%02d:00', $h + 1) }}</span>
                    </td>
                    @foreach($jours as $j)
                        @php
                            $slotKey = strtolower($j) . '_' . $h;
                            $slotsInCell = $grid[$slotKey] ?? [];
                        @endphp
                        <td>
                            @foreach($slotsInCell as $slot)
                                <div class="course-card">
                                    <div class="course-matiere">{{ $slot->matiere->nom ?? 'Cours' }}</div>
                                    <div class="course-time">
                                        {{ substr($slot->heure_debut, 0, 5) }} - {{ substr($slot->heure_fin, 0, 5) }}
                                    </div>
                                    @if($typeVue === 'classe' && $slot->enseignant)
                                        <div class="course-info">
                                            Prof : {{ $slot->enseignant->prenom }} {{ $slot->enseignant->nom }}
                                        </div>
                                    @elseif($typeVue === 'enseignant' && $slot->classe)
                                        <div class="course-info">
                                            Classe : <strong>{{ $slot->classe->nom }}</strong>
                                        </div>
                                    @endif
                                    @if(!empty($slot->salle))
                                        <div style="margin-top: 1px;">
                                            <span class="course-salle">Salle : {{ $slot->salle }}</span>
                                        </div>
                                    @endif
                                </div>
                            @endforeach
                        </td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Pied de page & Signature -->
    <table class="footer-table">
        <tr>
            <td style="width: 60%; vertical-align: bottom;">
                <div class="footer-note">
                    * Document officiel généré via la plateforme Buyedi. Tout aménagement ou changement d'horaire doit être validé par la Direction des Études.
                </div>
            </td>
            <td style="width: 40%; vertical-align: bottom;" class="signature-box">
                <div>Le Directeur / La Direction des Études</div>
                <div class="signature-line"></div>
                <div style="font-size: 8.5px; color: #64748b; font-weight: normal;">Signature & Cachet</div>
            </td>
        </tr>
    </table>

</body>
</html>
