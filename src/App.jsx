import { Suspense } from 'react';
import './App.css'
import { router } from './routes/routes';
import { RouterProvider } from 'react-router-dom';


function App() {

  return (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
        <RouterProvider router={router} />
    </Suspense>
  )
}

export default App
