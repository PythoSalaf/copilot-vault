export const fmtUSD = (n: number, digits = 0) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

export const fmtNum = (n: number, digits = 1) =>
  n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmtPct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;
