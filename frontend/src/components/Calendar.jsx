export default function Calendar(){
  return (
    <aside className="w-72 shrink-0">
      <button className="w-full bg-white text-black rounded-md py-2 px-3 mb-6">+ Add Log</button>
      <div className="text-center text-sm text-gray-300 mb-4"> 
        <button className="px-2">&lt;</button>
        <span className="mx-3">September 2021</span>
        <button className="px-2">&gt;</button>
      </div>
      <div className="calendar-grid bg-transparent text-gray-300">
        <div className="grid grid-cols-7 gap-2 text-xs text-center mb-2">
          <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
        </div>
        <div className="grid grid-cols-7 gap-2 text-sm">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className={`py-2 ${i === 18 ? 'bg-blue-600 text-white rounded-full' : ''}`}>{i < 30 ? i + 1 : ''}</div>
          ))}
        </div>
      </div>
    </aside>)
}