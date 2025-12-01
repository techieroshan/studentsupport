
import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Shield, Lock, User, Info, Flag, CheckCircle2, KeyRound, Loader2 } from 'lucide-react';
import { Message, User as UserType, UserRole, VerificationStatus } from '../types';
import VerificationBadge from './VerificationBadge';
import { apiClient } from '../src/services/api';
import type { BackendChatThread, BackendMessage } from '../src/services/apiTypes';

interface Props {
  recipientName: string;
  recipientAvatarId: number;
  recipientVerificationStatus: VerificationStatus;
  itemName: string;
  currentUser: UserType;
  onClose: () => void;
  onFlag: () => void;
  onAcceptMatch: () => void;
  onVerifyPin: (pin: string) => void;
  isOwner?: boolean;
  status: 'OPEN' | 'IN_PROGRESS' | 'FULFILLED' | 'CLAIMED' | 'AVAILABLE';
  completionPin?: string;
  userRole: UserRole;
  itemType: 'REQUEST' | 'OFFER';
  itemId: string;
}

const ChatModal: React.FC<Props> = ({ 
    recipientName, recipientAvatarId, recipientVerificationStatus, itemName, currentUser, 
    onClose, onFlag, onAcceptMatch, onVerifyPin, 
    isOwner, status, completionPin, userRole, itemType, itemId
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load chat thread and messages
  useEffect(() => {
    const loadChat = async () => {
      setLoading(true);
      try {
        // Get all threads and find the one for this item
        const threadsResponse = await apiClient.getChatThreads();
        if (threadsResponse.data && Array.isArray(threadsResponse.data)) {
          const thread = (threadsResponse.data as BackendChatThread[]).find(
            (t) => t.item_id === itemId && t.item_type === itemType
          );

          if (thread) {
            setThreadId(thread.id);
            // Map backend messages to frontend format
            const mappedMessages: Message[] = thread.messages.map((msg: BackendMessage) => ({
              id: msg.id,
              senderId: msg.sender_id,
              text: msg.text,
              timestamp: new Date(msg.timestamp).getTime(),
              isSystem: msg.is_system || false,
            }));
            
            // Add system messages
            const systemMessages: Message[] = [
              {
                id: 'sys-1',
                senderId: 'system',
                text: `You are connected with ${recipientName} regarding "${itemName}".`,
                timestamp: Date.now(),
                isSystem: true
              },
              {
                id: 'sys-2',
                senderId: 'system',
                text: 'Safety Tip: Coordinate pickup locations in public areas. Do not share financial info.',
                timestamp: Date.now(),
                isSystem: true
              }
            ];
            setMessages([...systemMessages, ...mappedMessages]);
          } else {
            // No thread yet, just show system messages
            setMessages([
              {
                id: 'sys-1',
                senderId: 'system',
                text: `You are connected with ${recipientName} regarding "${itemName}".`,
                timestamp: Date.now(),
                isSystem: true
              },
              {
                id: 'sys-2',
                senderId: 'system',
                text: 'Safety Tip: Coordinate pickup locations in public areas. Do not share financial info.',
                timestamp: Date.now(),
                isSystem: true
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Error loading chat:', error);
        // Fallback to system messages only
        setMessages([
          {
            id: 'sys-1',
            senderId: 'system',
            text: `You are connected with ${recipientName} regarding "${itemName}".`,
            timestamp: Date.now(),
            isSystem: true
          },
          {
            id: 'sys-2',
            senderId: 'system',
            text: 'Safety Tip: Coordinate pickup locations in public areas. Do not share financial info.',
            timestamp: Date.now(),
            isSystem: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [itemId, itemType, recipientName, itemName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto focus input on mount
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;

    setSending(true);
    try {
      // If no thread exists, accept match first to create thread
      let currentThreadId = threadId;
      if (!currentThreadId) {
        const acceptResponse = await apiClient.acceptMatch(itemId);
        if (acceptResponse.error) {
          showToast(acceptResponse.error);
          setSending(false);
          return;
        }
        if (acceptResponse.data) {
          currentThreadId = acceptResponse.data.thread_id;
          setThreadId(currentThreadId);
        }
      }

      if (!currentThreadId) {
        showToast('Error: Could not create chat thread.');
        setSending(false);
        return;
      }

      // Send message
      const response = await apiClient.sendMessage(currentThreadId, inputValue);
      if (response.error) {
        showToast(response.error);
        setSending(false);
        return;
      }

      if (response.data) {
        const data = response.data as BackendMessage;
        const newMessage: Message = {
          id: data.id,
          senderId: data.sender_id,
          text: data.text,
          timestamp: new Date(data.timestamp).getTime(),
          isSystem: data.is_system || false,
        };
        setMessages([...messages, newMessage]);
        setInputValue('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const showToast = (message: string) => {
    // Simple toast notification - you might want to use a toast library
    alert(message);
  };

  const AVATARS = [
    "https://picsum.photos/seed/student1/200",
    "https://picsum.photos/seed/student2/200",
    "https://picsum.photos/seed/student3/200",
    "https://picsum.photos/seed/student4/200",
    "https://picsum.photos/seed/donor1/200",
    "https://picsum.photos/seed/donor2/200",
    "https://picsum.photos/seed/tech/200",
    "https://picsum.photos/seed/art/200"
  ];

  // Logic to determine if user needs to GIVE or RECEIVE the PIN
  // Student (Seeker) -> Recipient -> GIVES PIN (Has PIN)
  // Donor -> Provider -> ENTERS PIN
  const isRecipient = userRole === UserRole.SEEKER; // Students always receive food
  
  // Identify role of the other person
  const recipientRole = userRole === UserRole.SEEKER ? 'Donor' : 'Student';

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Focus trap: keep focus within modal
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      modal.removeEventListener('keydown', handleTab);
    };
  }, [loading]);

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 dark:bg-black text-white p-4 flex justify-between items-center shadow-md z-10">
          <div className="flex items-center">
            <div className="relative">
                <img 
                    src={AVATARS[recipientAvatarId] || AVATARS[0]} 
                    alt={recipientName} 
                    className="w-10 h-10 rounded-full border-2 border-slate-700 bg-slate-800"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <div className="ml-3">
              <div className="flex items-center">
                <h3 id="chat-modal-title" className="font-bold text-sm flex items-center mr-2">
                    {recipientName} 
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-700 rounded text-slate-300 uppercase font-bold mr-2">
                    {recipientRole}
                </span>
                <VerificationBadge status={recipientVerificationStatus} showLabel={false} />
              </div>
              <p className="text-xs text-slate-300 truncate max-w-[150px]">{status === 'IN_PROGRESS' ? '• In Progress' : '• Connecting...'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={onFlag} className="p-2 hover:bg-slate-800 rounded-full transition text-slate-500 hover:text-red-500" title="Flag Transaction">
                <Flag className="h-5 w-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition">
                <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </div>
        
        {/* Actions Bar: Acceptance Phase */}
        {status !== 'IN_PROGRESS' && isOwner && (
            <div className="bg-brand-50 dark:bg-brand-900/30 border-b border-brand-100 dark:border-brand-800 p-3 flex justify-between items-center">
                <p className="text-xs text-brand-800 dark:text-brand-200 font-bold">Details agreed upon?</p>
                <button 
                    onClick={onAcceptMatch}
                    className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center shadow-sm"
                >
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Accept Match
                </button>
            </div>
        )}

        {/* PIN Verification Phase */}
        {status === 'IN_PROGRESS' && (
            <div className="bg-emerald-50 dark:bg-emerald-900/30 border-b border-emerald-100 dark:border-emerald-800 p-4">
                {isRecipient ? (
                    <div className="text-center">
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200 uppercase mb-1">Digital Handshake</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-300 mb-2">Share this PIN with {recipientName} upon receipt of meal:</p>
                        <div className="text-3xl font-mono font-bold tracking-widest text-emerald-900 dark:text-emerald-100 bg-white dark:bg-emerald-900/50 border-2 border-emerald-200 dark:border-emerald-700 rounded-lg py-2 w-32 mx-auto">
                            {completionPin || '....'}
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200 uppercase mb-2">Verify Delivery</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-300 mb-2">Ask {recipientName} for the PIN when you hand over the meal:</p>
                        <div className="flex justify-center space-x-2 mb-2">
                            <input 
                                type="text" 
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value.replace(/\D/g,'').slice(0,4))}
                                placeholder="0000"
                                className="w-24 text-center text-xl font-mono font-bold py-1 rounded border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                            />
                            <button 
                                onClick={() => onVerifyPin(pinInput)}
                                disabled={pinInput.length !== 4}
                                className="bg-emerald-700 text-white px-3 py-1 rounded font-bold text-sm hover:bg-emerald-800 disabled:opacity-50"
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-800 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
            </div>
          ) : (
            messages.map((msg) => {
            if (msg.isSystem) {
                return (
                    <div key={msg.id} className="flex justify-center my-2">
                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-3 py-1 rounded-full flex items-center text-center">
                            <Info className="h-3 w-3 mr-1 inline" /> {msg.text}
                        </span>
                    </div>
                )
            }
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-brand-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          }))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center space-x-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 rounded-full px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none placeholder-slate-500"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || sending || loading}
              className="p-3 bg-brand-600 text-white rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
          <div className="text-center mt-2">
             <p className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-center">
                <Shield className="h-3 w-3 mr-1" /> Chats are end-to-end masked for privacy.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatModal;
