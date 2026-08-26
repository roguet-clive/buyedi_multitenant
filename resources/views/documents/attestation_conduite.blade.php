<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Attestation de Bonne Conduite</title>
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

        .title-box { text-align: center; margin: 50px 0; }
        .title-box h1 { font-size: 26px; text-transform: uppercase; letter-spacing: 1px; border: 2px solid #000; padding: 10px 20px; display: inline-block; }

        .content { margin: 0 40px; font-size: 16px; line-height: 1.6; text-align: left; }
        .student-name { font-weight: bold; font-size: 18px; text-transform: uppercase; }

        .footer-signature { width: 100%; margin-top: 80px; }
        .signature-box { text-align: center; float: right; width: 250px; }
        .signature-line { border-bottom: 1px dotted #000; height: 80px; margin-top: 10px; width: 100%; }
        
        .watermark { position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; opacity: 0.04; z-index: -10; text-transform: uppercase; width: 100%; text-align: center; }
    </style>
</head>
<body>
    <div class="watermark">Bonne Conduite</div>

    <div class="header-container">
        <table class="header-table">
            <tr>
                <td class="header-left">
                    @if(!empty($etablissement['logo']))
                        <img src="{{ $etablissement['logo'] }}" style="max-width: 80px; height: auto;" alt="Logo">
                    @endif
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
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <div class="title-box">
        <h1>Attestation de Bonne Conduite</h1>
    </div>

    <div class="content">
        <p>Je soussigné(e), <strong>Monsieur le Directeur</strong> de l'établissement susvisé, atteste par la présente que l'élève :</p>
        
        <p style="text-align: center; margin: 30px 0; background-color: #f7fafc; padding: 15px;">
            <span class="student-name">{{ $eleve->user->prenom }} {{ $eleve->user->nom }}</span><br>
            Matricule : <strong>{{ $eleve->matricule }}</strong><br>
            Classe : <strong>{{ $inscription->classe->nom }}</strong>
        </p>

        <p>A fait preuve, durant l'année scolaire <strong>{{ $inscription->anneeScolaire->nom }}</strong>, d'une conduite irréprochable, d'assiduité et de discipline.</p>

        <p>Cette attestation lui est délivrée pour servir et valoir ce que de droit, notamment en vue de {{-- Espace pour motif --}} ........................................................................ .</p>
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
