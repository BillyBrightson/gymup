import { useState } from 'react';
import { getSMSLink, getWhatsAppLink } from '../utils/sms';
import { MessageSquare, Send, X, Copy, Check, Phone, Smartphone } from 'lucide-react';

export default function SMSComposer({ member, initialMessage, onClose, title, subtitle }) {
  const [message, setMessage] = useState(initialMessage || '');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = message.length;
  const smsCount = Math.ceil(charCount / 160);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <MessageSquare size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{title || 'Send Notification'}</p>
                <p className="text-orange-100 text-xs">{subtitle || `To: ${member?.name} · ${member?.phone}`}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Member info chip */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
              {member?.name?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">{member?.name}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Phone size={10} /> {member?.phone}
              </p>
            </div>
            <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{member?.plan}</span>
          </div>
        </div>

        {/* Message editor */}
        <div className="px-5 pt-3 pb-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-600">Message</label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{charCount} chars · {smsCount} SMS</span>
              <button onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                {copied ? <><Check size={11} className="text-green-500" /> Copied</> : <><Copy size={11} /> Copy</>}
              </button>
            </div>
          </div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={8}
            className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none leading-relaxed"
          />
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-5 grid grid-cols-2 gap-3">
          <a
            href={getSMSLink(member?.phone, message)}
            onClick={onClose}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors"
          >
            <Smartphone size={16} /> Send SMS
          </a>
          <a
            href={getWhatsAppLink(member?.phone, message)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
