import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    const res = await fetch('http://localhost:8000/conversations/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setConversations(data);
  }

  async function handleNewChat() {
    const res = await fetch('http://localhost:8000/conversations/', {
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
    const res = await fetch(`http://localhost:8000/conversations/${conversation.id}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessages(data);
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const res = await fetch(`http://localhost:8000/conversations/${activeConversation.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: newMessage, role: 'user' }),
    });
    const data = await res.json();
    setMessages([...messages, data]);
    setNewMessage('');
  }

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '250px', borderRight: '1px solid gray', padding: '10px' }}>
        <button onClick={handleNewChat}>+ New Chat</button>
        <button onClick={handleLogout}>Logout</button>
        <ul>
          {conversations.map((conv) => (
            <li key={conv.id} onClick={() => openConversation(conv)} style={{ cursor: 'pointer' }}>
              {conv.title}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1, padding: '10px' }}>
        {activeConversation ? (
          <>
            <h3>{activeConversation.title}</h3>
            <div>
              {messages.map((msg) => (
                <p key={msg.id}><strong>{msg.role}:</strong> {msg.content}</p>
              ))}
            </div>
            <form onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <p>Select or create a conversation to start chatting.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;