<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Fiche de Renseignements - {{ $eleve->user->nom ?? '' }} {{ $eleve->user->prenom ?? '' }}</title>
    <style>
        @page {
            margin: 8mm 12mm 14mm 12mm;
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
            font-size: 9pt;
            line-height: 1.35;
        }

        /* 1. CADRE OFFICIEL */
        .certificate-frame {
            width: 100%;
            border: 2px solid #0B3C5D;
            border-radius: 6px;
            padding: 2px;
            box-sizing: border-box;
            background-color: #FFFFFF;
            position: relative;
        }

        .certificate-inner {
            border: 1px solid #007A48;
            border-radius: 4px;
            padding: 10px 16px 8px 16px;
            box-sizing: border-box;
            position: relative;
        }

        /* FILIGRANE RÉPUBLIQUE */
        .watermark {
            position: absolute;
            top: 48%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 320px;
            opacity: 0.03;
            z-index: 0;
            pointer-events: none;
        }

        /* 3. EN-TÊTE RÉPUBLICAIN & ÉTABLISSEMENT */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 3px;
            position: relative;
            z-index: 1;
        }

        .header-left {
            width: 38%;
            text-align: center;
            vertical-align: top;
        }

        .republic-title {
            font-size: 9.5pt;
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
            margin-bottom: 2px;
        }

        .flag-emblem-bar {
            margin: 2px auto;
            text-align: center;
        }

        .emblem-img {
            height: 22px;
            width: auto;
            vertical-align: middle;
            margin-right: 4px;
        }

        .flag-img {
            height: 13px;
            width: 20px;
            vertical-align: middle;
            border: 0.5px solid rgba(0,0,0,0.2);
            border-radius: 1px;
        }

        .ministry-title {
            font-size: 6.8pt;
            font-weight: 800;
            color: #007A48;
            text-transform: uppercase;
            line-height: 1.2;
            margin-top: 2px;
        }

        .header-center {
            width: 24%;
            text-align: center;
            vertical-align: middle;
            padding: 0 4px;
        }

        .main-school-logo {
            max-height: 48px;
            max-width: 68px;
            object-fit: contain;
            display: inline-block;
        }

        .header-right {
            width: 38%;
            text-align: center;
            vertical-align: top;
        }

        .school-name-header {
            font-size: 9.8pt;
            font-weight: 900;
            color: #0B3C5D;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            line-height: 1.2;
            margin-bottom: 2px;
        }

        .school-sub-info {
            font-size: 7.2pt;
            color: #4A5568;
            line-height: 1.25;
        }

        .school-contact-info {
            font-size: 6.6pt;
            color: #2D3748;
            font-weight: 600;
            margin-top: 1px;
        }

        /* SÉPARATEUR TRICOLORE GABONAIS */
        .divider-table {
            width: 100%;
            height: 2.5px;
            border-collapse: collapse;
            margin: 4px 0 6px 0;
            position: relative;
            z-index: 1;
        }

        .flag-g { background-color: #009E60; width: 33.33%; height: 2.5px; }
        .flag-y { background-color: #FCD116; width: 33.33%; height: 2.5px; }
        .flag-b { background-color: #3A75C4; width: 33.34%; height: 2.5px; }

        /* 4. BANDEAU RÉFÉRENCE & DATE */
        .ref-bar {
            width: 100%;
            margin-bottom: 6px;
            font-size: 8pt;
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
        }

        .ref-right {
            text-align: right;
            color: #4A5568;
            font-style: italic;
        }

        /* 5. TITRE CENTRAL */
        .title-container {
            text-align: center;
            margin: 4px 0 8px 0;
            position: relative;
            z-index: 1;
        }

        .title-badge {
            display: inline-block;
            background: #F8FAFC;
            border: 1.4px solid #0B3C5D;
            border-radius: 4px;
            padding: 5px 24px;
        }

        .title-badge h1 {
            margin: 0;
            font-size: 12.5pt;
            font-weight: 900;
            color: #0B3C5D;
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }

        .title-badge .subtitle {
            margin-top: 1px;
            font-size: 6.8pt;
            font-weight: 700;
            color: #007A48;
            text-transform: uppercase;
            letter-spacing: 0.6px;
        }

        /* SECTIONS STYLÉES */
        .section-header {
            background-color: #0B3C5D;
            color: #FFFFFF;
            font-size: 8pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 3px 8px;
            margin: 6px 0 4px 0;
            border-radius: 2px;
            position: relative;
            z-index: 1;
        }

        /* BLOC ÉLÈVE & PHOTO */
        .student-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
            position: relative;
            z-index: 1;
        }

        .student-photo-td {
            width: 66px;
            vertical-align: top;
            padding-right: 10px;
        }

        .student-photo-frame {
            width: 62px;
            height: 74px;
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
            line-height: 74px;
            font-size: 16pt;
            font-weight: 900;
            color: #64748B;
            background-color: #E2E8F0;
            text-align: center;
        }

        .info-grid {
            width: 100%;
            border-collapse: collapse;
        }

        .info-grid td {
            padding: 2px 2px;
            vertical-align: top;
            font-size: 8.8pt;
        }

        .lbl {
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
            font-size: 9.8pt;
            font-weight: 900;
            color: #0B3C5D;
            text-transform: uppercase;
        }

        .val-class {
            font-size: 9.8pt;
            font-weight: 900;
            color: #007A48;
            text-transform: uppercase;
        }

        .val-matricule {
            font-family: 'DejaVu Sans', monospace;
            font-weight: 900;
            color: #C53030;
        }

        /* TABLEAUX DE DONNÉES */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
            position: relative;
            z-index: 1;
        }

        .data-table th, .data-table td {
            border: 0.6px solid #CBD5E1;
            padding: 3px 6px;
            font-size: 8pt;
            text-align: left;
        }

        .data-table th {
            background-color: #F1F5F9;
            color: #334155;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 7.2pt;
        }

        .health-box {
            background-color: #F8FAFC;
            border: 0.8px solid #E2E8F0;
            border-left: 3px solid #0284C7;
            padding: 4px 8px;
            font-size: 8.2pt;
            color: #334155;
            margin-bottom: 4px;
            position: relative;
            z-index: 1;
        }

        /* SIGNATURES & QR CODE */
        .signature-section {
            width: 100%;
            margin-top: 8px;
            position: relative;
            z-index: 1;
        }

        .sig-table {
            width: 100%;
            border-collapse: collapse;
        }

        .sig-left {
            width: 32%;
            vertical-align: bottom;
            text-align: left;
        }

        .qr-box {
            display: inline-block;
            text-align: center;
            border: 1px dashed #CBD5E1;
            padding: 4px;
            border-radius: 4px;
            background-color: #FAFAFA;
        }

        .qr-img {
            width: 54px;
            height: 54px;
            display: block;
            margin: 0 auto;
        }

        .qr-caption {
            font-size: 4.8pt;
            font-weight: 800;
            color: #007A48;
            text-transform: uppercase;
            margin-top: 1px;
        }

        .qr-ref {
            font-size: 5pt;
            color: #64748B;
            margin-top: 1px;
            font-weight: 600;
        }

        .sig-center {
            width: 34%;
            vertical-align: top;
            text-align: center;
            padding: 0 5px;
        }

        .sig-right {
            width: 34%;
            vertical-align: top;
            text-align: center;
            padding: 0 5px;
        }

        .sig-title {
            font-size: 8.2pt;
            font-weight: 800;
            text-transform: uppercase;
            color: #0B3C5D;
            margin-bottom: 2px;
        }

        .stamp-placeholder {
            height: 48px;
            border: 1.2px dashed #94A3B8;
            border-radius: 4px;
            background-color: #FAFAFA;
            position: relative;
        }

        .stamp-hint {
            position: absolute;
            bottom: 2px;
            right: 6px;
            font-size: 6pt;
            color: #A0AEC0;
            font-style: italic;
        }

        /* NOTE DE SÉCURITÉ BAS DE CADRE */
        .security-footer-note {
            margin-top: 6px;
            padding-top: 3px;
            border-top: 0.6px solid #E2E8F0;
            text-align: center;
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

    $documentTitle = 'Fiche Individuelle de Renseignements Élève';
    $docRef = $reference ?? ('FICHE/' . $schoolYear . '/' . $matricule);
@endphp

{{-- PIED DE PAGE OFFICIEL BUYEDI (DOMPDF FIXE EN BAS DE PAGE) --}}
@include('documents.partials.footer', [
    'etablissement' => $etablissement,
    'documentTitle' => $documentTitle,
    'schoolYear' => $schoolYear,
])

{{-- 2. CADRE OFFICIEL DU DOSSIER --}}
<div class="certificate-frame">
    <div class="certificate-inner">
        
        <!-- FILIGRANE -->
        @if(file_exists($emblemPath))
            <img src="{{ $emblemPath }}" class="watermark" alt="Filigrane">
        @endif

        <!-- EN-TÊTE RÉPUBLICAIN & ÉTABLISSEMENT -->
        <table class="header-table">
            <tr>
                <td class="header-left">
                    <div class="republic-title">RÉPUBLIQUE GABONAISE</div>
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
                        MINISTÈRE DE L'ÉDUCATION NATIONALE<br>
                        CHARGÉ DE LA FORMATION CIVIQUE
                    </div>
                </td>

                <td class="header-center">
                    @if($schoolLogo)
                        <img src="{{ $schoolLogo }}" class="main-school-logo" alt="Logo Établissement">
                    @endif
                </td>

                <td class="header-right">
                    <div class="school-name-header">{{ $schoolName }}</div>
                    <div class="school-sub-info">
                        Enseignement Général &bull; Primaire & Secondaire<br>
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

        <!-- BANDEAU RÉFÉRENCE & DATE -->
        <div class="ref-bar">
            <table class="ref-table">
                <tr>
                    <td class="ref-left">N° RÉF : <strong>{{ $docRef }}</strong></td>
                    <td class="ref-right">Année Académique : <strong>{{ $schoolYear }}</strong></td>
                </tr>
            </table>
        </div>

        <!-- TITRE OFFICIEL -->
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
                <td>
                    <table class="info-grid">
                        <tr>
                            <td class="lbl" style="width: 125px;">Nom & Prénom(s) :</td>
                            <td class="val val-highlight">{{ $fullName }}</td>
                            <td class="lbl" style="width: 85px;">Matricule :</td>
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
                            <td class="lbl">Email / Identifiant :</td>
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
                    <td colspan="4" style="text-align: center; color: #64748B; font-style: italic; padding: 4px;">
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
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 35%;">Année Scolaire</th>
                    <th style="width: 35%;">Classe Fréquentée</th>
                    <th style="width: 30%;">Statut</th>
                </tr>
            </thead>
            <tbody>
                @foreach($eleve->inscriptions->sortByDesc('created_at')->take(2) as $insc)
                <tr>
                    <td>{{ $insc->anneeScolaire->nom ?? '-' }}</td>
                    <td><strong>{{ $insc->classe->nom ?? '-' }}</strong></td>
                    <td><span style="color: #007A48; font-weight: bold;">Inscrit(e) &bull; Régulier</span></td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        <!-- SIGNATURES & QR CODE -->
        <div class="signature-section">
            <table class="sig-table">
                <tr>
                    <!-- QR Code Sécurité -->
                    <td class="sig-left">
                        <div class="qr-box">
                            @if(!empty($qrCode))
                                <img src="data:image/svg+xml;base64,{{ $qrCode }}" class="qr-img" alt="QR Code">
                                <div class="qr-caption">AUTHENTICITÉ VÉRIFIÉE</div>
                                <div class="qr-ref">{{ $docRef }}</div>
                            @endif
                        </div>
                    </td>

                    <!-- Signature Parent -->
                    <td class="sig-center">
                        <div class="sig-title">Le Parent / Responsable</div>
                        <div class="stamp-placeholder">
                            <span class="stamp-hint">Signature Responsable</span>
                        </div>
                    </td>

                    <!-- Signature & Cachet Direction -->
                    <td class="sig-right">
                        <div class="sig-title">La Direction des Études</div>
                        <div class="stamp-placeholder">
                            <span class="stamp-hint">Sceau officiel & Signature</span>
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- NOTE DE SÉCURITÉ BAS DE CADRE -->
        <div class="security-footer-note">
            Document officiel certifié conforme par le système de gestion scolaire Buyedi &bull; Sécurisé par QR Code infalsifiable.<br>
            Toute falsification ou rature expose son auteur à des sanctions administratives et judiciaires selon les lois de la République Gabonaise.
        </div>

    </div>
</div>

</body>
</html>
