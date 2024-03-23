import React from 'react'
import InputItem from './InputItem'

function SearchSection() {
  return (
    <div className='p-3 border-[2px] rounded-xl shadow-sm'>
        <p className='mt-1 text-[16px] font-bold'>Get a ride</p>
        <InputItem type='source'/>
        <InputItem type='destination'/>
        <button className='p-3 bg-black w-full mt-5 text-white rounded-lg hover:bg-gray-800'>Search</button>
    </div>
  )
}

export default SearchSection