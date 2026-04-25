const { getFicaConfig } = require("../config/taxConfig");

function roundMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100) / 100;
}

function calculateFica({
  grossPay,
  taxYear,
  ytdSocialSecurityWages = 0,
  ytdMedicareWages = 0,
}) {
  const gross = Number(grossPay);
  if (!Number.isFinite(gross) || gross < 0) {
    throw new Error("Gross pay must be a non-negative number.");
  }

  const year = Number(taxYear);
  const config = getFicaConfig({ year });

  const ssRate = Number(config.socialSecurity.rate);
  const ssWageBase = Number(config.socialSecurity.wageBase);
  const medicareRate = Number(config.medicare.rate);

  const ytdSS = Math.max(0, Number(ytdSocialSecurityWages) || 0);
  const ytdMed = Math.max(0, Number(ytdMedicareWages) || 0);

  const remainingSsWageBase = Math.max(0, ssWageBase - ytdSS);
  const ssTaxableThisPeriod = Math.min(gross, remainingSsWageBase);

  const socialSecurity = ssTaxableThisPeriod * ssRate;
  const medicare = gross * medicareRate;

  return {
    socialSecurity: roundMoney(socialSecurity),
    medicare: roundMoney(medicare),
    ficaTotal: roundMoney(socialSecurity + medicare),
    ssWageBase: roundMoney(ssWageBase),
    ssTaxableThisPeriod: roundMoney(ssTaxableThisPeriod),
    ytdSocialSecurityWages: roundMoney(ytdSS),
    ytdMedicareWages: roundMoney(ytdMed),
  };
}

module.exports = {
  calculateFica,
};

