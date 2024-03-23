import React from 'react'
import Header from '../Header/header'
import Footer from '../Footer/footer'

function Wrapper({children}) {
  return (
    <div>
        <Header/>
        {children}
        <Footer/>
    </div>
  )
}

export default Wrapper