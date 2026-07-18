import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { getAuthSession } from '../../services/authService';
import { useToast } from '../../ui';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export default function AddMetadataModal({ isOpen, type, onClose, onSuccess }) {
  const [metadataValue, setMetadataValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!metadataValue.trim()) return;

    const session = getAuthSession();
    if (!session?.tokens?.accessToken) {
      toast.error('Please sign in again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = type === 'subject'
        ? `${API_BASE_URL}/app/subjects`
        : `${API_BASE_URL}/app/years`;
      
      const payload = type === 'subject'
        ? { subject_name: metadataValue.trim() }
        : { year: metadataValue.trim() };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to save metadata');
      }

      setMetadataValue('');
      
      if (type === 'subject') {
        const newSub = data?.data?.subject_name || metadataValue.trim();
        onSuccess(type, newSub);
        toast.success('Subject added successfully.');
      } else {
        const newYr = String(data?.data?.years_name || metadataValue.trim());
        onSuccess(type, newYr);
        toast.success('Year added successfully.');
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-[500px] rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              Add New {type === 'subject' ? 'Subject' : 'Year'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Enter the new {type === 'subject' ? 'subject name' : 'year'} to save in the system.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              setMetadataValue('');
            }}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            {type === 'subject' ? 'Subject Name' : 'Year Value'}
            <input
              type={type === 'subject' ? 'text' : 'number'}
              value={metadataValue}
              onChange={(e) => setMetadataValue(e.target.value)}
              placeholder={type === 'subject' ? 'e.g. History' : 'e.g. 2025'}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
              required
            />
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                setMetadataValue('');
              }}
              className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-container px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 cursor-pointer"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
