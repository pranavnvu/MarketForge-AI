// ============================================
// DevForge AI — Root Layout
// ============================================

import { Outlet } from 'react-router-dom';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Outlet />
    </div>
  );
}
