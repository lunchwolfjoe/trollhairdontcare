import { ReactNode } from 'react';
import Navigation from './Navigation';
import ConnectionTester from '../common/ConnectionTester';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <ConnectionTester />
    </div>
  );
};

export default Layout; 