import { useState } from 'react';

const FollowUpForm = ({ onSubmit, loading }) => {
  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!note.trim()) {
      setError('Note is required.');
      return;
    }

    await onSubmit({ note: note.trim(), follow_up_date: followUpDate || null }, setError);
    if (!error) {
      setNote('');
      setFollowUpDate('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Note *</label>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Follow-up Date</label>
        <input
          type="date"
          value={followUpDate}
          onChange={(event) => setFollowUpDate(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
        />
      </div>
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading ? 'Saving...' : 'Add Follow-up'}
      </button>
    </form>
  );
};

export default FollowUpForm;
