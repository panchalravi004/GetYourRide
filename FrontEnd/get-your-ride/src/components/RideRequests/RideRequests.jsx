import userBrowsingImage from '../../assets/images/user-browsing.png';
import mapIcon from '../../assets/svg/map-icon.svg';
import carSeatIcon from '../../assets/svg/car-seat.svg';

import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';

import ScrollViewTop from '../Helper/scrollViewTop'
import { SERVER_API_HOST } from '../Helper/config';

function RideRequests({ onspinner }) {
    const [userToken, setUserToken] = useState('')
    const [rideRequest, setRideRequest] = useState([])

    useEffect(() => {
        onspinner(false);
        const token = localStorage.getItem('token')
        setUserToken(token)
        handleGetAllRideRequests(token)
    }, []);

    const handleGetAllRideRequests = async (token) =>{
        onspinner(true);
        const response = await fetch(`${SERVER_API_HOST}/ridesharing/seeker`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':token
            }
        });
        const result = await response.json()
        if(result.status == 'TokenExpired'){
            handleTokenExpired()
            onspinner(false);
        } else {
            console.log('handleGetAllRideRequests : ', result)
            setRideRequest(result);
            onspinner(false);
        }
    }

    const handleTokenExpired = ()=>{
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
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

    return (
        <div>
            <ScrollViewTop />
            <ToastContainer />
            <div className='grid grid-cols-1 md:grid-cols-4'>
                <div className='col-span-1'></div>
                <div className='col-span-2 p-2 min-h-[500px]'>
                    <p className='mx-1 mb-3 text-[16px] font-bold border-[2px] shadow-sm rounded-md py-1 px-3'>
                        Your Ride Request({rideRequest.length}) <br />
                        <span className='text-[12px] font-normal'>
                            View and manage your ride requests with pending requests.
                        </span>
                    </p>
                    <div className='border-[2px] shadow-sm rounded-md py-1 px-3 m-1 max-h-[450px] overflow-y-scroll'>
                        {rideRequest?.map((item) =>
                            <div key={item}>
                                <div data-popover-placement="right" className='relative items-center grid grid-cols-4 mt-3 mb-3 p-2 rounded-lg border-[1px] shadow-sm hover:shadow-md hover:cursor-pointer'>
                                    <div className='col-span-1 m-2 flex justify-center items-center'>
                                        <img className='w-[50px]' src={mapIcon} />
                                    </div>
                                    <div className='col-span-3'>
                                        <p className='mt-1 text-[15px]'>{item.Pickup.text} To {item.DropOff.text}</p>
                                        <p className='mt-1 text-[12px] text-gray-600'>• {item.Ride.Source.text} To {item.Ride.Destination.text}</p>
                                        <p className='flex items-center mt-1 text-[12px] text-gray-600'>
                                            ${item.Ride.ChargePerMile} Per/Mile, {convertToTimeString(item.Duration)}, {parseInt(item.Distance / 1000)}Km,
                                            <img src={carSeatIcon} width={20} />
                                            {item.Ride.AvailableSeat}x Available
                                            
                                        </p>
                                        <p className='mt-1 text-[12px] text-gray-600'>Pickup: {getPickupTime(item.Ride.StartDateTime, item.Duration)}</p>
                                        <div className='flex flex-wrap items-center mt-2 gap-2'>
                                            <p className='bg-green-100 inline-block text-[14px] rounded px-2.5 py-0.5'>{item.Status}</p>
                                            <button className='bg-green-100 hover:bg-green-500 hover:text-white inline-block text-[14px] rounded px-2.5 py-0.5'>View Map</button>
                                            <button className='bg-blue-100 hover:bg-blue-500 hover:text-white inline-block text-[14px] rounded px-2.5 py-0.5'>Make Payment</button>
                                            <button className='bg-red-400 hover:bg-red-700 text-white inline-block text-[14px] rounded px-2.5 py-0.5'>Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {
                            rideRequest.length == 0 &&
                            <div className={`w-full flex flex-col px-3 py-10 items-center justify-center`}>
                                <img src={userBrowsingImage} width={250}/>
                                <p className='mt-3 font-semibold text-[13px]'>No Rides Request Found</p>
                            </div>
                        }
                    </div>
                </div>
                <div className='col-span-1'></div>
            </div>
        </div>
    )
}

export default RideRequests