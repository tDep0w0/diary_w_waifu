import { createContext, useState } from "react";

const LogContext = createContext();

export const LogProvider = ({ children }) => {
  const [log, setLog] = useState("");

  const contextValue = { log, setLog };

  return (
    <LogContext.Provider value={contextValue}>
      {children}
    </LogContext.Provider>
  )
};

export default LogContext
