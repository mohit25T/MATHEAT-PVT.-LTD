import React, { useState } from 'react';
import { Plus, Check, X, Database } from 'lucide-react';
import { useDropdowns } from '../context/DropdownContext';

export default function CreatableSelect({
  dropdownKey,
  label,
  value = '',
  onChange,
  options = [],
  placeholder = '-- Select --',
  addPlaceholder = 'Type new option to save in database...',
  name,
  required = false,
  className = '',
  disabled = false,
  isLight = false,
  allowAdd = true,
  helperText,
}) {
  const { getOptions, addOption } = useDropdowns();
  const [customList, setCustomList] = useState([]);
  const [showAddBox, setShowAddBox] = useState(false);
  const [newOptionInput, setNewOptionInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch options from central database if dropdownKey is provided
  const dbOptions = dropdownKey ? getOptions(dropdownKey) : [];

  // 2. Combine and normalize database options with props options
  const rawList = [...dbOptions, ...options];

  const normalizedOptions = [];
  const seenValues = new Set();

  rawList.forEach((opt) => {
    let val = '';
    let lbl = '';
    if (typeof opt === 'object' && opt !== null) {
      val = String(opt.value !== undefined ? opt.value : opt.name || opt.companyName || opt._id || '');
      lbl = String(opt.label || opt.name || opt.companyName || opt.value || '');
    } else {
      val = String(opt);
      lbl = String(opt);
    }
    const cleanVal = val.trim();
    if (cleanVal && !seenValues.has(cleanVal.toLowerCase())) {
      seenValues.add(cleanVal.toLowerCase());
      normalizedOptions.push({ value: cleanVal, label: lbl.trim() || cleanVal });
    }
  });

  // Combine with custom user-added items in current session
  customList.forEach((c) => {
    const cleanC = String(c).trim();
    if (cleanC && !seenValues.has(cleanC.toLowerCase())) {
      seenValues.add(cleanC.toLowerCase());
      normalizedOptions.push({ value: cleanC, label: cleanC });
    }
  });

  // If current value is set but not in list, make sure it appears in options
  if (value && !seenValues.has(String(value).trim().toLowerCase()) && value !== '__ADD_NEW__') {
    normalizedOptions.push({ value: String(value), label: String(value) });
  }

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === '__ADD_NEW__') {
      setShowAddBox(true);
    } else {
      onChange(val);
    }
  };

  const handleAddNew = async (e) => {
    if (e) e.preventDefault();
    const trimmed = newOptionInput.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a valid value');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      // If dropdownKey is provided, permanently save to MongoDB database
      if (dropdownKey) {
        await addOption(dropdownKey, { value: trimmed, label: trimmed });
      }

      if (!customList.includes(trimmed)) {
        setCustomList((prev) => [...prev, trimmed]);
      }

      onChange(trimmed);
      setNewOptionInput('');
      setShowAddBox(false);
    } catch (err) {
      console.error('Failed to save dropdown option to database:', err);
      setErrorMsg('Failed to save to database: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-slate-700 dark:text-slate-300 font-semibold block text-xs">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {allowAdd && !showAddBox && (
            <button
              type="button"
              onClick={() => setShowAddBox(true)}
              className="text-[10px] font-bold text-orange-600 hover:text-orange-500 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Option
            </button>
          )}
        </div>
      )}

      {/* Select Dropdown */}
      <select
        name={name}
        value={value || ''}
        onChange={handleSelectChange}
        disabled={disabled}
        required={required}
        className={
          className ||
          `w-full rounded-lg p-2 text-xs font-semibold border transition-colors ${
            isLight
              ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-orange-500'
              : 'bg-slate-950 border-slate-700 text-white focus:border-orange-500'
          }`
        }
      >
        <option value="">{placeholder}</option>
        {normalizedOptions.map((opt, i) => (
          <option key={`${opt.value}-${i}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {allowAdd && (
          <option value="__ADD_NEW__">+ Add Custom / Type New...</option>
        )}
      </select>

      {/* Box where user can add a custom option for dropdown (persisted to DB) */}
      {showAddBox && (
        <div className="p-2 rounded-lg border border-orange-400/60 bg-orange-50/70 dark:bg-orange-950/30 space-y-1.5 transition-all">
          <div className="text-[10px] font-bold text-orange-700 dark:text-orange-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3" /> Add new option (stores in Database):
            </span>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                setShowAddBox(false);
                setErrorMsg('');
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              disabled={isSaving}
              value={newOptionInput}
              onChange={(e) => {
                setNewOptionInput(e.target.value);
                setErrorMsg('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNew();
                }
              }}
              placeholder={addPlaceholder}
              autoFocus
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
            />
            <button
              type="button"
              disabled={isSaving}
              onClick={handleAddNew}
              className="px-3 py-1 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-md text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Check className="w-3 h-3" /> {isSaving ? 'Saving...' : 'Add'}
            </button>
          </div>
          {errorMsg && <p className="text-[10px] text-red-500">{errorMsg}</p>}
        </div>
      )}

      {helperText && <p className="text-[10px] text-slate-400">{helperText}</p>}
    </div>
  );
}
