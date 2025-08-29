import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Restaurants from './pages/Restaurants';
import Payments from './pages/Payments';
import Support from './pages/Support';

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}> */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="restaurants" element={<Restaurants />} />
          <Route path="payments" element={<Payments />} />
          <Route path="support" element={<Support />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
