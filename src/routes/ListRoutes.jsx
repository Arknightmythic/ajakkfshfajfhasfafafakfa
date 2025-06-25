import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

const generateRoutes = (menu) => {
  return menu.map((item) => {
    return {
      path: item.path,
      element: item.component ? (
        <Suspense 
          fallback={
            <div className='p-6 flex items-center justify-center min-h-[400px]'>
              <div className='text-center'>
                <Loader2 className='animate-spin w-8 h-8 mx-auto mb-4 text-blue-600' />
                <p className='text-gray-600'>Loading...</p>
              </div>
            </div>
        }>
          <item.component />
        </Suspense>
      ) : null,
    };
  });
};

export const generateRoutesFromMenu = (filteredMenu) => {
  return generateRoutes(filteredMenu);
};
