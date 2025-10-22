import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <img 
          src="/sapere-logo.png" 
          alt="Sapere Logo" 
          className="w-24 h-24 mx-auto mb-4 object-contain"
        />
        <h1 className="text-3xl font-bold text-orange-600 mb-4">
          Sistema Sapere
        </h1>
        <p className="text-gray-600 mb-6">
          Gestão para Clínica de Neurodivergentes
        </p>
        <Link
          to="/login"
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded block"
        >
          Acessar Sistema
        </Link>
      </div>
    </div>
  );
}