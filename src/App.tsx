import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  // Trigger remount to clear HMR context mismatch
  return (
    <div className="h-full w-full">
      <RouterProvider router={router} />
    </div>
  );
}