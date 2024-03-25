import '../../style/auto-complete-input.css';
import locationMarker from '../../assets/svg/location-marker.svg';
import locationDestination from '../../assets/svg/location-destination.svg';
import refreshIcon from '../../assets/svg/refresh.svg';
import userBrowsingImage from '../../assets/images/user-browsing.png';

import React, { useEffect, useState } from 'react'
import { GEOAPIFY_API_KEY, SERVER_API_HOST } from '../Helper/config';
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import { LngLat, Marker, Popup } from 'maplibre-gl';
import { ToastContainer, toast } from 'react-toastify';

import ScrollViewTop from '../Helper/scrollViewTop'
import GoogleMapSection from './others/GoogleMapSection'
import AvailableRide from './others/AvailableRide';

function Home({ onspinner }) {
    const [userToken, setUserToken] = useState('')
    const [activeRides, setActiveRide] = useState([])
    const [selectedActiveRide, setSelectedActiveRide] = useState(null)

    const [maps, setMaps] = useState({});
    const [formData, setFormData] = useState({Pickup:'',DropOff:'',PickupLocation:[],DropOffLocation:[]});

    useEffect(() => {
        onspinner(false);
        const token = localStorage.getItem('token')
        setUserToken(token)
    }, []);

    const mapIsReadyCallback = ({ name, map, directions }) => {
        console.log("Map Loaded...", name);
        setMaps(prevMaps => ({ ...prevMaps, [name]: {map, directions}}));
    }

    const handleAddWayPointInMap = (name, lon, lat)=>{
        if(maps[name]?.directions){
            maps[name]?.directions.addWaypoint([lon, lat]);
        }
    }

    const handleAddPopupInMap = (name, lon, lat, content)=>{
        if(maps[name]?.map){
            new Popup()
            .setLngLat([lon, lat])
            .setHTML(content)
            .addTo(maps[name]?.map);
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

    const onPickupPlaceSelect = (value)=>{
        if(value){
            var placeName = value.properties.formatted;
            var lon = value.properties.lon;
            var lat = value.properties.lat;
            setFormData({...formData,Pickup: placeName, PickupLocation:[lon,lat]});
            // handleAddMarkerInMap('ridesAddRideMap','pickup',lon, lat)
            handleAddWayPointInMap('homeMap', lon, lat)

            handleMapScreenFlyTo('homeMap',{
                center: [lon, lat],
                zoom: 12,
                speed: 0.5,
                curve: 3,
                easing(t) {
                    return t;
                }
            })

        }else{
            setFormData({...formData,Pickup: '', PickupLocation:[]});
            handleRemoveWayPointInMap('homeMap', 0)
        }
    }

    const onDropoffPlaceSelect = (value)=>{
        if(value){
            var placeName = value.properties.formatted;
            var lon = value.properties.lon;
            var lat = value.properties.lat;
            setFormData({...formData,DropOff: placeName, DropOffLocation:[lon,lat]});
            // handleAddMarkerInMap('homeMap','dropoff',lon, lat)
            handleAddWayPointInMap('homeMap', lon, lat)

            handleMapScreenFlyTo('homeMap',{
                center: [lon, lat],
                zoom: 12,
                speed: 0.5,
                curve: 3,
                easing(t) {
                    return t;
                }
            })
        }else{
            setFormData({...formData,DropOff: '', DropOffLocation:[]});
            handleRemoveWayPointInMap('homeMap', formData.PickupLocation.length == 0 ? 0 : 1)
        }
    }

    const handleSearchRides = async ()=>{
        if(validateSearchRide()){
            onspinner(true)
            console.log('handleSearchRides :: ',formData);
            const response = await fetch(`${SERVER_API_HOST}/ride/planning`, {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':userToken
                }
            });
            const result = await response.json()
            console.log('handleSearchRides :: ',result);
            if(result.status == 'Success'){
                toast.success(result.message)
                setActiveRide(result?.rides)
                onspinner(false);
            }
            else {
                if(result.status == 'TokenExpired'){
                    toast.warning('Your session is Expired!')
                    handleTokenExpired()
                }
                onspinner(false);
            }
        }else{
            toast.warning('Please enter valid inputs!')
        }
    }

    const validateSearchRide = ()=>{

        if(formData.Pickup == '') return false
        if(formData.DropOff == '') return false
        if(formData.PickupLocation == []) return false
        if(formData.DropOffLocation == []) return false
        return true
    }

    const handleActiveRideClick = (data)=>{

        if(data){
            console.log(data);
            setSelectedActiveRide(data)
            const sourceCord = data.Source.cord;
            const destinationCord = data.Destination.cord;

            handleClearDirectionInMap('homeMap')

            handleMapScreenFlyTo('homeMap',{
                center: [sourceCord.lon, sourceCord.lat],
                zoom: 8,
                speed: 0.5,
                curve: 3,
                easing(t) {
                    return t;
                }
            })

            handleAddWayPointInMap('homeMap', sourceCord.lon, sourceCord.lat)
            handleAddWayPointInMap('homeMap', destinationCord.lon, destinationCord.lat)
        }

    }

    const handleMakeRideRequest = async()=>{
        if(validateSearchRide() && selectedActiveRide){
            onspinner(true)
            const response = await fetch(`${SERVER_API_HOST}/ridesharing`, {
                method: 'POST',
                body: JSON.stringify({
                    ...formData, 
                    Ride : selectedActiveRide._id,
                    Provider : selectedActiveRide.User,
                    Distance : selectedActiveRide.ActualDistance,
                    Duration : selectedActiveRide.ActualTime
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':userToken
                }
            });
            const result = await response.json()
            console.log('handleMakeRideRequest :: ',result);
            if(result.status == 'Success'){
                toast.success(result.message)

                // socket.emit('riderequestnotification', {
                //     userId: selectedActiveRide.User
                // })

                setTimeout(() => {
                    window.location.href = '/riderequest'
                    onspinner(false);
                }, 2000);
            }
            else {
                if(result.status == 'TokenExpired'){
                    toast.warning('Your session is Expired!')
                    handleTokenExpired()
                }
                onspinner(false);
            }

        }else{
            toast.warning('Please select valid details!')
        }
    }

    const handleTokenExpired = ()=>{
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
    }

    const handleReloadWindow = ()=>{
        window.location.reload()
        onspinner(true);
    }

    return (
        <div>
            <ScrollViewTop />
            <ToastContainer />
            <div className='p-6 grid grid-cols-1 md:grid-cols-3 gap-5'>
                <div className='md:col-span-1'>
                    <div className='p-3 border-[2px] rounded-xl shadow-sm'>
                        <p className='mt-1 text-[16px] font-bold flex justify-between'>
                            <span>Get a ride</span>
                            <span className='hover:cursor-pointer rounded-lg opacity-40 hover:opacity-100' onClick={handleReloadWindow}>
                                <img src={refreshIcon} width={22} />
                            </span>
                        </p>
                        <p className='text-[12px] text-gray-600'>
                            Find and request ridesharing.
                        </p>
                        <GeoapifyContext apiKey={GEOAPIFY_API_KEY}>
                            <div className='bg-slate-200 p-1 rounded-lg mt-5 flex items-center gap-4'>
                                <img className='opacity-80' src={locationMarker} width={30} />
                                <GeoapifyGeocoderAutocomplete className="bg-transparent w-full border-none" placeholder='Search Pickup Location' placeSelect={onPickupPlaceSelect} />
                            </div>
                            <div className='bg-slate-200 p-1 rounded-lg mt-5 flex items-center gap-4'>
                                <img className='opacity-80' src={locationDestination} width={30} />
                                <GeoapifyGeocoderAutocomplete className="bg-transparent w-full border-none" placeholder='Search Dropoff Location' placeSelect={onDropoffPlaceSelect} />
                            </div>
                        </GeoapifyContext>
                        <button onClick={handleSearchRides} className='p-3 bg-black w-full mt-5 text-white rounded-lg hover:bg-gray-800'>Search</button>
                    </div>
                    <div className='p-3 shadow-sm mt-3 border-[2px] rounded-xl'>
                        {
                            activeRides.length != 0 && 
                            <>
                                <p className='mt-1 text-[16px] font-bold'>Available Rides({activeRides.length})</p>
                                <div className='max-h-[250px] overflow-y-scroll pr-2'>
                                    {activeRides?.map((item) =>
                                        <AvailableRide key={item._id} data={item} onactiverideclick={handleActiveRideClick} />
                                    )}
                                </div>
                                <div className='mt-5 border-t-2'>
                                    <p className='my-2 text-[13px] text-right text-gray-600'>
                                        With Inlcude Platform fees <span className='text-green-600 font-bold'>$2</span>
                                    </p>
                                    <button className='p-3 bg-black w-full text-white rounded-lg hover:bg-gray-800' onClick={handleMakeRideRequest}>Request For Ride</button>
                                </div>
                            </>
                        }
                        {
                            activeRides.length == 0 &&
                            <div className={`w-full flex flex-col px-3 py-10 items-center justify-center`}>
                                <img src={userBrowsingImage} width={250}/>
                                <p className='mt-3 text-[12px] text-slate-600 text-center'>Ready to explore? Begin your journey by searching for routes!</p>
                            </div>
                        }
                    </div>
                </div>
                <div className='md:col-span-2 h-[500px] shadow-md rounded-md overflow-hidden  md:h-full'>
                    <GoogleMapSection name={'homeMap'} mapIsReadyCallback={mapIsReadyCallback} onmapclick={onmapclick} />
                </div>
            </div>
        </div>
    )
}

export default Home