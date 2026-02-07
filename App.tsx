
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Transaction, Summary } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import TransactionForm from './components/TransactionForm.tsx';
import TransactionList from './components/TransactionList.tsx';
import Charts from './components/Charts.tsx';
import SmartInsights from './components/SmartInsights.tsx';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const summary = useMemo<Summary>(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === 'income') {
          acc.totalIncome += t.amount;
        } else {
          acc.totalExpenses += t.amount;
        }
        acc.balance = acc.totalIncome - acc.totalExpenses;
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0, balance: 0 }
    );
  }, [transactions]);

  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: crypto.randomUUID(),
    };
    setTransactions((prev) => [transaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm('Delete this transaction?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zenwealth-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          setTransactions(json);
          alert('Data imported successfully!');
        }
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure? This will delete all local transactions.')) {
      setTransactions([]);
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m.599-1a1.964 1.964 0 001.401-1.913z" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">ZEN<span className="text-indigo-600">WEALTH</span></h1>
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={importData} 
              className="hidden" 
              accept=".json" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="hidden sm:flex text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Import
            </button>
            <button 
              onClick={exportData}
              className="text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Backup
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <Dashboard summary={summary} />
        
        <SmartInsights transactions={transactions} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <TransactionForm onAdd={addTransaction} />
              
              <div className="mt-6 pt-6 border-t border-slate-200">
                <button 
                  onClick={clearAllData}
                  className="text-xs font-medium text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Reset All Local Data
                </button>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <Charts transactions={transactions} />
            <TransactionList transactions={transactions} onDelete={deleteTransaction} />
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-slate-200 py-8 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} ZenWealth. Your data is stored locally in your browser cache.</p>
        <p className="mt-1">Use the "Backup" button to save your data if you need to switch browsers.</p>
      </footer>
    </div>
  );
};

export default App;
