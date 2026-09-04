import { useParams, Navigate } from 'react-router-dom';

export const Watch = () => {
  const { id } = useParams();

  // Redirect to the movie detail page where the player is now integrated
  if (id) {
    return <Navigate to={`/phim/${id}`} replace />;
  }

  return <Navigate to="/" replace />;
};
