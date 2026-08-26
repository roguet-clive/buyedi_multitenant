<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Fiche de Synthèse Élève - {{ $eleve->user->nom }} {{ $eleve->user->prenom }}</title>
    <style>
        @page {
            margin: 10mm 12mm 10mm 12mm;
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
            font-size: 9.8pt;
            line-height: 1.4;
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
            padding: 14px 18px 12px 18px;
            box-sizing: border-box;
            position: relative;
        }

        /* FILIGRANE */
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 350px;
            opacity: 0.035;
            z-index: 0;
            pointer-events: none;
        }

        /* 1. EN-TÊTE RÉPUBLICAIN & ÉTABLISSEMENT */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
            position: relative;
            z-index: 1;
        }

        .header-left {
            width: 36%;
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
            font-size: 7.5pt;
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
            height: 24px;
            width: auto;
            vertical-align: middle;
            margin-right: 3px;
        }

        .flag-img {
            height: 14px;
            width: 22px;
            vertical-align: middle;
            border: 0.5px solid rgba(0,0,0,0.2);
            border-radius: 1px;
        }

        .ministry-title {
            font-size: 7pt;
            font-weight: 800;
            color: #007A48;
            text-transform: uppercase;
            line-height: 1.2;
            margin-top: 2px;
        }

        .header-center {
            width: 28%;
            text-align: center;
            vertical-align: middle;
            padding: 0 4px;
        }

        .main-school-logo {
            max-height: 50px;
            max-width: 75px;
            object-fit: contain;
            display: inline-block;
        }

        .header-right {
            width: 36%;
            text-align: center;
            vertical-align: top;
        }

        .school-name-header {
            font-size: 10.2pt;
            font-weight: 900;
            color: #0B3C5D;
            text-transform: uppercase;
            letter-spacing: 0.2px;
            line-height: 1.2;
            margin-bottom: 2px;
        }

        .school-sub-info {
            font-size: 7.2pt;
            color: #4A5568;
            line-height: 1.3;
        }

        .school-contact-info {
            font-size: 6.8pt;
            color: #2D3748;
            font-weight: 600;
            margin-top: 1px;
        }

        /* SÉPARATEUR TRICOLORE */
        .divider-table {
            width: 100%;
            height: 2.5px;
            border-collapse: collapse;
            margin: 6px 0 8px 0;
            position: relative;
            z-index: 1;
        }

        .flag-g { background-color: #009E60; width: 33.33%; height: 2.5px; }
        .flag-y { background-color: #FCD116; width: 33.33%; height: 2.5px; }
        .flag-b { background-color: #3A75C4; width: 33.34%; height: 2.5px; }

        /* 2. BANDEAU DE RÉFÉRENCE & DATE */
        .ref-bar {
            width: 100%;
            margin-bottom: 8px;
            font-size: 7.8pt;
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

        /* 3. TITRE DU DOCUMENT */
        .title-container {
            text-align: center;
            margin: 6px 0 10px 0;
            position: relative;
            z-index: 1;
        }

        .title-badge {
            display: inline-block;
            background: #F8FAFC;
            border: 1.4px solid #0B3C5D;
            border-radius: 4px;
            padding: 6px 26px;
        }

        .title-badge h1 {
            margin: 0;
            font-size: 13.5pt;
            font-weight: 900;
            color: #0B3C5D;
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }

        .title-badge .subtitle {
            margin-top: 2px;
            font-size: 7.2pt;
            font-weight: 700;
            color: #007A48;
            text-transform: uppercase;
            letter-spacing: 0.6px;
        }

        /* TITRES DE SECTIONS */
        .section-header {
            background-color: #F1F5F9;
            border-left: 3.5px solid #007A48;
            padding: 4px 8px;
            font-size: 8.5pt;
            font-weight: 900;
            color: #0B3C5D;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            margin: 10px 0 6px 0;
            position: relative;
            z-index: 1;
        }

        /* SECTION 1: ÉTAT CIVIL & IDENTITÉ */
        .student-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #FAFAFA;
            border: 0.8px solid #E2E8F0;
            border-radius: 3px;
            padding: 6px;
            position: relative;
            z-index: 1;
        }

        .student-photo-td {
            width: 72px;
            vertical-align: top;
            padding: 6px 8px 6px 6px;
        }

        .student-photo-frame {
            width: 66px;
            height: 82px;
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
            line-height: 82px;
            font-size: 18pt;
            font-weight: 900;
            color: #64748B;
            background-color: #E2E8F0;
            text-align: center;
        }

        .student-info-td {
            vertical-align: top;
            padding: 4px 6px;
        }

        .info-grid {
            width: 100%;
            border-collapse: collapse;
        }

        .info-grid td {
            padding: 3px 0;
            vertical-align: top;
            font-size: 8.8pt;
        }

        .lbl {
            width: 140px;
            font-weight: bold;
            color: #4A5568;
            font-size: 7.8pt;
            text-transform: uppercase;
        }

        .val {
            font-weight: 700;
            color: #1A202C;
        }

        .val-highlight {
            font-size: 10.5pt;
            font-weight: 900;
            color: #0B3C5D;
            text-transform: uppercase;
        }

        .val-class {
            font-size: 9.8pt;
            font-weight: 900;
            color: #007A48;
        }

        .val-matricule {
            font-family: 'DejaVu Sans', monospace;
            font-weight: 900;
            color: #C53030;
        }

        /* SECTION 2: RESPONSABLES LÉGAUX (TABLEAU) */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            position: relative;
            z-index: 1;
        }

        .data-table th {
            background-color: #0B3C5D;
            color: #FFFFFF;
            font-size: 7.5pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            padding: 5px 8px;
            border: 0.6px solid #0B3C5D;
            text-align: left;
        }

        .data-table td {
            padding: 4.5px 8px;
            font-size: 8.2pt;
            border: 0.6px solid #CBD5E1;
            color: #1E293B;
            vertical-align: middle;
        }

        .data-table tr:nth-child(even) td {
            background-color: #F8FAFC;
        }

        /* SECTION 3: SANTÉ & OBSERVATIONS */
        .health-box {
            border: 0.8px dashed #94A3B8;
            background-color: #FAFAFA;
            padding: 7px 10px;
            border-radius: 3px;
            font-size: 8.5pt;
            color: #334155;
            min-height: 28px;
            position: relative;
            z-index: 1;
        }

        /* SECTION 4: HISTORIQUE DES INSCRIPTIONS */
        .history-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            position: relative;
            z-index: 1;
        }

        .history-table th {
            background-color: #007A48;
            color: #FFFFFF;
            font-size: 7.5pt;
            font-weight: 800;
            text-transform: uppercase;
            padding: 4.5px 8px;
            border: 0.6px solid #007A48;
            text-align: left;
        }

        .history-table td {
            padding: 4px 8px;
            font-size: 8pt;
            border: 0.6px solid #CBD5E1;
            color: #1E293B;
        }

        /* 5. BLOC SIGNATURE, CACHET ET QR CODE - AU BAS DE PAGE */
        .signature-section {
            width: 100%;
            margin-top: 14px;
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
            padding-bottom: 4px;
        }

        .qr-box {
            display: inline-block;
            text-align: center;
            border: 1px dashed #CBD5E1;
            padding: 5px;
            border-radius: 4px;
            background-color: #FAFAFA;
        }

        .qr-img {
            width: 58px;
            height: 58px;
            display: block;
            margin: 0 auto;
        }

        .qr-caption {
            font-size: 5pt;
            font-weight: 800;
            color: #007A48;
            text-transform: uppercase;
            margin-top: 2px;
            letter-spacing: 0.2px;
        }

        .sig-right {
            width: 62%;
            vertical-align: top;
            text-align: center;
        }

        .sig-date {
            font-size: 8.5pt;
            font-weight: 600;
            color: #2D3748;
            margin-bottom: 3px;
        }

        .sig-title {
            font-size: 9pt;
            font-weight: 900;
            text-transform: uppercase;
            color: #0B3C5D;
            letter-spacing: 0.3px;
        }

        .stamp-placeholder {
            height: 58px;
            margin-top: 4px;
            border-bottom: 1px dotted #CBD5E1;
            position: relative;
        }

        .stamp-hint {
            position: absolute;
            bottom: 3px;
            right: 10px;
            font-size: 6pt;
            color: #A0AEC0;
            font-style: italic;
        }

        /* 6. PIED DE PAGE DE SÉCURITÉ */
        .footer-security {
            position: absolute;
            bottom: 10px;
            left: 18px;
            right: 18px;
            text-align: center;
            border-top: 0.8px solid #E2E8F0;
            padding-top: 5px;
        }

        .security-note {
            font-size: 6.2pt;
            color: #718096;
            line-height: 1.25;
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
    $matricule = $eleve->matricule ?? 'MAT-' . str_pad($eleve->id, 5, '0', STR_PAD_LEFT);
    $dateNaissance = $eleve->date_naissance ? $eleve->date_naissance->format('d/m/Y') : 'Non renseignée';
    $lieuNaissance = $eleve->lieu_naissance ?? 'Libreville';
    $sexe = $eleve->sexe === 'M' ? 'Masculin' : ($eleve->sexe === 'F' ? 'Féminin' : 'Non spécifié');

    $docRef = $reference ?? ('FICHE/' . $schoolYear . '/' . $matricule);
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
                <h1>DOSSIER INDIVIDUEL DE SYNTHÈSE</h1>
                <div class="subtitle">Fiche récapitulative des renseignements administratifs & pédagogiques</div>
            </div>
        </div>

        <!-- SECTION 1 : IDENTITÉ DE L'ÉLÈVE -->
        <div class="section-header">1. Identité & État Civil de l'Élève</div>
        <table class="student-table">
            <tr>
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
                <td class="student-info-td">
                    <table class="info-grid">
                        <tr>
                            <td class="lbl">Nom & Prénom(s) :</td>
                            <td class="val val-highlight">{{ $fullName }}</td>
                            <td class="lbl" style="width: 100px;">Matricule :</td>
                            <td class="val val-matricule">{{ $matricule }}</td>
                        </tr>
                        <tr>
                            <td class="lbl">Date & Lieu de Naissance :</td>
                            <td class="val">{{ $dateNaissance }} à {{ $lieuNaissance }}</td>
                            <td class="lbl">Sexe :</td>
                            <td class="val">{{ $sexe }}</td>
                        </tr>
                        <tr>
                            <td class="lbl">Classe Actuelle :</td>
                            <td class="val val-class">{{ $className }}</td>
                            <td class="lbl">Nationalité :</td>
                            <td class="val">Gabonaise</td>
                        </tr>
                        <tr>
                            <td class="lbl">Email Personnel / ID :</td>
                            <td class="val" colspan="3">{{ $eleve->user->email ?? 'Non renseigné' }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- SECTION 2 : RESPONSABLES LÉGAUX -->
        <div class="section-header">2. Responsables Légaux & Urgences Familiales</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 22%;">Lien de Parenté</th>
                    <th style="width: 32%;">Nom & Prénom(s)</th>
                    <th style="width: 24%;">Téléphone / Contact</th>
                    <th style="width: 22%;">Email / Profession</th>
                </tr>
            </thead>
            <tbody>
                @forelse($eleve->parents as $parent)
                <tr>
                    <td><strong>{{ ucfirst($parent->pivot->lien ?? 'Responsable légal') }}</strong></td>
                    <td>{{ strtoupper($parent->user->nom ?? '') }} {{ $parent->user->prenom ?? '' }}</td>
                    <td>{{ $parent->telephone ?? '-' }}</td>
                    <td>{{ $parent->user->email ?? ($parent->profession ?? '-') }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="4" style="text-align: center; color: #64748B; font-style: italic; padding: 6px;">
                        Aucun responsable légal enregistré dans le dossier
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>

        <!-- SECTION 3 : SANTÉ & OBSERVATIONS -->
        <div class="section-header">3. Santé Scolaire & Renseignements Particuliers</div>
        <div class="health-box">
            <strong>Allergies / Particularités médicales :</strong> 
            {{ $eleve->probleme_particulier ?: 'R.A.S. - Aucun problème particulier signalé à ce jour.' }}
        </div>

        <!-- SECTION 4 : HISTORIQUE DES INSCRIPTIONS -->
        @if($eleve->inscriptions && $eleve->inscriptions->count() > 0)
        <div class="section-header">4. Cursus au sein de l'Établissement</div>
        <table class="history-table">
            <thead>
                <tr>
                    <th style="width: 35%;">Année Scolaire</th>
                    <th style="width: 35%;">Classe Fréquentée</th>
                    <th style="width: 30%;">Statut</th>
                </tr>
            </thead>
            <tbody>
                @foreach($eleve->inscriptions->sortByDesc('created_at')->take(3) as $insc)
                <tr>
                    <td>{{ $insc->anneeScolaire->nom ?? '-' }}</td>
                    <td><strong>{{ $insc->classe->nom ?? '-' }}</strong></td>
                    <td><span style="color: #007A48; font-weight: bold;">Inscrit(e) &bull; Régulier</span></td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        <!-- 5. SIGNATURES, CACHET ET QR CODE - AU BAS DE PAGE -->
        <div class="signature-section">
            <table class="sig-table">
                <tr>
                    <td class="sig-left">
                        <div class="qr-box">
                            @if(!empty($qrCode))
                                <img src="data:image/svg+xml;base64,{{ $qrCode }}" class="qr-img" alt="QR Code Sécurité">
                                <div class="qr-caption">DOSSIER SÉCURISÉ</div>
                            @endif
                        </div>
                    </td>
                    <td class="sig-right">
                        <div class="sig-date">Fait à Libreville, le {{ now()->format('d/m/Y') }}</div>
                        <div class="sig-title">Le Secrétariat / Chef d'Établissement</div>
                        <div class="stamp-placeholder">
                            <span class="stamp-hint">Sceau & Visa Officiels</span>
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- 6. PIED DE PAGE DE SÉCURITÉ -->
        <div class="footer-security">
            <div class="security-note">
                Fiche individuelle de synthèse confidentielle &bull; Générée par le système scolaire <strong>Buyedi</strong> le {{ now()->format('d/m/Y à H:i') }}.<br>
                Ce document est réservé à l'administration scolaire et aux autorités éducatives compétentes.
            </div>
        </div>

    </div>
</div>
</body>
</html>
