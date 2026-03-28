// /app/facebook-pages/adaccount/page.jsx
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdAccountPage() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAcc, setSelectedAcc] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load ad accounts
  useEffect(() => {
    axios.get('/api/facebook/adaccount')
      .then(res => setAccounts(res.data.accounts))
      .catch(() => setError('Failed to load accounts'))
      .finally(() => setLoading(false));
  }, []);

  // Load account + campaigns
  const selectAccount = async (acc) => {
    setSelectedAcc(acc);
    setAccountDetails(null);
    setCampaigns([]);
    setSelectedCamp(null);
    setLoading(true);

    try {
      const res = await axios.get(`/api/facebook/adaccount?accountId=${acc.account_id.replace('act_', '')}`);
      setAccountDetails(res.data.account);
      setCampaigns(res.data.campaigns);
    } catch (err) {
      setError('Failed to load account or campaigns');
    } finally {
      setLoading(false);
    }
  };

  // Load campaign details
  const selectCampaign = async (camp) => {
    setSelectedCamp(camp);
    try {
      const res = await axios.get(`/api/facebook/adaccount?campaignId=${camp.id}`);
      setSelectedCamp(res.data.campaign);
    } catch (err) {
      setError('Failed to load campaign');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold text-center text-indigo-900 mb-8">
          Facebook Ad Accounts & Campaigns
        </h1>

        {loading && <div className="text-center my-10">Loading...</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-6">{error}</div>}

        {/* Ad Accounts */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-indigo-800 mb-4">Ad Accounts</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {accounts.map(acc => (
              <div
                key={acc.account_id}
                onClick={() => selectAccount(acc)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${selectedAcc?.account_id === acc.account_id
                    ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                    : 'border-gray-300 bg-white hover:border-indigo-400'
                  }`}
              >
                <h3 className="font-bold">{acc.name}</h3>
                <p className="text-xs text-gray-600">ID: {acc.account_id}</p>
                <p className="text-sm">{acc.currency}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Account Details + Campaigns */}
        {accountDetails && (
          <>
            <section className="bg-white p-6 rounded-xl shadow mb-8">
              <h2 className="text-xl font-bold text-indigo-700 mb-4">Account: {accountDetails.name}</h2>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <Info label="ID" value={accountDetails.account_id} code />
                <Info label="Status" value={statusMap[accountDetails.account_status]} badge />
                <Info label="Currency" value={accountDetails.currency} />
                <Info label="Spent" value={accountDetails.amount_spent} green />
                <Info label="Balance" value={accountDetails.balance} />
                <Info label="Spend Cap" value={accountDetails.spend_cap} />
                {accountDetails.business && <Info label="Business" value={accountDetails.business.name} />}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-indigo-700 mb-4">
                Campaigns ({campaigns.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map(camp => (
                  <div
                    key={camp.id}
                    onClick={() => selectCampaign(camp)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all
                      ${selectedCamp?.id === camp.id
                        ? 'border-purple-600 bg-purple-50 shadow-md'
                        : 'border-gray-300 bg-white hover:border-purple-400'
                      }`}
                  >
                    <h4 className="font-semibold">{camp.name}</h4>
                    <p className="text-xs text-gray-600">ID: {camp.id}</p>
                    <p className="text-sm mt-1">{camp.objective}</p>
                    <span className={`text-xs px-2 py-1 rounded mt-1 inline-block
                      ${camp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {camp.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Campaign Full Details */}
        {selectedCamp && typeof selectedCamp === 'object' && selectedCamp.name && (
          <section className="mt-10 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-purple-700 mb-4">
              Campaign: {selectedCamp.name}
            </h2>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <Info label="ID" value={selectedCamp.id} code />
              <Info label="Status" value={selectedCamp.status} badge />
              <Info label="Objective" value={selectedCamp.objective} />
              <Info label="Daily Budget" value={selectedCamp.daily_budget} />
              <Info label="Lifetime Budget" value={selectedCamp.lifetime_budget} />
              <Info label="Budget Remaining" value={selectedCamp.budget_remaining} green />
              <Info label="Start" value={formatDate(selectedCamp.start_date)} />
              <Info label="End" value={formatDate(selectedCamp.stop_time)} />
              <Info label="Created" value={formatDate(selectedCamp.created_time)} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// Helpers
function Info({ label, value, code, badge, green }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-1 border-b border-gray-100">
      <span className="font-medium text-gray-700">{label}:</span>
      <span className={`
        ${code ? 'font-mono text-xs bg-gray-100 px-2 py-1 rounded' : ''}
        ${badge ? 'px-2 py-1 rounded text-xs font-medium ' + (value === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : ''}
        ${green ? 'text-green-600 font-medium' : ''}
      `}>
        {value}
      </span>
    </div>
  );
}

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : '—';
}

const statusMap = {
  1: 'ACTIVE', 2: 'PAUSED', 3: 'DELETED', 4: 'ARCHIVED',
  7: 'IN_PROCESS', 8: 'WITH_ISSUES'
};