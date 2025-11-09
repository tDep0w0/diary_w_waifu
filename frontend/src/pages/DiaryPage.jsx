import { useContext, useState } from 'react';
import Calendar from '../components/Calendar'
import './DiaryPage.css'
import { useNavigate } from 'react-router-dom';
import AIResContext from '../context/AIResContext';

export default function DiaryPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const { response } = useContext(AIResContext)

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // const formattedDate = selectedDate.toISOString().split('T')[0] // "2025-11-09"
  };

  return (
    <div className='h-full w-full flex items-center justify-center'>
      <div className="h-fit bg-[#071226] text-white p-20">
        <div className="max-w-6xl mx-auto flex gap-6">
          
          {/* Left column: calendar */}
          <aside className="w-72 shrink-0">
            <button onClick={() => navigate("/diary/add")} className="w-full bg-white text-black rounded-md py-2 px-3 mb-6">
              + Add Log
            </button>
            <Calendar onDateSelect={handleDateSelect} />
          </aside>

          {/* Right column: diary entries */}
          <div className="flex-1">
            <div className="diary-card border rounded-lg p-6" style={{ background: 'rgba(9,16,28,0.7)', borderColor: 'rgba(255,255,255,0.12)' }}>
              <div className="flex justify-between items-start mb-4">
                <div className="text-sm text-gray-300">
                  {selectedDate
                    ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'long' })
                    : 'No date selected'}
                </div>
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
                    {response}
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
