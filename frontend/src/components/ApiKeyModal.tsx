import { X } from "lucide-react";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  error: string;
};

export default function ApiKeyModal({ isOpen, onClose, onSave, error }: Props) {
  const [key, setKey] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(key);
          if (key.trim()) {
            setKey("");
          }
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">API Key Settings</h2>
            <p className="text-sm text-slate-500">
              Add your OpenAI API key for repository analysis and workflow generation.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mb-2 block text-sm font-medium text-slate-700">
          OpenAI API Key
        </label>

        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-..."
          className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="mt-3 min-h-6">
          {error ? (
            <p className="text-sm font-medium text-rose-600">{error}</p>
          ) : (
            <p className="text-sm text-slate-500">
              The key is stored in your browser and sent to the backend in request headers.
            </p>
          )}
        </div>

        <div className="mt-5 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">
          Use this only in local development. For deployed environments, keep the
          real key on the backend instead of passing it from the browser.
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-5 py-2 font-medium hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
          >
            Save Key
          </button>
        </div>
      </form>
    </div>
  );
}
