import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PipelinePage from './pages/PipelinePage';
import OpportunityDetailPage from './pages/OpportunityDetailPage';
import AdminPage from './pages/AdminPage';
import OpportunityFormPage from './pages/OpportunityFormPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<PipelinePage />} />
          <Route path="/oportunidade/:id" element={<OpportunityDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/nova" element={<OpportunityFormPage />} />
          <Route path="/admin/editar/:id" element={<OpportunityFormPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
