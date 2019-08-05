import React from 'react';
import routes from './router/config'
import RouteWithSubRoutes from './router'
import { BrowserRouter as Router, Link} from "react-router-dom"

import './App.css'
function App() {
  return (
    <Router>
      <div className="button-box">
        {routes.map((route, index) => (
          <Link to={route.path} key={index}>
            <button>{route.path}</button>
          </Link>
        ))}
      </div>
      <div className="detail-box">
        {routes.map((route, index) => <RouteWithSubRoutes key={index} { ...route } />)}
      </div>
    </Router>
  )
}

export default App;
