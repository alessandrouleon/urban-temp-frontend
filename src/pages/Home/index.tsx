export function Home() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Bem-vindo!</h1>
      <p className="text-gray-600">
        Esta é uma sidebar responsiva criada com React, Vite e Tailwind CSS.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
          >
            <h3 className="font-semibold text-gray-700 mb-2">Card {item}</h3>
            <p className="text-sm text-gray-600">Conteúdo do card exemplo</p>
          </div>
        ))}
      </div>
    </div>
  );
}
