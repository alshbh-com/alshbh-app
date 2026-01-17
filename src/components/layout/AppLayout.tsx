import { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  showSearch?: boolean;
}

export const AppLayout = ({
  children,
  showHeader = true,
  showNav = true,
  showSearch = true,
}: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <AppHeader showSearch={showSearch} />}
      <main className={showNav ? 'pb-nav' : ''}>{children}</main>
      {showNav && <BottomNav />}
    </div>
  );
};