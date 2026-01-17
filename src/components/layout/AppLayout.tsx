import { ReactNode, useState } from 'react';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { SideDrawer } from './SideDrawer';

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
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {showHeader && (
        <AppHeader 
          showSearch={showSearch} 
          onMenuClick={() => setDrawerOpen(true)}
        />
      )}
      <main className={showNav ? 'pb-nav' : ''}>{children}</main>
      {showNav && <BottomNav />}
      <SideDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
};
