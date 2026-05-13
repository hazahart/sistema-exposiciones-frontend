# Sistema de Exposiciones — Frontend

Aplicación web para la gestión de exposiciones académicas con rúbrica de evaluación.
Desarrollada como práctica de la materia **Tópicos Avanzados de Desarrollo Web** en el Instituto Tecnológico de Celaya.

## Stack

- React 18 + Vite
- Tailwind CSS v4
- Axios (singleton con interceptores JWT)
- React Router v7
- Sonner (toasts)
- Lucide React (iconos)

## Deploy

Aplicación disponible en: https://sistema-exposiciones.vercel.app

API Backend: https://sistema-exposiciones-backend.onrender.com/api/v1

## Requisitos

- Node.js v18+

## Instalación

```bash
git clone https://github.com/tu-usuario/sistema-exposiciones-frontend.git
cd sistema-exposiciones-frontend
npm install
```

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

Para producción usa `.env`:

```env
VITE_API_URL=https://sistema-exposiciones-backend.onrender.com/api/v1
```

## Ejecución

```bash
npm run dev    # Desarrollo
npm run build  # Build de producción
```

## Módulos

| Módulo | Descripción | Roles |
|--------|-------------|-------|
| Login | Autenticación con No. de Control y contraseña | Todos |
| Dashboard | Resumen de estadísticas y próximas exposiciones | Todos |
| Materias | CRUD con paginación y filtro por nombre | Ver: todos / Editar: admin |
| Grupos | CRUD con gestión de alumnos inscritos | Ver: todos / Editar: admin |
| Alumnos | CRUD con búsqueda por nombre | Ver: todos / Editar: admin |
| Equipos | CRUD con gestión de integrantes por grupo | Ver: todos / Editar: admin |
| Exposiciones | Lista con estado por alumno autenticado | Ver: todos / Crear: admin |
| Evaluaciones | Rúbrica dinámica con calificación ponderada | Todos (excepto equipo propio) |
| Criterios | CRUD de criterios con validación de peso | Solo admin |

## Roles

| Rol | Acceso |
|-----|--------|
| `admin` | CRUD completo en todos los módulos |
| `alumno` | Lectura + registrar evaluaciones de exposiciones ajenas |

## Reglas de negocio

- Un alumno no puede evaluar una exposición de su propio equipo
- Un alumno solo puede evaluar una vez cada exposición
- Las exposiciones muestran estado: `propia`, `evaluada` o `pendiente`
- La calificación final se calcula ponderando cada criterio por su peso porcentual
- Al agregar integrantes a un equipo, solo se listan alumnos del grupo del equipo

## Estructura del proyecto

```
src/
├── api/           # Servicios de llamadas HTTP (singleton Axios)
├── components/
│   ├── layout/    # Sidebar, Navbar, DashboardLayout
│   └── ui/        # LoadingScreen
├── context/       # AuthContext — JWT y estado de sesión
├── pages/         # Una carpeta por módulo
├── router/        # AppRouter con rutas protegidas
└── main.jsx
```

## Equipo

| Integrante | Módulos |
|------------|---------|
| Gustavo Ramírez Mireles | Materias, Exposiciones, Evaluaciones |
| Vanessa Fernanda Arreola García | Login, Grupos |
| Luis Ángel Cruz Guerrero | Dashboard, Alumnos, Equipos |