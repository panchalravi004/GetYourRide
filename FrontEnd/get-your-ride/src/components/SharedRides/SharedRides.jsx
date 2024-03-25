import userBrowsingImage from '../../assets/images/user-browsing.png';
import mapIcon from '../../assets/svg/multiple-location.svg';
import carSeatIcon from '../../assets/svg/car-seat.svg';

import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';

import { SERVER_API_HOST } from '../Helper/config';
import ScrollViewTop from '../Helper/scrollViewTop';
import GoogleMapSection from '../Home/others/GoogleMapSection';

function SharedRides({ onspinner }) {
    const [userToken, setUserToken] = useState('')
    const [rideRequest, setRideRequest] = useState([])
    const [selectedRequest, setSelectedRequest] = useState({})


    const [maps, setMaps] = useState({});

    useEffect(() => {
        onspinner(false);
        const token = localStorage.getItem('token')
        setUserToken(token)
        handleGetAllRideRequests(token)
    }, []);

    const mapIsReadyCallback =({name, map, directions})=>{
        console.log("Map Loaded... ", name);
        setMaps(prevMaps => ({ ...prevMaps, [name]: {map, directions}}));
    }

    const handleAddWayPointInMap = (name, lon, lat)=>{
        if(maps[name]?.directions){
            maps[name]?.directions.addWaypoint([lon, lat]);
        }
    }

    const handleRemoveWayPointInMap = (name, index)=>{
        if(maps[name]?.directions){
            maps[name]?.directions.removeWaypoint(index);
        }
    }

    const handleClearDirectionInMap = (name)=>{
        if(maps[name]?.directions){
            maps[name]?.directions.clear();
        }
    }

    const handleMapScreenFlyTo = (name, features)=>{
        if(maps[name]?.map){
            maps[name]?.map.flyTo({...features})
        }
    }
    
    const onmapclick = ({name, e})=>{
        console.log("Map Click ", name, e);
    }

    const handleGetAllRideRequests = async (token) =>{
        onspinner(true);
        const response = await fetch(`${SERVER_API_HOST}/ridesharing/provider`, {
            method: 'POST',
            body: JSON.stringify({
                Status:[
                    'Cancel By Seeker', 'Payment Pending',
                    'Not Pickup','Pickup','Dropped'
                ]
            }),
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

    const handleViewMapModal = (e) => {
        var data = rideRequest.find((item)=> item._id == e.currentTarget.dataset.id)
        if(data){
            onspinner(true)
            setSelectedRequest(data)
            handleClearDirectionInMap('rideRequestMap')

            var mainSource = {...data.Ride.Source.cord};
            var mainDestination = {...data.Ride.Destination.cord};
            
            var subSource = {...data.Pickup.cord};
            var subDestination = {...data.DropOff.cord};

            handleAddWayPointInMap('rideRequestMap', mainSource.lon, mainSource.lat)
            handleAddWayPointInMap('rideRequestMap', subSource.lon, subSource.lat)
            handleAddWayPointInMap('rideRequestMap', subDestination.lon, subDestination.lat)
            handleAddWayPointInMap('rideRequestMap', mainDestination.lon, mainDestination.lat)

            handleMapScreenFlyTo('rideRequestMap',{
                center: [mainSource.lon, mainSource.lat],
                zoom: 7,
                speed: 0.5,
                curve: 3,
                easing(t) {
                    return t;
                }
            })

            setTimeout(() => {
                onspinner(false);
                var a = document.querySelector('#ride-request-modal');
                a.classList.remove('hidden')
                a.classList.add('flex')
            }, 2000);
        }
    }

    const handleCloseViewMapModal = () => {
        var a = document.querySelector('#ride-request-modal');
        a.classList.add('hidden')
        a.classList.remove('flex')

        handleClearDirectionInMap('rideRequestMap')
        setSelectedRequest({})
    }

    return (
        <div>
            <ScrollViewTop />
            <ToastContainer />
            <div className='grid grid-cols-1 md:grid-cols-4'>
                <div className='col-span-1'></div>
                <div className='col-span-2 p-2 min-h-[500px]'>
                    <p className='mx-1 mb-3 text-[16px] font-bold border-[2px] shadow-sm rounded-md py-1 px-3'>
                        Shared Rides({rideRequest.length}) <br />
                        <span className='text-[12px] font-normal'>
                            View and manage your shared ride requests.
                        </span>
                    </p>
                    <div className='border-[2px] shadow-sm rounded-md py-1 px-3 m-1 max-h-[450px] overflow-y-scroll'>
                        {rideRequest?.map((item) =>
                            <div key={item._id}>
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
                                            <button data-id={item._id} onClick={handleViewMapModal} className='bg-green-100 hover:bg-green-500 hover:text-white inline-block text-[14px] rounded px-2.5 py-0.5'>View Map</button>
                                            {
                                                ['Payment Pending','Not Pickup'].includes(item.Status) &&
                                                <button className='bg-blue-100 hover:bg-blue-500 hover:text-white inline-block text-[14px] rounded px-2.5 py-0.5'>Chat</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {
                            rideRequest.length == 0 &&
                            <div className={`w-full flex flex-col px-3 py-10 items-center justify-center`}>
                                <img src={userBrowsingImage} width={250} />
                                <p className='mt-3 font-semibold text-[13px]'>Currently, no ride requests found. Stay tuned!</p>
                            </div>
                        }
                    </div>
                </div>
                <div className='col-span-1'></div>
            </div>

            <div id='ride-request-modal' style={{background: '#2a2a2a70'}} className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-full max-h-full" >
                <div className="relative p-4 w-full max-w-2xl max-h-full">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {selectedRequest.Pickup?.text} To {selectedRequest.DropOff?.text}
                                <p className='text-[12px] text-slate-600 text-start'>{selectedRequest.Ride?.Source?.text} To {selectedRequest.Ride?.Destination?.text}</p>
                                <p className='text-[12px] text-slate-600 text-start'>Pickup: {getPickupTime(selectedRequest.Ride?.StartDateTime, selectedRequest.Duration)}</p>
                            </h3>
                            <button onClick={handleCloseViewMapModal} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                            
                        </div>
                        <div className="p-4 md:p-5 space-y-4 ">
                            <div className='md:h-[300px] h-[350px] shadow-md rounded-md overflow-hidden'>
                                <GoogleMapSection name={'rideRequestMap'} mapIsReadyCallback={mapIsReadyCallback} onmapclick={onmapclick}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SharedRides