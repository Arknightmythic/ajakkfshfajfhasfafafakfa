import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

const generateRoutes = (menu) => {
  return menu.map((item) => {
    return {
      path: item.path,
      element: item.component ? (
        <Suspense 
          fallback={
          <div className='text-center mt-10'>
            <Loader2 className='animate-spin w-8 h-8 mx-auto mb-4 text-blue-600' />
            <p className='text-gray-600'>Loading...</p>
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
