import React from 'react'
import { NavLink } from 'react-router-dom';

function Footer(props) {
  // const excludedRoutes = ['/login', '/sign-up', '/'];
  // const pathname = window.location.pathname;
  // if(excludedRoutes.includes(pathname)) return '';
  
  return (
    <div>
      <footer className=" bg-white mb-0 dark:bg-gray-800">
          <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
            <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2023 <a className="hover:underline">GetYourRide™</a> All Rights Reserved.
          </span>
          <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
              <li>
                  <NavLink to="/" className="hover:underline me-4 md:me-6">Privacy Policy</NavLink>
              </li>
              <li>
                  <NavLink to="/contact" className="hover:underline">Contact Us</NavLink>
              </li>
          </ul>
          </div>
      </footer>

    </div>
  )
}

export default Footer