{{-- Pied de page officiel Buyedi conforme aux standards administratifs professionnels --}}
@php
    $siteWebUrl = $etablissement['site_web'] ?? 'https://appbuyedi.com';
    $nomEtablissement = $etablissement['nom'] ?? 'COMPLEXE SCOLAIRE BUYEDI';
    $telephone = $etablissement['telephone'] ?? null;
    $email = $etablissement['email'] ?? null;
    $titreDoc = $documentTitle ?? 'Document Administratif Officiel';
    $annee = $schoolYear ?? (date('Y') . '-' . (date('Y')+1));

    $globePngPath = public_path('images/globe.png');
    if (file_exists($globePngPath)) {
        $globeSrc = 'data:image/png;base64,' . base64_encode(file_get_contents($globePngPath));
    } else {
        $globeSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
        $globeSrc = 'data:image/svg+xml;base64,' . base64_encode($globeSvg);
    }
@endphp

<style>
    footer.official-footer {
        position: fixed;
        bottom: 2.5mm;
        left: 12mm;
        right: 12mm;
        height: 10.5mm;
        border-top: 1.2px solid #0B3C5D;
        padding-top: 3px;
        font-size: 7.4pt;
        color: #334155;
        line-height: 1.25;
        font-family: 'DejaVu Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }

    .footer-table {
        width: 100%;
        border-collapse: collapse;
    }

    .footer-table td {
        padding: 0;
        vertical-align: middle;
    }

    .footer-row-top-left {
        width: 70%;
        text-align: left;
        font-size: 7.6pt;
        color: #0F172A;
        line-height: 1.25;
    }

    .footer-school-bold {
        font-weight: 800;
        color: #0B3C5D;
        text-transform: uppercase;
        letter-spacing: 0.2px;
    }

    .footer-bullet {
        color: #94A3B8;
        margin: 0 3px;
        font-weight: normal;
    }

    .footer-row-top-right {
        width: 30%;
        text-align: right;
        font-size: 7.4pt;
        white-space: nowrap;
    }

    .footer-globe-icon {
        width: 10px;
        height: 10px;
        vertical-align: -1px;
        margin-right: 3px;
        display: inline-block;
    }

    .footer-link-web {
        color: #0284C7;
        text-decoration: underline;
        font-weight: 600;
    }

    .footer-row-sub-left {
        width: 70%;
        text-align: left;
        font-size: 6.9pt;
        color: #64748B;
        font-style: italic;
        padding-top: 2px;
        line-height: 1.2;
    }

    .footer-row-sub-right {
        width: 30%;
        text-align: right;
        font-size: 7.2pt;
        font-weight: 700;
        color: #0F172A;
        padding-top: 2px;
        white-space: nowrap;
    }
</style>

<footer class="official-footer">
    <table class="footer-table">
        <tr>
            <td class="footer-row-top-left">
                <strong class="footer-school-bold">{{ $nomEtablissement }}</strong>
                @if(!empty($telephone))
                    <span class="footer-bullet">&bull;</span> Tél : {{ $telephone }}
                @endif
                @if(!empty($email))
                    <span class="footer-bullet">&bull;</span> {{ $email }}
                @endif
            </td>
            <td class="footer-row-top-right">
                <img src="{{ $globeSrc }}" class="footer-globe-icon" alt="Web">
                <a href="{{ $siteWebUrl }}" class="footer-link-web">{{ $siteWebUrl }}</a>
            </td>
        </tr>
        <tr>
            <td class="footer-row-sub-left">
                {{ $titreDoc }} &bull; Année {{ $annee }} &bull; Édité le {{ now()->format('d/m/Y à H:i') }}
            </td>
            <td class="footer-row-sub-right">
                {{-- L'indicateur Page X / Y est calculé et positionné dynamiquement par le moteur de rendu PHP DomPDF --}}
            </td>
        </tr>
    </table>
</footer>

<script type="text/php">
if (isset($pdf)) {
    $size = 7.2;
    $font = $fontMetrics->getFont("DejaVu Sans", "bold");
    $width = $fontMetrics->getTextWidth("Page 1 / 1", $font, $size);
    $x = $pdf->get_width() - $width - 34; // aligné sur la marge droite (12mm)
    $y = $pdf->get_height() - 17; // positionné sur la 2ème ligne du pied de page
    $pdf->page_text($x, $y, "Page {PAGE_NUM} / {PAGE_COUNT}", $font, $size, array(0.06, 0.09, 0.16));
}
</script>
