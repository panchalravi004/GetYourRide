import userBrowsingImage from '../../assets/images/user-browsing.png';
import chatHistoryImage from '../../assets/images/chat-history.png';
import mapIcon from '../../assets/svg/map-icon.svg';
import carSeatIcon from '../../assets/svg/car-seat.svg';
import userIcon from '../../assets/svg/user.svg';

import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';

import ScrollViewTop from '../Helper/scrollViewTop'
import { RAZORPAY_API_KEY, RAZORPAY_API_SECRET, SERVER_API_HOST } from '../Helper/config';
import GoogleMapSection from '../Home/others/GoogleMapSection';
import { socket } from '../../socket';
import Spinner from '../Helper/Spinner';

function RideRequests({ onspinner }) {
    const [userToken, setUserToken] = useState('')
    const [userInfo, setUserInfo] = useState({})
    const [rideRequest, setRideRequest] = useState([])
    const [selectedRequest, setSelectedRequest] = useState({})
    const [selectedRequestForChat, setSelectedRequestForChat] = useState({})
    const [messageHistory, setMessageHistory] = useState([])

    const [maps, setMaps] = useState({});

    useEffect(()=>{

    },[])

    useEffect(() => {
        onspinner(false);
        localStorage.removeItem('chatrequest')
        const token = localStorage.getItem('token')
        const userDetail = localStorage.getItem('user')
        setUserToken(token)
        setUserInfo(JSON.parse(userDetail))
        handleGetAllRideRequests(token)

        socket.on('connect', ()=>{
            console.log('User Connected To Socket ',socket.id);
        })

        socket.on('welcome', (data)=>{
            console.log('Someone Join ', data);
        })

        socket.on('receivemessage', (data) => {
            console.log('receiveMessage shared', data);
            var chatrequest = localStorage.getItem('chatrequest')
            if(chatrequest && chatrequest == data.RideSharing){
                setMessageHistory(previous => [...previous, data])
            }
        })

    }, []);

    const mapIsReadyCallback = ({ name, map, directions }) => {
        console.log("Map Loaded... ", name);
        setMaps(prevMaps => ({ ...prevMaps, [name]: { map, directions } }));
    }

    const handleAddWayPointInMap = (name, lon, lat) => {
        if (maps[name]?.directions) {
            maps[name]?.directions.addWaypoint([lon, lat]);
        }
    }

    const handleRemoveWayPointInMap = (name, index) => {
        if (maps[name]?.directions) {
            maps[name]?.directions.removeWaypoint(index);
        }
    }

    const handleClearDirectionInMap = (name) => {
        if (maps[name]?.directions) {
            maps[name]?.directions.clear();
        }
    }

    const handleMapScreenFlyTo = (name, features) => {
        if (maps[name]?.map) {
            maps[name]?.map.flyTo({ ...features })
        }
    }

    const onmapclick = ({ name, e }) => {
        console.log("Map Click ", name, e);
    }

    const handleGetAllRideRequests = async (token) => {
        onspinner(true);
        const response = await fetch(`${SERVER_API_HOST}/ridesharing/seeker`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        });
        const result = await response.json()
        if (result.status == 'TokenExpired') {
            handleTokenExpired()
            onspinner(false);
        } else {
            console.log('handleGetAllRideRequests : ', result)
            setRideRequest(result);
            onspinner(false);
        }
    }

    const handleCancelRequest = (e) => {
        let id = e.currentTarget.dataset.id;
        handleRideRequestStatus(id, 'Cancel By Seeker')
    }

    const handleRideRequestStatus = async (id, Status) => {
        onspinner(true);
        const response = await fetch(`${SERVER_API_HOST}/ridesharing/status/${id}`, {
            method: 'POST',
            body: JSON.stringify({ Status }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userToken
            }
        });
        const result = await response.json()
        if (result.status == 'TokenExpired') {
            handleTokenExpired()
            onspinner(false);
        } else {
            console.log('handleRideRequestStatus : ', result)
            window.location.reload()
            onspinner(false);
        }
    }

    const handleTokenExpired = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
    }

    const convertToTimeString = (seconds) => {

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

    const getPickupTime = (datetime, seconds) => {
        let d = new Date(datetime);
        d.setSeconds(d.getSeconds() + seconds)
        return d.toLocaleString()
    }

    const handleViewMapModal = (e) => {
        var data = rideRequest.find((item) => item._id == e.currentTarget.dataset.id)
        if (data) {
            onspinner(true)
            setSelectedRequest(data)
            handleClearDirectionInMap('rideRequestMap')

            var mainSource = { ...data.Ride.Source.cord };
            var mainDestination = { ...data.Ride.Destination.cord };

            var subSource = { ...data.Pickup.cord };
            var subDestination = { ...data.DropOff.cord };

            handleAddWayPointInMap('rideRequestMap', mainSource.lon, mainSource.lat)
            handleAddWayPointInMap('rideRequestMap', subSource.lon, subSource.lat)
            handleAddWayPointInMap('rideRequestMap', subDestination.lon, subDestination.lat)
            handleAddWayPointInMap('rideRequestMap', mainDestination.lon, mainDestination.lat)

            handleMapScreenFlyTo('rideRequestMap', {
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

    const handleCreatePaymentHistory = async (e) => {
        let id = e.currentTarget.dataset.id;
        var rideRequestData = rideRequest.find((item) => item._id == id)
        if (rideRequestData) {
            onspinner(true);

            var currentDomain = window.location.href
            currentDomain = currentDomain.substring(0, currentDomain.lastIndexOf('/'))

            let amountToPaid = rideRequestData.Ride.ChargePerMile * parseInt(rideRequestData.Distance / 1000);

            var data = {
                CurrentDomain: currentDomain,
                RideSharing: id,
                User: rideRequestData.Seeker,
                Amount: amountToPaid,
                Status: 'In Progress',
                Name: rideRequestData.Seeker.firstName + ' ' + rideRequestData.Seeker.lastName,
                Email: rideRequestData.Seeker.email,
                Phone: rideRequestData.Seeker.phone
            }

            const response = await fetch(`${SERVER_API_HOST}/paymenthistory`, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': userToken,
                }
            });
            const result = await response.json()
            if (result.status == 'TokenExpired') {
                handleTokenExpired()
                onspinner(false);
            } else {
                console.log('handleCreatePaymentHistory : ', result);

                if (result.status == 'Success') {
                    toast.success('Payment link is created!')
                    toast.success('Payment link expired in 5 hours!')
                    setTimeout(() => {
                        onspinner(false)
                        window.location.href = result.shortURL;
                    }, 2000);
                }

            }
        }


    }

    const handleChatModalClick = (e)=>{

        let id = e.currentTarget.dataset.id;
        var rideRequestData = rideRequest.find((item) => item._id == id)
        if(rideRequestData){
            setSelectedRequestForChat(rideRequestData)
            localStorage.setItem('chatrequest', id);
            // connect with socket
            socket.connect();
            // then join room
            socket.emit('joinroom',id)
            // getting old messages in between this
            handleGetAllRideRequestMessages(id)
            // then open modal
            // use one of state variable to get selected ride
            var modal = document.querySelector("#request-chat-modal")
            modal.classList.remove('hidden')
            modal.classList.add('fixed')
        }

    }

    const handleGetAllRideRequestMessages = async (RideSharing) => {
        onspinner(true);
        const response = await fetch(`${SERVER_API_HOST}/messagehistory/ridesharing`, {
            method: 'POST',
            body: JSON.stringify({RideSharing}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userToken
            }
        });
        const result = await response.json()
        if (result.status == 'TokenExpired') {
            handleTokenExpired()
            onspinner(false);
        } else {
            console.log('handleGetAllRideRequestMessages : ', result)
            setMessageHistory(result);
            onspinner(false);
        }
    }

    const handleSendMessage = ()=>{
        var chat = document.querySelector('#chatMessageInput')
        var inputVal = chat.value
        if(inputVal){
            var data = {
                RideSharing:selectedRequestForChat._id,
                Sender:userInfo._id,
                Receiver:selectedRequestForChat.Provider._id,
                Message:inputVal,
                SendTime:new Date().getTime()
            }
            socket.emit('sendmessage', data)

            setMessageHistory(previous => ([...previous, data]))
            chat.value = '';
        }
        
    }

    const handleKeyDown = (e)=>{
        // console.log(e);
        if(e.code == 'Enter'){
            handleSendMessage()
        }
    }
    
    const handleChatModalClose = ()=>{
        
        var modal = document.querySelector("#request-chat-modal")
        modal.classList.add('hidden')
        modal.classList.remove('fixed')
        setSelectedRequestForChat({})
        setMessageHistory([])
        localStorage.removeItem('chatrequest')
        socket.disconnect()
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
                            <div key={item._id}>
                                <div data-popover-placement="right" className='relative items-center grid grid-cols-4 mt-3 mb-3 p-2 rounded-lg border-[1px] shadow-sm hover:shadow-md hover:cursor-pointer'>
                                    <div className='col-span-1 m-2 flex justify-center items-center'>
                                        <img className='w-[50px]' src={mapIcon} />
                                    </div>
                                    <div className='col-span-3'>
                                        <p className='mt-1 text-[15px]'>{item.Pickup.text} To {item.DropOff.text}</p>
                                        <p className='mt-1 text-[12px] text-gray-600'>• {item.Ride.Source.text} To {item.Ride.Destination.text}</p>
                                        <p className='flex items-center mt-1 text-[12px] text-gray-600'>
                                            ${item.Ride.ChargePerMile} Per/Mile, {convertToTimeString(item.Duration)}, {parseInt(item.Distance / 1000)}Mile,
                                            <img src={carSeatIcon} width={20} />
                                            {item.Ride.AvailableSeat}x Available

                                        </p>
                                        <p className='mt-1 text-[12px] text-gray-600'>Pickup: {getPickupTime(item.Ride.StartDateTime, item.Duration)}</p>
                                        <div className='flex flex-wrap items-center mt-2 gap-2'>
                                            <p className='bg-green-100 inline-block text-[14px] rounded px-2.5 py-0.5'>{item.Status}</p>
                                            <button data-id={item._id} onClick={handleViewMapModal} className='bg-green-100 hover:bg-green-500 hover:text-white inline-block text-[14px] rounded px-2.5 py-0.5'  >View Map</button>
                                            {
                                                ['Payment Pending'].includes(item.Status) &&
                                                <button data-id={item._id} onClick={handleCreatePaymentHistory} className='bg-blue-100 hover:bg-blue-500 hover:text-white inline-block text-[14px] rounded px-2.5 py-0.5'>Make Payment</button>
                                            }
                                            {
                                                ['Payment Pending', 'Not Pickup'].includes(item.Status) &&
                                                <button  data-id={item._id} onClick={handleChatModalClick} className='bg-blue-100 hover:bg-blue-500 hover:text-white inline-block text-[14px] rounded px-2.5 py-0.5'>Chat</button>
                                            }
                                            {
                                                ['Payment Pending'].includes(item.Status) &&
                                                <button data-id={item._id} onClick={handleCancelRequest} className='bg-red-400 hover:bg-red-700 text-white inline-block text-[14px] rounded px-2.5 py-0.5'>Cancel</button>
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

            <div id='ride-request-modal' style={{ background: "#2a2a2a70" }} className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-full max-h-full" >
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
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>

                        </div>
                        <div className="p-4 md:p-5 space-y-4 ">
                            <div className='md:h-[300px] h-[350px] shadow-md rounded-md overflow-hidden'>
                                <GoogleMapSection name={'rideRequestMap'} mapIsReadyCallback={mapIsReadyCallback} onmapclick={onmapclick} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id='request-chat-modal' style={{ "boxShadow": "0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
                className="hidden md:bottom-[calc(1rem)] bottom-0 right-0 md:mr-4 bg-white p-2 rounded-lg border shadow-md border-[#e5e7eb] md:w-[440px] w-full">
                
                <div className="relative flex flex-col space-y-1.5 pb-2 border-b-[1px]">
                    <h2 className="font-semibold text-lg tracking-tight">{selectedRequestForChat?.Provider?.firstName} {selectedRequestForChat?.Provider?.lastName}</h2>
                    <p className="text-sm text-[#6b7280] leading-3">Powered by GetYourRide</p>

                    <button onClick={handleChatModalClose} type="button" className="absolute top-0 right-0 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>

                </div>

                <div className="chat-section flex flex-col pr-4 md:h-[350px] h-2xl my-1 overflow-y-scroll" style={{ "minWidth": "100%" }}>
                    {
                        messageHistory?.map((item, index)=>
                            <div key={index} className='mt-2 w-full'>
                                <div className={`inline-flex max-w-[320px] flex-col p-2 shadow-sm ${item.Receiver == userInfo._id ? 'rounded-e-xl rounded-es-xl bg-gray-100' : 'rounded-s-xl  rounded-ee-xl bg-blue-100 float-end' } dark:bg-gray-700`}>
                                    <div className={`flex items-center ${item.Sender == userInfo._id ? 'justify-end' : ''} space-x-2 rtl:space-x-reverse`}>
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white">{item.Receiver == userInfo._id ? selectedRequestForChat?.Provider?.firstName : 'You'}</span>
                                    </div>
                                    <p style={{wordBreak:'break-all'}} className={` text-xs font-normal py-2 text-gray-900 dark:text-white ${ item.Sender == userInfo._id ? 'text-end' : ''}`}>{item.Message}</p>
                                </div>
                            </div>
                        )
                    }
                    {
                        messageHistory.length == 0 &&
                        <div className={`w-full flex flex-col px-3 py-10 items-center justify-center opacity-75`}>
                            <img src={chatHistoryImage} width={200} />
                            <p className='mt-3 font-semibold text-[13px]'>Currently, no messages. Stay tuned!</p>
                        </div>
                    }
                </div>
                <div className="flex items-center pt-0">
                    <div className="flex items-center justify-center w-full space-x-2">
                        <input onKeyDown={handleKeyDown} id='chatMessageInput' className="flex h-10 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm placeholder-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-50 text-[#030712] focus-visible:ring-offset-1"
                        placeholder="Type your message" />
                        <button onClick={handleSendMessage} className="inline-flex items-center justify-center rounded-md text-sm font-medium text-[#f9fafb] disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-[#111827E6] h-10 px-4 py-2">
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RideRequests