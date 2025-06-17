import { createBrowserRouter } from 'react-router-dom';
import Layout from '../layouts/Layout';
import { menu } from '../configs/menu';
import { generateRoutesFromMenu } from './ListRoutes';


const filteredRoutes = generateRoutesFromMenu(menu);
console.log("filteredroutes",filteredRoutes)
export const routeConfig = [
  {
    path: '/',
    element: <Layout />,
    children: filteredRoutes,
  },
];

export const router = createBrowserRouter(routeConfig);
