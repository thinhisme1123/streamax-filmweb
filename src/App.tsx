import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { MovieDetails } from './pages/MovieDetails';
import { Search } from './pages/Search';
import { Auth } from './pages/Auth';
import { MyList } from './pages/MyList';
import { Watch } from './pages/Watch';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/watch/:id" element={<Watch />} />
        
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/phim/:id" element={<MovieDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/mylist" element={<MyList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
