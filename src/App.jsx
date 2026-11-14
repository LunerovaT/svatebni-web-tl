import ErrorBoundary from "./ErrorBoundary.jsx";
import WeddingSite from "./WeddingSite.jsx";

export default function App() {
  return (
    <ErrorBoundary>
      <WeddingSite />
    </ErrorBoundary>
  );
}
