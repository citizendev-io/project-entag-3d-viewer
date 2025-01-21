import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Viewer from './pages/viewer'
import Home from './pages'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/viewer' element={<Viewer />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App