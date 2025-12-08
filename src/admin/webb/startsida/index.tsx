import { Routes, Route } from 'react-router-dom';
import StartsidaOverview from './StartsidaOverview';
import Ordning from './Ordning';
import Sektioner from './Sektioner';
import SektionEditor from './SektionEditor';

export default function StartsidaMain() {
  return (
    <Routes>
      <Route index element={<StartsidaOverview />} />
      <Route path="ordning" element={<Ordning />} />
      <Route path="sektioner" element={<Sektioner />} />
      <Route path="sektioner/:sectionSlug" element={<SektionEditor />} />
    </Routes>
  );
}
