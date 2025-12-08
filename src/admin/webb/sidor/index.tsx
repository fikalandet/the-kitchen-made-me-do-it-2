import { Routes, Route, Navigate } from 'react-router-dom';
import SidorList from './SidorList';
import StaticPageEditor from './StaticPageEditor';

export default function SidorMain() {
  return (
    <Routes>
      <Route index element={<SidorList />} />
      <Route path=":pageSlug" element={<StaticPageEditor />} />
    </Routes>
  );
}
