import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div style={{ padding: '2rem' }}>Shared Expenses App</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
