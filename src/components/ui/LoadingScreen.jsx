export default function LoadingScreen() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-green-600"></div>
            <p className="mt-4 text-gray-600 font-medium animate-pulse">Cargando sistema...</p>
        </div>
    )
}