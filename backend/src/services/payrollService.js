function calculateHourlyPay(hoursWorked, hourlyRate) {
  if (hoursWorked == null || hourlyRate == null) {
    throw new Error("Hours worked and hourly rate are required.");
  }

  
  const hours = Number(hoursWorked);
  const rate = Number(hourlyRate);
  const otHours = hours > 40 ? hours - 40 : 0

  if (Number.isNaN(hours) || Number.isNaN(rate)) {
    throw new Error("Hours and rate must be numbers.");
  }

  if (hours < 0 || rate < 0) {
    throw new Error("Hours and rate cannot be negative.");
  }

  return {
    grossPay: ((hours-otHours) * rate) + (otHours * rate * 1.5),
    normalPay: (hours-otHours) * rate,
    overtimePay: otHours * rate * 1.5,
    hoursWorked: hours,
    overtimeHours: otHours,
    hourlyRate: rate,
  };
}

function calculateSalaryPay(salary, payFrequency) {
  if (salary == null || !payFrequency) {
    throw new Error("Salary and pay frequency are required.");
  }

  const annualSalary = Number(salary);

  if (Number.isNaN(annualSalary)) {
    throw new Error("Salary must be a number.");
  }

  if (annualSalary < 0) {
    throw new Error("Salary cannot be negative.");
  }

  let periods;

  if (payFrequency === "weekly") {
    periods = 52;
  } else if (payFrequency === "biweekly") {
    periods = 26;
  } else {
    throw new Error("Pay frequency must be weekly or biweekly.");
  }

  return {
    grossPay: annualSalary / periods,
    annualSalary,
    payFrequency,
    periods,
  };
}

module.exports = {
  calculateHourlyPay,
  calculateSalaryPay,
};
