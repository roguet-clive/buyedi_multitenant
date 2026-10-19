<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Établissement Suspendu - Buyedi</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #f8fafc;
            padding: 24px;
        }
        .card {
            background: rgba(30, 41, 59, 0.85);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 24px;
            padding: 48px;
            max-width: 580px;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .icon {
            width: 80px;
            height: 80px;
            background: rgba(239, 68, 68, 0.15);
            border: 2px solid rgba(239, 68, 68, 0.4);
            color: #ef4444;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            margin-bottom: 24px;
        }
        h1 { font-size: 26px; font-weight: 800; color: #ffffff; margin-bottom: 12px; }
        .school-name { color: #f87171; font-weight: 700; margin-bottom: 16px; font-size: 18px; }
        p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
        .support-box {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 20px;
            margin-top: 24px;
            font-size: 14px;
            color: #cbd5e1;
        }
        .support-btn {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: #ffffff;
            font-weight: 600;
            padding: 12px 28px;
            border-radius: 12px;
            text-decoration: none;
            margin-top: 16px;
            transition: all 0.2s;
        }
        .support-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.5); }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">🔒</div>
        <h1>Accès Temporairement Suspendu</h1>
        <div class="school-name">{{ $tenant->nom ?? 'Établissement' }}</div>
        <p>{{ $raison ?? 'L\'accès à cet espace a été restreint par l\'administration de la plateforme.' }}</p>

        <div class="support-box">
            <div>Besoin de débloquer vos accès ou d'une assistance ?</div>
            <a href="mailto:support@buyedi.com?subject=Demande de déblocage - {{ $tenant->id }}" class="support-btn">Contacter le Support Buyedi</a>
        </div>
    </div>
</body>
</html>
