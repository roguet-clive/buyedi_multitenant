<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Carte d'Étudiant - {{ $eleve->user->nom }}</title>
    <style>
        @page { margin: 0; size: 85.6mm 54mm; } /* Format Carte Crédit (CR80) */
        
        body { 
            margin: 0; 
            padding: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            width: 100%; 
            height: 100%; 
            overflow: hidden; 
            -webkit-print-color-adjust: exact;
        }
        
        .card-container {
            width: 100%; 
            height: 100%; 
            position: relative;
            background: #0B1A2D; /* Deep dark blue */
            color: #ffffff;
            box-sizing: border-box;
            border-radius: 4px; /* Slight rounding for safety, usually clipped by printer */
        }

        /* Abstract shapes for background texture */
        .bg-shape-1 {
            position: absolute;
            top: -20px;
            right: -30px;
            width: 120px;
            height: 120px;
            background: rgba(16, 185, 129, 0.15); /* Emerald tint */
            border-radius: 50%;
            z-index: 0;
        }

        .bg-shape-2 {
            position: absolute;
            bottom: -40px;
            left: -20px;
            width: 150px;
            height: 150px;
            background: rgba(59, 130, 246, 0.1); /* Blue tint */
            border-radius: 50%;
            z-index: 0;
        }

        /* Top Header Strip */
        .header {
            position: relative;
            z-index: 10;
            padding: 8px 12px;
            background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%);
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .school-name {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #ffffff;
            margin-bottom: 2px;
        }

        .school-sub {
            font-size: 6.5px;
            font-weight: 600;
            color: #94a3b8; /* Slate 400 */
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        /* Main Content Layout */
        .content {
            position: relative;
            z-index: 10;
            padding: 10px 12px;
            height: 100%;
            box-sizing: border-box;
        }

        /* Photo Area */
        .photo-container {
            position: absolute;
            right: 12px;
            top: 28px; /* Below header */
            width: 24mm;
            height: 29mm;
            background: #1e293b;
            border: 2px solid rgba(255,255,255,0.2);
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            text-align: center;
        }

        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .no-photo {
            width: 100%;
            height: 100%;
            background: #334155;
            color: #64748b;
            font-size: 24px;
            line-height: 29mm;
            font-weight: bold;
        }

        /* Info Area */
        .info-box {
            width: calc(100% - 30mm); /* Leave space for photo */
            padding-top: 2px;
        }

        .student-name {
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
            color: #ffffff;
            margin-bottom: 2px;
            line-height: 1.1;
            letter-spacing: 0.3px;
        }
        
        .student-firstname {
            font-size: 11px;
            font-weight: 500;
            color: #e2e8f0;
            text-transform: capitalize;
            margin-bottom: 8px;
            display: block;
        }

        table.info-grid {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
        }

        table.info-grid td {
            padding: 1.5px 0;
            vertical-align: top;
        }

        .info-label { 
            font-size: 6px; 
            text-transform: uppercase; 
            color: #94a3b8; /* slate-400 */
            font-weight: 700;
            letter-spacing: 0.5px;
            width: 45px;
        }

        .info-value { 
            font-size: 8px; 
            font-weight: 700; 
            color: #f8fafc;
        }

        /* Bottom Strip */
        .footer {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 18px;
            background: rgba(0,0,0,0.3);
            border-top: 1px solid rgba(255,255,255,0.05);
            z-index: 10;
        }

        .year-badge {
            position: absolute;
            left: 12px;
            bottom: 3.5px;
            background: #10b981; /* emerald-500 */
            color: #ffffff;
            font-size: 7px;
            font-weight: 800;
            padding: 2px 5px;
            border-radius: 3px;
            letter-spacing: 0.5px;
        }
        
        .matricule-badge {
            position: absolute;
            right: 12px;
            bottom: 4px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 8px;
            font-weight: bold;
            color: #cbd5e1;
            letter-spacing: 1px;
        }
        
        /* Simulated Barcode */
        .barcode {
            position: absolute;
            right: 48px;
            bottom: 5px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 6px;
            letter-spacing: -1px;
            color: rgba(255,255,255,0.4);
        }

    </style>
</head>
<body>
    <div class="card-container">
        <!-- Decorative Shapes -->
        <div class="bg-shape-1"></div>
        <div class="bg-shape-2"></div>

        <!-- Header -->
        <div class="header">
            <div class="school-name">{{ $etablissement['nom'] }}</div>
            <div class="school-sub">CARTE D'IDENTITÉ SCOLAIRE</div>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Photo Layer -->
            <div class="photo-container">
                @if($eleve->photo)
                    <img src="{{ public_path('storage/' . $eleve->photo) }}" alt="Photo">
                @else
                    <div class="no-photo">{{ substr($eleve->user->nom, 0, 1) }}</div>
                @endif
            </div>

            <!-- Student Data Layer -->
            <div class="info-box">
                <div class="student-name">{{ $eleve->user->nom }}</div>
                <div class="student-firstname">{{ $eleve->user->prenom }}</div>
                
                <table class="info-grid">
                    <tr>
                        <td class="info-label">Né(e) le</td>
                        <td class="info-value">{{ $eleve->date_naissance ? $eleve->date_naissance->format('d/m/Y') : '-' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Sexe</td>
                        <td class="info-value">{{ $eleve->sexe == 'M' ? 'Masculin' : 'Féminin' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Classe</td>
                        <td class="info-value" style="color: #38bdf8; font-size: 9px;">{{ $inscription->classe->nom }}</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="year-badge">ANNÉE {{ $inscription->anneeScolaire->nom }}</div>
            <div class="barcode">||| | || ||| | |||</div>
            <div class="matricule-badge">{{ $eleve->matricule }}</div>
        </div>
    </div>
</body>
</html>
