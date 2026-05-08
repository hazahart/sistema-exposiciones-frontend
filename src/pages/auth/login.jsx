import { useState } from 'react';
import { Lock, User } from 'lucide-react';

export default function Login() {
  const [matricula, setMatricula] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Enviando datos:', { matricula, password });
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8">
        
        {/* Contenedor principal */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          
          {/* Header */}
          <div className="bg-green-600 p-8 text-center">
            <div className="mb-4">
              <img
                src="https://images.unsplash.com/photo-1749977585560-8e6b39efe5fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxseW54JTIwd2lsZCUyMGNhdHxlbnwxfHx8fDE3NzgyMTY2ODN8MA&ixlib=rb-4.1.0&q=80&w=200"
                alt="Lince - Mascota del Tecno"
                className="mx-auto h-32 w-32 rounded-full border-4 border-white object-cover"
              />
            </div>
            <h1 className="mb-2 text-3xl text-white">TOP WEB</h1>
            <p className="text-green-100">Sistema de calificación de exposiciones</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6 p-8">

            {/* Campo del numero de control */}
            <div className="space-y-2">
              <label htmlFor="matricula" className="block text-gray-700">
                No. de Control
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="matricula"
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="Ingresa tu Numero de Control"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {/* Campo de contraseña */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {/* Botón de inicio de sesión */}
            <button
              type="submit"
              className="w-full rounded-lg bg-green-600 py-3 text-white transition-all hover:bg-green-700"
            >
              Iniciar Sesión
            </button>

          </form>
          
        </div>
      </div>
    </div>
  );
}