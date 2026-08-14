import "../styles/wobl-tokens.css";
import { ToastProvider } from "../components/shared/Toast";
import { SupabaseProvider } from "shared/lib/SupabaseContext";
import { SearchProvider } from "../context/SearchContext";
import SearchOverlay from "../components/shared/SearchOverlay";
import ErrorBoundary from "../components/shared/ErrorBoundary";

export default function App({ Component, pageProps }) {
  return (
    <SupabaseProvider>
      <ToastProvider>
        <SearchProvider>
          <ErrorBoundary>
            <Component {...pageProps} />
          </ErrorBoundary>
          <SearchOverlay />
        </SearchProvider>
      </ToastProvider>
    </SupabaseProvider>
  );
}
