function getTaxYear() {
  const raw = process.env.TAX_YEAR;
  const year = raw ? Number(raw) : new Date().getFullYear();
  return Number.isFinite(year) ? year : new Date().getFullYear();
}

function parseJsonEnv(name) {
  const raw = process.env[name];
  if (!raw || !String(raw).trim()) return null;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

/**
 * Very small, configurable bracket table.
 * Each bracket: { upTo: number|null, rate: number } where upTo is annual taxable income ceiling.
 *
 * You can override at runtime with FEDERAL_BRACKETS_JSON like:
 * {
 *   "2026": {
 *     "single": [{"upTo": 10000, "rate": 0.1}, {"upTo": null, "rate": 0.2}],
 *     "married": [{"upTo": 20000, "rate": 0.1}, {"upTo": null, "rate": 0.2}]
 *   }
 * }
 */
const DEFAULT_FEDERAL_BRACKETS_BY_YEAR = {
  // Placeholder progressive schedule; project can update via env without code changes.
  2026: {
    single: [
      { upTo: 11600, rate: 0.1 },
      { upTo: 47150, rate: 0.12 },
      { upTo: 100525, rate: 0.22 },
      { upTo: 191950, rate: 0.24 },
      { upTo: 243725, rate: 0.32 },
      { upTo: 609350, rate: 0.35 },
      { upTo: null, rate: 0.37 },
    ],
    married: [
      { upTo: 23200, rate: 0.1 },
      { upTo: 94300, rate: 0.12 },
      { upTo: 201050, rate: 0.22 },
      { upTo: 383900, rate: 0.24 },
      { upTo: 487450, rate: 0.32 },
      { upTo: 731200, rate: 0.35 },
      { upTo: null, rate: 0.37 },
    ],
  },
};

function getFederalBrackets({ year, filingStatus }) {
  const env = parseJsonEnv("FEDERAL_BRACKETS_JSON");
  const table = env || DEFAULT_FEDERAL_BRACKETS_BY_YEAR;
  const byYear = table?.[String(year)] || table?.[year] || table?.[String(getTaxYear())];
  const byStatus = byYear?.[filingStatus];
  return Array.isArray(byStatus) && byStatus.length ? byStatus : DEFAULT_FEDERAL_BRACKETS_BY_YEAR[2026][filingStatus];
}

function getFicaConfig({ year }) {
  const ssRate = Number(process.env.FICA_SOCIAL_SECURITY_RATE ?? 0.062);
  const medicareRate = Number(process.env.FICA_MEDICARE_RATE ?? 0.0145);
  const ssWageBase = Number(process.env.FICA_SOCIAL_SECURITY_WAGE_BASE ?? 0);

  // If not provided, use a conservative default (can be overridden by env).
  const defaultWageBaseByYear = {
    2026: 180000,
  };

  const resolvedWageBase =
    Number.isFinite(ssWageBase) && ssWageBase > 0
      ? ssWageBase
      : defaultWageBaseByYear[year] ?? defaultWageBaseByYear[2026];

  return {
    socialSecurity: {
      rate: Number.isFinite(ssRate) ? ssRate : 0.062,
      wageBase: resolvedWageBase,
    },
    medicare: {
      rate: Number.isFinite(medicareRate) ? medicareRate : 0.0145,
    },
  };
}

module.exports = {
  getTaxYear,
  getFederalBrackets,
  getFicaConfig,
};
