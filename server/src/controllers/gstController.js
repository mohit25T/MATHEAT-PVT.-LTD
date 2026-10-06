import { getStateNameByCode } from '../utils/stateCodeUtil.js';

export const getEntityTypeFromPan = (pan) => {
  if (!pan || pan.length < 4) return 'Business Entity';
  const typeChar = pan[3].toUpperCase();
  const types = {
    'C': 'Company / Pvt Ltd',
    'P': 'Proprietorship / Individual',
    'F': 'Partnership Firm / LLP',
    'H': 'HUF',
    'A': 'Association of Persons',
    'T': 'Trust',
    'G': 'Government Body',
    'J': 'Artificial Juridical Person',
    'L': 'Local Authority'
  };
  return types[typeChar] || 'Commercial Entity';
};

export const lookupGstin = async (req, res) => {
  const rawGstin = req.params.gstin || '';
  const gstin = rawGstin.replace(/\s+/g, '').toUpperCase();

  console.log('\n===============================================================');
  console.log('                 [GST API INCOMING REQUEST]                    ');
  console.log('===============================================================');
  console.log(`[TIMESTAMP] : ${new Date().toISOString()}`);
  console.log(`[METHOD]    : ${req.method} ${req.originalUrl}`);
  console.log(`[GSTIN]     : ${gstin}`);
  console.log(`[CLIENT IP] : ${req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'}`);
  console.log('---------------------------------------------------------------');

  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstRegex.test(gstin)) {
    const errorResponse = {
      success: false,
      message: 'Invalid GSTIN format. Expected 15 characters (e.g., 24AAACM1234F1Z5).'
    };

    console.log('===============================================================');
    console.log('                 [GST API ERROR RESPONSE (400)]                ');
    console.log('===============================================================');
    console.log(JSON.stringify(errorResponse, null, 2));
    console.log('===============================================================\n');

    return res.status(400).json(errorResponse);
  }

  const stateCode = gstin.slice(0, 2);
  const pan = gstin.slice(2, 12);
  const state = getStateNameByCode(stateCode);
  const entityType = getEntityTypeFromPan(pan);

  // Read available API keys (supports comma-separated GST_API_KEYS or single GST_API_KEY)
  const rawKeys = process.env.GST_API_KEYS || process.env.GST_API_KEY || '';
  const apiKeys = rawKeys
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  if (apiKeys.length > 0) {
    for (const apiKey of apiKeys) {
      try {
        const maskedKey = apiKey.length > 8 ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : apiKey;
        const externalUrl = `https://sheet.gstincheck.co.in/check/${apiKey}/${gstin}`;

        console.log(`\n>>> [EXTERNAL GST API CALL]:`);
        console.log(`    URL     : https://sheet.gstincheck.co.in/check/${maskedKey}/${gstin}`);
        console.log(`    API Key : ${maskedKey}`);

        const response = await fetch(externalUrl, {
          signal: AbortSignal.timeout(8000)
        });

        console.log(`<<< [EXTERNAL GST API STATUS]: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`<<< [EXTERNAL GST API ERROR BODY]:\n${errText}`);
          continue;
        }

        const result = await response.json();

        console.log('\n===============================================================');
        console.log('              [EXTERNAL GST API RAW RESPONSE BODY]             ');
        console.log('===============================================================');
        console.log(JSON.stringify(result, null, 2));
        console.log('===============================================================\n');

        if (result && result.flag && result.data) {
          const biz = result.data;
          const addr = biz.pradr?.addr || {};
          
          // Format complete operational hub address
          const combinedAddress = [
            addr.bno ? `No. ${addr.bno}` : '',
            addr.bnm,
            addr.flno ? `Flr ${addr.flno}` : '',
            addr.st,
            addr.loc,
            addr.dst,
            addr.city,
            addr.pncd ? `PIN: ${addr.pncd}` : ''
          ].filter(Boolean).join(', ') || [
            addr.bnm,
            addr.bno,
            addr.flno,
            addr.st,
            addr.loc,
            addr.dst,
            addr.city
          ].filter(Boolean).join(', ');

          const finalCity = addr.city || addr.dst || addr.loc || '';
          const finalState = state || (addr.stcd ? String(addr.stcd).toUpperCase() : '');
          const finalEntityType = biz.ctb || entityType;

          const clientResponse = {
            success: true,
            source: 'LIVE_GSTN_API',
            data: {
              gstin,
              companyName: biz.lgnm || biz.tradeNam || '',
              tradeName: biz.tradeNam || biz.lgnm || '',
              address: combinedAddress,
              city: finalCity,
              state: finalState,
              stateCode,
              pincode: addr.pncd || '',
              pan,
              entityType: finalEntityType,
              status: biz.sts || 'Active',
              taxpayerType: biz.dty || 'Regular',
              registrationDate: biz.rgdt || ''
            }
          };

          console.log('===============================================================');
          console.log('             [GST API CLIENT RESPONSE (200 OK)]                ');
          console.log('===============================================================');
          console.log(JSON.stringify(clientResponse, null, 2));
          console.log('===============================================================\n');

          return res.json(clientResponse);
        }
      } catch (err) {
        console.warn(`[GST LOOKUP] API query attempt failed: ${err.message}`);
      }
    }
  }

  // Fallback: Smart structure & registry decoder
  const fallbackResponse = {
    success: true,
    source: 'SMART_DECODER',
    data: {
      gstin,
      companyName: '',
      tradeName: '',
      address: '',
      city: '',
      state,
      stateCode,
      pincode: '',
      pan,
      entityType,
      status: 'Active',
      taxpayerType: 'Regular',
      registrationDate: ''
    }
  };

  console.log('===============================================================');
  console.log('           [GST API FALLBACK RESPONSE (SMART DECODER)]         ');
  console.log('===============================================================');
  console.log(JSON.stringify(fallbackResponse, null, 2));
  console.log('===============================================================\n');

  return res.json(fallbackResponse);
};
