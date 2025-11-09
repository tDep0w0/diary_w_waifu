import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import AIResContext from '../context/AIResContext';

export default function AddLogPage() {
  const navigate = useNavigate();
  const [logText, setLogText] = useState('');
  const { setResponse } = useContext(AIResContext)

  const handleSave = async () => {
    console.log('Saved log:', logText);
    navigate("/diary")
    try {
      const response = await fetch('http://127.0.0.1:8000/api/add_and_comment_entry/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entry_text: logText }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let streamedContent = "";
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        let chunk = decoder.decode(value, { stream: true });
        streamedContent += chunk;
        setResponse(streamedContent);
      }
    } catch (error) {
      console.error(error);
    }
    setLogText('');
    alert('Log saved!');
    navigate('/diary', {
      state: {
        logText,
        date: formattedDate,
      },
    });
  };

  // Tạo ngày hiện tại theo định dạng "Friday, 13 September 2025"
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen  text-white flex flex-col justify-between p-6">

      <div className="mt-5">
        <h2 className="text-lg mb-5 text-center">{formattedDate}</h2>

        <textarea
          className="w-full h-[70vh] p-4 text-white bg-[#071226] rounded-md resize-none"
          placeholder="Write your log here..."
          value={logText}
          onChange={(e) => setLogText(e.target.value)}
        />

      </div>

      <div className="relative">
        <div className="absolute bottom-7 left-0 right-0 flex justify-between px-6">

          <button
            className="bg-white text-black rounded-md py-2 px-4 w-26 transition-transform transform hover:scale-102 active:scale-98"
            onClick={() => navigate(-1)}
          >
            ← Return
          </button>

          <button
            className="bg-white text-black rounded-md py-2 px-4 w-26 transition-transform transform hover:scale-102 active:scale-98"
            onClick={handleSave}
          >
            Done
          </button>

        </div>
      </div>

    </div>
  );
}
