import { createContext, useContext } from 'react';

export const RunContext = createContext<(cmd: string) => void>(() => {});
export const useTerminalRun = () => useContext(RunContext);
