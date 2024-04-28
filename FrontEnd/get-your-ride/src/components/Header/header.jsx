import logo from "../../assets/svg/logo.svg";
import userIcon from "../../assets/svg/user.svg";
import notificationIcon from "../../assets/svg/notification.svg";
import mapIcon from '../../assets/svg/map-icon.svg';
import carSeatIcon from '../../assets/svg/car-seat.svg';
import shareLocationImage from '../../assets/images/share-location.png';

import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { SERVER_API_HOST } from "../Helper/config";
import Spinner from "../Helper/Spinner";

function Header() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({})
    const [userToken, setUserToken] = useState('')
    const [loading, setLoading] = useState(false)
    const [ridePendingRequest, setRidePendingRequest] = useState([])

    useEffect(() => {
        const userDetail = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token');

        if (!storedToken) navigate('/login')

        // if (!("Notification" in window)) {
        //     console.log("Browser does not support desktop notification");
        // } else {
        //     Notification.requestPermission();
        // }
        

        // socket.connect();
        // socket.on('notificationreceived',(data)=>{
        //     if(userDetail?._id == data?.userId){
        //         showNotification('You have a new ride request!')
        //         handleGetAllPendingRideRequests(storedToken)
        //     }
        // })
        // socket.on('riderequestupdates',(data)=>{
        //     console.log('riderequestupdates', data);
        //     if(userDetail?._id == data?.userId){
        //         showNotification(`You ride request ${data.Status} !`)
        //     }
        // })

        setUserInfo(JSON.parse(userDetail))
        setUserToken(storedToken)
        handleGetAllPendingRideRequests(storedToken)
    }, [])

    
    // const showNotification = (msg)=>{
    //     new Notification(msg)
    // }
    
    const handleGetAllPendingRideRequests = async (token) =>{
        const response = await fetch(`${SERVER_API_HOST}/ridesharing/provider`, {
            method: 'POST',
            body: JSON.stringify({Status:['Pending']}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization':token
            }
        });
        const result = await response.json()
        if(result.status == 'TokenExpired'){
            handleTokenExpired()
        } else {
            console.log('handleGetAllPendingRideRequests : ', result)
            setRidePendingRequest(result);
        }
    }

    const handleRideAccept = (e)=>{
        let id = e.currentTarget.dataset.id;
        handleRideRequestStatus(id, 'Payment Pending')
    }
    
    const handleRideCancel = (e)=>{
        let id = e.currentTarget.dataset.id;
        handleRideRequestStatus(id, 'Cancel By Provider');
    }


    const handleRideRequestStatus = async(id,Status)=>{
        setLoading(true)
        const response = await fetch(`${SERVER_API_HOST}/ridesharing/status/${id}`, {
            method: 'POST',
            body: JSON.stringify({Status}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization':userToken
            }
        });
        const result = await response.json()
        if(result.status == 'TokenExpired'){
            handleTokenExpired()
        } else {
            console.log('handleRideRequestStatus : ', result)
            // var request = ridePendingRequest.find((item) => item._id == id)
            // if(request){
            //     socket.emit('riderequestupdates', {
            //         userId: request.Seeker,
            //         Status
            //     })
            // }
            window.location.reload()
        }
    }

    const handleTokenExpired = ()=>{
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
    }

    const handleSignOut = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    const convertToTimeString = (seconds) =>{
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        let result = '';
        if (hours > 0) {
            result += `${hours}h `;
        }
        if (minutes > 0 || hours === 0) {
            result += `${minutes}m`;
        }
        
        return result;
    }

    const getPickupTime = (datetime, seconds) =>{
        let d = new Date(datetime);
        d.setSeconds(d.getSeconds() + seconds)
        return d.toLocaleString()
    }

    const currentPath = window.location.pathname

    const routesList = [
        {label:'Home',route:'/'},
        {label:'Rides',route:'/rides'},
        {label:'Ride Requests',route:'/riderequest'},
        {label:'Shared Rides',route:'/sharedrides'},
        {label:'Contact Us',route:'/contact'}
    ]

    const toggleProfileModal = ()=>{
        document.querySelector('#userDropdown').classList.toggle('hidden')
    }

    const toggleMenuBarModal = ()=>{
        document.querySelector('#mobile-menu-2').classList.toggle('hidden')
    }

    const toggleNotificationModal = ()=>{
        var temp = document.querySelector('#default-modal')

        if(temp.classList.contains('hidden')){
            temp.classList.remove('hidden')
            temp.style.display = 'flex';
        }else{
            temp.style.display = 'none';
            temp.classList.add('hidden')
        }
    }

    return (
        <div>
            <Spinner isLoading={loading} />
            <header>
                <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800 shadow">
                    <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                        <a href="/" className="flex items-center">
                            <img src={logo} className="mr-3 h-6 sm:h-9" alt="GetYourRide Logo" />
                            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">GetYourRide</span>
                        </a>
                        <div className="flex items-center lg:order-2 gap-4">
                            <button onClick={toggleNotificationModal} type="button" className="relative inline-flex items-center text-sm text-center text-white">
                                <img src={notificationIcon} className="mr-3 h-4 sm:h-6" />
                                <span className="sr-only">Notifications</span>
                                <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-orange-700 border-2 border-white rounded-full -top-1 -end-1 dark:border-gray-900">{ridePendingRequest.length}</div>
                            </button>
                            <div>
                                <img id="avatarButton" type="button" onClick={toggleProfileModal} className="w-7 h-7 rounded-full ring-2 ring-gray-300 dark:ring-gray-500 cursor-pointer shadow-sm hover:shadow" src={userIcon} alt="User dropdown" />
                                <div id="userDropdown" className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600" style={{position:'absolute', right:'50px'}}>
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
                            <button onClick={toggleMenuBarModal} type="button" className="inline-flex items-center p-1 ml-1 text-sm text-gray-800 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="mobile-menu-2" aria-expanded="false">
                                <span className="sr-only">Open main menu</span>
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
                                <svg className="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            </button>
                        </div>
                        <div className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
                            <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                                {
                                    routesList.map(item=>
                                        <li key={item.route}>
                                            <a href={item.route} className={` ${item.route == currentPath ? 'lg:bg-slate-100' : ''} block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-slate-100 lg:border-0 lg:hover:text-primary-700 lg:p-1 lg:rounded-md dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700`} aria-current="page">
                                                {item.label}
                                            </a>
                                        </li>
                                    )
                                }
                            </ul>
                        </div>

                    </div>
                </nav>
            </header>

            <div id="default-modal" style={{background:'#80808052'}} tabIndex="-1" aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                <div className="relative p-4 w-full max-w-2xl max-h-full">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <div className="flex items-center justify-between p-3 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Notifications
                                <p className='text-[12px] text-slate-600 text-center'>Stay updated with pending notifications.</p>
                            </h3>
                            <button onClick={toggleNotificationModal} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        <div className="p-2 md:p-5 space-y-4">
                            <div className={`p-2 h-[380px] ${ridePendingRequest.length != 0 ? 'overflow-y-scroll' : ''}`}>
                                {ridePendingRequest?.map((item) =>
                                    <div key={item._id}>
                                        <div data-popover-placement="right" className='relative items-center grid grid-cols-5 mt-3 mb-3 p-2 rounded-lg border-[1px] shadow-sm hover:shadow-md hover:cursor-pointer'>
                                            <div className='col-span-1 m-2 flex justify-center items-center'>
                                                <img className='w-[50px]' src={mapIcon} />
                                            </div>
                                            <div className='col-span-4'>
                                                <p className='mt-1 text-[15px]'>{item.Pickup.text} To {item.DropOff.text}</p>
                                                <p className='mt-1 text-[12px] text-gray-600'>• {item.Ride.Source.text} To {item.Ride.Destination.text}</p>
                                                <p className='flex items-center mt-1 text-[12px] text-gray-600'>
                                                    ${item.Ride.ChargePerMile} Per/Mile, {convertToTimeString(item.Duration)}, {parseInt(item.Distance / 1000)}Km,
                                                    <img src={carSeatIcon} width={20} />
                                                    {item.Ride.AvailableSeat}x Available
                                                </p>
                                                <p className='mt-1 text-[12px] text-gray-600'>Pickup: {getPickupTime(item.Ride.StartDateTime, item.Duration)}</p>
                                                <div className='flex flex-wrap items-center mt-2 gap-2'>
                                                    <p className='bg-green-100 inline-block text-[14px] rounded px-2.5 py-0.5'>Pending</p>
                                                    <button data-id={item._id} className='bg-green-100 hover:bg-green-500 hover:text-white inline-block text-[14px] rounded px-2.5 py-0.5' onClick={handleRideAccept}>Accept</button>
                                                    <button data-id={item._id} className='bg-red-400 hover:bg-red-700 text-white inline-block text-[14px] rounded px-2.5 py-0.5' onClick={handleRideCancel}>Cancel</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {
                                    ridePendingRequest.length == 0 &&
                                    <div className={`w-full flex flex-col px-3 py-10 items-center justify-center`}>
                                        <img src={shareLocationImage} width={250} className="opacity-65"/>
                                        <p className='mt-3 font-semibold text-[13px]'>Oops! No pending ride requests. Keep cruising!</p>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header