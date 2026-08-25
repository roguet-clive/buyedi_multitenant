<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Billet de Sortie</title>
    <style>
        @page { margin: 20mm; size: A5; } /* Format A5 pour économiser papier */
        body { font-family: 'Courier', sans-serif; font-size: 14px; border: 2px dashed #000; padding: 20px; }
        
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .h-title { font-weight: bold; font-size: 18px; text-transform: uppercase; }
        
        .row { margin: 15px 0; border-bottom: 1px dotted #999; padding-bottom: 5px; }
        .label { font-weight: bold; width: 140px; display: inline-block; }
        
        .footer { margin-top: 40px; text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <div class="h-title">AUTORISATION DE SORTIE</div>
        <div>{{ $etablissement['nom'] }}</div>
    </div>

    <div class="row">
        <span class="label">Élève :</span> <strong>{{ $eleve->user->nom }} {{ $eleve->user->prenom }}</strong>
    </div>

    <div class="row">
        <span class="label">Classe :</span> {{ $inscription->classe->nom ?? '__________' }}
    </div>

    <div class="row">
        <span class="label">Date :</span> {{ now()->format('d/m/Y') }} à ________ H ________
    </div>

    <div class="row">
        <span class="label">Motif :</span> ..........................................................................
    </div>
    <div class="row">
        .............................................................................................................
    </div>

    <div class="row">
        <span class="label">Accompagnateur :</span> ....................................................................
    </div>

    <div class="footer">
        <p>Signature (Surveillant / Dir) :</p>
        <br><br>
        ______________________
    </div>
</body>
</html>
