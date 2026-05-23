import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { MovieDetails } from './pages/MovieDetails';
import { Search } from './pages/Search';
import { CategoryPage } from './pages/CategoryPage';
import { Auth } from './pages/Auth';
import { MyList } from './pages/MyList';
import { Watch } from './pages/Watch';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/watch/:id" element={<Watch />} />
        
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/phim/:id" element={<MovieDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/country/:slug" element={<CategoryPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/mylist" element={<MyList />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
