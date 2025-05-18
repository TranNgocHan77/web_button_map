import React from 'react';
import DotMap from './components/DotMap';
import { MapPin } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex items-center">
          <MapPin className="text-blue-500 mr-2" size={28} />
          <h1 className="text-2xl font-bold text-blue-700 tracking-tight">Interactive Map Builder</h1>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4">
        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
          <h2 className="font-semibold text-blue-700 mb-1">Hướng dẫn sử dụng</h2>
          <ul className="list-disc list-inside text-sm text-blue-900">
            <li>Chọn chế độ <b>Place</b> để thêm điểm lên bản đồ.</li>
            <li>Chọn chế độ <b>Connect</b> để nối các điểm với nhau.</li>
            <li>Chọn chế độ <b>Adjust</b> để chỉnh hướng của điểm.</li>
            <li>Sử dụng Undo/Redo hoặc các nút xóa để thao tác nhanh.</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <DotMap />
        </div>
      </main>
      
      <footer className="bg-white mt-12 py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          Interactive Map Builder &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}

export default App;