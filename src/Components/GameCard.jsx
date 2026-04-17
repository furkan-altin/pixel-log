// onEdit ve onDelete özelliklerini (props) dışarıdan alıyoruz
const GameCard = ({ game, onEdit, onDelete }) => {
  return (
    <div className="bg-[#1f293a] rounded-xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-[#374151]">
      <img src={game.image} alt={game.title} className="w-full h-40 object-cover" />
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-4 truncate" title={game.title}>
          {game.title}
        </h3>
        
        <div className="space-y-3 text-sm text-gray-400">
          <p className="flex justify-between items-center">
            <span>Status:</span>
            <span className="bg-[#2d3a51] text-indigo-400 px-3 py-1 rounded font-medium">
              {game.status}
            </span>
          </p>
          <p className="flex justify-between items-center">
            <span>Rating:</span>
            <span className="text-yellow-400 font-bold text-base tracking-widest">
              {game.rating ? '★'.repeat(game.rating).padEnd(5, '☆') : '-'}
            </span>
          </p>
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#374151]">
          {/* DÜZENLEME BUTONU */}
          <button onClick={() => onEdit(game)} className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
            ✎ Edit
          </button>
          {/* SİLME BUTONU */}
          <button onClick={() => onDelete(game.id)} className="text-gray-400 hover:text-red-500 flex items-center gap-2 transition-colors">
            🗑 Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;