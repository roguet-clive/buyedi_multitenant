<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Certificat de Scolarité - {{ $eleve->user->nom ?? '' }} {{ $eleve->user->prenom ?? '' }}</title>
    <style>
        @page {
            margin: 7mm 12mm 18mm 12mm;
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
            font-size: 10.2pt;
            line-height: 1.5;
        }

        /* 1. CADRE OFFICIEL DOUBLE LIGNE PRESTIGE */
        .certificate-frame {
            width: 100%;
            border: 2px solid #0B3C5D;
            border-radius: 6px;
            padding: 2.5px;
            box-sizing: border-box;
            background-color: #FFFFFF;
            position: relative;
        }

        .certificate-inner {
            border: 1px solid #007A48;
            border-radius: 4px;
            padding: 20px 22px 18px 22px;
            box-sizing: border-box;
            position: relative;
            /* Hauteur fixe = page A4 (297mm) - marges (@page top+bot = 25mm) - frame outer padding (5px*2) - footer (18mm) */
            min-height: 235mm;
        }

        /* FILIGRANE RÉPUBLIQUE */
        .watermark {
            position: absolute;
            top: 48%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 320px;
            opacity: 0.035;
            z-index: 0;
            pointer-events: none;
        }

        /* 3. EN-TÊTE RÉPUBLICAIN & ÉTABLISSEMENT */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
            position: relative;
            z-index: 1;
        }

        .header-left {
            width: 38%;
            text-align: center;
            vertical-align: top;
        }

        .republic-title {
            font-size: 10.2pt;
            font-weight: 900;
            color: #0B3C5D;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            margin-bottom: 1px;
        }

        .republic-motto {
            font-size: 8pt;
            font-style: italic;
            font-weight: bold;
            color: #4A5568;
            margin-bottom: 3px;
        }

        .flag-emblem-bar {
            margin: 2px auto;
            text-align: center;
        }

        .emblem-img {
            height: 25px;
            width: auto;
            vertical-align: middle;
            margin-right: 4px;
        }

        .flag-img {
            height: 14px;
            width: 22px;
            vertical-align: middle;
            border: 0.5px solid rgba(0,0,0,0.2);
            border-radius: 1px;
        }

        .ministry-title {
            font-size: 7.2pt;
            font-weight: 800;
            color: #007A48;
            text-transform: uppercase;
            line-height: 1.25;
            margin-top: 2px;
        }

        .header-center {
            width: 24%;
            text-align: center;
            vertical-align: middle;
            padding: 0 4px;
        }

        .main-school-logo {
            max-height: 54px;
            max-width: 72px;
            object-fit: contain;
            display: inline-block;
        }

        .header-right {
            width: 38%;
            text-align: center;
            vertical-align: top;
        }

        .school-name-header {
            font-size: 10.5pt;
            font-weight: 900;
            color: #0B3C5D;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            line-height: 1.2;
            margin-bottom: 2px;
        }

        .school-sub-info {
            font-size: 7.6pt;
            color: #4A5568;
            line-height: 1.3;
        }

        .school-contact-info {
            font-size: 7pt;
            color: #2D3748;
            font-weight: 600;
            margin-top: 1px;
        }

        /* SÉPARATEUR TRICOLORE GABONAIS */
        .divider-table {
            width: 100%;
            height: 3px;
            border-collapse: collapse;
            margin: 6px 0 9px 0;
            position: relative;
            z-index: 1;
        }

        .flag-g { background-color: #009E60; width: 33.33%; height: 3px; }
        .flag-y { background-color: #FCD116; width: 33.33%; height: 3px; }
        .flag-b { background-color: #3A75C4; width: 33.34%; height: 3px; }

        /* 4. BANDEAU RÉFÉRENCE & DATE */
        .ref-bar {
            width: 100%;
            margin-bottom: 10px;
            font-size: 8.4pt;
            position: relative;
            z-index: 1;
        }

        .ref-table {
            width: 100%;
            border-collapse: collapse;
        }

        .ref-left {
            text-align: left;
            font-weight: 800;
            color: #0B3C5D;
            letter-spacing: 0.3px;
        }

        .ref-right {
            text-align: right;
            color: #4A5568;
            font-style: italic;
        }

        /* 5. TITRE CENTRAL CALIBRÉ */
        .title-container {
            text-align: center;
            margin: 8px 0 14px 0;
            position: relative;
            z-index: 1;
        }

        .title-badge {
            display: inline-block;
            background: #F8FAFC;
            border: 1.5px solid #0B3C5D;
            border-radius: 4px;
            padding: 7px 32px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .title-badge h1 {
            margin: 0;
            font-size: 14.5pt;
            font-weight: 900;
            color: #0B3C5D;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .title-badge .subtitle {
            margin-top: 2px;
            font-size: 7.5pt;
            font-weight: 700;
            color: #007A48;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }

        /* 6. TEXTE D'INTRODUCTION */
        .intro-text {
            font-size: 10.4pt;
            line-height: 1.6;
            color: #2D3748;
            margin-bottom: 10px;
            text-align: justify;
            position: relative;
            z-index: 1;
        }

        /* 7. CADRE ÉLÈVE CENTRÉ & ÉQUILIBRÉ */
        .student-card-box {
            background-color: #F8FAFC;
            border: 1px solid #CBD5E1;
            border-left: 4.5px solid #007A48;
            border-radius: 4px;
            padding: 10px 16px;
            margin: 10px 0 14px 0;
            position: relative;
            z-index: 1;
        }

        .student-table {
            width: 100%;
            border-collapse: collapse;
        }

        .student-photo-td {
            width: 88px;
            vertical-align: middle;
            padding-right: 16px;
        }

        .student-photo-frame {
            width: 80px;
            height: 102px;
            border: 1px solid #94A3B8;
            border-radius: 3px;
            overflow: hidden;
            background-color: #E2E8F0;
            text-align: center;
        }

        .student-photo-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .student-photo-placeholder {
            width: 100%;
            height: 100%;
            line-height: 102px;
            font-size: 24pt;
            font-weight: 900;
            color: #64748B;
            background-color: #E2E8F0;
            text-align: center;
        }

        .student-info-td {
            vertical-align: middle;
        }

        .info-grid-table {
            width: 100%;
            border-collapse: collapse;
        }

        .info-grid-table td {
            padding: 4px 0;
            vertical-align: middle;
            font-size: 10pt;
        }

        .lbl {
            width: 195px;
            white-space: nowrap;
            font-weight: bold;
            color: #4A5568;
            text-transform: uppercase;
            font-size: 8.5pt;
            letter-spacing: 0.25px;
        }

        .colon {
            width: 14px;
            text-align: center;
            font-weight: 900;
            color: #4A5568;
            font-size: 9pt;
            padding: 0 4px;
        }

        .val {
            font-weight: 700;
            color: #1A202C;
            padding-left: 4px;
        }

        .val-highlight {
            font-size: 11pt;
            font-weight: 900;
            color: #0B3C5D;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .val-class {
            font-size: 11pt;
            font-weight: 900;
            color: #007A48;
            text-transform: uppercase;
        }

        .val-matricule {
            font-family: 'DejaVu Sans', monospace;
            font-weight: 900;
            color: #C53030;
            letter-spacing: 0.4px;
        }

        /* 8. CLAUSES ACADÉMIQUES & LÉGALES */
        .academic-statement {
            font-size: 10.2pt;
            line-height: 1.55;
            color: #2D3748;
            margin: 12px 0;
            text-align: justify;
            position: relative;
            z-index: 1;
        }

        .legal-closing {
            font-size: 9.8pt;
            line-height: 1.55;
            color: #2D3748;
            margin: 12px 0 140px 0;
            text-align: justify;
            font-style: italic;
            position: relative;
            z-index: 1;
        }

        /* 9. SIGNATURES & QR CODE */
        .signature-section {
            width: 100%;
            position: absolute;
            bottom: 18px;
            left: 22px;
            right: 22px;
            z-index: 1;
        }

        .sig-table {
            width: 100%;
            border-collapse: collapse;
        }

        .sig-left {
            width: 32%;
            vertical-align: bottom;
            text-align: center;
            padding-bottom: 2px;
        }

        .qr-box {
            display: inline-block;
            padding: 6px 8px;
            border: 1px solid #CBD5E1;
            border-radius: 4px;
            background-color: #F8FAFC;
            text-align: center;
        }

        .qr-img {
            width: 66px;
            height: 66px;
            display: block;
            margin: 0 auto;
        }

        .qr-caption {
            font-size: 5.8pt;
            font-weight: 800;
            color: #007A48;
            text-transform: uppercase;
            margin-top: 3px;
            letter-spacing: 0.3px;
        }

        .qr-ref {
            font-size: 5.5pt;
            color: #64748B;
            margin-top: 1px;
            font-weight: 600;
        }

        .sig-right {
            width: 68%;
            vertical-align: top;
            text-align: right;
            padding-left: 20px;
        }

        .sig-date {
            font-size: 9.5pt;
            font-weight: 600;
            color: #2D3748;
            margin-bottom: 3px;
            text-align: right;
        }

        .sig-title {
            font-size: 10pt;
            font-weight: 900;
            text-transform: uppercase;
            color: #0B3C5D;
            letter-spacing: 0.3px;
            margin-bottom: 6px;
            text-align: right;
        }

        .stamp-placeholder {
            height: 85px;
            border: 1.2px dashed #94A3B8;
            border-radius: 4px;
            background-color: #FAFAFA;
            position: relative;
            margin-left: auto;
            width: 230px;
        }

        .stamp-hint {
            position: absolute;
            bottom: 4px;
            right: 8px;
            font-size: 6.5pt;
            color: #94A3B8;
            font-style: italic;
        }

        /* 9. MENTION DE SÉCURITÉ BAS DE CADRE */
        .security-footer-note {
            margin-top: 18px;
            padding-top: 6px;
            border-top: 0.6px solid #E2E8F0;
            text-align: center;
            font-size: 6.5pt;
            color: #718096;
            line-height: 1.35;
        }


    </style>
</head>
<body>

@php
    // Photo de l'élève
    $photoPath = null;
    if (!empty($eleve->photo)) {
        if (file_exists(public_path('storage/' . $eleve->photo))) {
            $photoPath = public_path('storage/' . $eleve->photo);
        } elseif (file_exists(storage_path('app/public/' . $eleve->photo))) {
            $photoPath = storage_path('app/public/' . $eleve->photo);
        }
    }

    // Assets officiels Gabon
    $flagPath = public_path('images/gabon_flag.png');
    $emblemPath = public_path('images/armoiries_gabon.png');

    // Logo établissement
    $schoolLogo = null;
    if (!empty($etablissement['logo']) && file_exists($etablissement['logo'])) {
        $schoolLogo = $etablissement['logo'];
    } elseif (file_exists(public_path('images/logo.png'))) {
        $schoolLogo = public_path('images/logo.png');
    }

    $fullName = trim(($eleve->user->nom ?? '') . ' ' . ($eleve->user->prenom ?? ''));
    $schoolName = $etablissement['nom'] ?? 'COMPLEXE SCOLAIRE BUYEDI';
    $schoolAddress = $etablissement['adresse'] ?? 'Libreville, République Gabonaise';
    $schoolCity = $etablissement['ville'] ?? 'Libreville';
    $schoolPhone = $etablissement['telephone'] ?? '+241 77 00 00 00';
    $schoolEmail = $etablissement['email'] ?? 'contact@buyedi.com';
    $siteWeb = $etablissement['site_web'] ?? 'https://appbuyedi.com';
    $schoolYear = $inscription->anneeScolaire->nom ?? date('Y') . '-' . (date('Y')+1);
    $className = $inscription->classe->nom ?? 'Non assignée';
    $matricule = $eleve->matricule ?? (($etablissement['sigle'] ?? 'CS-BUYEDI') . '-' . date('Y') . '-' . str_pad($eleve->id ?? 1, 4, '0', STR_PAD_LEFT));
    $dateNaissance = $eleve->date_naissance ? $eleve->date_naissance->format('d/m/Y') : 'Non renseignée';
    $lieuNaissance = $eleve->lieu_naissance ?? 'Libreville';
    $sexe = $eleve->sexe === 'M' ? 'Masculin' : ($eleve->sexe === 'F' ? 'Féminin' : 'Non spécifié');

    $documentTitle = 'Certificat de Scolarité Officiel';
    $docRef = $reference ?? ('CS/' . $schoolYear . '/' . $matricule);
@endphp

{{-- PIED DE PAGE OFFICIEL BUYEDI (DOMPDF FIXE EN BAS DE PAGE) --}}
@include('documents.partials.footer', [
    'etablissement' => $etablissement,
    'documentTitle' => $documentTitle,
    'schoolYear' => $schoolYear,
])

{{-- CADRE PRESTIGE DIPLÔME DU CERTIFICAT --}}
<div class="certificate-frame">
    <div class="certificate-inner">
        
        <!-- FILIGRANE ARMOIRIES -->
        @if(file_exists($emblemPath))
            <img src="{{ $emblemPath }}" class="watermark" alt="Filigrane">
        @endif

        <!-- EN-TÊTE RÉPUBLICAIN & ÉTABLISSEMENT -->
        <table class="header-table">
            <tr>
                <!-- Gauche : République Gabonaise -->
                <td class="header-left">
                    <div class="republic-title">République Gabonaise</div>
                    <div class="republic-motto">Union &bull; Travail &bull; Justice</div>
                    <div class="flag-emblem-bar">
                        @if(file_exists($emblemPath))
                            <img src="{{ $emblemPath }}" class="emblem-img" alt="Armoiries">
                        @endif
                        @if(file_exists($flagPath))
                            <img src="{{ $flagPath }}" class="flag-img" alt="Drapeau Gabon">
                        @endif
                    </div>
                    <div class="ministry-title">
                        Ministère de l'Éducation Nationale<br>
                        Direction d'Académie Provinciale
                    </div>
                </td>

                <!-- Centre : Logo Officiel -->
                <td class="header-center">
                    @if($schoolLogo)
                        <img src="{{ $schoolLogo }}" class="main-school-logo" alt="Logo École">
                    @endif
                </td>

                <!-- Droite : Établissement -->
                <td class="header-right">
                    <div class="school-name-header">{{ $schoolName }}</div>
                    <div class="school-sub-info">
                        Enseignement Général &bull; Cycles Primaire & Secondaire<br>
                        {{ $schoolAddress }}
                    </div>
                    <div class="school-contact-info">
                        Tél : {{ $schoolPhone }} &bull; {{ $schoolEmail }}
                    </div>
                </td>
            </tr>
        </table>

        <!-- RUBAN TRICOLORE GABON -->
        <table class="divider-table">
            <tr>
                <td class="flag-g"></td>
                <td class="flag-y"></td>
                <td class="flag-b"></td>
            </tr>
        </table>

        <!-- BANDEAU DE RÉFÉRENCE & DATE -->
        <div class="ref-bar">
            <table class="ref-table">
                <tr>
                    <td class="ref-left">RÉF : <strong>{{ $docRef }}</strong></td>
                    <td class="ref-right">Fait à {{ $schoolCity }}, le {{ now()->format('d/m/Y') }}</td>
                </tr>
            </table>
        </div>

        <!-- TITRE DU DOCUMENT CENTRÉ -->
        <div class="title-container">
            <div class="title-badge">
                <h1>Certificat de Scolarité</h1>
                <div class="subtitle">Attestation Officielle d'Inscription &bull; Année {{ $schoolYear }}</div>
            </div>
        </div>

        <!-- FORMULATION ACADÉMIQUE -->
        <div class="intro-text">
            Le Chef d'Établissement soussigné certifie par la présente que l'élève désigné(e) ci-après est régulièrement inscrit(e) et poursuit son cursus académique au sein de cette institution pour l'année scolaire <strong>{{ $schoolYear }}</strong> :
        </div>

        <!-- CADRE DES INFORMATIONS ÉLÈVE AVEC PHOTO -->
        <div class="student-card-box">
            <table class="student-table">
                <tr>
                    <!-- Photo d'identité -->
                    <td class="student-photo-td">
                        <div class="student-photo-frame">
                            @if($photoPath)
                                <img src="{{ $photoPath }}" alt="Photo">
                            @else
                                <div class="student-photo-placeholder">&#128100;</div>
                            @endif
                        </div>
                    </td>

                    <!-- Données administratives -->
                    <td class="student-info-td">
                        <table class="info-grid-table">
                            <tr>
                                <td class="lbl">Nom & Prénom(s)</td>
                                <td class="colon">:</td>
                                <td class="val val-highlight">{{ $fullName }}</td>
                            </tr>
                            <tr>
                                <td class="lbl">Matricule Scolaire</td>
                                <td class="colon">:</td>
                                <td class="val val-matricule">{{ $matricule }}</td>
                            </tr>
                            <tr>
                                <td class="lbl">Date & Lieu de Naissance</td>
                                <td class="colon">:</td>
                                <td class="val">{{ $dateNaissance }} à {{ $lieuNaissance }}</td>
                            </tr>
                            <tr>
                                <td class="lbl">Sexe</td>
                                <td class="colon">:</td>
                                <td class="val">{{ $sexe }}</td>
                            </tr>
                            <tr>
                                <td class="lbl">Classe Fréquentée</td>
                                <td class="colon">:</td>
                                <td class="val val-class">{{ $className }}</td>
                            </tr>
                            <tr>
                                <td class="lbl">Statut / Régime</td>
                                <td class="colon">:</td>
                                <td class="val">Élève Régulier(e) &bull; Externe</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>

        <!-- CLAUSE ACADÉMIQUE -->
        <div class="academic-statement">
            L'élève susmentionné(e) est soumis(e) aux règles de discipline et au régime pédagogique en vigueur pour l'année scolaire <strong>{{ $schoolYear }}</strong>.
        </div>

        <!-- FORMULE LÉGALE -->
        <div class="legal-closing">
            En foi de quoi, le présent certificat de scolarité lui est délivré pour servir et valoir ce que de droit, notamment auprès des organismes administratifs, sociaux et d'état civil.
        </div>

        <!-- SIGNATURES, CACHET ET QR CODE -->
        <div class="signature-section">
            <table class="sig-table">
                <tr>
                    <!-- QR Code de Sécurité -->
                    <td class="sig-left">
                        <div class="qr-box">
                            @if(!empty($qrCode))
                                <img src="data:image/svg+xml;base64,{{ $qrCode }}" class="qr-img" alt="QR Code Sécurité">
                                <div class="qr-caption">AUTHENTICITÉ VÉRIFIÉE</div>
                                <div class="qr-ref">{{ $docRef }}</div>
                            @endif
                        </div>
                    </td>

                    <!-- Signature & Cachet Direction -->
                    <td class="sig-right">
                        <div class="sig-date">Fait à {{ $schoolCity }}, le {{ now()->format('d/m/Y') }}</div>
                        <div class="sig-title">Le Chef d'Établissement / La Direction</div>
                        <div class="stamp-placeholder">
                            <span class="stamp-hint">Sceau officiel & Signature</span>
                        </div>
                    </td>
                </tr>
            </table>

            <!-- NOTE DE SÉCURITÉ BAS DE CADRE -->
            <div class="security-footer-note">
                Document officiel certifié conforme par le système de gestion scolaire Buyedi &bull; Sécurisé par QR Code infalsifiable.<br>
                Toute falsification ou rature expose son auteur à des sanctions administratives et judiciaires selon les lois de la République Gabonaise.
            </div>
        </div>

    </div>
</div>

</body>
</html>
