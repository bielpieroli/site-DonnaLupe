import iconeProduto from '../../assets/img/icone-produto.png';

const PRODUCTS = [
  { id: 1, name: 'Ovo de Pascoa', price: 'R$ 89,90' },
  { id: 2, name: 'Bolo de Chocolate', price: 'R$ 24,50' },
  { id: 3, name: 'Cookie', price: 'R$ 12,00' },
  { id: 4, name: 'Hot dog', price: 'R$ 25,00' },
];

function Shopping() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Página de Compras</h1>
        <p className="text-gray-600">Explore nossa seleção de produtos exclusivos.</p>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {PRODUCTS.map((product) => (
          <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
            <img 
              src={iconeProduto} 
              alt={product.name} 
              className="w-full h-48 object-contain p-4 bg-gray-50" 
            />
            <div className="p-4">
              <h2 className="font-semibold text-lg mb-2">{product.name}</h2>
              <p className="text-blue-600 font-bold text-xl mb-4">{product.price}</p>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors">
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shopping;