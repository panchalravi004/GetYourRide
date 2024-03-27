import React, { useEffect, useState } from 'react'
import ScrollViewTop from "../Helper/scrollViewTop";
import { ToastContainer, toast } from 'react-toastify';
import { SERVER_API_HOST } from '../Helper/config';

function Profile({onspinner}) {
    const [userInfo, setUserInfo] = useState({_id:'', firstName:'', lastName:'', email:''})
    const [userToken, setUserToken] = useState('')
    const [walletAmount, setWalletAmount] = useState(0)
    
    useEffect(()=>{
        onspinner(false)
        const userDetail = localStorage.getItem('user')
        const token = localStorage.getItem('token')
        const {_id, firstName, lastName, email} = JSON.parse(userDetail);
        setUserInfo({_id, firstName, lastName, email})
        setUserToken(token)
        handleGetWalletAmount(token)
    },[])

    const handleGetWalletAmount = async (token) =>{
        const response = await fetch(`${SERVER_API_HOST}/paymenthistory/walletamount`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':token
            }
        });
        const result = await response.json()
        if(result.status == 'TokenExpired'){
            handleTokenExpired()
        } else {
            console.log('handleGetWalletAmount : ', result)
            if(result){
                setWalletAmount(result?.totalAmount)
            }
        }
    }

    const handleInputChange = (e)=>{
        setUserInfo({
          ...userInfo,
          [e.target.name]:e.target.value
        })
    }

    const handleFormSubmit = async (e)=>{
        e.preventDefault();
        if(validateSearchRide()){
            onspinner(true);
            const response = await fetch(`${SERVER_API_HOST}/user/${userInfo._id}`, {
                method:'PATCH',
                body:JSON.stringify(userInfo),
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':userToken
                }
            });
            const result = await response.json()
            if(result.status == 'Success'){
                toast.success(result.message)
                localStorage.setItem('user',JSON.stringify({
                    ...JSON.parse(localStorage.getItem('user')),
                    ...userInfo
                }))
                setTimeout(() => {
                    onspinner(false);
                    window.location.reload();
                }, 2000);
            }else {
                if(result.status == 'TokenExpired'){
                    toast.warning('Your session is Expired!')
                    handleTokenExpired()
                }
                onspinner(false);
            }
            console.log('handleFormSubmit : ',result)
        }else{
            toast.warning('Please enter valid inputs!')
        }
    }

    const validateSearchRide = ()=>{
        if(userInfo.firstName == '') return false
        if(userInfo.lastName == '') return false
        if(userInfo.email == '') return false
        return true
    }

    const handleTokenExpired = ()=>{
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
    }

  return (
    <div>
        <ScrollViewTop/>
        <ToastContainer/>
        <section className="bg-white dark:bg-gray-900">
            <div className="max-w-2xl px-4 py-8 mx-auto lg:py-16">


                <p className="mb-10 border-[1px] p-1 rounded-md shadow-sm flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Update Information</h2>
                    
                    <div className='bg-slate-100 p-2 rounded-md'>
                        <span className='text-md font-bold text-gray-900 dark:text-white'>
                            Wallet
                        </span>
                        <span className='mx-3 font-semibold'>
                            ${walletAmount}
                        </span>
                    </div>
                </p>
                <form onSubmit={handleFormSubmit}>
                    <div className="grid gap-4 mb-4 sm:grid-cols-2 sm:gap-6 sm:mb-5">
                        <div className="w-full">
                            <label htmlFor="firstName" className="block mb-3 text-sm font-medium text-gray-900 dark:text-white">FirstName</label>
                            <input onChange={handleInputChange} type="text" name="firstName" id="firstName" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={userInfo.firstName} placeholder="Enter your first name" required/>
                        </div>
                        <div className="w-full">
                            <label htmlFor="lastName" className="block mb-3 text-sm font-medium text-gray-900 dark:text-white">LastName</label>
                            <input onChange={handleInputChange} type="text" name="lastName" id="lastName" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={userInfo.lastName} placeholder="Enter your last name" required/>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="email" className="block mb-3 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                            <input onChange={handleInputChange} type="text" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={userInfo.email} placeholder="Enter your email" required/>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="password" className="block mb-3 text-sm font-medium text-gray-900 dark:text-white">New Password</label>
                            <input onChange={handleInputChange} type="password" name="password" id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Enter your new password" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-primary-800">
                            Update Account
                        </button>
                        {/* <button type="button" className="text-red-600 inline-flex items-center hover:text-white border border-red-600 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900">
                            <svg className="w-5 h-5 mr-1 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                            Delete 
                        </button> */}
                    </div>
                </form>
            </div>
            </section>
    </div>
  )
}

export default Profile