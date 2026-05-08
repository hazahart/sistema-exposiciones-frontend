import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/login';
// import Grupos from './pages/grupos/grupos';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta inicial para redirigir al login de una */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Ruta del Login */}
        <Route path="/login" element={<Login />} />
        

      </Routes>
    </Router>
  );
}

export default App;