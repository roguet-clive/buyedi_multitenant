<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bulletin de Paie - {{ $paiement->user->nom ?? 'Employe' }} - {{ $moisNom }} {{ $paiement->annee }}</title>
    <style>
        @page {
            margin: 22px 28px;
            size: a4 portrait;
        }
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 10px;
            color: #1e293b;
            line-height: 1.35;
            background-color: #ffffff;
        }

        /* BANDEAU HAUT NATIONAL */
        .national-bar {
            width: 100%;
            height: 3px;
            background: #0B1A2D;
            margin-bottom: 12px;
        }

        /* HEADER TABLE */
        .header-table {
            width: 100%;
            border-bottom: 2px solid #0B1A2D;
            padding-bottom: 10px;
            margin-bottom: 14px;
        }
        .header-table td {
            vertical-align: middle;
        }
        .school-logo {
            max-height: 58px;
            max-width: 90px;
            object-fit: contain;
            display: block;
            margin-bottom: 4px;
        }
        .school-name {
            font-size: 13px;
            font-weight: 800;
            color: #0B1A2D;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            line-height: 1.2;
        }
        .school-sub {
            font-size: 9px;
            color: #475569;
            margin-top: 3px;
            line-height: 1.3;
        }
        .republic-box {
            text-align: center;
            padding: 0 10px;
        }
        .rep-title {
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            color: #0B1A2D;
            letter-spacing: 0.5px;
        }
        .rep-devise {
            font-size: 8px;
            font-style: italic;
            color: #64748b;
            margin-top: 1px;
        }
        .tricolor {
            width: 50px;
            height: 2.5px;
            margin: 4px auto 0 auto;
            background: #15803d;
        }

        .title-box {
            text-align: right;
        }
        .badge-bulletin {
            display: inline-block;
            background-color: #0B1A2D;
            color: #ffffff;
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 5px 12px;
            border-radius: 4px;
        }
        .title-period {
            font-size: 11px;
            font-weight: 800;
            color: #0f766e;
            text-transform: uppercase;
            margin-top: 4px;
            letter-spacing: 0.5px;
        }
        .ref-num {
            font-size: 8.5px;
            color: #64748b;
            margin-top: 2px;
        }

        /* INFOS CARDS */
        .info-table {
            width: 100%;
            margin-bottom: 12px;
            border-collapse: separate;
            border-spacing: 8px 0;
        }
        .info-card {
            border: 1px solid #cbd5e1;
            background-color: #f8fafc;
            border-radius: 6px;
            padding: 9px 12px;
            vertical-align: top;
        }
        .card-header {
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            color: #0B1A2D;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
        }
        .info-row {
            margin-bottom: 3.5px;
            font-size: 9.5px;
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

        /* TABLEAU DES RUBRIQUES */
        .rubriques-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .rubriques-table th {
            background-color: #0B1A2D;
            color: #ffffff;
            font-size: 8.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 6px 8px;
            border: 1px solid #0B1A2D;
        }
        .rubriques-table td {
            padding: 6px 8px;
            border: 1px solid #e2e8f0;
            font-size: 9.5px;
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
        .row-brut {
            background-color: #f1f5f9 !important;
            font-weight: bold;
            color: #0f172a;
            border-top: 1.5px solid #94a3b8;
            border-bottom: 1.5px solid #94a3b8;
        }

        /* NET A PAYER BOX */
        .net-box {
            background: #f0fdf4;
            border: 1.5px solid #16a34a;
            border-radius: 6px;
            padding: 9px 14px;
            margin-bottom: 10px;
        }
        .net-table {
            width: 100%;
        }
        .net-label {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            color: #166534;
            letter-spacing: 0.5px;
        }
        .net-amount {
            font-size: 17px;
            font-weight: 900;
            color: #15803d;
            text-align: right;
            letter-spacing: 0.5px;
        }
        .net-words {
            font-size: 9px;
            font-style: italic;
            color: #14532d;
            margin-top: 4px;
            padding-top: 4px;
            border-top: 1px dashed #86efac;
        }

        /* COMMENTAIRE */
        .comment-box {
            border-left: 3px solid #0ea5e9;
            background: #f0f9ff;
            padding: 6px 10px;
            margin-bottom: 12px;
            color: #0369a1;
            font-size: 9px;
            border-radius: 0 4px 4px 0;
        }

        /* SIGNATURES */
        .signature-table {
            width: 100%;
            margin-top: 15px;
            page-break-inside: avoid;
        }
        .signature-box {
            width: 48%;
            border: 1px dashed #94a3b8;
            height: 95px;
            padding: 8px 10px;
            vertical-align: top;
            background: #fafafa;
            border-radius: 5px;
        }
        .sig-title {
            font-size: 8.5px;
            font-weight: 800;
            text-transform: uppercase;
            color: #334155;
            letter-spacing: 0.3px;
        }
        .sig-sub {
            font-size: 7.5px;
            color: #94a3b8;
            margin-top: 2px;
            font-style: italic;
        }

        /* FOOTER */
        .footer {
            margin-top: 20px;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            text-align: center;
            font-size: 8px;
            color: #94a3b8;
            line-height: 1.4;
        }
    </style>
</head>
<body>

    <div class="national-bar"></div>

    <!-- EN-TÊTE ÉTABLISSEMENT & TITRE -->
    <table class="header-table">
        <tr>
            <td style="width: 50%;">
                <table style="width: 100%;">
                    <tr>
                        @if(!empty($logoBase64))
                        <td style="width: 68px; vertical-align: middle; padding-right: 10px;">
                            <img src="{{ $logoBase64 }}" class="school-logo" alt="Logo">
                        </td>
                        @endif
                        <td style="vertical-align: middle;">
                            <div class="school-name">{{ $etablissement->nom ?? config('app.name', 'Buyedi') }}</div>
                            <div class="school-sub">
                                @if(!empty($etablissement->sigle))<strong>{{ $etablissement->sigle }}</strong> • @endif
                                {{ $etablissement->adresse ?? 'Lambaréné - GABON' }}
                                @if(!empty($etablissement->telephone))<br>Tél : {{ $etablissement->telephone }}@endif
                                @if(!empty($etablissement->email)) | Email : {{ $etablissement->email }}@endif
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
            <td style="width: 20%;" class="republic-box">
                <div class="rep-title">RÉPUBLIQUE GABONAISE</div>
                <div class="rep-devise">Union - Travail - Justice</div>
                <div class="tricolor"></div>
            </td>
            <td style="width: 30%;" class="title-box">
                <div class="badge-bulletin">Bulletin de Paie</div>
                <div class="title-period">{{ $moisNom }} {{ $paiement->annee }}</div>
                <div class="ref-num">
                    Réf : <strong>BUL-{{ str_pad($paiement->id, 6, '0', STR_PAD_LEFT) }}</strong><br>
                    Date de versement : {{ $datePaiement }}
                </div>
            </td>
        </tr>
    </table>

    <!-- INFORMATIONS SALARIÉ ET CONTRAT -->
    <table class="info-table">
        <tr>
            <!-- COLONNE SALARIÉ -->
            <td class="info-card" style="width: 50%;">
                <div class="card-header">1. Salarié Bénéficiaire</div>
                <div class="info-row">
                    <span class="info-label">Nom & Prénom :</span>
                    <span class="info-value">{{ strtoupper($paiement->user->nom ?? '') }} {{ $paiement->user->prenom ?? '' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Identifiant / Matricule :</span>
                    <span class="info-value">EMP-{{ str_pad($paiement->user->id, 4, '0', STR_PAD_LEFT) }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Poste / Fonction :</span>
                    <span class="info-value">{{ $poste }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Adresse Email :</span>
                    <span class="info-value">{{ $paiement->user->email ?? 'Non renseigné' }}</span>
                </div>
            </td>

            <!-- COLONNE CONTRAT & MODALITÉS -->
            <td class="info-card" style="width: 50%;">
                <div class="card-header">2. Modalités Contractuelles</div>
                <div class="info-row">
                    <span class="info-label">Nature du Contrat :</span>
                    <span class="info-value">
                        @if(($contrat->type ?? '') === 'CDI') Contrat à Durée Indéterminée (CDI)
                        @elseif(($contrat->type ?? '') === 'CDD') Contrat à Durée Déterminée (CDD)
                        @elseif(($contrat->type ?? '') === 'Vacataire') Contrat de Vacations / Heures
                        @else {{ $contrat->type ?? 'Standard' }}
                        @endif
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date d'engagement :</span>
                    <span class="info-value">{{ $dateEmbauche }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Mode de règlement :</span>
                    <span class="info-value">Caisse / Virement Bancaire</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Période concernée :</span>
                    <span class="info-value">{{ $moisNom }} {{ $paiement->annee }}</span>
                </div>
            </td>
        </tr>
    </table>

    <!-- DÉCOMPTE DES RUBRIQUES SALARIALES -->
    <table class="rubriques-table">
        <thead>
            <tr>
                <th style="width: 8%;" class="text-center">Code</th>
                <th style="width: 44%;">Désignation des Rubriques</th>
                <th style="width: 16%;" class="text-right">Base / Taux</th>
                <th style="width: 16%;" class="text-right">Gains (+)</th>
                <th style="width: 16%;" class="text-right">Retenues (-)</th>
            </tr>
        </thead>
        <tbody>
            <!-- Salaire de base -->
            @php
                $base = (float) ($contrat->salaire_base ?? $paiement->salaire_brut);
                $brut = (float) $paiement->salaire_brut;
                $vacations = max(0, $brut - $base);
            @endphp
            <tr>
                <td class="text-center">100</td>
                <td><strong>Salaire de Base Catégoriel</strong></td>
                <td class="text-right">{{ number_format($base, 0, ',', ' ') }} XAF</td>
                <td class="text-right font-bold">{{ number_format($base, 0, ',', ' ') }}</td>
                <td class="text-right">-</td>
            </tr>

            <!-- Vacations complémentaires -->
            @if($vacations > 0)
            <tr>
                <td class="text-center">110</td>
                <td>Heures Complémentaires / Vacations</td>
                <td class="text-right">Taux : {{ number_format($contrat->taux_horaire ?? 0, 0, ',', ' ') }} XAF/h</td>
                <td class="text-right font-bold">{{ number_format($vacations, 0, ',', ' ') }}</td>
                <td class="text-right">-</td>
            </tr>
            @endif

            <!-- Total Salaire Brut -->
            <tr class="row-brut">
                <td class="text-center"><strong>BRUT</strong></td>
                <td colspan="2"><strong>SOUS-TOTAL SALAIRE BRUT MENSUEL</strong></td>
                <td class="text-right font-bold" style="color: #0f766e;">{{ number_format($paiement->salaire_brut, 0, ',', ' ') }}</td>
                <td class="text-right">-</td>
            </tr>

            <!-- Primes & Bonus -->
            <tr>
                <td class="text-center">200</td>
                <td>Primes, Indemnités & Gratifications de fonction</td>
                <td class="text-right">-</td>
                <td class="text-right font-bold" style="color: #16a34a;">
                    @if($paiement->primes > 0)
                        + {{ number_format($paiement->primes, 0, ',', ' ') }}
                    @else
                        -
                    @endif
                </td>
                <td class="text-right">-</td>
            </tr>

            <!-- Retenues & Avances -->
            <tr>
                <td class="text-center">300</td>
                <td>Retenues sur salaire, Avances & Cotisations</td>
                <td class="text-right">-</td>
                <td class="text-right">-</td>
                <td class="text-right font-bold" style="color: #dc2626;">
                    @if($paiement->retenues > 0)
                        - {{ number_format($paiement->retenues, 0, ',', ' ') }}
                    @else
                        -
                    @endif
                </td>
            </tr>
        </tbody>
    </table>

    <!-- BLOC NET À PAYER AVEC SOMME EN TOUTES LETTRES -->
    <div class="net-box">
        <table class="net-table">
            <tr>
                <td class="net-label">
                    NET À PAYER EN FAVEUR DU SALARIÉ
                </td>
                <td class="net-amount">
                    {{ number_format($paiement->net_a_payer, 0, ',', ' ') }} FCFA
                </td>
            </tr>
        </table>
        @if(!empty($netEnLettres))
        <div class="net-words">
            Arrêté le présent bulletin de paie à la somme nette de : <strong>{{ $netEnLettres }}</strong>.
        </div>
        @endif
    </div>

    @if(!empty($paiement->commentaire))
    <div class="comment-box">
        <strong>Observation de la Comptabilité :</strong> {{ $paiement->commentaire }}
    </div>
    @endif

    <!-- CADRES DE SIGNATURES OFFICIELLES -->
    <table class="signature-table">
        <tr>
            <td class="signature-box">
                <div class="sig-title">L'Employé(e) (Pour Acquit)</div>
                <div class="sig-sub">Mention manuscrite « Lu et approuvé - Reçu paiement »</div>
            </td>
            <td style="width: 4%;"></td>
            <td class="signature-box">
                <div class="sig-title">Pour la Direction / Le Service Paie</div>
                <div class="sig-sub">Signature autorisée et Cachet officiel de l'établissement</div>
            </td>
        </tr>
    </table>

    <!-- PIED DE PAGE LÉGAL -->
    <div class="footer">
        Document officiel confidentiel généré par la plateforme de gestion <strong>BUYEDI</strong> le {{ date('d/m/Y à H:i') }}.<br>
        Ce document tient lieu de justificatif de paiement et de bulletin de salaire. À conserver sans limitation de durée.
    </div>

</body>
</html>
