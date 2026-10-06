import { QCInstrument } from '../models/QCInstrument.js';

export const getInstruments = async (req, res, next) => {
  try {
    let list = await QCInstrument.find().sort({ calibrationDueDate: 1 });
    
    // Seed default certified NABL instruments if empty
    if (list.length === 0) {
      const now = new Date();
      const inSixMonths = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
      const defaults = [
        {
          instrumentId: 'INST-RC-01',
          instrumentName: 'Rockwell Hardness Tester (HRC/HRB)',
          type: 'HARDNESS_TESTER',
          manufacturer: 'Mitutoyo Corp.',
          model: 'HR-530',
          serialNumber: 'MT-RC-88912',
          calibrationDate: now,
          calibrationDueDate: inSixMonths,
          calibrationCertificateNumber: 'NABL-CAL-2026-4412',
          status: 'ACTIVE'
        },
        {
          instrumentId: 'INST-MV-02',
          instrumentName: 'Micro-Vickers Hardness Tester (HV 0.1 - HV 1.0)',
          type: 'HARDNESS_TESTER',
          manufacturer: 'Shimadzu Corp.',
          model: 'HMV-G31ST',
          serialNumber: 'SH-MV-33019',
          calibrationDate: now,
          calibrationDueDate: inSixMonths,
          calibrationCertificateNumber: 'NABL-CAL-2026-4413',
          status: 'ACTIVE'
        },
        {
          instrumentId: 'INST-TC-03',
          instrumentName: 'Type-K Furnace Master Thermocouple Logger',
          type: 'TEMPERATURE_SENSOR',
          manufacturer: 'Chino / Eurotherm',
          model: '6100A',
          serialNumber: 'CH-TC-90411',
          calibrationDate: now,
          calibrationDueDate: inSixMonths,
          calibrationCertificateNumber: 'NABL-CAL-2026-5120',
          status: 'ACTIVE'
        },
        {
          instrumentId: 'INST-WB-04',
          instrumentName: 'Gate Dual-Loadcell Weighbridge (50 Ton)',
          type: 'WEIGHING_SCALE',
          manufacturer: 'Mettler Toledo',
          model: 'IND-50T RS232',
          serialNumber: 'MT-IND-77123',
          calibrationDate: now,
          calibrationDueDate: inSixMonths,
          calibrationCertificateNumber: 'NABL-CAL-2026-8802',
          status: 'ACTIVE'
        }
      ];
      list = await QCInstrument.insertMany(defaults);
    }

    // Refresh dynamic status based on current date
    const now = new Date();
    const updatedList = list.map((inst) => {
      const due = new Date(inst.calibrationDueDate);
      const daysUntilDue = (due - now) / (1000 * 60 * 60 * 24);
      let status = inst.status;
      if (status !== 'OUT_OF_SERVICE') {
        if (daysUntilDue < 0) status = 'CALIBRATION_OVERDUE';
        else if (daysUntilDue <= 30) status = 'CALIBRATION_DUE';
        else status = 'ACTIVE';
      }
      return { ...inst.toObject(), dynamicStatus: status, daysUntilDue: Math.round(daysUntilDue) };
    });

    res.json({ success: true, count: updatedList.length, instruments: updatedList, data: updatedList });
  } catch (err) { next(err); }
};

export const createInstrument = async (req, res, next) => {
  try {
    const inst = await QCInstrument.create(req.body);
    res.status(201).json({ success: true, instrument: inst });
  } catch (err) { next(err); }
};

export const updateInstrument = async (req, res, next) => {
  try {
    const inst = await QCInstrument.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!inst) return res.status(404).json({ success: false, message: 'Instrument not found' });
    res.json({ success: true, instrument: inst });
  } catch (err) { next(err); }
};

export const deleteInstrument = async (req, res, next) => {
  try {
    await QCInstrument.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Instrument deleted' });
  } catch (err) { next(err); }
};
