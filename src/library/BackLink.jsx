import { Link } from 'react-router-dom';

export function BackLink({ to = '/', label = 'Library' }) {
  return (
    <Link to={to} className="back-link">
      <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
      {label}
    </Link>
  );
}
