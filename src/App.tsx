import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResumePage from './pages/ResumePage';
import TerminalPage from './pages/TerminalPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/terminal" element={<TerminalPage />} />
      <Route path="/resume" element={<ResumePage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
