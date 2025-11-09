import { createContext, useState } from "react";

const DateContext = createContext();

export const DateProvider = ({ children }) => {
  const [DATE, setDate] = useState("");

  const contextValue = { DATE, setDate };

  return (
    <DateContext.Provider value={contextValue}>
      {children}
    </DateContext.Provider>
  )
};

export default DateContext
