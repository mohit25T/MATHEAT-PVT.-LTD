import { Customer } from '../models/Customer.js';

// Helper to auto-generate unique customer code if none provided
export const generateCustomerCode = async (companyName) => {
  const prefix = companyName
    ? companyName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase()
    : 'CUST';
  const count = await Customer.countDocuments();
  return `CUST-${prefix}-${String(count + 1).padStart(3, '0')}`;
};

// 1. GET ALL CUSTOMERS
export const getAll = async (req, res, next) => {
  try {
    const { search, type } = req.query;
    const filter = {};

    if (type && type !== 'all') {
      filter.customerType = type;
    }

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { companyName: regex },
        { tradeName: regex },
        { customerCode: regex },
        { gstin: regex },
        { pan: regex },
        { name: regex },
        { state: regex },
        { stateCode: regex },
        { city: regex },
        { phone: regex },
        { email: regex }
      ];
    }

    // Exclude legacy mock seed customers
    filter.customerCode = { $nin: ['CUST-SKF', 'CUST-TATA'] };
    filter.companyName = { $not: /skf|tata motors/i };

    const customers = await Customer.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (err) {
    next(err);
  }
};

// 2. GET SINGLE CUSTOMER BY ID
export const getById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

// 3. CREATE NEW CUSTOMER
export const create = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      companyName,
      tradeName,
      gstin,
      pan,
      state,
      stateCode,
      city,
      address,
      pincode,
      entityType,
      gstStatus,
      taxpayerType,
      type,
      customerType,
      addresses,
      paymentTerms,
      creditLimit,
      customerCode,
      notes
    } = req.body;

    const finalCompanyName = (company || companyName || '').trim();
    if (!finalCompanyName) {
      return res.status(400).json({ success: false, message: 'Company / Business name is required' });
    }

    const cleanGstin = gstin ? gstin.replace(/\s+/g, '').toUpperCase() : '';
    const cleanPan = pan || (cleanGstin && cleanGstin.length >= 12 ? cleanGstin.slice(2, 12) : '');
    const cleanStateCode = stateCode || (cleanGstin && cleanGstin.length >= 2 ? cleanGstin.slice(0, 2) : '');

    let finalCode = customerCode ? customerCode.trim().toUpperCase() : '';
    if (!finalCode) {
      finalCode = await generateCustomerCode(finalCompanyName);
    }

    const existing = await Customer.findOne({ customerCode: finalCode });
    if (existing) {
      finalCode = `${finalCode}-${Date.now().toString().slice(-4)}`;
    }

    const newCustomer = new Customer({
      customerCode: finalCode,
      companyName: finalCompanyName,
      tradeName: tradeName || '',
      name: name || '',
      email: email || '',
      phone: phone || '',
      gstin: cleanGstin,
      pan: cleanPan,
      state: state || '',
      stateCode: cleanStateCode,
      city: city || '',
      address: address || '',
      pincode: pincode || '',
      entityType: entityType || '',
      gstStatus: gstStatus || 'Active',
      taxpayerType: taxpayerType || 'Regular',
      billingAddress: {
        street: address || '',
        city: city || '',
        state: state || '',
        pincode: pincode || '',
        country: 'India'
      },
      customerType: type || customerType || 'regular',
      addresses: addresses || [],
      paymentTerms: paymentTerms || '30 Days Net',
      creditLimit: parseFloat(creditLimit) || 500000,
      notes: notes || '',
      isActive: true
    });

    await newCustomer.save();
    console.log(`[CUSTOMER CREATED] #${newCustomer.customerCode} - ${newCustomer.companyName} (GST: ${newCustomer.gstin || 'N/A'}, State: ${cleanStateCode})`);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: newCustomer
    });
  } catch (err) {
    next(err);
  }
};

// 4. UPDATE EXISTING CUSTOMER
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    if (body.company && !body.companyName) {
      body.companyName = body.company;
    }
    if (body.gstin) {
      body.gstin = body.gstin.replace(/\s+/g, '').toUpperCase();
      if (!body.pan && body.gstin.length >= 12) {
        body.pan = body.gstin.slice(2, 12);
      }
      if (!body.stateCode && body.gstin.length >= 2) {
        body.stateCode = body.gstin.slice(0, 2);
      }
    }
    if (body.type && !body.customerType) {
      body.customerType = body.type;
    }
    if (body.address || body.city || body.state || body.pincode) {
      body.billingAddress = {
        street: body.address || '',
        city: body.city || '',
        state: body.state || '',
        pincode: body.pincode || '',
        country: 'India'
      };
    }

    const updated = await Customer.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    console.log(`[CUSTOMER UPDATED] #${updated.customerCode} - ${updated.companyName}`);
    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// 5. DELETE CUSTOMER
export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Customer.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    console.log(`[CUSTOMER DELETED] #${deleted.customerCode} - ${deleted.companyName}`);
    res.json({
      success: true,
      message: 'Customer deleted successfully',
      data: deleted
    });
  } catch (err) {
    next(err);
  }
};
