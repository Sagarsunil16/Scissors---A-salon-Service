import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AppRoutes from './routes/AppRoutes';
export default function App() {
  

  return (
    <Router>
      <ToastContainer position="top-center" autoClose={3000} />
      <AppRoutes/>
    </Router>
  );
}
