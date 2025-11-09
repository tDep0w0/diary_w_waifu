import { useContext, useState } from 'react';
import Calendar from '../components/Calendar'
import './DiaryPage.css'
import { useNavigate } from 'react-router-dom';
import AIResContext from '../context/AIResContext';
import startLogo from '../assets/start-logo.png';
import DateContext from '../context/DateContext';
import LogContext from '../context/LogContext';

export default function DiaryPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const { response } = useContext(AIResContext)
  const { setDate } = useContext(DateContext)
  const [entryText, setEntryText] = useState("");
  const [aiText, setAiText] = useState("");
  const [isChanged, setIsChanged] = useState(false)
  const { log } = useContext(LogContext)

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    const formattedDate = date.toISOString().split('T')[0]; // "2025-11-09"
    setDate(formattedDate);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/diary/${formattedDate}`);
      if (!response.ok) {
      throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log(data);
      if (data.error) {
        setEntryText("");
        setAiText("")
      } else {
        setIsChanged(true)
        setEntryText(data.entry_text);
        setAiText(data.ai_response_text);
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  return (
    <div className='h-full w-full flex items-center justify-center'>
      <div className="h-fit bg-[#071226] text-white p-20">
        <div className="max-w-6xl mx-auto flex gap-6">
          
          {/* Left column: calendar */}
          <aside className="w-72 shrink-0">
            <button
              onClick={() => navigate("/diary/add")}
              className="w-full bg-white text-black rounded-md py-2 px-3 mb-6 transition-transform transform hover:scale-102 active:scale-98 hover:shadow-md"
            >
              + Add Log
            </button>
            <Calendar onDateSelect={handleDateSelect} selectedDate={selectedDate} />
          </aside>

          {/* Right column: diary entries */}
          <div className="flex-1 w-[700px]">
            <div className="diary-card border rounded-lg p-6 h-full" style={{ background: 'rgba(9,16,28,0.7)', borderColor: 'rgba(255,255,255,0.12)' }}>
              <div className="flex justify-between items-start mb-4">
                <div className="text-sm text-gray-300">
                  {selectedDate
                    ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'long' })
                    : 'No date selected'}
                </div>
              </div>

              <div className="prose prose-invert text-left max-w-none text-gray-200 mb-6">
                <p>{isChanged ? entryText : log}</p>
              </div>

              <div className="mt-6 flex items-start gap-3">
                <div className='text-left'>
                  <div className='flex w-7 h-7 items-center space-x-2'>
                    <img src={startLogo} alt="Bot Avatar" />
                    <div className="text-sm text-gray-300">Fuze</div> 
                  </div>
                  <p className="text-sm text-gray-300 max-w-2xl">
                    {isChanged ? aiText : response}
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
