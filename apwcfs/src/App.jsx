import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Science from './pages/Science';
import Dashboard from './pages/Dashboard';
import Policy from './pages/Policy';
import Roadmap from './pages/Roadmap';
import Validation from './pages/Validation';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/science" element={<Science />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/policy" element={<Policy />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/validation" element={<Validation />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
