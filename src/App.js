import React from 'react';
import routes from './router/config'
import RouteWithSubRoutes from './router'
import { BrowserRouter as Router} from "react-router-dom"
function App() {
  return (
    <Router>
      {routes.map((route, index) => <RouteWithSubRoutes key={index} { ...route } />)}
    </Router>
  )
}

export default App;
