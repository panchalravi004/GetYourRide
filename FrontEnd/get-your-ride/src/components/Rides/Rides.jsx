import 'react-toastify/dist/ReactToastify.css';
import carIcon from '../../assets/svg/car.svg';
import carSeatIcon from '../../assets/svg/car-seat.svg';
import userBrowsingImage from '../../assets/images/user-browsing.png';

import React, { useEffect, useState } from 'react'
import { GEOAPIFY_API_KEY, SERVER_API_HOST } from '../Helper/config';
import { GeoapifyContext, GeoapifyGeocoderAutocomplete } from '@geoapify/react-geocoder-autocomplete';
import { LngLat, Marker } from 'maplibre-gl';
import { ToastContainer, toast } from 'react-toastify';

import ScrollViewTop from '../Helper/scrollViewTop'
import GoogleMapSection from '../Home/others/GoogleMapSection'
import { Navigate } from 'react-router-dom';

function Rides({onspinner}) {
    const [userToken, setUserToken] = useState('')
    const [allRides, setAllRides] = useState([])

    const [route, setRoute] = useState([]);
    const [maps, setMaps] = useState({});
    
    const [selectedRoute, setSelectedRoute] = useState([]);
    const [selectedMarker, setSelectedMarker] = useState([]);
    const [formMarker, setFormMarker] = useState({});
    
    const [formData, setFormData] = useState({Source:'',Destination:'',SourceLocation:[],DestinationLocation:[]});

    useEffect(()=>{
        onspinner(false)
        const token = localStorage.getItem('token')
        setUserToken(token)
        handleGetAllRides(token)
    },[])
    
    const mapIsReadyCallback =({name, map, directions})=>{
        console.log("Map Loaded... ", name);
        setMaps(prevMaps => ({ ...prevMaps, [name]: {map, directions}}));
    }
    
    const handleAddMarkerInMap = (name, markname, lon, lat)=>{
        if(maps[name]?.map){
            var mark = new Marker().setLngLat(new LngLat(lon, lat)).addTo(maps[name].map);
            maps[name].map._render();
            setFormMarker(prevMarkers => ({ ...prevMarkers, [markname]: mark}));
        }
    }
    const handleRemoveMarkerInMap = (name, markname)=>{
        if(maps[name]?.map){
            if(formMarker[markname]){
                formMarker[markname].remove()
            }
        }
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

    const handleAddRideMapClick = ({name, e})=>{
        if (formData.Source == '' || formData.Destination == '') {
            var lat = e.lngLat.lat;
            var lng = e.lngLat.lng;

            fetch('https://api.geoapify.com/v1/geocode/reverse?lat='+lat+'&lon='+lng+'&apiKey='+GEOAPIFY_API_KEY, {
                method: 'GET',
            })
            .then((response) => response.json())
            .then((result) => {
                var placeName = result?.features[0]?.properties?.formatted;
                if (!formData.Source) {
                    console.log('=======formData.Source====',formData.Source);
                    // formData.Source = placeName
                    // formData.SourceLocation = [lng,lat]
                    
                    setFormData({...formData,Source: placeName, SourceLocation:[lng,lat]});
                    setSelectedRoute([...selectedRoute,[lng,lat]])
                    setSelectedMarker([...selectedMarker,[lng, lat]])
                    
                } else if (!formData.Destination) {
                    // formData.Destination = placeName
                    // formData.DestinationLocation = [lng,lat]
                    
                    setFormData({...formData,Destination: placeName, DestinationLocation:[lng,lat]});
                    setSelectedRoute([...selectedRoute,[lng,lat]])
                    setSelectedMarker([...selectedMarker,[lng, lat]])
                }
            })
            .catch((error) => console.error(error));
        }
    }

    const onPickupPlaceSelect = (value)=>{
        if(value){
            var placeName = value.properties.formatted;
            var lon = value.properties.lon;
            var lat = value.properties.lat;
            setFormData({...formData,Source: placeName, SourceLocation:[lon,lat]});
            // handleAddMarkerInMap('ridesAddRideMap','pickup',lon, lat)
            handleAddWayPointInMap('ridesAddRideMap', lon, lat)

            handleMapScreenFlyTo('ridesAddRideMap',{
                center: [lon, lat],
                zoom: 12,
                speed: 0.5,
                curve: 3,
                easing(t) {
                    return t;
                }
            })

        }else{
            setFormData({...formData,Source: '', SourceLocation:[]});
            handleRemoveWayPointInMap('ridesAddRideMap', 0)
        }
    }

    const onDropoffPlaceSelect = (value)=>{
        if(value){
            var placeName = value.properties.formatted;
            var lon = value.properties.lon;
            var lat = value.properties.lat;
            setFormData({...formData,Destination: placeName, DestinationLocation:[lon,lat]});
            // handleAddMarkerInMap('ridesAddRideMap','dropoff',lon, lat)
            handleAddWayPointInMap('ridesAddRideMap', lon, lat)

            handleMapScreenFlyTo('ridesAddRideMap',{
                center: [lon, lat],
                zoom: 12,
                speed: 0.5,
                curve: 3,
                easing(t) {
                    return t;
                }
            })
        }else{
            setFormData({...formData,Destination: '', DestinationLocation:[]});
            handleRemoveWayPointInMap('ridesAddRideMap', formData.SourceLocation.length == 0 ? 0 : 1)
        }
    }

    const handleInputChange = (e)=>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        })
    }

    // API Callout is from here

    const handleGetAllRides = async (token) =>{
        onspinner(true);
        const response = await fetch(`${SERVER_API_HOST}/ride`, {
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
            console.log('handleGetAllRides : ', result)
            setAllRides(result);
            onspinner(false);
        }
    }

    const handleFormSubmit = async (e)=>{
        e.preventDefault();
        if(validateSearchRide()){
            onspinner(true);

            const distanceFetchPromise = await fetch(`https://api.geoapify.com/v1/routing?waypoints=${formData.SourceLocation[1]},${formData.SourceLocation[0]}|${formData.DestinationLocation[1]},${formData.DestinationLocation[0]}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`, {
                method: "GET",
            });
            const distanceResult = await distanceFetchPromise.json();
            // console.log(distanceResult);
            if (distanceResult) {
                var Distance = distanceResult?.features[0]?.properties?.distance;
                var Duration = distanceResult?.features[0]?.properties?.time;
    
                console.log('handleFormSubmit formData',formData);
                const response = await fetch(`${SERVER_API_HOST}/ride`, {
                    method: 'POST',
                    body: JSON.stringify({...formData, Distance, Duration}),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization':userToken
                    }
                });
                // const result = await response.text();
                const result = await response.json()
                if (result.status == 'Success') {
                    toast.success(result.message)
                    setTimeout(() => {
                        onspinner(false);
                        window.location.reload();
                    }, 2000);
        
                } else {
                    if(result.status == 'TokenExpired'){
                        toast.warning('Your session is Expired!')
                        handleTokenExpired()
                    } 
                    onspinner(false);
                }
                console.log('handleFormSubmit : ', result)
            }
        }else{
            toast.warning('Please enter valid inputs!')
        }
    }

    const validateSearchRide = ()=>{

        if(formData.Source == '') return false
        if(formData.Destination == '') return false
        if(formData.SourceLocation == []) return false
        if(formData.DestinationLocation == []) return false
        return true
    }

    const handleRideClick = (e)=>{
        console.log('handleRideClick ', e.currentTarget.dataset.id)
        var ride = allRides.find((item)=> item._id == e.currentTarget.dataset.id)
        if(ride){
            console.log(ride);
            const sourceCord = ride.Source.cord;
            const destinationCord = ride.Destination.cord;

            handleClearDirectionInMap('ridesMainMap')

            handleMapScreenFlyTo('ridesMainMap',{
                center: [sourceCord.lon, sourceCord.lat],
                zoom: 10,
                speed: 0.5,
                curve: 3,
                easing(t) {
                    return t;
                }
            })

            handleAddWayPointInMap('ridesMainMap', sourceCord.lon, sourceCord.lat)
            handleAddWayPointInMap('ridesMainMap', destinationCord.lon, destinationCord.lat)
        }
    }

    const handleUpdateStatus = async (e)=>{
        var id = e.currentTarget.dataset.id;
        var Status = e.currentTarget.dataset.status;
        onspinner(true);
        const response = await fetch(`${SERVER_API_HOST}/ride/status/${id}`, {
            method: 'POST',
            body: JSON.stringify({Status}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization':userToken
            }
        });
        const result = await response.json()
        if (result.status == 'Success') {
            toast.success(result.message)
            setTimeout(() => {
                onspinner(false);
                window.location.reload();
            }, 2000);
        } else {
            if(result.status == 'TokenExpired'){
                handleTokenExpired()
            } 
            onspinner(false);
        }
        console.log('handleUpdateStatus : ', result)

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

    const toggleAddRideModal = ()=>{
        var temp = document.querySelector('#add-ride-modal')

        if(temp.classList.contains('hidden')){
            temp.classList.remove('hidden')
            temp.style.display = 'flex';
        }else{
            temp.style.display = 'none';
            temp.classList.add('hidden')
        }
    }

  return (
    <div >
        <ScrollViewTop/>
        <ToastContainer/>
        <div className='p-6 grid grid-cols-1 md:grid-cols-3 gap-5'>
            <div className='md:col-span-1 md:min-h-[500px]'>
                <p className='flex items-center justify-between font-bold'>
                    <span className='text-[16px]'>My Rides</span>
                    <button onClick={toggleAddRideModal} type='button' className='p-2 bg-black text-[12px] text-white rounded-lg hover:bg-gray-800' >Add Ride</button>
                </p>
                <p className='text-[12px] text-gray-600'>
                    Manage and create rides effortlessly.
                </p>
                <div className='p-2 shadow-sm mt-3 border-[2px] rounded-md'>
                    <p className='my-1 text-[16px] font-bold'>Available Rides({allRides.length})</p>
                    <div className={`max-h-[380px] ${allRides.length == 0 ? '' : 'overflow-y-scroll'}  pr-2`}>
                        {allRides?.map((item)=>
                            <div key={item._id}>

                                <div data-popover-placement="right" onClick={handleRideClick} data-id={item._id} className='relative items-center grid grid-cols-6 mt-3 mb-3 p-2 rounded-lg border-[1px] shadow-sm hover:shadow-md hover:cursor-pointer'>
                                    <div className='col-span-1 flex justify-center'>
                                        <img className=' w-[30px] md:w-[30px]' src={carIcon} />
                                    </div>
                                    <div className='col-span-5'>
                                        <p className='mt-1 text-[14px]'>{item.Source.text}</p>
                                        <p className='mt-1 text-[14px]'>{item.Destination.text}</p>
                                        <p className='flex items-center mt-1 text-[12px] text-gray-600'>
                                            ${item.ChargePerMile} Per/Mile, {convertToTimeString(item.Duration)}, {parseInt(item.Distance / 1000)}Mile, 
                                            <img src={carSeatIcon} width={20} />
                                            {item.AvailableSeat}x
                                        </p>
                                        <p className='flex items-center mt-1 text-[12px] text-gray-600'>{getPickupTime(item.StartDateTime, 0)}</p>
                                        <div className='flex'>
                                            <p className='bg-green-100 inline-block mt-2 text-[14px] rounded me-2 px-2.5 py-0.5'>{item.Status}</p>
                                            <p className='bg-green-100 inline-block mt-2 text-[14px] rounded me-2 px-2.5 py-0.5'>{item.SeekerCount} Seeker</p>
                                            {
                                                item.Status == 'Not Started' &&
                                                <p onClick={handleUpdateStatus} data-status='Started' data-id={item._id} className='bg-blue-100 hover:bg-blue-600 hover:text-white inline-block mt-2 text-[14px] rounded me-2 px-2.5 py-0.5'>Start</p>
                                            }
                                            {
                                                item.Status == 'Started' &&
                                                <p onClick={handleUpdateStatus} data-status='Completed' data-id={item._id} className='bg-blue-100 hover:bg-blue-600 hover:text-white inline-block mt-2 text-[14px] rounded me-2 px-2.5 py-0.5'>Mark Completed</p>
                                            }
                                        </div>
                                    
                                    </div>
                                    {/* 
                                        <div className='col-span-1 flex flex-col'>
                                            <button type="button" className="mb-1 text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-[10px] p-2 text-center inline-flex items-center justify-center me-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500">
                                                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M8.661,19.113,3,21l1.887-5.661ZM20.386,7.388a2.1,2.1,0,0,0,0-2.965l-.809-.809a2.1,2.1,0,0,0-2.965,0L6.571,13.655l3.774,3.774Z"/></svg>
                                            </button>
                                            <button type="button" className=" text-red-700 border border-red-700 hover:bg-red-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-red-300 rounded-lg text-[10px] p-2 text-center inline-flex items-center justify-center me-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:focus:ring-red-800 dark:hover:bg-red-500">
                                                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M5.755 20.283 4 8h16l-1.755 12.283A2 2 0 0 1 16.265 22h-8.53a2 2 0 0 1-1.98-1.717zM21 4h-5V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2z"/></svg>
                                            </button>                                            
                                        </div> 
                                    */}
                                </div>
                            </div>
                        )}
                        
                        <div className={`w-full ${ allRides.length == 0 ? 'flex' : 'hidden' } flex-col px-3 py-10 items-center justify-center`}>
                            <img src={userBrowsingImage} width={250}/>
                            <p className='mt-3 text-[12px] text-slate-600 text-center'>Oops! No rides available at the moment. Check back soon!</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className='md:col-span-2 h-[500px]  md:h-full shadow-md rounded-md overflow-hidden'>
                <GoogleMapSection name={'ridesMainMap'} mapIsReadyCallback={mapIsReadyCallback} onmapclick={onmapclick}/>
            </div>
        </div>

        <div id="add-ride-modal" style={{background:'#80808052'}} tabIndex="-1" aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full" role="dialog">
            <div className="relative p-4 w-full max-w-4xl max-h-full">
                <form onSubmit={handleFormSubmit} className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Start New Ride
                            <p className='text-[12px] text-slate-600 text-center'>Ready to roll? Start your new ride here.</p>
                        </h3>
                        <button onClick={toggleAddRideModal} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="add-ride-modal">
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                        
                    </div>
                    <div className="p-4 md:p-5 space-y-4 ">
                        <div className='grid md:grid-cols-2 gap-3 '>
                            <div className='md:order-1 order-2'>
                                <div>
                                    {/* <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required=""/> */}
                                    <GeoapifyContext apiKey={GEOAPIFY_API_KEY}>
                                        <label className="block mt-3 text-sm font-medium text-gray-900 dark:text-white">Your Source Location</label>
                                        <GeoapifyGeocoderAutocomplete value={formData.Source} placeholder={'Search Source Location'} placeSelect={onPickupPlaceSelect}/>

                                        <label className="block mt-3 text-sm font-medium text-gray-900 dark:text-white">Your Destination Location</label>
                                        <GeoapifyGeocoderAutocomplete value={formData.Destination} placeholder={'Search Destination Location'} placeSelect={onDropoffPlaceSelect}/>
                                    </GeoapifyContext>
                                </div>
                                <div>
                                    <label htmlFor="ChargePerMile" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Charges Per Mile</label>
                                    <input onChange={handleInputChange} min={1} type="number" name="ChargePerMile" id="ChargePerMile" placeholder='Enter your charges' className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required/>
                                </div>
                                <div>
                                    <label htmlFor="AvailableSeat" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Available Seats</label>
                                    <input onChange={handleInputChange} min={1} type="number" name="AvailableSeat" id="AvailableSeat" placeholder='Enter available seats' className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required/>
                                </div>
                                <div>
                                    <label htmlFor="StartDateTime" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">StartDateTime</label>
                                    <input onChange={handleInputChange} type="datetime-local" name="StartDateTime" id="StartDateTime" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required/>
                                </div>
                            </div>
                            <div className='h-[250px] md:h-full md:order-2 order-1 shadow-md rounded-md overflow-hidden'>
                                <GoogleMapSection name={'ridesAddRideMap'} route={selectedRoute} marker={selectedMarker} mapIsReadyCallback={mapIsReadyCallback} onmapclick={onmapclick}/>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save</button>
                        <button data-modal-hide="add-ride-modal" type="button" className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  )
}

export default Rides