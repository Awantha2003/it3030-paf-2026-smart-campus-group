import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User as UserIcon } from 'lucide-react';
import { getChatUsers, getChatHistory, sendMessage } from '../../api/chat';
import { useAuth } from '../../contexts/AuthContext';

export function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Allow all logged-in users to chat (Admins can chat with anyone, others with Admins)
  const canChat = !!user;

  useEffect(() => {
    if (isOpen && canChat) {
      fetchUsers();
    }
  }, [isOpen, canChat]);

  useEffect(() => {
    let intervalId;
    if (selectedUser) {
      fetchConversation();
      intervalId = setInterval(fetchConversation, 3000); // poll every 3 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const data = await getChatUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load chat users', err);
    }
  };

  const fetchConversation = async () => {
    if (!selectedUser) return;
    try {
      const msgs = await getChatHistory(selectedUser.id);
      setMessages(msgs || []);
    } catch (err) {
      console.error('Failed to load history', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !selectedUser) return;
    const tempMsg = inputMsg;
    setInputMsg('');
    try {
      await sendMessage(selectedUser.id, tempMsg);
      await fetchConversation();
    } catch (err) {
      console.error('Failed to send msg', err);
    }
  };

  if (!canChat) return null;

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-brand-purple text-white shadow-lg hover:bg-purple-700 transition shadow-purple-500/30 z-50 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-80 md:w-96 bg-white dark:bg-brand-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 flex flex-col overflow-hidden"
            style={{ height: '500px', maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="bg-brand-purple p-4 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {selectedUser ? (
                    <>
                      <button onClick={() => setSelectedUser(null)} className="hover:text-purple-200">
                        &larr; Back
                      </button>
                      <span>{selectedUser.name || selectedUser.email}</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5" />
                      Messages
                    </>
                  )}
                </h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-red-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4">
              {!selectedUser ? (
                <div className="space-y-2">
                  <div className="mb-4">
                    <input 
                      type="text" 
                      placeholder="Search Admin or Technician..." 
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-purple outline-none dark:text-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 px-1">
                    Select a user to message:
                  </p>
                  {filteredUsers.length === 0 && (
                    <div className="text-center text-slate-500 text-sm py-8">No users found.</div>
                  )}
                  {filteredUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {u.name || u.email}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{u.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 pb-2">
                  {messages.length === 0 && (
                    <div className="text-center text-slate-500 text-xs py-4">Session started. Say hi!</div>
                  )}
                  {messages.map(m => {
                    const isMine = m.senderId === user.id;
                    return (
                      <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                            isMine
                              ? 'bg-brand-purple text-white rounded-br-none'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                          }`}
                        >
                          <p style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{m.content}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? 'text-purple-200' : 'text-slate-400'}`}>
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input field */}
            {selectedUser && (
              <form onSubmit={handleSend} className="p-3 bg-white dark:bg-brand-surface border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-purple outline-none dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!inputMsg.trim()}
                  className="p-2 bg-brand-purple text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
