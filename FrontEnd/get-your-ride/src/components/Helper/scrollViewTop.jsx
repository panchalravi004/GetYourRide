import React from 'react'
import { useEffect } from 'react';

function ScrollViewTop() {
    useEffect(() => {
      window.scrollTo(0, 0)
    }, []);
    return (<div></div>)
}

export default ScrollViewTop