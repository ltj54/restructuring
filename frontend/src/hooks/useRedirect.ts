import { useLocation } from 'react-router-dom';

export function useRedirect() {
  const location = useLocation();

  return encodeURIComponent(location.pathname + location.search + location.hash);
}
