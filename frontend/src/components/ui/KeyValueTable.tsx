'use client'
import React from 'react';
import { Trash2 } from 'lucide-react';
import { KeyValue } from '@/lib/types';

interface KeyValueTableProps {
  items: KeyValue[];
  onChange: (items: KeyValue[]) => void;
  placeholderKey?: string;
  placeholderValue?: string;
}

export default function KeyValueTable({ 
  items, 
  onChange,
  placeholderKey = "Key",
  placeholderValue = "Value"
}: KeyValueTableProps) {
  
  const handleUpdate = (index: number, field: keyof KeyValue, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Add empty row if last row was just edited
    if (index === newItems.length - 1 && (field === 'key' || field === 'value') && value !== '') {
      newItems.push({ id: crypto.randomUUID(), key: '', value: '', enabled: true });
    }
    
    onChange(newItems);
  };

  const handleRemove = (index: number) => {
    if (items.length === 1) {
      onChange([{ id: crypto.randomUUID(), key: '', value: '', enabled: true }]);
    } else {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  // Ensure there's always at least one empty row
  if (items.length === 0 || items[items.length - 1].key !== '') {
    // This is better handled in state initialization, but safe fallback
    setTimeout(() => {
      onChange([...items, { id: crypto.randomUUID(), key: '', value: '', enabled: true }]);
    }, 0);
  }

  return (
    <div className="p-4">
      <table className="data-table w-full">
        <thead>
          <tr>
            <th className="w-10 text-center"></th>
            <th>{placeholderKey}</th>
            <th>{placeholderValue}</th>
            <th className="w-10 text-center"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id}>
              <td className="text-center">
                {item.key && (
                  <input 
                    type="checkbox" 
                    checked={item.enabled} 
                    onChange={(e) => handleUpdate(i, 'enabled', e.target.checked)} 
                    className="accent-[#FF6C37]"
                  />
                )}
              </td>
              <td>
                <input 
                  type="text" 
                  value={item.key} 
                  onChange={(e) => handleUpdate(i, 'key', e.target.value)} 
                  placeholder={placeholderKey}
                  className="font-mono text-sm placeholder:font-sans placeholder:text-gray-600"
                />
              </td>
              <td>
                <input 
                  type="text" 
                  value={item.value} 
                  onChange={(e) => handleUpdate(i, 'value', e.target.value)} 
                  placeholder={placeholderValue}
                  className="font-mono text-sm placeholder:font-sans placeholder:text-gray-600"
                />
              </td>
              <td className="text-center group">
                {i < items.length - 1 && (
                  <button 
                    onClick={() => handleRemove(i)}
                    className="text-gray-600 hover:text-red-500 hidden group-hover:block mx-auto"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
