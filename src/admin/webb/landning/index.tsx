import { Routes, Route } from 'react-router-dom';
import LandningList from './LandningList';
import LandningEditor from './LandningEditor';

export default function LandningMain() {
  return (
    <Routes>
      <Route index element={<LandningList />} />
      <Route path=":slug" element={<LandningEditor />} />
    </Routes>
  );
}
