import React, { useState, useEffect } from "react";
import { Percent, DollarSign, Sparkles, Check, AlertCircle } from "lucide-react";

/**
 * Calculateur automatique bidirectionnel de remise sur la scolarité.
 * 
 * Permet de saisir :
 * - Soit le tarif permis de payer (ex: 15 000 FCFA au lieu de 20 000 FCFA) -> calcule automatiquement le % et l'économie.
 * - Soit le pourcentage de remise (ex: 20%) -> calcule automatiquement le tarif permis.
 */
export default function RemiseCalculator({
  baseMonthly = 20000,
  hasRemise = false,
  remisePourcentage = 0,
  remiseMontant = 0,
  scolariteAccorde = 0,
  onChange = () => {},
  title = "Remise sur la Scolarité",
  monthsCount = 9
}) {
  const [enabled, setEnabled] = useState(hasRemise);
  const [percentInput, setPercentInput] = useState(remisePourcentage ? String(remisePourcentage) : "");
  const [netInput, setNetInput] = useState(scolariteAccorde ? String(scolariteAccorde) : "");

  // Synchronisation si le tarif de base de la classe change
  useEffect(() => {
    if (enabled && percentInput) {
      const pct = parseFloat(percentInput) || 0;
      const net = Math.round(baseMonthly * (1 - pct / 100));
      setNetInput(String(net));
    }
  }, [baseMonthly]);

  const handleToggle = (checked) => {
    setEnabled(checked);
    if (!checked) {
      setPercentInput("");
      setNetInput("");
      onChange({
        has_remise: false,
        remise_pourcentage: 0,
        remise_montant: 0,
        scolarite_accorde: 0,
      });
    } else {
      // Activer avec valeurs par défaut
      const defaultNet = Math.round(baseMonthly * 0.9); // 10% par défaut
      setPercentInput("10");
      setNetInput(String(defaultNet));
      onChange({
        has_remise: true,
        remise_pourcentage: 10,
        remise_montant: baseMonthly - defaultNet,
        scolarite_accorde: defaultNet,
      });
    }
  };

  // L'utilisateur modifie le tarif net autorisé à payer
  const handleNetChange = (value) => {
    setNetInput(value);
    const net = parseFloat(value);
    if (isNaN(net) || net < 0) {
      setPercentInput("");
      onChange({
        has_remise: true,
        remise_pourcentage: 0,
        remise_montant: 0,
        scolarite_accorde: 0,
      });
      return;
    }

    const discount = Math.max(0, baseMonthly - net);
    const pct = baseMonthly > 0 ? Math.round((discount / baseMonthly) * 100 * 10) / 10 : 0;
    setPercentInput(String(pct));

    onChange({
      has_remise: true,
      remise_pourcentage: pct,
      remise_montant: discount,
      scolarite_accorde: net,
    });
  };

  // L'utilisateur modifie le pourcentage de remise
  const handlePercentChange = (value) => {
    setPercentInput(value);
    const pct = parseFloat(value);
    if (isNaN(pct) || pct < 0) {
      setNetInput("");
      onChange({
        has_remise: true,
        remise_pourcentage: 0,
        remise_montant: 0,
        scolarite_accorde: 0,
      });
      return;
    }

    const safePct = Math.min(100, Math.max(0, pct));
    const net = Math.round(baseMonthly * (1 - safePct / 100));
    const discount = baseMonthly - net;
    setNetInput(String(net));

    onChange({
      has_remise: true,
      remise_pourcentage: safePct,
      remise_montant: discount,
      scolarite_accorde: net,
    });
  };

  const parsedNet = parseFloat(netInput) || baseMonthly;
  const parsedDiscount = Math.max(0, baseMonthly - parsedNet);
  const parsedAnnualDiscount = parsedDiscount * monthsCount;

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 ${
      enabled 
        ? "bg-amber-50/70 border-amber-300 dark:bg-amber-950/20 dark:border-amber-800 shadow-sm ring-1 ring-amber-400/20" 
        : "bg-slate-50/50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800"
    }`}>
      {/* Entête Toggle */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700"
          />
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-amber-600" />
            {title}
          </span>
        </label>
        {enabled && (
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-2.5 py-0.5 rounded-full">
            Calcul Automatique Actif
          </span>
        )}
      </div>

      {!enabled ? (
        <p className="text-xs text-slate-400">
          Cochez cette option si l'élève bénéficie d'un tarif négocié ou d'une remise parentale sur sa scolarité.
        </p>
      ) : (
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-200/80 dark:border-amber-900/50 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-500">Tarif officiel de la classe :</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {Number(baseMonthly).toLocaleString("fr-FR")} FCFA / mois
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* OPTION 1 : SAISIE DU TARIF NET PERMIS */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                1. Tarif permis de payer (Net mensuel) :
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={baseMonthly}
                  step="500"
                  value={netInput}
                  onChange={(e) => handleNetChange(e.target.value)}
                  placeholder={String(baseMonthly)}
                  className="w-full pl-3 pr-14 py-2 border rounded-xl bg-white dark:bg-slate-800 font-mono font-bold text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 border-amber-300 dark:border-amber-700"
                />
                <span className="absolute right-3 top-2 text-xs font-black text-amber-600 pointer-events-none">
                  FCFA
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Saisissez ce que le parent a le droit de régler chaque mois.
              </p>
            </div>

            {/* OPTION 2 : SAISIE DU POURCENTAGE DE REMISE */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                2. Ou Pourcentage de remise accordé :
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={percentInput}
                  onChange={(e) => handlePercentChange(e.target.value)}
                  placeholder="Ex: 20"
                  className="w-full pl-3 pr-9 py-2 border rounded-xl bg-white dark:bg-slate-800 font-mono font-bold text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 border-amber-300 dark:border-amber-700"
                />
                <span className="absolute right-3 top-2 text-xs font-black text-amber-600 pointer-events-none">
                  %
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Le système calcule automatiquement le tarif réduit.
              </p>
            </div>
          </div>

          {/* RÉCAPITULATIF ÉCONOMIE */}
          {parsedDiscount > 0 && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>
                  Remise calculée : <strong>-{percentInput || 0}%</strong>
                </span>
              </div>
              <div className="text-right font-mono font-bold text-emerald-700 dark:text-emerald-300">
                Économie de {parsedDiscount.toLocaleString("fr-FR")} F / mois
                <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-normal">
                  ({parsedAnnualDiscount.toLocaleString("fr-FR")} F sur 9 mois)
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
