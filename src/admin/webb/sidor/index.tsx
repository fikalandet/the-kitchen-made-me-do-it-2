import { Routes, Route, Navigate } from 'react-router-dom';
import SidorList from './SidorList';
import StaticPageEditor from './StaticPageEditor';
import AboutUsEditor from './AboutUsEditor';
import ContactUsEditor from './ContactUsEditor';
import FAQEditor from './FAQEditor';

export default function SidorMain() {
  return (
    <Routes>
      <Route index element={<SidorList />} />
      <Route path="om-oss-editor" element={<AboutUsEditor />} />
      <Route path="kontakta-oss-editor" element={<ContactUsEditor />} />
      <Route path="faq-editor" element={<FAQEditor />} />
      <Route path=":pageSlug" element={<StaticPageEditor />} />
    </Routes>
  );
}
