import React from 'react'
import AvailableRide from './AvailableRide';

function RideResult() {
    var rides = [];
    for (let i = 0; i < 5; i++) {
        rides.push(i);
    }
    return (
        <div className='p-3 shadow-sm mt-3 border-[2px] rounded-xl'>
            <p className='mt-1 text-[16px] font-bold'>Available Rides(10)</p>
            <div className='max-h-[250px] overflow-y-scroll pr-2'>
                {rides.map((item)=>
                    <AvailableRide key={item}/>
                )}
            </div>
            <div className='mt-5 border-t-2'>
                <p className='my-2 text-[13px] text-right text-gray-600'>
                    With Inlcude Platform fees <span className='text-green-600 font-bold'>$2</span>
                </p>
                <button className='p-3 bg-black w-full text-white rounded-lg hover:bg-gray-800'>Request For Ride</button>
            </div>
        </div>
    )
}

export default RideResult