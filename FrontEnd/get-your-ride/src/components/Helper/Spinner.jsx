import React, { useEffect, useState } from 'react'
import GridLoader from "react-spinners/GridLoader";

function Spinner({isLoading}) {
  let [loading, setLoading] = useState(false);
  useEffect(()=>{
    setLoading(isLoading)
  },[isLoading])
  return (
    <div className={loading ? "flex items-center justify-center fixed w-full h-full bg-[#0000004f] t-0" : 'hidden'} style={{zIndex:1000}}>
        <GridLoader size={10} color={"#ffffff"} loading={loading}/>
    </div>
  )
}

export default Spinner