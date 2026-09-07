<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Carte d'Identité Scolaire - {{ $eleve->user->nom }} {{ $eleve->user->prenom }}</title>
    <style>
        @page {
            margin: 0;
            size: 85.6mm 54mm; /* Standard ID-1 / CR-80 Card */
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
            width: 85.6mm;
            height: 54mm;
            background-color: #E8E7E0;
            font-family: 'DejaVu Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1F2937;
            overflow: hidden;
        }

        .card-container {
            position: absolute;
            top: 1.4mm;
            left: 1.4mm;
            right: 1.4mm;
            bottom: 1.4mm;
            background-color: #FAF9F5;
            border: 1.2px solid #2B3A42;
            border-radius: 6px;
            overflow: hidden;
        }

        /* 1. EN-TÊTE INSTITUTIONNEL GABON */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 1.1px solid #2B3A42;
            background-color: #FAF9F5;
        }

        .header-left {
            width: 22mm;
            padding: 2px 0 1.5px 5px;
            vertical-align: middle;
            text-align: left;
            white-space: nowrap;
        }

        .header-gab {
            font-size: 11.5px;
            font-weight: 900;
            color: #007A48;
            vertical-align: middle;
            letter-spacing: 0.3px;
        }

        .header-flag {
            vertical-align: middle;
            margin-left: 2px;
            height: 10px;
            width: 15px;
            border-radius: 1px;
            border: 0.3px solid rgba(0,0,0,0.2);
        }

        .header-emblem {
            vertical-align: middle;
            margin-left: 3px;
            height: 13.5px;
            width: auto;
        }

        .header-center {
            padding: 2px 0 1.5px 0;
            vertical-align: middle;
            text-align: center;
        }

        .republic-name {
            font-size: 5.5px;
            font-weight: 900;
            color: #111827;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            line-height: 1.1;
        }

        .republic-motto {
            font-size: 4.2px;
            font-style: italic;
            font-weight: bold;
            color: #4B5563;
            line-height: 1.1;
        }

        .ministry-name {
            font-size: 4.8px;
            font-weight: 800;
            color: #007A48;
            text-transform: uppercase;
            line-height: 1.1;
        }

        .header-right {
            width: 20mm;
            padding: 2px 6px 1.5px 0;
            vertical-align: middle;
            text-align: right;
        }

        .school-logo {
            max-height: 14px;
            max-width: 22px;
            vertical-align: middle;
            object-fit: contain;
        }

        /* 2. BANDEAU ÉTABLISSEMENT & ANNÉE SCOLAIRE */
        .school-strip-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 1.1px solid #2B3A42;
            background-color: #F1F0E8;
        }

        .school-name-cell {
            padding: 1.8px 0 1.8px 5px;
            font-size: 7.2px;
            font-weight: 900;
            color: #111827;
            text-transform: uppercase;
            letter-spacing: 0.2px;
            text-align: left;
            vertical-align: middle;
            line-height: 1.1;
        }

        .school-year-cell {
            padding: 1.8px 6px 1.8px 0;
            font-size: 7.2px;
            font-weight: 900;
            color: #007A48;
            text-align: right;
            vertical-align: middle;
            white-space: nowrap;
            width: 26mm;
            line-height: 1.1;
        }

        /* 3. BANDEAU DE TITRE DE LA CARTE */
        .title-strip {
            width: 100%;
            border-bottom: 1.1px solid #2B3A42;
            padding: 1.2px 0 1.5px 0;
            text-align: center;
            background-color: #FAF9F5;
        }

        .title-text {
            font-size: 9.5px;
            font-weight: 900;
            color: #0F375C;
            text-transform: uppercase;
            letter-spacing: 1.4px;
        }

        /* 4. CORPS DE LA CARTE */
        .body-table {
            width: 100%;
            border-collapse: collapse;
        }

        .photo-col {
            width: 21.5mm;
            padding-left: 4.5px;
            padding-top: 2px;
            vertical-align: top;
        }

        .photo-box {
            width: 20mm;
            height: 24.5mm;
            border-radius: 4px;
            overflow: hidden;
            background-color: #E2E8F0;
            border: 0.6px solid #94A3B8;
            text-align: center;
        }

        .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .photo-placeholder {
            width: 100%;
            height: 100%;
            background-color: #CBD5E1;
            color: #475569;
            font-size: 11px;
            font-weight: 900;
            line-height: 24.5mm;
            text-align: center;
        }

        .info-col {
            padding-left: 5px;
            padding-top: 1.5px;
            vertical-align: top;
        }

        .student-id {
            font-size: 7.2px;
            font-weight: 900;
            color: #1E293B;
            margin-bottom: 1.5px;
            letter-spacing: 0.3px;
        }

        .student-id span {
            color: #007A48;
        }

        .student-name {
            font-size: 9px;
            font-weight: 900;
            color: #0F375C;
            text-transform: uppercase;
            line-height: 1.15;
            margin-bottom: 2px;
            letter-spacing: 0.1px;
        }

        .info-row {
            font-size: 6.8px;
            line-height: 1.25;
            color: #1F2937;
            margin-bottom: 1px;
        }

        .info-label {
            font-weight: bold;
            color: #4B5563;
        }

        .info-val {
            font-weight: 800;
            color: #111827;
        }

        .class-badge {
            display: inline-block;
            font-size: 7.5px;
            font-weight: 900;
            color: #0284C7;
        }

        .qr-col {
            width: 18.5mm;
            padding-right: 5.5px;
            padding-top: 1.5px;
            vertical-align: middle;
            text-align: right;
        }

        .qr-wrapper {
            display: inline-block;
            text-align: center;
        }

        .qr-image {
            width: 14.5mm;
            height: 14.5mm;
            display: block;
            margin: 0 auto;
        }

        .qr-subtext {
            font-size: 4px;
            font-weight: 900;
            color: #007A48;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-top: 1px;
            text-align: center;
        }

        /* 5. PIED DE PAGE SÉCURISÉ AVEC TRICOLORE GABONAIS */
        .footer-strip {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: #FAF9F5;
        }

        .gabon-tricolor {
            width: 100%;
            height: 1.8px;
            border-collapse: collapse;
        }

        .gabon-tricolor td {
            height: 1.8px;
            padding: 0;
        }

        .flag-green { background-color: #009E60; width: 33.33%; }
        .flag-yellow { background-color: #FCD116; width: 33.33%; }
        .flag-blue { background-color: #3A75C4; width: 33.34%; }

        .footer-content {
            border-top: 0.8px solid #2B3A42;
            padding: 1px 4px 1.5px 4px;
            text-align: center;
        }

        .footer-text {
            font-size: 5.2px;
            font-weight: bold;
            color: #4B5563;
            text-align: center;
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

    // Assets Gabon
    $flagPath = public_path('images/gabon_flag.png');
    $emblemPath = public_path('images/armoiries_gabon.png');

    // Logo Établissement
    $schoolLogoPath = null;
    if (!empty($etablissement['logo']) && file_exists($etablissement['logo'])) {
        $schoolLogoPath = $etablissement['logo'];
    } elseif (file_exists(public_path('images/logo.png'))) {
        $schoolLogoPath = public_path('images/logo.png');
    }

    // Établissement & Année
    $schoolName = $etablissement['nom'] ?? config('app.name', 'Établissement Scolaire');
    $schoolPhone = $etablissement['telephone'] ?? '';
    $schoolEmail = $etablissement['email'] ?? '';
    $schoolYear = $inscription->anneeScolaire->nom ?? '2025-2026';

    // Élève
    $fullName = trim(($eleve->user->nom ?? '') . ' ' . ($eleve->user->prenom ?? ''));
    $className = $inscription->classe->nom ?? 'Classe';
    $matricule = $eleve->matricule ?? ('CSPBO-' . date('Y') . '-' . str_pad($eleve->id ?? 1, 4, '0', STR_PAD_LEFT));
    $dateNaissance = $eleve->date_naissance ? $eleve->date_naissance->format('d/m/Y') : null;
    $lieuNaissance = $eleve->lieu_naissance ?? null;
    $sexe = $eleve->sexe ? strtoupper($eleve->sexe) : '-';
@endphp

<div class="card-container">
    <!-- 1. EN-TÊTE OFFICIEL GABON -->
    <table class="header-table">
        <tr>
            <td class="header-left">
                <span class="header-gab">GAB</span>
                @if(file_exists($flagPath))
                    <img class="header-flag" src="{{ $flagPath }}" alt="Drapeau Gabon">
                @endif
                @if(file_exists($emblemPath))
                    <img class="header-emblem" src="{{ $emblemPath }}" alt="Armoiries Gabon">
                @endif
            </td>
            <td class="header-center">
                <div class="republic-name">RÉPUBLIQUE GABONAISE</div>
                <div class="republic-motto">Union - Travail - Justice</div>
                <div class="ministry-name">Ministère de l'Éducation Nationale</div>
            </td>
            <td class="header-right">
                @if($schoolLogoPath)
                    <img class="school-logo" src="{{ $schoolLogoPath }}" alt="Logo École">
                @endif
            </td>
        </tr>
    </table>

    <!-- 2. BANDEAU NOM ÉTABLISSEMENT & ANNÉE SCOLAIRE -->
    <table class="school-strip-table">
        <tr>
            <td class="school-name-cell">
                {{ $schoolName }}
            </td>
            <td class="school-year-cell">
                {{ $schoolYear }}
            </td>
        </tr>
    </table>

    <!-- 3. BANDEAU DE TITRE DE LA CARTE -->
    <div class="title-strip">
        <span class="title-text">CARTE D'IDENTITÉ SCOLAIRE</span>
    </div>

    <!-- 4. CORPS PRINCIPAL : PHOTO | DONNÉES | QR CODE -->
    <table class="body-table">
        <tr>
            <!-- Colonne Photo -->
            <td class="photo-col">
                <div class="photo-box">
                    @if($photoPath && file_exists($photoPath))
                        <img src="{{ $photoPath }}" alt="{{ $fullName }}">
                    @else
                        <div class="photo-placeholder">
                            {{ strtoupper(substr($eleve->user->nom ?? 'E', 0, 1) . substr($eleve->user->prenom ?? '', 0, 1)) }}
                        </div>
                    @endif
                </div>
            </td>

            <!-- Colonne Infos Élève -->
            <td class="info-col">
                <div class="student-id">ID : <span>{{ $matricule }}</span></div>
                <div class="student-name">{{ $fullName }}</div>
                
                @if($dateNaissance)
                    <div class="info-row">
                        <span class="info-label">Né(e) le :</span> 
                        <span class="info-val">{{ $dateNaissance }}</span>
                        @if($lieuNaissance)
                            <span class="info-label">à</span> <span class="info-val">{{ $lieuNaissance }}</span>
                        @endif
                    </div>
                @endif

                <div class="info-row">
                    <span class="info-label">Sexe :</span> <span class="info-val">{{ $sexe }}</span>
                    &nbsp;&nbsp;&nbsp;
                    <span class="info-label">Classe :</span> <span class="class-badge">{{ $className }}</span>
                </div>

                @if($schoolPhone || $schoolEmail)
                    <div class="info-row" style="font-size: 5.5px; color: #64748B; margin-top: 1px;">
                        @if($schoolPhone) <span>Tél : {{ $schoolPhone }}</span> @endif
                        @if($schoolPhone && $schoolEmail) &bull; @endif
                        @if($schoolEmail) <span>{{ $schoolEmail }}</span> @endif
                    </div>
                @endif
            </td>

            <!-- Colonne QR Code Sécurisé -->
            <td class="qr-col">
                <div class="qr-wrapper">
                    @if(!empty($qrCode))
                        <img class="qr-image" src="data:image/svg+xml;base64,{{ $qrCode }}" alt="QR Code">
                        <div class="qr-subtext">SÉCURISÉ</div>
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <!-- 5. PIED DE PAGE SÉCURISÉ AVEC TRICOLORE GABONAIS -->
    <div class="footer-strip">
        <table class="gabon-tricolor">
            <tr>
                <td class="flag-green"></td>
                <td class="flag-yellow"></td>
                <td class="flag-blue"></td>
            </tr>
        </table>
        <div class="footer-content">
            <div class="footer-text">
                Carte officielle d'accès & scolarité &bull; République Gabonaise
            </div>
        </div>
    </div>
</div>
</body>
</html>
