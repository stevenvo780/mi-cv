import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@/styles/globals.css';
import '@/styles/brand.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import CustomNavbar from '@/app/components/Navbar';
import { SearchProvider } from '@/app/components/SearchContext';

config.autoAddCss = false;

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <CustomNavbar />
      {children}
    </SearchProvider>
  );
}
