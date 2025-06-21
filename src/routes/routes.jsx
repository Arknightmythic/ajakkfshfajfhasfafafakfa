import { createBrowserRouter } from 'react-router-dom';
import Layout from '../layouts/Layout';
import { menu } from '../configs/menu';
import { generateRoutesFromMenu } from './ListRoutes';
import PreviewPage from '../pages/BatchSynchronization/components/PreviewPage';
import InvestigatePage from '../pages/BatchSynchronization/components/InvestigatePage';

const filteredRoutes = generateRoutesFromMenu(menu);

export const routeConfig = [
  {
    path: '/',
    element: <Layout />,
    children: [
      ...filteredRoutes,
      {
        path: 'batch-synchronization/preview',
        element: <PreviewPage />,
      },
      {
        path: 'batch-synchronization/investigate',
        element: <InvestigatePage />,
      },
    ],
  },
];

export const router = createBrowserRouter(routeConfig);
