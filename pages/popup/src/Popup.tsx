import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import '@src/Popup.css';

const Popup = () => {
  const { isLight } = useStorage(exampleThemeStorage);

  return (
    <div className={cn('App', isLight ? 'bg-slate-50' : 'bg-gray-800')}>
      <header className={cn('App-header', isLight ? 'text-gray-900' : 'text-gray-100')}>
        <h1 className="text-lg font-semibold">Freedium Redirect</h1>
        <p className={cn('mt-2 max-w-[18rem] text-sm', isLight ? 'text-gray-600' : 'text-gray-300')}>
          Freedium buttons appear directly on Medium articles to open or redirect the story in one click.
        </p>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
