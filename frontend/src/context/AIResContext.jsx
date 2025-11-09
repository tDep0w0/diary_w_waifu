import { createContext, useState } from "react";

const AIResContext = createContext();

export const AIResProvider = ({ children }) => {
  const [response, setResponse] = useState("");

  const contextValue = { response, setResponse };

  return (
    <AIResContext.Provider value={contextValue}>
      {children}
    </AIResContext.Provider>
  )
};

export default AIResContext
