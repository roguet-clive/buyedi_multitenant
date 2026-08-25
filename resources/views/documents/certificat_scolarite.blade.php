<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Certificat de Scolarité</title>
    <style>
        @page { margin: 0px; size: A4; }
        body { margin: 40px; font-family: 'Helvetica', sans-serif; color: #1a202c; }
        
        .header-container { width: 100%; border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 40px; }
        .header-table { width: 100%; }
        .header-left { text-align: left; width: 30%; vertical-align: top; }
        .header-center { text-align: center; width: 40%; vertical-align: top; }
        .header-right { text-align: right; width: 30%; vertical-align: top; }

        .republic { text-transform: uppercase; font-weight: bold; font-size: 14px; line-height: 1.2; }
        .motto { font-size: 10px; font-style: italic; margin-top: 5px; }
        .ministry { font-weight: bold; text-transform: uppercase; font-size: 12px; margin-top: 10px; }
        
        .school-info h2 { margin: 0; font-size: 18px; text-transform: uppercase; color: #2d3748; }
        .school-info p { margin: 2px 0; font-size: 11px; color: #4a5568; }

        .title-box { text-align: center; margin: 50px 0; }
        .title-box h1 { font-size: 28px; text-transform: uppercase; letter-spacing: 2px; border: 2px solid #000; padding: 15px 30px; display: inline-block; }

        .content { margin: 0 40px; font-size: 16px; line-height: 1.6; text-align: left; }
        .student-name { font-weight: bold; font-size: 20px; text-transform: uppercase; display: block; margin: 10px 0; }
        .field-label { font-weight: bold; }

        .footer-signature { width: 100%; margin-top: 80px; }
        .signature-box { text-align: center; float: right; width: 250px; }
        .date-line { margin-bottom: 20px; font-style: italic; }
        .signature-line { border-bottom: 1px dotted #000; height: 80px; margin-top: 10px; width: 100%; }

        .logo { max-width: 80px; height: auto; }
        
        /* Filigrane discret */
        .watermark { position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; opacity: 0.03; z-index: -10; text-transform: uppercase; width: 100%; text-align: center; pointer-events: none; }
    </style>
</head>
<body>
    <div class="watermark">{{ $etablissement['nom'] }}</div>

    <div class="header-container">
        <table class="header-table">
            <tr>
                <td class="header-left">
                    <!-- Si logo disponible -->
                    <!-- <img src="{{ $etablissement['logo'] }}" class="logo" alt="Logo"> -->
                </td>
                <td class="header-center">
                    <div class="republic">République Gabonaise</div>
                    <div class="motto">Union - Travail - Justice</div>
                    <div class="ministry">Ministère de l'Éducation Nationale</div>
                </td>
                <td class="header-right">
                    <div class="school-info">
                        <h2>{{ $etablissement['nom'] }}</h2>
                        <p>{{ $etablissement['adresse'] }}</p>
                        <p>{{ $etablissement['telephone'] }}</p>
                        <p>{{ $etablissement['email'] }}</p>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <div class="title-box">
        <h1>Certificat de Scolarité</h1>
    </div>

    <div class="content">
        <p>Le Directeur de l'établissement susmentionné certifie que l'élève :</p>
        
        <div style="background: #f7fafc; padding: 20px; border-left: 5px solid #4a5568; margin: 30px 0;">
            <p style="margin: 5px 0;"><span class="field-label">Nom et Prénom :</span> <span class="student-name">{{ $eleve->user->nom }} {{ $eleve->user->prenom }}</span></p>
            <p style="margin: 5px 0;"><span class="field-label">Matricule :</span> {{ $eleve->matricule }}</p>
            <p style="margin: 5px 0;"><span class="field-label">Date et lieu de naissance :</span> {{ $eleve->date_naissance ? $eleve->date_naissance->format('d/m/Y') : 'Non renseigné' }} à {{ $eleve->lieu_naissance ?? '-' }}</p>
            <p style="margin: 5px 0;"><span class="field-label">Sexe :</span> {{ $eleve->sexe === 'M' ? 'Masculin' : 'Féminin' }}</p>
        </div>

        <p>Est régulièrement inscrit(e) pour l'année scolaire <strong>{{ $inscription->anneeScolaire->nom }}</strong> en classe de :</p>
        
        <h3 style="text-align: center; text-transform: uppercase; font-size: 24px; margin: 20px 0;">{{ $inscription->classe->nom }}</h3>

        <p>En foi de quoi, ce certificat lui est délivré pour servir et valoir ce que de droit.</p>
    </div>

    <div class="footer-signature">
        <div class="signature-box">
            <div class="date-line">Fait à Libreville, le {{ now()->format('d/m/Y') }}</div>
            <div style="font-weight: bold; text-transform: uppercase;">Le Directeur</div>
            <div class="signature-line"></div>
        </div>
    </div>
</body>
</html>
