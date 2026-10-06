/**
 * GSTIN Validation Utility for MATHEAT Indian ERP
 * Matches logic from ERP-main: Implements 15-character Regex, State Code mapping, and Mod 36 Checksum logic.
 */

const charMap = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const STATE_CODE_MAPPING = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "25": "Daman and Diu",
  "26": "Dadra and Nagar Haveli",
  "27": "Maharashtra",
  "28": "Andhra Pradesh",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman and Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh (New)",
  "38": "Ladakh"
};

export const getStateCodeByGstin = (gstin) => {
  if (!gstin || gstin.length < 2) return "";
  return gstin.slice(0, 2);
};

export const getStateByGstin = (gstin) => {
  if (!gstin || gstin.length < 2) return "";
  const code = gstin.slice(0, 2);
  return STATE_CODE_MAPPING[code] || "";
};

export const getPanByGstin = (gstin) => {
  if (!gstin || gstin.length < 12) return "";
  return gstin.slice(2, 12).toUpperCase();
};

export const getEntityTypeFromPan = (pan) => {
  if (!pan || pan.length < 4) return "Business Entity";
  const typeChar = pan[3].toUpperCase();
  const types = {
    C: "Company / Pvt Ltd",
    P: "Proprietorship / Individual",
    F: "Partnership Firm / LLP",
    H: "HUF",
    A: "Association of Persons",
    T: "Trust",
    G: "Government Body",
    J: "Artificial Juridical Person",
    L: "Local Authority"
  };
  return types[typeChar] || "Commercial Entity";
};

export const validateGSTIN = (gstin) => {
  if (!gstin) return { isValid: false, message: "GSTIN is required" };
  
  const cleanGSTIN = gstin.trim().toUpperCase();
  
  // 1. Length check
  if (cleanGSTIN.length !== 15) {
    return { 
      isValid: false, 
      message: `GSTIN must be exactly 15 characters (currently ${cleanGSTIN.length})` 
    };
  }

  // 2. Regex Format Check (00AAAAA0000A1Z1)
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstRegex.test(cleanGSTIN)) {
    return { 
      isValid: false, 
      message: "Invalid GSTIN Format (Expected: 2 Digits State + 10 Alphanumeric PAN + 1 Entity + Z + 1 Check)" 
    };
  }

  // 3. State Code Validation
  const stateCode = cleanGSTIN.slice(0, 2);
  if (!STATE_CODE_MAPPING[stateCode]) {
    return { 
      isValid: false, 
      message: `Unrecognized State Code '${stateCode}'. Valid Indian State codes are 01-38.` 
    };
  }

  // 4. Mod 36 Checksum Verification
  try {
    const inputChars = cleanGSTIN.split("");
    let totalSum = 0;

    for (let i = 0; i < 14; i++) {
      let charVal = charMap.indexOf(inputChars[i]);
      let multiplier = (i % 2 === 0) ? 1 : 2;
      let product = charVal * multiplier;
      
      // Sum digits in base 36
      product = Math.floor(product / 36) + (product % 36);
      totalSum += product;
    }

    const checkDigitVal = (36 - (totalSum % 36)) % 36;
    const expectedCheckDigit = charMap[checkDigitVal];
    const actualCheckDigit = inputChars[14];

    if (expectedCheckDigit !== actualCheckDigit) {
      return { 
        isValid: false, 
        message: `Mathematical Checksum Mismatch (Expected '${expectedCheckDigit}', got '${actualCheckDigit}'). Please check for typos.`,
        isChecksumError: true,
        state: STATE_CODE_MAPPING[stateCode]
      };
    }

    return { 
      isValid: true, 
      message: "Structurally & Mathematically Valid GSTIN",
      state: STATE_CODE_MAPPING[stateCode],
      pan: cleanGSTIN.slice(2, 12)
    };
  } catch (err) {
    return { isValid: false, message: "Verification failed. Check input." };
  }
};
