import { Suspense } from 'react';

const generateRoutes = (menu) => {
  return menu.map((item) => {
    return {
      path: item.path,
      element: item.component ? (
        <Suspense fallback={<div>Loading...</div>}>
          <item.component />
        </Suspense>
      ) : null,
    };
  });
};

export const generateRoutesFromMenu = (filteredMenu) => {
  return generateRoutes(filteredMenu);
};
