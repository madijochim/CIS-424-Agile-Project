const { getTaxYear } = require("../config/taxConfig");
const { calculateHourlyPay, calculateSalaryPay } = require("./payrollService");
const { calculateFederalWithholding } = require("./taxService");
const { calculateFica } = require("./ficaService");

function periodsPerYearForEmployee(employee) {
  if (employee.payType === "salary") {
    if (employee.payFrequency === "weekly") return 52;
    if (employee.payFrequency === "biweekly") return 26;
    return null;
  }
  const fromEnv = Number(process.env.DEFAULT_HOURLY_PAY_PERIODS_PER_YEAR);
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
  return 26;
}

function attachTaxToPayroll(employee, grossPay, payrollBase) {
  const taxYear = getTaxYear();
  const periods = periodsPerYearForEmployee(employee);

  if (!periods) {
    return {
      ...payrollBase,
      tax: {
        taxYear,
        error: "Pay frequency is required to calculate federal withholding for salary employees.",
      },
    };
  }

  const filingStatus = employee.federalFilingStatus === "married" ? "married" : "single";
  const federal = calculateFederalWithholding({
    grossPay,
    periodsPerYear: periods,
    filingStatus,
    taxYear,
    additionalWithholding: employee.federalAdditionalWithholding ?? 0,
  });

  const fica = calculateFica({
    grossPay,
    taxYear,
    ytdSocialSecurityWages: employee.ytdSocialSecurityWages ?? 0,
    ytdMedicareWages: employee.ytdMedicareWages ?? 0,
  });

  const totalDeductions = federal.federalWithholding + fica.socialSecurity + fica.medicare;
  const netPay = Math.max(0, grossPay - totalDeductions);

  return {
    ...payrollBase,
    tax: {
      taxYear,
      filingStatus,
      periodsPerYear: periods,
      federalWithholding: federal.federalWithholding,
      federalAnnualizedGross: federal.annualizedGross,
      federalAnnualTax: federal.annualFederalTax,
      federalAdditionalWithholding: federal.additionalWithholding,
      socialSecurity: fica.socialSecurity,
      medicare: fica.medicare,
      ficaTotal: fica.ficaTotal,
      socialSecurityTaxableThisPeriod: fica.ssTaxableThisPeriod,
      socialSecurityWageBase: fica.ssWageBase,
      totalDeductions,
      netPay,
    },
  };
}

/**
 * @param {object} employee - lean employee document (possibly merged with preview overrides)
 * @returns {{ payroll: object } & object}
 */
function assembleEmployeePayroll(employee) {
  const taxYear = getTaxYear();

  try {
    if (employee.payType === "hourly") {
      const result = calculateHourlyPay(
        employee.hoursWorked,
        employee.rate,
        employee.bonusPay ?? 0
      );

      const payrollBase = {
        payType: "hourly",
        hoursWorked: result.hoursWorked,
        overtimeHours: result.overtimeHours,
        hourlyRate: result.hourlyRate,
        grossPay: result.grossPay,
        normalPay: result.normalPay,
        overtimePay: result.overtimePay,
        bonusPay: result.bonusPay,
      };

      const payroll = attachTaxToPayroll(employee, result.grossPay, payrollBase);

      return {
        ...employee,
        payroll,
      };
    }

    if (employee.payType === "salary") {
      const result = calculateSalaryPay(
        employee.salary,
        employee.payFrequency,
        employee.bonusPay ?? 0
      );

      const payrollBase = {
        payType: "salary",
        annualSalary: result.annualSalary,
        payFrequency: result.payFrequency,
        periods: result.periods,
        grossPay: result.grossPay,
        bonusPay: result.bonusPay,
      };

      const payroll = attachTaxToPayroll(employee, result.grossPay, payrollBase);

      return {
        ...employee,
        payroll,
      };
    }

    return {
      ...employee,
      payroll: {
        error: "Unknown pay type.",
        taxYear,
      },
    };
  } catch (err) {
    return {
      ...employee,
      payroll: {
        error: err.message,
        taxYear,
      },
    };
  }
}

module.exports = {
  assembleEmployeePayroll,
  periodsPerYearForEmployee,
};
