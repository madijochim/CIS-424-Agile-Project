const { getFederalBrackets } = require("../config/taxConfig");

function roundMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100) / 100;
}

function calculateProgressiveTax(annualTaxableIncome, brackets) {
  let tax = 0;
  let remaining = Math.max(0, Number(annualTaxableIncome) || 0);
  let lower = 0;

  for (const bracket of brackets) {
    const ceiling = bracket.upTo == null ? null : Number(bracket.upTo);
    const rate = Number(bracket.rate);
    if (!Number.isFinite(rate) || rate < 0) continue;

    const bandSize = ceiling == null ? remaining : Math.max(0, Math.min(remaining, ceiling - lower));
    if (bandSize <= 0) {
      if (ceiling != null) lower = ceiling;
      continue;
    }

    tax += bandSize * rate;
    remaining -= bandSize;
    if (ceiling != null) lower = ceiling;
    if (remaining <= 0) break;
  }

  return tax;
}

/**
 * Simplified federal withholding:
 * - annualizes the per-period gross pay
 * - applies a progressive bracket schedule (configurable via env)
 * - converts back to per-period withholding
 */
function calculateFederalWithholding({
  grossPay,
  periodsPerYear,
  filingStatus = "single",
  taxYear,
  additionalWithholding = 0,
}) {
  const gross = Number(grossPay);
  const periods = Number(periodsPerYear);

  if (!Number.isFinite(gross) || gross < 0) {
    throw new Error("Gross pay must be a non-negative number.");
  }
  if (!Number.isFinite(periods) || periods <= 0) {
    throw new Error("Periods per year must be a positive number.");
  }

  const year = Number(taxYear);
  const brackets = getFederalBrackets({ year, filingStatus });

  const annualized = gross * periods;
  const annualTax = calculateProgressiveTax(annualized, brackets);
  const perPeriod = annualTax / periods;

  const extra = Math.max(0, Number(additionalWithholding) || 0);
  return {
    annualizedGross: roundMoney(annualized),
    annualFederalTax: roundMoney(annualTax),
    federalWithholding: roundMoney(perPeriod + extra),
    additionalWithholding: roundMoney(extra),
  };
}

module.exports = {
  calculateFederalWithholding,
};

