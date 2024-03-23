import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import logo from "../../assets/svg/logo.svg";
import userIcon from "../../assets/svg/user.svg";
import notificationIcon from "../../assets/svg/notification.svg";

function Header() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({})
  useEffect(()=>{
    const userDetail = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token');
    console.log(userDetail);
    if(!storedToken){
      navigate('/login')
    }
    setUserInfo(JSON.parse(userDetail))
  },[])
  
  const handleSignOut = () =>{
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div>
      <header>
          <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800 shadow">
              <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                  <a href="/" className="flex items-center">
                      <img src={logo} className="mr-3 h-6 sm:h-9" alt="GetYourRide Logo" />
                      <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">GetYourRide</span>
                  </a>
                  <div className="flex items-center lg:order-2 gap-4">
                      <button type="button" className="relative inline-flex items-center text-sm text-center text-white">    
                        <img src={notificationIcon} className="mr-3 h-4 sm:h-6" />
                        <span className="sr-only">Notifications</span>
                        <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-orange-700 border-2 border-white rounded-full -top-1 -end-1 dark:border-gray-900">20</div>
                      </button>
                      <div>
                        <img id="avatarButton" type="button" data-dropdown-toggle="userDropdown" data-dropdown-placement="bottom-start" className="w-7 h-7 rounded-full ring-2 ring-gray-300 dark:ring-gray-500 cursor-pointer shadow-sm hover:shadow" src={userIcon} alt="User dropdown"/>
                        <div id="userDropdown" className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600">
                            <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              <div>{userInfo.firstName} {userInfo.lastName}</div>
                              <div className="font-medium truncate">{userInfo.email}</div>
                            </div>
                            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="avatarButton">
                              <li>
                                <a href="/profile" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Profile</a>
                              </li>
                            </ul>
                            <div className="py-1">
                              <a onClick={handleSignOut} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white cursor-pointer">Sign out</a>
                            </div>
                        </div>
                      </div>
                      <button data-collapse-toggle="mobile-menu-2" type="button" className="inline-flex items-center p-1 ml-1 text-sm text-gray-800 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="mobile-menu-2" aria-expanded="false">
                          <span className="sr-only">Open main menu</span>
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
                          <svg className="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                      </button>
                  </div>
                  <div className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
                      <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                          <li>
                              <a href="/" className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700" aria-current="page">
                                Home
                              </a>
                          </li>
                          <li>
                              <a href="/rides" className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">
                                Rides
                              </a>
                          </li>
                          <li>
                              <a href="/riderequest" className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">
                                Ride Requests
                              </a>
                          </li>
                          <li>
                              <a href="/sharedrides" className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">
                                Shared Rides
                              </a>
                          </li>
                          <li>
                              <a href="/contact" className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">
                                Contact Us
                              </a>
                          </li>
                      </ul>
                  </div>
                  
              </div>
          </nav>
      </header>

    </div>
  )
}

export default Header