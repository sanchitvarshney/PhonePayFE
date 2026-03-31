/** Whole rupees only, Indian numbering (Lakh/Crore), uppercased for challan-style copy. */
const BELOW_20 = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return BELOW_20[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return TENS[t] + (o ? " " + BELOW_20[o] : "");
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h) parts.push(BELOW_20[h] + " Hundred");
  if (rest) parts.push(twoDigits(rest));
  return parts.join(" ").trim();
}

export function inrRupeesInWordsUpper(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return "";
  const n = Math.floor(amount + 1e-9);
  if (n === 0) return "ZERO RUPEES ONLY";

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rem = n % 1000;

  const parts: string[] = [];
  if (crore) parts.push(threeDigits(crore) + " Crore");
  if (lakh) parts.push(threeDigits(lakh) + " Lakh");
  if (thousand) parts.push(threeDigits(thousand) + " Thousand");
  if (rem) parts.push(threeDigits(rem));

  return ("RS. " + parts.join(" ") + " RUPEES ONLY")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}
