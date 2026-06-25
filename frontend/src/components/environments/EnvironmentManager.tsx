'use client'
import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useEnvironmentStore } from '@/stores/useEnvironmentStore';
import { Environment, EnvironmentVariable } from '@/lib/types';

export default function EnvironmentManager({ onClose }: { onClose: () => void }) {
  const { environments, activeEnvironmentId, createEnvironment, updateEnvironment, deleteEnvironment, activateEnvironment } = useEnvironmentStore();
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(environments[0] || null);
  const [editName, setEditName] = useState('');
  const [editVars, setEditVars] = useState<EnvironmentVariable[]>([]);

  const handleSelectEnv = (env: Environment) => {
    setSelectedEnv(env);
    setEditName(env.name);
    setEditVars([...env.variables]);
  };

  const handleCreateNew = () => {
    const newEnv: Environment = {
      id: 0,
      name: 'New Environment',
      is_active: false,
      variables: [{ key: '', value: '', enabled: true }]
    };
    setSelectedEnv(newEnv);
    setEditName(newEnv.name);
    setEditVars([...newEnv.variables]);
  };

  const handleSave = async () => {
    if (!selectedEnv) return;
    
    // Filter out empty rows
    const validVars = editVars.filter(v => v.key.trim() !== '');
    
    if (selectedEnv.id === 0) {
      await createEnvironment({ name: editName, variables: validVars, is_active: false });
    } else {
      await updateEnvironment(selectedEnv.id, { name: editName, variables: validVars, is_active: selectedEnv.is_active });
    }
    // Simple refresh logic by closing for now
    onClose();
  };

  const updateVar = (index: number, field: keyof EnvironmentVariable, value: any) => {
    const newVars = [...editVars];
    newVars[index] = { ...newVars[index], [field]: value };
    
    // Add new row if editing last row
    if (index === newVars.length - 1 && newVars[index].key !== '') {
      newVars.push({ key: '', value: '', enabled: true });
    }
    
    setEditVars(newVars);
  };

  const removeVar = (index: number) => {
    setEditVars(editVars.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#202020] rounded-lg shadow-xl w-[800px] h-[500px] flex overflow-hidden border border-[#383838]">
        
        {/* Sidebar */}
        <div className="w-1/3 border-r border-[#383838] bg-[#181818] flex flex-col">
          <div className="p-4 border-b border-[#383838] flex justify-between items-center">
            <h2 className="font-bold">Environments</h2>
            <button onClick={handleCreateNew} className="text-gray-400 hover:text-white"><Plus size={18} /></button>
          </div>
          <div className="flex-1 overflow-auto">
            {environments.map(env => (
              <div 
                key={env.id} 
                className={`p-3 cursor-pointer flex justify-between items-center ${selectedEnv?.id === env.id ? 'bg-[#333]' : 'hover:bg-[#252525]'}`}
                onClick={() => handleSelectEnv(env)}
              >
                <span>{env.name}</span>
                {activeEnvironmentId === env.id && <span className="text-xs bg-[#FF6C37] text-white px-2 py-0.5 rounded">Active</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-[#383838] flex justify-between items-center">
            {selectedEnv ? (
              <input 
                type="text" 
                value={editName} 
                onChange={e => setEditName(e.target.value)} 
                className="text-lg font-bold bg-transparent outline-none w-full"
                placeholder="Environment Name"
              />
            ) : (
              <span className="text-gray-500">Select an environment</span>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-white ml-4"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {selectedEnv && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-10 text-center"></th>
                    <th>Variable</th>
                    <th>Value</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {editVars.map((v, i) => (
                    <tr key={i}>
                      <td className="text-center">
                        <input type="checkbox" checked={v.enabled} onChange={e => updateVar(i, 'enabled', e.target.checked)} />
                      </td>
                      <td>
                        <input type="text" value={v.key} onChange={e => updateVar(i, 'key', e.target.value)} placeholder="New variable" />
                      </td>
                      <td>
                        <input type="text" value={v.value} onChange={e => updateVar(i, 'value', e.target.value)} placeholder="Value" />
                      </td>
                      <td className="text-center">
                        {i < editVars.length - 1 && (
                          <button onClick={() => removeVar(i)} className="text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {selectedEnv && (
            <div className="p-4 border-t border-[#383838] flex justify-end gap-2 bg-[#181818]">
              {selectedEnv.id !== 0 && (
                <button 
                  className="btn btn-secondary mr-auto text-red-500 border-red-900/30 hover:bg-red-900/20"
                  onClick={async () => {
                    await deleteEnvironment(selectedEnv.id);
                    setSelectedEnv(null);
                  }}
                >
                  Delete
                </button>
              )}
              <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
