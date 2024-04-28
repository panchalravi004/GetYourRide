import React from 'react';
import carIcon from '../../../assets/svg/car.svg';
import carSeatIcon from '../../../assets/svg/car-seat.svg';
import '../../../style/common.css';

function AvailableRide({ data , onactiverideclick}) {
    const handleRideClick = (e)=>{
        onactiverideclick(data);
        var allSelectedRide = document.querySelectorAll('.selected-ride');
        allSelectedRide.forEach(element => {
            element.classList.remove('selected-ride')
        });

        e.currentTarget.classList.add('selected-ride')

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
        <div onClick={handleRideClick} className='relative gap-3 grid md:grid-cols-5 grid-cols-1 mt-3 mb-3 p-2 rounded-lg border-[1px] shadow-sm hover:shadow-md hover:cursor-pointer'>
            <div className='col-span-1 flex justify-center items-center'>
                <img className='m-2 w-[60px] md:w-[40px]' src={carIcon} />
            </div>
            <div className='md:col-span-3'>
                <p className='mt-1 text-[14px] '>• {data.Source.text}</p>
                <p className='mt-1 text-[14px] '>• {data.Destination.text}</p>
                <p className='flex items-center mt-1 text-[12px] text-gray-600'>
                    ${data.ChargePerMile} Per/Mile, {convertToTimeString(data.ActualTime)}, {parseInt(data.ActualDistance / 1000)}Mile,
                    <img src={carSeatIcon} width={20} />
                    {data.AvailableSeat}x
                </p>
                <p className='mt-1 text-[12px] text-gray-600'>Pickup: {getPickupTime(data.StartDateTime, data.ActualTime)}</p>
            </div>
            <div className='md:col-span-1 md:flex md:items-center md:flex-col md:justify-center md:relative md:m-1 absolute top-0 right-0 m-7'>
                <p className='font-bold text-[14px]'>${parseInt(data.ActualDistance / 1000)*data.ChargePerMile}</p>
                <p className='text-[10px] line-through'>${
                    parseInt(data.ActualDistance / 1000)*data.ChargePerMile + ((parseInt(data.ActualDistance / 1000)*data.ChargePerMile * 10) / 100)
                }</p>
            </div>
        </div>
    )
}

export default AvailableRide