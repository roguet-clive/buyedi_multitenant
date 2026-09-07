<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bulletin de Paie - {{ $paiement->user->nom ?? 'Employe' }} - {{ $moisNom }} {{ $paiement->annee }}</title>
    <style>
        @page {
            margin: 25px 30px;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #1e293b;
            line-height: 1.4;
        }
        .header-table {
            width: 100%;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 15px;
        }
        .header-table td {
            vertical-align: middle;
        }
        .school-name {
            font-size: 18px;
            font-weight: 800;
            color: #0B1A2D;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .school-sub {
            font-size: 10px;
            color: #64748b;
            margin-top: 2px;
        }
        .title-box {
            text-align: right;
        }
        .title-main {
            font-size: 18px;
            font-weight: 900;
            color: #0f766e;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .title-period {
            font-size: 12px;
            font-weight: bold;
            color: #334155;
            margin-top: 3px;
        }
        .ref-num {
            font-size: 9px;
            color: #94a3b8;
            margin-top: 2px;
        }

        /* INFOS GRIDS */
        .info-table {
            width: 100%;
            margin-bottom: 15px;
            border-collapse: collapse;
        }
        .info-card {
            border: 1px solid #e2e8f0;
            background-color: #f8fafc;
            border-radius: 6px;
            padding: 10px;
            vertical-align: top;
        }
        .card-header {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: #0B1A2D;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
        }
        .info-row {
            margin-bottom: 4px;
        }
        .info-label {
            color: #64748b;
            font-weight: 600;
            width: 110px;
            display: inline-block;
        }
        .info-value {
            font-weight: 700;
            color: #0f172a;
        }

        /* TABLEAU RUBRIQUES */
        .rubriques-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .rubriques-table th {
            background-color: #0B1A2D;
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 7px 10px;
            border: 1px solid #0B1A2D;
        }
        .rubriques-table td {
            padding: 7px 10px;
            border: 1px solid #e2e8f0;
            font-size: 11px;
        }
        .rubriques-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .font-bold {
            font-weight: bold;
        }

        /* NET A PAYER BOX */
        .net-box {
            background-color: #f0fdf4;
            border: 2px solid #16a34a;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 25px;
        }
        .net-table {
            width: 100%;
        }
        .net-label {
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            color: #166534;
        }
        .net-amount {
            font-size: 18px;
            font-weight: 900;
            color: #15803d;
            text-align: right;
        }

        /* COMMENTAIRE */
        .comment-box {
            border-left: 3px solid #64748b;
            background: #f1f5f9;
            padding: 6px 10px;
            margin-bottom: 25px;
            font-style: italic;
            color: #475569;
            font-size: 10px;
        }

        /* SIGNATURES */
        .signature-table {
            width: 100%;
            margin-top: 30px;
            page-break-inside: avoid;
        }
        .signature-box {
            width: 48%;
            border: 1px dashed #94a3b8;
            height: 90px;
            padding: 8px;
            vertical-align: top;
            background: #fafafa;
        }
        .sig-title {
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            color: #475569;
        }

        /* FOOTER */
        .footer {
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            text-align: center;
            font-size: 9px;
            color: #94a3b8;
        }
    </style>
</head>
<body>

    <!-- EN-TÊTE ÉTABLISSEMENT & TITRE -->
    <table class="header-table">
        <tr>
            <td style="width: 55%;">
                <div class="school-name">{{ $etablissement->nom ?? config('app.name', 'Buyedi') }}</div>
                <div class="school-sub">
                    @if(!empty($etablissement->sigle))<strong>{{ $etablissement->sigle }}</strong> • @endif
                    {{ $etablissement->adresse ?? 'Établissement Scolaire' }}
                    @if(!empty($etablissement->telephone))<br>Tél : {{ $etablissement->telephone }}@endif
                    @if(!empty($etablissement->email)) | Email : {{ $etablissement->email }}@endif
                </div>
            </td>
            <td style="width: 45%;" class="title-box">
                <div class="title-main">Bulletin de Paie</div>
                <div class="title-period">{{ $moisNom }} {{ $paiement->annee }}</div>
                <div class="ref-num">Réf : BUL-{{ str_pad($paiement->id, 6, '0', STR_PAD_LEFT) }} • Date : {{ $datePaiement }}</div>
            </td>
        </tr>
    </table>

    <!-- INFORMATIONS SALARIÉ ET CONTRAT -->
    <table class="info-table">
        <tr>
            <!-- COLONNE SALARIÉ -->
            <td class="info-card" style="width: 48%;">
                <div class="card-header">Informations Salarié</div>
                <div class="info-row">
                    <span class="info-label">Nom & Prénom :</span>
                    <span class="info-value">{{ $paiement->user->nom ?? '' }} {{ $paiement->user->prenom ?? '' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Poste / Fonction :</span>
                    <span class="info-value">{{ $poste }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email :</span>
                    <span class="info-value">{{ $paiement->user->email ?? 'N/A' }}</span>
                </div>
            </td>

            <td style="width: 4%;"></td>

            <!-- COLONNE CONTRAT & PAIEMENT -->
            <td class="info-card" style="width: 48%;">
                <div class="card-header">Détails Contractuels</div>
                <div class="info-row">
                    <span class="info-label">Type de contrat :</span>
                    <span class="info-value">{{ $contrat->type ?? 'Non spécifié' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date d'embauche :</span>
                    <span class="info-value">{{ $dateEmbauche }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date de versement :</span>
                    <span class="info-value">{{ $datePaiement }}</span>
                </div>
            </td>
        </tr>
    </table>

    <!-- DÉCOMPTE DES RUBRIQUES SALARIALES -->
    <table class="rubriques-table">
        <thead>
            <tr>
                <th style="width: 45%;">Rubrique / Libellé</th>
                <th style="width: 20%;" class="text-right">Base / Taux</th>
                <th style="width: 17%;" class="text-right">Gains (+)</th>
                <th style="width: 18%;" class="text-right">Retenues (-)</th>
            </tr>
        </thead>
        <tbody>
            <!-- Salaire de base -->
            <tr>
                <td><strong>Salaire de Base Fixe</strong></td>
                <td class="text-right">{{ number_format($contrat->salaire_base ?? $paiement->salaire_brut, 0, ',', ' ') }} XAF</td>
                <td class="text-right font-bold">{{ number_format($contrat->salaire_base ?? $paiement->salaire_brut, 0, ',', ' ') }}</td>
                <td class="text-right">-</td>
            </tr>

            <!-- Complément de vacations si applicable -->
            @php
                $base = (float) ($contrat->salaire_base ?? 0);
                $brut = (float) $paiement->salaire_brut;
                $vacations = max(0, $brut - $base);
            @endphp
            @if($vacations > 0)
            <tr>
                <td>Heures de Vacations / Cours complémentaires</td>
                <td class="text-right">Taux : {{ number_format($contrat->taux_horaire ?? 0, 0, ',', ' ') }} XAF/h</td>
                <td class="text-right font-bold">{{ number_format($vacations, 0, ',', ' ') }}</td>
                <td class="text-right">-</td>
            </tr>
            @endif

            <!-- Total Salaire Brut -->
            <tr style="background-color: #f1f5f9; font-weight: bold;">
                <td colspan="2"><strong>SOUS-TOTAL SALAIRE BRUT</strong></td>
                <td class="text-right font-bold" style="color: #0f766e;">{{ number_format($paiement->salaire_brut, 0, ',', ' ') }}</td>
                <td class="text-right">-</td>
            </tr>

            <!-- Primes & Bonus -->
            <tr>
                <td>Primes, Indemnités & Gratifications</td>
                <td class="text-right">-</td>
                <td class="text-right font-bold" style="color: #16a34a;">
                    @if($paiement->primes > 0)
                        + {{ number_format($paiement->primes, 0, ',', ' ') }}
                    @else
                        0
                    @endif
                </td>
                <td class="text-right">-</td>
            </tr>

            <!-- Retenues & Avances -->
            <tr>
                <td>Avances sur salaire, Acomptes & Déductions</td>
                <td class="text-right">-</td>
                <td class="text-right">-</td>
                <td class="text-right font-bold" style="color: #dc2626;">
                    @if($paiement->retenues > 0)
                        - {{ number_format($paiement->retenues, 0, ',', ' ') }}
                    @else
                        0
                    @endif
                </td>
            </tr>
        </tbody>
    </table>

    <!-- NET À PAYER -->
    <div class="net-box">
        <table class="net-table">
            <tr>
                <td class="net-label">
                    NET À PAYER EN FAVEUR DU SALARIÉ
                </td>
                <td class="net-amount">
                    {{ number_format($paiement->net_a_payer, 0, ',', ' ') }} XAF
                </td>
            </tr>
        </table>
    </div>

    @if(!empty($paiement->commentaire))
    <div class="comment-box">
        <strong>Observation / Motif :</strong> {{ $paiement->commentaire }}
    </div>
    @endif

    <!-- SIGNATURES -->
    <table class="signature-table">
        <tr>
            <td class="signature-box">
                <div class="sig-title">Signature de l'Employé (Pour Acquit)</div>
            </td>
            <td style="width: 4%;"></td>
            <td class="signature-box">
                <div class="sig-title">Cachet et Signature de la Direction</div>
            </td>
        </tr>
    </table>

    <!-- PIED DE PAGE -->
    <div class="footer">
        Document édité par le logiciel de gestion <strong>Buyedi</strong> le {{ date('d/m/Y à H:i') }} — Document tenant lieu de reçu et bulletin de salaire.
    </div>

</body>
</html>
