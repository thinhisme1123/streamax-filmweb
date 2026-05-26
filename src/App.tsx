import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { MovieDetails } from './pages/MovieDetails';
import { Search } from './pages/Search';
import { MovieListPage } from './pages/MovieListPage';
import { Auth } from './pages/Auth';
import { MyList } from './pages/MyList';
import { Watch } from './pages/Watch';
import { WatchRoom } from './pages/WatchRoom';
import { WatchMovie } from './pages/WatchMovie';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Profile } from './pages/Profile';
import { ActorPage } from './pages/ActorPage';

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
        <Route path="/xem-phim/:movieSlug/:episodeSlug" element={<WatchMovie />} />
        <Route path="/watch-party/:roomId" element={<WatchRoom />} />
        
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/phim/:movieSlug" element={<MovieDetails />} />
          <Route path="/xem-phim/:movieSlug/:episodeSlug" element={<WatchMovie />} />
          <Route path="/search" element={<Search />} />
          <Route path="/danh-sach/:type" element={<MovieListPage />} />
          <Route path="/category/:slug" element={<MovieListPage />} />
          <Route path="/the-loai/:slug" element={<MovieListPage />} />
          <Route path="/country/:slug" element={<MovieListPage />} />
          <Route path="/quoc-gia/:slug" element={<MovieListPage />} />
          <Route path="/nam/:year" element={<MovieListPage />} />
          <Route path="/dien-vien/:actorName" element={<ActorPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/mylist" element={<MyList />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
