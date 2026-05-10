import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/login';
import Grupos from './pages/equipos/groups';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta inicial para redirigir al login de una */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Ruta del Login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta de Grupos, crud */}
        <Route path="/grupos" element={<Grupos />} />

      </Routes>
    </Router>
  );
}

export default App;