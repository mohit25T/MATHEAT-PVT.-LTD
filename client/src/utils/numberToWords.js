// Indian Number to Words converter for Rupees & Paise
export const numberToWords = (num) => {
  if (num === null || num === undefined || isNaN(num)) return 'Zero Rupees Only';
  const n = Math.round(Number(num));
  if (n === 0) return 'Zero Rupees Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teenDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tensDigits = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertTwoDigit = (val) => {
    if (val === 0) return '';
    if (val < 10) return singleDigits[val];
    if (val >= 10 && val < 20) return teenDigits[val - 10];
    const tens = Math.floor(val / 10);
    const unit = val % 10;
    return `${tensDigits[tens]}${unit ? ' ' + singleDigits[unit] : ''}`;
  };

  const convertThreeDigit = (val) => {
    let str = '';
    const hundred = Math.floor(val / 100);
    const rest = val % 100;
    if (hundred > 0) {
      str += `${singleDigits[hundred]} Hundred`;
      if (rest > 0) str += ' and ';
    }
    if (rest > 0) {
      str += convertTwoDigit(rest);
    }
    return str;
  };

  let crore = Math.floor(n / 10000000);
  let remainder = n % 10000000;

  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  let thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  let parts = [];
  if (crore > 0) parts.push(`${convertThreeDigit(crore)} Crore`);
  if (lakh > 0) parts.push(`${convertTwoDigit(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${convertTwoDigit(thousand)} Thousand`);
  if (remainder > 0) parts.push(convertThreeDigit(remainder));

  const result = parts.join(' ').trim();
  return result ? `Rupees ${result} Only` : 'Zero Rupees Only';
};

export default numberToWords;
