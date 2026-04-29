import { AlertTriangle, X } from "lucide-react";

type Props = {
  message: string;
  onClose: () => void;
};

export default function ErrorAlert({ message, onClose }: Props) {
  if (!message) return null;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-800">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5" />
        <p className="text-sm font-medium">{message}</p>
      </div>

      <button onClick={onClose}>
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}