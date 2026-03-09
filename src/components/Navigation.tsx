import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import '../styles/Navigation.css';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = '' }: NavigationProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/strategies', label: 'Strategies' },
    { path: '/optimizer', label: 'Optimizer' },
  ];

  return (
    <nav className={`navigation ${className}`}>
      <div className="navigation__container">
        <div className="navigation__links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`navigation__link ${
                location.pathname === item.path ? 'navigation__link--active' : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="navigation__actions">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
