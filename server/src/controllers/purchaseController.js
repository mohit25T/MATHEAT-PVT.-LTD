import { PurchaseOrder } from '../models/PurchaseOrder.js';

export const getPurchaseOrders = async (req, res, next) => {
  try {
    const orders = await PurchaseOrder.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders, data: orders });
  } catch (error) {
    next(error);
  }
};

export const createPurchaseOrder = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.create(req.body);
    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const updatePurchaseOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const deletePurchaseOrder = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    res.json({ success: true, message: 'Purchase Order deleted' });
  } catch (error) {
    next(error);
  }
};
