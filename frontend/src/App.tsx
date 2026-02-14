function App() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-white mb-4">
          Optic Engine
        </h1>
        <p className="text-gray-400 mb-8">
          Ready to build! 🚀
        </p>
        <div className="space-x-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Default Button
          </button>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
            Secondary Button
          </button>
          <button className="border border-gray-500 text-gray-300 px-4 py-2 rounded-md hover:bg-gray-800 hover:text-white transition-colors">
            Outline Button
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
