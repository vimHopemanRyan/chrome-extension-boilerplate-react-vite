import '@src/Popup.css';
import { useCleanData } from '../hooks/useCleanData';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';

const Popup = () => {
  const { cleanData } = useCleanData();

  const onClick = async () => {
    await cleanData();
  };

  return (
    <div className="App">
      <button className={`logout-button`} onClick={onClick} disabled={false}>
        <span className="liquid-blob liquid-blob-1"></span>
        <span className="liquid-blob liquid-blob-2"></span>
        <span className="liquid-blob liquid-blob-3"></span>
        <span className="button-content">
          <span className="button-text">Logout Console</span>
          <span className="button-icon">🚀</span>
        </span>
        <span className="button-shine"></span>
        <span className="glass-reflection"></span>
      </button>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
