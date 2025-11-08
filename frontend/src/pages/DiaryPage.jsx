import Calendar from '../components/Calendar'
import './DiaryPage.css'
import { useNavigate } from 'react-router-dom';

export default function DiaryPage() {
  const navigate = useNavigate();

  return (
    <div className='h-full w-full flex items-center justify-center'>
      <div className="h-fit bg-[#071226] text-white p-20">
        <div className="max-w-6xl mx-auto flex gap-6">
          {/* Left column: calendar */}
          <aside className="w-72 shrink-0">
            <button onClick={() => navigate("/diary/add")} className="w-full bg-white text-black rounded-md py-2 px-3 mb-6">+ Add Log</button>

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
          </aside>

          {/* Right column: diary entries */}
          <div className="flex-1">
            <div className="diary-card border rounded-lg p-6" style={{ background: 'rgba(9,16,28,0.7)', borderColor: 'rgba(255,255,255,0.12)' }}>
              <div className="flex justify-between items-start mb-4">
                <div className="text-sm text-gray-300">March 24, Sunday</div>
              </div>

              <div className="prose prose-invert max-w-none text-gray-200 mb-6">
                <p>
                  Lorem ipsum dolor sit amet consectetur. Mattis rhoncus turpis rutrum bibendum sapien in vestibulum
                  fermentum. Neque ac morbi elementum quis sit etiam sed erat. Nibh in adipiscing porta porttitor gravida
                  molestie ac. Fermentum amet integer nunc lacus egestas vitae vel tristique.Lorem ipsum dolor sit amet
                  consectetur. Mattis rhoncus turpis rutrum bibendum sapien in vestibulum fermentum. Neque ac morbi
                  elementum quis sit etiam sed erat. Nibh in adipiscing porta porttitor gravida molestie ac. Fermentum amet
                  integer nunc lacus egestas vitae vel tristique.Lorem ipsum dolor sit amet consectetur. Mattis rhoncus
                  turpis rutrum bibendum sapien in vestibulum fermentum. Neque ac morbi elementum quis sit etiam sed erat.
                </p>
              </div>

              <div className="mt-6 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">Fw</div>
                <div>
                  <div className="text-sm text-gray-300">Fuze</div>
                  <p className="text-sm text-gray-300 max-w-2xl">
                    Lorem ipsum dolor sit amet consectetur. Mattis rhoncus turpis rutrum bibendum sapien in vestibulum
                    fermentum. Cc morbi elementum quis sit etiam sed erat. Nibh in adipiscing porta porttitor gravida
                    molestie ac. Fermentum amet integer nunc lacus egestas vitae vel tristique.Lorem ipsum dolor sit amet
                    consectetur.
                  </p>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
    </div>
  )
}
