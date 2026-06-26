import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar/NavBar';
import { Footer } from './Footer/Footer';

export const PageLayout = () => {
  return (
    <div className="app">
      <NavBar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
