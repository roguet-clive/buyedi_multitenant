<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Billet de Sortie - {{ $eleve->user->nom ?? '' }} {{ $eleve->user->prenom ?? '' }}</title>
    <style>
        @page {
            margin: 6mm 10mm 14mm 10mm;
            size: A4 portrait;
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
        }

        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            font-family: 'DejaVu Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1A202C;
            background-color: #FFFFFF;
            font-size: 8.8pt;
            line-height: 1.35;
        }

        /* ========================================
           VOLET - CONTENEUR PRINCIPAL
        ======================================== */
        .volet-wrap {
            border: 2px solid #0B3C5D;
            border-radius: 5px;
            padding: 2px;
            background-color: #FFFFFF;
        }

        .volet-inner {
            border: 1px solid #6B8EAE;
            border-radius: 3px;
            padding: 9px 12px 10px 12px;
            position: relative;
            background-color: #FFFFFF;
        }

        .volet-inner.green {
            border-color: #007A48;
        }

        .volet-wrap.green {
            border-color: #007A48;
        }

        /* ========================================
           BADGE VOLET
        ======================================== */
        .volet-badge {
            position: absolute;
            top: 7px;
            right: 9px;
            font-size: 6pt;
            font-weight: 900;
            text-transform: uppercase;
            padding: 1.5px 6px;
            border-radius: 2px;
            background-color: #EFF6FF;
            color: #0B3C5D;
            border: 0.8px solid #BFDBFE;
            letter-spacing: 0.3px;
        }

        .volet-badge.green {
            background-color: #F0FDF4;
            color: #007A48;
            border-color: #BBF7D0;
        }

        /* ========================================
           EN-TÊTE RÉPUBLICAIN COMPACT
        ======================================== */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
        }

        .h-republic {
            width: 30%;
            vertical-align: middle;
            text-align: center;
        }

        .republic-name {
            font-size: 7.4pt;
            font-weight: 900;
            color: #0B3C5D;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .republic-motto {
            font-size: 6.2pt;
            font-style: italic;
            color: #4A5568;
        }

        .republic-icons {
            margin: 2px auto;
        }

        .emblem-sm {
            height: 18px;
            width: auto;
            vertical-align: middle;
        }

        .flag-sm {
            height: 10px;
            width: 16px;
            vertical-align: middle;
            border: 0.3px solid rgba(0,0,0,0.15);
        }

        .h-center {
            width: 40%;
            text-align: center;
            vertical-align: middle;
            padding: 0 4px;
        }

        .school-logo-sm {
            max-height: 38px;
            max-width: 50px;
            object-fit: contain;
        }

        .school-name-sm {
            font-size: 9pt;
            font-weight: 900;
            color: #0B3C5D;
            text-transform: uppercase;
            letter-spacing: 0.2px;
        }

        .school-sub-sm {
            font-size: 6.2pt;
            color: #64748B;
            margin-top: 1px;
        }

        .h-ref {
            width: 30%;
            text-align: right;
            vertical-align: middle;
            font-size: 7.2pt;
            color: #334155;
        }

        .ref-number {
            font-weight: 900;
            color: #C53030;
            font-size: 7.8pt;
        }

        /* ========================================
           RUBAN TRICOLORE MINCE
        ======================================== */
        .divider-tri {
            width: 100%;
            height: 2px;
            border-collapse: collapse;
            margin: 4px 0 5px 0;
        }

        .d-g { background-color: #009E60; width: 33.33%; height: 2px; }
        .d-y { background-color: #FCD116; width: 33.33%; height: 2px; }
        .d-b { background-color: #3A75C4; width: 33.34%; height: 2px; }

        /* ========================================
           TITRE VOLET
        ======================================== */
        .volet-title {
            text-align: center;
            background-color: #0B3C5D;
            color: #FFFFFF;
            font-weight: 900;
            font-size: 9pt;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            padding: 4px 6px;
            border-radius: 3px;
            margin: 0 0 6px 0;
        }

        .volet-title.green {
            background-color: #007A48;
        }

        /* ========================================
           GRILLE DES CHAMPS
        ======================================== */
        .fields-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
        }

        .fields-table td {
            padding: 2.5px 3px;
            vertical-align: middle;
        }

        .f-lbl {
            width: 95px;
            font-weight: 800;
            color: #4A5568;
            text-transform: uppercase;
            font-size: 6.8pt;
            letter-spacing: 0.2px;
            white-space: nowrap;
        }

        .f-sep {
            width: 10px;
            font-weight: 900;
            color: #94A3B8;
            text-align: center;
        }

        .f-val {
            font-weight: 700;
            color: #1A202C;
            font-size: 8.4pt;
            border-bottom: 0.8px dotted #CBD5E1;
            padding-bottom: 1px;
        }

        .f-name {
            font-size: 9.5pt;
            font-weight: 900;
            color: #0B3C5D;
            text-transform: uppercase;
            letter-spacing: 0.2px;
        }

        .f-matricule {
            font-weight: 900;
            color: #C53030;
            letter-spacing: 0.3px;
        }

        .f-class {
            font-weight: 900;
            color: #007A48;
        }

        .f-motif {
            color: #1A202C;
            font-size: 8pt;
        }

        /* LIGNE REMPLIE (zone de saisie manuscrite) */
        .f-blank {
            border-bottom: 1px solid #CBD5E1;
            display: block;
            width: 100%;
            min-height: 12px;
        }

        /* ========================================
           SECTION BAS DE VOLET : QR + SIGNATURES
        ======================================== */
        .sig-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
        }

        .sig-qr {
            width: 18%;
            vertical-align: middle;
            text-align: center;
        }

        .sig-qr img {
            width: 44px;
            height: 44px;
            display: block;
            margin: 0 auto;
        }

        .sig-qr-caption {
            font-size: 5.2pt;
            color: #007A48;
            font-weight: 800;
            text-transform: uppercase;
            margin-top: 1px;
            letter-spacing: 0.2px;
        }

        .sig-col {
            width: 41%;
            text-align: center;
            vertical-align: top;
            padding: 0 4px;
        }

        .sig-title {
            font-size: 6.8pt;
            font-weight: 900;
            text-transform: uppercase;
            color: #4A5568;
            margin-bottom: 2px;
        }

        .sig-box {
            height: 42px;
            border: 0.8px dashed #CBD5E1;
            border-radius: 2px;
            background-color: #FAFAFA;
        }

        /* ========================================
           MENTION SÉCURITÉ BAS
        ======================================== */
        .security-note {
            margin-top: 6px;
            padding-top: 4px;
            border-top: 0.5px solid #E2E8F0;
            text-align: center;
            font-size: 5.8pt;
            color: #94A3B8;
            line-height: 1.3;
        }

        /* ========================================
           LIGNE DE DÉCOUPE
        ======================================== */
        .cut-line {
            width: 100%;
            text-align: center;
            margin: 8px 0;
            position: relative;
        }

        .cut-rule {
            border-top: 1.5px dashed #94A3B8;
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            z-index: 1;
        }

        .cut-badge {
            display: inline-block;
            background-color: #FFFFFF;
            padding: 2px 14px;
            border-radius: 10px;
            font-size: 6.2pt;
            font-weight: 800;
            color: #64748B;
            border: 0.8px solid #CBD5E1;
            position: relative;
            z-index: 2;
            letter-spacing: 0.3px;
        }

    </style>
</head>
<body>

@php
    $fullName = trim(($eleve->user->nom ?? '') . ' ' . ($eleve->user->prenom ?? ''));
    $schoolName = $etablissement['nom'] ?? 'COMPLEXE SCOLAIRE BUYEDI';
    $schoolCity = $etablissement['ville'] ?? 'Libreville';
    $schoolPhone = $etablissement['telephone'] ?? '+241 77 00 00 00';
    $siteWeb = $etablissement['site_web'] ?? 'https://appbuyedi.com';
    $schoolYear = $inscription->anneeScolaire->nom ?? date('Y') . '-' . (date('Y')+1);
    $className = $inscription->classe->nom ?? 'Non assignée';
    $matricule = $eleve->matricule ?? (($etablissement['sigle'] ?? 'CS-BUYEDI') . '-' . date('Y') . '-' . str_pad($eleve->id ?? 1, 4, '0', STR_PAD_LEFT));
    $dateNaissance = $eleve->date_naissance ? $eleve->date_naissance->format('d/m/Y') : 'Non renseignée';

    $documentTitle = 'Billet d\'Autorisation de Sortie';
    $docRef = $reference ?? ('SORTIE/' . date('Ymd') . '/' . $matricule);

    // Assets
    $emblemPath = public_path('images/armoiries_gabon.png');
    $flagPath   = public_path('images/gabon_flag.png');
    $schoolLogo = null;
    if (!empty($etablissement['logo']) && file_exists($etablissement['logo'])) {
        $schoolLogo = $etablissement['logo'];
    } elseif (file_exists(public_path('images/logo.png'))) {
        $schoolLogo = public_path('images/logo.png');
    }
@endphp

{{-- PIED DE PAGE OFFICIEL (DOMPDF FIXE EN BAS) --}}
@include('documents.partials.footer', [
    'etablissement' => $etablissement,
    'documentTitle' => $documentTitle,
    'schoolYear'    => $schoolYear,
])

{{-- ============================================================
     VOLET 1 : SOUCHE ADMINISTRATION / SURVEILLANCE
============================================================ --}}
<div class="volet-wrap">
    <div class="volet-inner">
        <div class="volet-badge">Volet 1 &bull; Souche Surveillance</div>

        {{-- EN-TÊTE RÉPUBLICAIN --}}
        <table class="header-table">
            <tr>
                {{-- République --}}
                <td class="h-republic">
                    <div class="republic-name">République Gabonaise</div>
                    <div class="republic-motto">Union &bull; Travail &bull; Justice</div>
                    <div class="republic-icons">
                        @if(file_exists($emblemPath))
                            <img src="{{ $emblemPath }}" class="emblem-sm" alt="Armoiries">
                        @endif
                        @if(file_exists($flagPath))
                            <img src="{{ $flagPath }}" class="flag-sm" alt="Drapeau">
                        @endif
                    </div>
                </td>

                {{-- Centre : Établissement --}}
                <td class="h-center">
                    @if($schoolLogo)
                        <img src="{{ $schoolLogo }}" class="school-logo-sm" alt="Logo"><br>
                    @endif
                    <div class="school-name-sm">{{ $schoolName }}</div>
                    <div class="school-sub-sm">Surveillance Générale &bull; Direction de la Vie Scolaire</div>
                </td>

                {{-- Référence --}}
                <td class="h-ref">
                    Réf. : <span class="ref-number">{{ $docRef }}</span><br>
                    Date : <strong>{{ now()->format('d/m/Y') }}</strong><br>
                    Heure : <strong>{{ now()->format('H:i') }}</strong>
                </td>
            </tr>
        </table>

        {{-- RUBAN TRICOLORE --}}
        <table class="divider-tri">
            <tr>
                <td class="d-g"></td>
                <td class="d-y"></td>
                <td class="d-b"></td>
            </tr>
        </table>

        {{-- TITRE --}}
        <div class="volet-title">&#9873;&nbsp; AUTORISATION DE SORTIE &bull; SOUCHE ÉTABLISSEMENT</div>

        {{-- DONNÉES ÉLÈVE --}}
        <table class="fields-table">
            <tr>
                <td class="f-lbl">Élève</td>
                <td class="f-sep">:</td>
                <td class="f-val f-name" colspan="4">{{ $fullName }}</td>
            </tr>
            <tr>
                <td class="f-lbl">Matricule</td>
                <td class="f-sep">:</td>
                <td class="f-val f-matricule" style="width: 32%;">{{ $matricule }}</td>
                <td class="f-lbl" style="width: 70px; padding-left: 8px;">Classe</td>
                <td class="f-sep">:</td>
                <td class="f-val f-class">{{ $className }}</td>
            </tr>
            <tr>
                <td class="f-lbl">Date de naissance</td>
                <td class="f-sep">:</td>
                <td class="f-val" colspan="4">{{ $dateNaissance }}</td>
            </tr>
            <tr>
                <td class="f-lbl">Heure de sortie</td>
                <td class="f-sep">:</td>
                <td class="f-val">{{ now()->format('H:i') }}</td>
                <td class="f-lbl" style="padding-left: 8px;">Retour prévu</td>
                <td class="f-sep">:</td>
                <td class="f-val">......... h .......</td>
            </tr>
            <tr>
                <td class="f-lbl">Motif de la sortie</td>
                <td class="f-sep">:</td>
                <td class="f-val f-motif" colspan="4">.................................................................................................................................................................................................................................</td>
            </tr>
            <tr>
                <td class="f-lbl">Accompagnateur</td>
                <td class="f-sep">:</td>
                <td class="f-val f-motif" colspan="4">.................................................................................................................................................................................................................................</td>
            </tr>
        </table>

        {{-- SIGNATURES --}}
        <table class="sig-table">
            <tr>
                <td class="sig-qr">
                    @if(!empty($qrCode))
                        <img src="data:image/svg+xml;base64,{{ $qrCode }}" alt="QR Code">
                        <div class="sig-qr-caption">Sécurisé QR</div>
                    @endif
                </td>
                <td class="sig-col">
                    <div class="sig-title">Le Parent / Tuteur Légal</div>
                    <div class="sig-box"></div>
                </td>
                <td class="sig-col">
                    <div class="sig-title">Le Surveillant Général / Direction</div>
                    <div class="sig-box"></div>
                </td>
            </tr>
        </table>

        <div class="security-note">
            Document officiel &bull; Système Buyedi &bull; Toute falsification est passible de sanctions judiciaires.
        </div>
    </div>
</div>

{{-- LIGNE DE DÉCOUPE --}}
<div class="cut-line">
    <div class="cut-rule"></div>
    <div class="cut-badge">&#9986;&nbsp; LIGNE DE DÉCOUPE &bull; PRÉSENTER AU POSTE DE CONTRÔLE / PORTAIL</div>
</div>

{{-- ============================================================
     VOLET 2 : BILLET ÉLÈVE / PORTEUR (PORTAIL)
============================================================ --}}
<div class="volet-wrap green">
    <div class="volet-inner green">
        <div class="volet-badge green">Volet 2 &bull; Billet Porteur (Portail)</div>

        {{-- EN-TÊTE RÉPUBLICAIN --}}
        <table class="header-table">
            <tr>
                <td class="h-republic">
                    <div class="republic-name" style="color: #007A48;">République Gabonaise</div>
                    <div class="republic-motto">Union &bull; Travail &bull; Justice</div>
                    <div class="republic-icons">
                        @if(file_exists($emblemPath))
                            <img src="{{ $emblemPath }}" class="emblem-sm" alt="Armoiries">
                        @endif
                        @if(file_exists($flagPath))
                            <img src="{{ $flagPath }}" class="flag-sm" alt="Drapeau">
                        @endif
                    </div>
                </td>

                <td class="h-center">
                    @if($schoolLogo)
                        <img src="{{ $schoolLogo }}" class="school-logo-sm" alt="Logo"><br>
                    @endif
                    <div class="school-name-sm" style="color: #007A48;">{{ $schoolName }}</div>
                    <div class="school-sub-sm">Contrôle des Accès &bull; Sortie Autorisée</div>
                </td>

                <td class="h-ref">
                    Réf. : <span class="ref-number">{{ $docRef }}</span><br>
                    Date : <strong>{{ now()->format('d/m/Y') }}</strong><br>
                    Heure : <strong>{{ now()->format('H:i') }}</strong>
                </td>
            </tr>
        </table>

        {{-- RUBAN TRICOLORE --}}
        <table class="divider-tri">
            <tr>
                <td class="d-g"></td>
                <td class="d-y"></td>
                <td class="d-b"></td>
            </tr>
        </table>

        {{-- TITRE --}}
        <div class="volet-title green">&#9873;&nbsp; BILLET DE SORTIE ÉLÈVE &bull; LAISSEZ-PASSER OFFICIEL</div>

        {{-- DONNÉES ÉLÈVE --}}
        <table class="fields-table">
            <tr>
                <td class="f-lbl">Élève</td>
                <td class="f-sep">:</td>
                <td class="f-val f-name" colspan="4">{{ $fullName }}</td>
            </tr>
            <tr>
                <td class="f-lbl">Matricule</td>
                <td class="f-sep">:</td>
                <td class="f-val f-matricule" style="width: 32%;">{{ $matricule }}</td>
                <td class="f-lbl" style="width: 70px; padding-left: 8px;">Classe</td>
                <td class="f-sep">:</td>
                <td class="f-val f-class">{{ $className }}</td>
            </tr>
            <tr>
                <td class="f-lbl">Date de naissance</td>
                <td class="f-sep">:</td>
                <td class="f-val" colspan="4">{{ $dateNaissance }}</td>
            </tr>
            <tr>
                <td class="f-lbl">Heure de sortie</td>
                <td class="f-sep">:</td>
                <td class="f-val">{{ now()->format('H:i') }}</td>
                <td class="f-lbl" style="padding-left: 8px;">Retour prévu</td>
                <td class="f-sep">:</td>
                <td class="f-val">......... h .......</td>
            </tr>
            <tr>
                <td class="f-lbl">Motif de la sortie</td>
                <td class="f-sep">:</td>
                <td class="f-val f-motif" colspan="4">.................................................................................................................................................................................................................................</td>
            </tr>
            <tr>
                <td class="f-lbl">Accompagnateur</td>
                <td class="f-sep">:</td>
                <td class="f-val f-motif" colspan="4">.................................................................................................................................................................................................................................</td>
            </tr>
        </table>

        {{-- SIGNATURES --}}
        <table class="sig-table">
            <tr>
                <td class="sig-qr">
                    @if(!empty($qrCode))
                        <img src="data:image/svg+xml;base64,{{ $qrCode }}" alt="QR Code">
                        <div class="sig-qr-caption" style="color: #007A48;">Sécurisé QR</div>
                    @endif
                </td>
                <td class="sig-col">
                    <div class="sig-title">Visa Poste de Garde</div>
                    <div class="sig-box" style="border-color: #BBF7D0;"></div>
                </td>
                <td class="sig-col">
                    <div class="sig-title">Le Surveillant Général (Cachet)</div>
                    <div class="sig-box" style="border-color: #BBF7D0;"></div>
                </td>
            </tr>
        </table>

        <div class="security-note">
            Document officiel &bull; Système Buyedi &bull; Toute falsification est passible de sanctions judiciaires.
        </div>
    </div>
</div>

</body>
</html>
