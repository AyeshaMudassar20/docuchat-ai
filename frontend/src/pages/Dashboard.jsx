import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { API_URL } from '../config';

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    const res = await fetch(`${API_URL}/conversations/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setConversations(data);
    return data;
  }

  async function handleNewChat() {
    const res = await fetch(`${API_URL}/conversations/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'New Chat' }),
    });
    const data = await res.json();
    setConversations([...conversations, data]);
    openConversation(data);
  }

  async function openConversation(conversation) {
    setActiveConversation(conversation);
    setUploadedDocs([]);
    const res = await fetch(`${API_URL}/conversations/${conversation.id}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessages(data);
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || isSending) return;

    const isFirstMessage = messages.length === 0;

    setIsSending(true);
    try {
      const res = await fetch(`${API_URL}/conversations/${activeConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newMessage, role: 'user' }),
      });
      const data = await res.json();
      setMessages([...messages, ...data]);
      setNewMessage('');

      if (isFirstMessage) {
        const updated = await fetchConversations();
        const updatedActive = updated.find((c) => c.id === activeConversation.id);
        if (updatedActive) setActiveConversation(updatedActive);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file || !activeConversation) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(
        `${API_URL}/conversations/${activeConversation.id}/documents/upload`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) {
        alert('Upload failed. Please try again.');
        return;
      }

      const data = await res.json();
      setUploadedDocs([...uploadedDocs, data.filename]);
    } catch (err) {
      console.error('Failed to upload document:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  async function handleDeleteConversation(convId, e) {
    e.stopPropagation();
    const confirmed = window.confirm('Delete this conversation?');
    if (!confirmed) return;

    const res = await fetch(`${API_URL}/conversations/${convId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      alert('Failed to delete. Try logging in again.');
      return;
    }

    setConversations(conversations.filter((c) => c.id !== convId));
    if (activeConversation?.id === convId) {
      setActiveConversation(null);
      setMessages([]);
    }
  }

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-buttons">
          <button className="btn btn-primary" onClick={handleNewChat}>+ New Chat</button>
          <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
        <ul className="conversation-list">
          {conversations.map((conv) => (
            <li
              key={conv.id}
              onClick={() => openConversation(conv)}
              className={`conversation-item ${activeConversation?.id === conv.id ? 'active' : ''}`}
            >
              <span>{conv.title}</span>
              <button className="delete-btn" onClick={(e) => handleDeleteConversation(conv.id, e)}>🗑</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-panel">
        {activeConversation ? (
          <>
            <h3 className="chat-title">{activeConversation.title}</h3>

            <div className="upload-box">
              📎 Upload PDF:{' '}
              <input type="file" accept=".pdf" onChange={handleFileUpload} disabled={isUploading} />
              {isUploading && <p className="upload-status">Uploading...</p>}
              {uploadedDocs.length > 0 && (
                <p className="upload-status">Uploaded: {uploadedDocs.join(', ')}</p>
              )}
            </div>

            <div className="messages-area">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-bubble ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}
                >
                  {msg.content}
                </div>
              ))}
            </div>

            <form className="message-form" onSubmit={handleSendMessage}>
              <input
                className="message-input"
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={isSending}
              />
              <button className="btn btn-primary" type="submit" disabled={isSending}>
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </>
        ) : (
          <p className="empty-state">Select or create a conversation to start chatting.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;