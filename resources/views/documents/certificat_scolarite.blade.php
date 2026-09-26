<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Certificat de Scolarité - {{ $eleve->user->nom }} {{ $eleve->user->prenom }}</title>
    <style>
        @page {
            margin: 10mm 14mm 10mm 14mm;
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
            height: 100%;
            font-family: 'DejaVu Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1A202C;
            background-color: #FFFFFF;
            font-size: 11pt;
            line-height: 1.5;
        }

        .page-container {
            width: 100%;
            height: 275mm;
            border: 2.2px solid #0B3C5D;
            padding: 2.5px;
            box-sizing: border-box;
            position: relative;
        }

        .inner-container {
            width: 100%;
            height: 100%;
            border: 1px solid #007A48;
            padding: 16px 22px 14px 22px;
            box-sizing: border-box;
            position: relative;
        }

        /* FILIGRANE */
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 360px;
            opacity: 0.035;
            z-index: 0;
            pointer-events: none;
        }

        /* 1. EN-TÊTE RÉPUBLICAIN & ÉTABLISSEMENT */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
            position: relative;
            z-index: 1;
        }

        .header-left {
            width: 38%;
            text-align: center;
            vertical-align: top;
        }

        .republic-title {
            font-size: 11pt;
            font-weight: 900;
            color: #0B3C5D;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }

        .republic-motto {
            font-size: 8.5pt;
            font-style: italic;
            font-weight: bold;
            color: #4A5568;
            margin-bottom: 4px;
        }

        .flag-emblem-bar {
            margin: 4px auto;
            text-align: center;
        }

        .emblem-img {
            height: 28px;
            width: auto;
            vertical-align: middle;
            margin-right: 4px;
        }

        .flag-img {
            height: 16px;
            width: 24px;
            vertical-align: middle;
            border: 0.5px solid rgba(0,0,0,0.2);
            border-radius: 1px;
        }

        .ministry-title {
            font-size: 7.5pt;
            font-weight: 800;
            color: #007A48;
            text-transform: uppercase;
            line-height: 1.25;
            margin-top: 3px;
        }

        .header-center {
            width: 24%;
            text-align: center;
            vertical-align: middle;
            padding: 0 4px;
        }

        .main-school-logo {
            max-height: 56px;
            max-width: 75px;
            object-fit: contain;
            display: inline-block;
        }

        .header-right {
            width: 38%;
            text-align: center;
            vertical-align: top;
        }

        .school-name-header {
            font-size: 11pt;
            font-weight: 900;
            color: #0B3C5D;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            line-height: 1.2;
            margin-bottom: 2px;
        }

        .school-sub-info {
            font-size: 7.8pt;
            color: #4A5568;
            line-height: 1.35;
        }

        .school-contact-info {
            font-size: 7.2pt;
            color: #2D3748;
            font-weight: 600;
            margin-top: 2px;
        }

        /* SÉPARATEUR TRICOLORE */
        .divider-table {
            width: 100%;
            height: 3px;
            border-collapse: collapse;
            margin: 8px 0 12px 0;
            position: relative;
            z-index: 1;
        }

        .flag-g { background-color: #009E60; width: 33.33%; height: 3px; }
        .flag-y { background-color: #FCD116; width: 33.33%; height: 3px; }
        .flag-b { background-color: #3A75C4; width: 33.34%; height: 3px; }

        /* 2. BANDEAU DE RÉFÉRENCE & DATE */
        .ref-bar {
            width: 100%;
            margin-bottom: 14px;
            font-size: 8.5pt;
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
            letter-spacing: 0.4px;
        }

        .ref-right {
            text-align: right;
            color: #4A5568;
            font-style: italic;
        }

        /* 3. TITRE DU DOCUMENT */
        .title-container {
            text-align: center;
            margin: 12px 0 20px 0;
            position: relative;
            z-index: 1;
        }

        .title-badge {
            display: inline-block;
            background: #F8FAFC;
            border: 1.6px solid #0B3C5D;
            border-radius: 4px;
            padding: 9px 34px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .title-badge h1 {
            margin: 0;
            font-size: 16pt;
            font-weight: 900;
            color: #0B3C5D;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .title-badge .subtitle {
            margin-top: 3px;
            font-size: 8pt;
            font-weight: 700;
            color: #007A48;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* 4. CONTENU DE L'ATTESTATION */
        .intro-text {
            font-size: 11pt;
            line-height: 1.65;
            color: #2D3748;
            margin-bottom: 14px;
            text-align: justify;
            position: relative;
            z-index: 1;
        }

        /* CADRE DES INFORMATIONS ÉLÈVE */
        .student-card-box {
            background-color: #F8FAFC;
            border: 1.2px solid #CBD5E1;
            border-left: 4.5px solid #007A48;
            border-radius: 4px;
            padding: 12px 16px;
            margin: 14px 0 18px 0;
            position: relative;
            z-index: 1;
        }

        .student-table {
            width: 100%;
            border-collapse: collapse;
        }

        .student-photo-td {
            width: 78px;
            vertical-align: top;
            padding-right: 14px;
        }

        .student-photo-frame {
            width: 72px;
            height: 90px;
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
            line-height: 90px;
            font-size: 20pt;
            font-weight: 900;
            color: #64748B;
            background-color: #E2E8F0;
            text-align: center;
        }

        .student-info-td {
            vertical-align: top;
        }

        .info-grid-table {
            width: 100%;
            border-collapse: collapse;
        }

        .info-grid-table td {
            padding: 3.5px 0;
            vertical-align: top;
            font-size: 10.2pt;
        }

        .lbl {
            width: 165px;
            font-weight: bold;
            color: #4A5568;
            text-transform: uppercase;
            font-size: 8.8pt;
            letter-spacing: 0.3px;
        }

        .val {
            font-weight: 700;
            color: #1A202C;
        }

        .val-highlight {
            font-size: 11.5pt;
            font-weight: 900;
            color: #0B3C5D;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .val-class {
            font-size: 11.5pt;
            font-weight: 900;
            color: #007A48;
            text-transform: uppercase;
        }

        .val-matricule {
            font-family: 'DejaVu Sans', monospace;
            font-weight: 900;
            color: #C53030;
            letter-spacing: 0.5px;
        }

        /* CLAUSE ET MENTIONS LÉGALES */
        .academic-statement {
            font-size: 10.8pt;
            line-height: 1.6;
            color: #2D3748;
            margin: 14px 0;
            text-align: justify;
            position: relative;
            z-index: 1;
        }

        .legal-closing {
            font-size: 10.2pt;
            line-height: 1.6;
            color: #2D3748;
            margin: 14px 0 24px 0;
            text-align: justify;
            font-style: italic;
            position: relative;
            z-index: 1;
        }

        /* 5. BLOC SIGNATURE, CACHET ET QR CODE - AU BAS DE PAGE */
        .signature-section {
            width: 100%;
            margin-top: 25px;
            position: relative;
            z-index: 1;
        }

        .sig-table {
            width: 100%;
            border-collapse: collapse;
        }

        .sig-left {
            width: 38%;
            vertical-align: bottom;
            text-align: left;
            padding-bottom: 6px;
        }

        .qr-box {
            display: inline-block;
            text-align: center;
            border: 1px dashed #CBD5E1;
            padding: 6px;
            border-radius: 4px;
            background-color: #FAFAFA;
        }

        .qr-img {
            width: 68px;
            height: 68px;
            display: block;
            margin: 0 auto;
        }

        .qr-caption {
            font-size: 5.5pt;
            font-weight: 800;
            color: #007A48;
            text-transform: uppercase;
            margin-top: 3px;
            letter-spacing: 0.3px;
        }

        .sig-right {
            width: 62%;
            vertical-align: top;
            text-align: center;
        }

        .sig-date {
            font-size: 10pt;
            font-weight: 600;
            color: #2D3748;
            margin-bottom: 4px;
        }

        .sig-title {
            font-size: 10.5pt;
            font-weight: 900;
            text-transform: uppercase;
            color: #0B3C5D;
            letter-spacing: 0.4px;
        }

        .stamp-placeholder {
            height: 72px;
            margin-top: 6px;
            border-bottom: 1px dotted #CBD5E1;
            position: relative;
        }

        .stamp-hint {
            position: absolute;
            bottom: 4px;
            right: 12px;
            font-size: 6.8pt;
            color: #A0AEC0;
            font-style: italic;
        }

        /* 6. PIED DE PAGE DE SÉCURITÉ */
        .footer-security {
            position: absolute;
            bottom: 10px;
            left: 22px;
            right: 22px;
            text-align: center;
            border-top: 0.8px solid #E2E8F0;
            padding-top: 6px;
        }

        .security-note {
            font-size: 6.8pt;
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
    $schoolPhone = $etablissement['telephone'] ?? '';
    $schoolEmail = $etablissement['email'] ?? '';
    $schoolYear = $inscription->anneeScolaire->nom ?? date('Y') . '-' . (date('Y')+1);
    $className = $inscription->classe->nom ?? 'Non assignée';
    $matricule = $eleve->matricule ?? ('CSSD-' . date('Y') . '-' . str_pad($eleve->id ?? 1, 4, '0', STR_PAD_LEFT));
    $dateNaissance = $eleve->date_naissance ? $eleve->date_naissance->format('d/m/Y') : 'Non renseignée';
    $lieuNaissance = $eleve->lieu_naissance ?? 'Libreville';
    $sexe = $eleve->sexe === 'M' ? 'Masculin' : ($eleve->sexe === 'F' ? 'Féminin' : 'Non spécifié');

    $docRef = $reference ?? ('CS/' . $schoolYear . '/' . $matricule);
@endphp

<div class="page-container">
    <div class="inner-container">
        
        <!-- FILIGRANE -->
        @if(file_exists($emblemPath))
            <img src="{{ $emblemPath }}" class="watermark" alt="Filigrane">
        @endif

        <!-- 1. EN-TÊTE RÉPUBLICAIN ET ÉTABLISSEMENT -->
        <table class="header-table">
            <tr>
                <!-- GAUCHE : RÉPUBLIQUE DU GABON -->
                <td class="header-left">
                    <div class="republic-title">RÉPUBLIQUE GABONAISE</div>
                    <div class="republic-motto">Union - Travail - Justice</div>
                    <div class="flag-emblem-bar">
                        @if(file_exists($emblemPath))
                            <img src="{{ $emblemPath }}" class="emblem-img" alt="Armoiries">
                        @endif
                        @if(file_exists($flagPath))
                            <img src="{{ $flagPath }}" class="flag-img" alt="Drapeau Gabon">
                        @endif
                    </div>
                    <div class="ministry-title">
                        MINISTÈRE DE L'ÉDUCATION NATIONALE<br>
                        CHARGÉ DE LA FORMATION CIVIQUE
                    </div>
                </td>

                <!-- CENTRE : LOGO OFFICIEL -->
                <td class="header-center">
                    @if($schoolLogo)
                        <img src="{{ $schoolLogo }}" class="main-school-logo" alt="Logo Établissement">
                    @endif
                </td>

                <!-- DROITE : ÉTABLISSEMENT SCOLAIRE -->
                <td class="header-right">
                    <div class="school-name-header">{{ $schoolName }}</div>
                    <div class="school-sub-info">
                        Enseignement Général &bull; Primaire & Secondaire<br>
                        {{ $schoolAddress }}
                    </div>
                    @if($schoolPhone || $schoolEmail)
                        <div class="school-contact-info">
                            @if($schoolPhone) <span>Tél : {{ $schoolPhone }}</span> @endif
                            @if($schoolPhone && $schoolEmail) &bull; @endif
                            @if($schoolEmail) <span>{{ $schoolEmail }}</span> @endif
                        </div>
                    @endif
                </td>
            </tr>
        </table>

        <!-- FILET TRICOLORE GABONAIS -->
        <table class="divider-table">
            <tr>
                <td class="flag-g"></td>
                <td class="flag-y"></td>
                <td class="flag-b"></td>
            </tr>
        </table>

        <!-- 2. RÉFÉRENCE & DATE -->
        <div class="ref-bar">
            <table class="ref-table">
                <tr>
                    <td class="ref-left">N° RÉF : {{ $docRef }}</td>
                    <td class="ref-right">Année Académique : <strong>{{ $schoolYear }}</strong></td>
                </tr>
            </table>
        </div>

        <!-- 3. TITRE OFFICIEL -->
        <div class="title-container">
            <div class="title-badge">
                <h1>CERTIFICAT DE SCOLARITÉ</h1>
                <div class="subtitle">Attestation d'inscription et de fréquentation scolaire</div>
            </div>
        </div>

        <!-- 4. CONTENU OFFICIEL -->
        <div class="intro-text">
            Le Chef d'Établissement soussigné certifie par la présente que l'élève désigné(e) ci-après est régulièrement inscrit(e) et poursuit assidûment ses études au sein du <strong>{{ $schoolName }}</strong> :
        </div>

        <!-- CADRE RÉCAPITULATIF DE L'ÉLÈVE -->
        <div class="student-card-box">
            <table class="student-table">
                <tr>
                    <!-- Photo d'Identité -->
                    <td class="student-photo-td">
                        <div class="student-photo-frame">
                            @if($photoPath && file_exists($photoPath))
                                <img src="{{ $photoPath }}" alt="{{ $fullName }}">
                            @else
                                <div class="student-photo-placeholder">
                                    {{ strtoupper(substr($eleve->user->nom ?? 'E', 0, 1) . substr($eleve->user->prenom ?? '', 0, 1)) }}
                                </div>
                            @endif
                        </div>
                    </td>

                    <!-- Données Élève -->
                    <td class="student-info-td">
                        <table class="info-grid-table">
                            <tr>
                                <td class="lbl">Nom & Prénom(s) :</td>
                                <td class="val val-highlight">{{ $fullName }}</td>
                            </tr>
                            <tr>
                                <td class="lbl">Matricule Scolaire :</td>
                                <td class="val val-matricule">{{ $matricule }}</td>
                            </tr>
                            <tr>
                                <td class="lbl">Date & Lieu de Naissance :</td>
                                <td class="val">{{ $dateNaissance }} à {{ $lieuNaissance }}</td>
                            </tr>
                            <tr>
                                <td class="lbl">Sexe :</td>
                                <td class="val">{{ $sexe }}</td>
                            </tr>
                            <tr>
                                <td class="lbl">Classe Fréquentée :</td>
                                <td class="val val-class">{{ $className }}</td>
                            </tr>
                            <tr>
                                <td class="lbl">Statut / Régime :</td>
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

        <!-- 5. SIGNATURES, CACHET ET QR CODE - AU BAS DE PAGE -->
        <div class="signature-section">
            <table class="sig-table">
                <tr>
                    <!-- QR Code de Vérification -->
                    <td class="sig-left">
                        <div class="qr-box">
                            @if(!empty($qrCode))
                                <img src="data:image/svg+xml;base64,{{ $qrCode }}" class="qr-img" alt="QR Code Sécurité">
                                <div class="qr-caption">AUTHENTICITÉ VÉRIFIÉE</div>
                            @endif
                        </div>
                    </td>

                    <!-- Signature & Cachet de la Direction -->
                    <td class="sig-right">
                        <div class="sig-date">Fait à Libreville, le {{ now()->format('d/m/Y') }}</div>
                        <div class="sig-title">Le Chef d'Établissement / La Direction</div>
                        <div class="stamp-placeholder">
                            <span class="stamp-hint">Sceau & Signature Officiels</span>
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- 6. PIED DE PAGE DE SÉCURITÉ -->
        <div class="footer-security">
            <div class="security-note">
                Document officiel généré électroniquement par le système de gestion scolaire <strong>Buyedi</strong> sous le contrôle du Ministère de l'Éducation Nationale.<br>
                Ce certificat est sécurisé par un QR Code d'authenticité numérique. Toute falsification ou rature expose son auteur à des poursuites judiciaires.
            </div>
        </div>

    </div>
</div>
</body>
</html>
