import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div>
      <h2>Welcome to DocuChat AI</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;