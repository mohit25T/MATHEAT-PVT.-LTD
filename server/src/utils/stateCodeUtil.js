/**
 * Indian State Codes for GST (Reference: NIC / GSTN)
 */
export const STATE_CODE_MAPPING = {
  "01": "JAMMU AND KASHMIR",
  "02": "HIMACHAL PRADESH",
  "03": "PUNJAB",
  "04": "CHANDIGARH",
  "05": "UTTARAKHAND",
  "06": "HARYANA",
  "07": "DELHI",
  "08": "RAJASTHAN",
  "09": "UTTAR PRADESH",
  "10": "BIHAR",
  "11": "SIKKIM",
  "12": "ARUNACHAL PRADESH",
  "13": "NAGALAND",
  "14": "MANIPUR",
  "15": "MIZORAM",
  "16": "TRIPURA",
  "17": "MEGHALAYA",
  "18": "ASSAM",
  "19": "WEST BENGAL",
  "20": "JHARKHAND",
  "21": "ODISHA",
  "22": "CHHATTISGARH",
  "23": "MADHYA PRADESH",
  "24": "GUJARAT",
  "25": "DAMAN AND DIU",
  "26": "DADRA AND NAGAR HAVELI",
  "27": "MAHARASHTRA",
  "28": "ANDHRA PRADESH",
  "29": "KARNATAKA",
  "30": "GOA",
  "31": "LAKSHADWEEP",
  "32": "KERALA",
  "33": "TAMIL NADU",
  "34": "PUDUCHERRY",
  "35": "ANDAMAN AND NICOBAR ISLANDS",
  "36": "TELANGANA",
  "37": "ANDHRA PRADESH (NEW)",
  "38": "LADAKH"
};

export const getStateNameByCode = (code) => {
  if (!code) return "GUJARAT";
  const cleanCode = String(code).padStart(2, "0");
  return STATE_CODE_MAPPING[cleanCode] || "GUJARAT";
};

export const getStateCodeByName = (stateName) => {
  if (!stateName) return "24";
  const upper = stateName.toUpperCase().trim();
  const entry = Object.entries(STATE_CODE_MAPPING).find(([_, name]) => name === upper);
  return entry ? entry[0] : "24";
};
