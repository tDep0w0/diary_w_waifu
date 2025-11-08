import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function AddLogPage() {
  const navigate = useNavigate();
  const [logText, setLogText] = useState('');

  const handleSave = () => {
    console.log('Saved log:', logText);
    setLogText('');
    alert('Log saved!');
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

      <div>
        <h2 className="text-lg mb-5">{formattedDate}</h2>

        <textarea
          className="w-full h-[70vh] p-4 text-white bg-[#071226] rounded-md resize-none"
          placeholder="Write your log here..."
          value={logText}
          onChange={(e) => setLogText(e.target.value)}
        />
      </div>

      <div className="relative">
      <div className="absolute bottom-12 left-0 right-0 flex justify-between px-6">
          <button className="bg-white text-black rounded-md py-2 px-4" onClick={() => navigate(-1)}>
            ← Return
          </button>

          <button className="bg-white text-black rounded-md py-2 px-4" onClick={handleSave}>
            Done
          </button>
        </div>
      </div>

    </div>
  );
}
