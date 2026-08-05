import './App.css'
import { RouterProvider } from 'react-router-dom';
import root from './router/root'
import './css/style.css'

function App() {
  return (
    <>
      <RouterProvider router={root} />
    </>
  )
}

export default App;
