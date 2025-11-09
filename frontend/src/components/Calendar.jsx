import { useState, useEffect } from "react";

export default function Calendar({ onDateSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());


  // Key arrow event
  useEffect(() => {
      const handleKeyDown = (e) => {
      if (!selectedDate) return;

      if (e.key === "ArrowLeft") {
        moveSelectedDate(-1);
      } else if (e.key === "ArrowRight") {
        moveSelectedDate(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDate, currentDate]);

  const today = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day) => {
    const newDate = new Date(year, month, day);
    setSelectedDate(newDate);
    if (onDateSelect) {
      onDateSelect(newDate); // Gửi ngày đã chọn lên DiaryPage
    }
  };

  const moveSelectedDate = (offset) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + offset);

    if (
      newDate.getMonth() !== currentDate.getMonth() ||
      newDate.getFullYear() !== currentDate.getFullYear()
    ) {
      setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    }

    setSelectedDate(newDate);
  };


  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;

      const isToday =
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year;

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`w-10 h-10 flex items-center justify-center rounded-full border ${
            isSelected ? "bg-blue-600 text-white" : "hover:bg-white hover:text-black"
          } ${isToday ? "border-red-500" : "border-transparent"}`}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  return (
    <aside className="w-72 shrink-0">
      <div className="text-center text-sm text-gray-300 mb-4">
        <button className="px-2" onClick={handlePrevMonth}>
          &lt;
        </button>
        <span className="mx-3">
          {monthNames[month]} {year}
        </span>
        <button className="px-2" onClick={handleNextMonth}>
          &gt;
        </button>
      </div>
      <div className="calendar-grid bg-transparent text-gray-300">
        <div className="grid grid-cols-7 gap-2 text-xs text-center mb-2">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 text-sm">{renderDays()}</div>
      </div>
    </aside>
  );
}
