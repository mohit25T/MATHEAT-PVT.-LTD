import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  { _id: false, timestamps: true }
);

const DropdownSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    label: {
      type: String,
      trim: true
    },
    options: [OptionSchema]
  },
  { timestamps: true }
);

export const Dropdown = mongoose.model('Dropdown', DropdownSchema);
export default Dropdown;
