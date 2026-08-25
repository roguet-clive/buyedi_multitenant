<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Reçu de Paiement</title>
    <style>
        body { font-family: sans-serif; font-size: 14px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ddd; padding-bottom: 15px; }
        .logo { font-size: 24px; font-weight: bold; color: #444; }
        .school-info { font-size: 12px; color: #666; margin-top: 5px; }
        
        .receipt-title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; color: #2c3e50; }
        
        .details-box { border: 1px solid #eee; padding: 15px; margin-bottom: 20px; background: #f9f9f9; }
        .row { display: table; width: 100%; margin-bottom: 10px; }
        .label { display: table-cell; width: 40%; font-weight: bold; color: #555; }
        .value { display: table-cell; width: 60%; }

        .footer { text-align: center; margin-top: 50px; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
        
        .amount-box { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; color: #27ae60; }
        .signature { margin-top: 40px; text-align: right; font-style: italic; font-size: 12px; }
    </style>
</head>
<body>

    <div class="header">
        <div class="logo">{{ config('app.name', 'Buyedi') }}</div>
        <div class="school-info">
            Année Scolaire : {{ $paiement->inscription->anneeScolaire->nom ?? 'N/A' }}<br>
            Tél: +243 000 000 000 | Email: contact@buyedi.com
        </div>
    </div>

    <div class="receipt-title">Reçu de Paiement</div>

    <div class="details-box">
        <div class="row">
            <span class="label">Référence :</span>
            <span class="value">{{ $paiement->reference ?? 'N/A' }}</span>
        </div>
        <div class="row">
            <span class="label">Date :</span>
            <span class="value">{{ \Carbon\Carbon::parse($paiement->date_paiement)->format('d/m/Y') }}</span>
        </div>
        <div class="row">
            <span class="label">Élève :</span>
            <span class="value">{{ $paiement->inscription->eleve->user->nom }} {{ $paiement->inscription->eleve->user->prenom }}</span>
        </div>
        <div class="row">
            <span class="label">Classe :</span>
            <span class="value">{{ $paiement->inscription->classe->nom }}</span>
        </div>
        <div class="row">
            <span class="label">Motif :</span>
            <span class="value">{{ $paiement->fraisType->nom }} {{ $paiement->mois ? "($paiement->mois)" : "" }}</span>
        </div>
        <div class="row">
            <span class="label">Mode de Paiement :</span>
            <span class="value">{{ ucfirst($paiement->mode_paiement) }}</span>
        </div>
        @if($paiement->commentaire)
        <div class="row">
            <span class="label">Note :</span>
            <span class="value">{{ $paiement->commentaire }}</span>
        </div>
        @endif
    </div>

    <div class="amount-box">
        Montant Payé : {{ number_format($paiement->montant, 0, ',', ' ') }} FCFA
    </div>

    <div class="signature">
        <p>Le Caissier<br>
        {{ $paiement->user ? $paiement->user->nom : 'Système' }}</p>
    </div>

    <div class="footer">
        Ce reçu est une preuve de paiement officielle. Veuillez le conserver précieusement.<br>
        Généré le {{ date('d/m/Y H:i') }}
    </div>

</body>
</html>
