import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import { FiDollarSign, FiCalendar, FiDownload, FiExternalLink, FiActivity } from 'react-icons/fi';
import { HiOutlineTicket } from 'react-icons/hi2';

const TransactionHistory = () => {
  const [activeTab, setActiveTab] = useState('payments'); // Options: 'payments', 'events'
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchUserHistory = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        setLoading(true);
        
        // Target your core tickets/orders document reference path
        const ticketRef = collection(db, "tickets");
        const q = query(
          ticketRef, 
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedRecords = [];
        
        querySnapshot.forEach((doc) => {
          fetchedRecords.push({
            id: doc.id,
            ...doc.data()
          });
        });

        setRecords(fetchedRecords);
      } catch (error) {
        console.error("Error standardizing payment system arrays:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserHistory();
  }, []);

  // Format Helper Utilities
  const formatDate = (timestamp) => {
    if (!timestamp) return "Recent";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center text-gray-400 text-sm">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          <p className="font-medium tracking-wide">Syncing payment records...</p>
        </div>
      </div>
    );
  }

  return (
    <div  className="w-full min-h-screen text-gray-900 dark:text-gray-100 p-4 md:p-8 flex justify-center items-start">
      <div className="flex flex-col bg-(--bg-color) p-6 rounded-xl shadow-md w-full max-w-4xl border border-gray-100 dark:border-gray-800">
        
        {/* Header Block */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Billing & Passes</h1>
          <p className="text-xs text-gray-400 mt-1">Track access tokens, receipts, and booking redemptions across your event lifecycle.</p>
        </div>

        {/* Tab Selection Filter Controls */}
        <div className="flex gap-2 border-b border-gray-100 dark:border-gray-800 mb-6 text-sm font-medium">
          <button 
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-1.5 pb-3 px-2 border-b-2 transition-all ${activeTab === 'payments' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}
          >
            <FiDollarSign size={15} /> Payment Receipts
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-1.5 pb-3 px-2 border-b-2 transition-all ${activeTab === 'events' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}
          >
            <HiOutlineTicket size={16} /> My Event Passes
          </button>
        </div>

        {/* MAIN HISTORY LAYOUT RUNTIME */}
        <div>
          {activeTab === 'payments' ? (
            /* TAB 1: TRANSACTION LISTING (PAID CONTEXTS) */
            <div className="overflow-x-auto">
              {records.filter(r => r.amount > 0).length === 0 ? (
                <div className="text-center py-12 text-gray-400 space-y-2">
                  <FiDollarSign size={32} className="mx-auto text-gray-300 dark:text-gray-700" />
                  <p className="text-sm font-medium">No financial billing transactions found.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 text-[10px] uppercase tracking-wider font-bold">
                      <th className="pb-3 pl-2">Reference / ID</th>
                      <th className="pb-3">Target Event</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-right pr-2">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {records.filter(r => r.amount > 0).map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                        <td className="py-3.5 pl-2 font-mono text-gray-500 select-all">{record.paymentRef || record.id.slice(0,8)}</td>
                        <td className="py-3.5 font-semibold text-gray-800 dark:text-gray-200 max-w-[180px] truncate">{record.eventName || 'Premium Pass Admission'}</td>
                        <td className="py-3.5 text-gray-400">{formatDate(record.createdAt)}</td>
                        <td className="py-3.5 font-bold text-gray-900 dark:text-white">{formatCurrency(record.amount, record.currency)}</td>
                        <td className="py-3.5 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${record.status === 'success' || record.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            {record.status || 'completed'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <button 
                            type="button"
                            onClick={() => alert(`Pulling full metadata schema invoice for order sequence ${record.id}`)}
                            className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-600 font-medium transition-colors"
                          >
                            <FiDownload size={13} /> <span className="hidden sm:inline">Download</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            /* TAB 2: ATTENDED EVENTS TICKETS MATRIX (FREE + PAID) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {records.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400 space-y-2">
                  <FiCalendar size={32} className="mx-auto text-gray-300 dark:text-gray-700" />
                  <p className="text-sm font-medium">You haven't claimed passes to any events yet.</p>
                </div>
              ) : (
                records.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="relative flex flex-col justify-between bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-xl p-4 transition-all hover:border-gray-200 dark:hover:border-gray-700"
                  >
                    {/* Badge Flag indicators */}
                    <div className="absolute top-4 right-4 flex gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${ticket.amount === 0 ? 'bg-sky-500/10 text-sky-500' : 'bg-orange-500/10 text-orange-500'}`}>
                        {ticket.amount === 0 ? 'Free Pass' : 'Paid Admission'}
                      </span>
                    </div>

                    <div className="space-y-1.5 pr-16">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug truncate">
                        {ticket.eventName || 'Airticks Standard Event'}
                      </h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <FiCalendar size={12} /> {formatDate(ticket.eventDate || ticket.createdAt)}
                      </p>
                    </div>

                    <div className="border-t border-dashed border-gray-200 dark:border-gray-800 my-4" />

                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Pass Code</p>
                        <p className="font-mono font-semibold text-gray-700 dark:text-gray-300 select-all">{ticket.ticketCode || ticket.id.slice(0, 10).toUpperCase()}</p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => alert(`Launching digital ticket modal view for item: ${ticket.id}`)}
                        className="flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 uppercase tracking-wider transition-colors"
                      >
                        View Ticket <FiExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TransactionHistory;