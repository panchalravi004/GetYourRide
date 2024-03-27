import React, { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { SERVER_API_HOST } from './Helper/config';
import ScrollViewTop from './Helper/scrollViewTop';

function PaymentRedirect({ onspinner }) {

    const { id, ridesharing } = useParams();
    const location = useLocation();
    
    useEffect(() => {
        const token = localStorage.getItem('token')
        handlePaymentHistoryUpdate(token)
    }, [])
    
    const handlePaymentHistoryUpdate = async (token)=>{
        onspinner(true)
        const queryParams = new URLSearchParams(location.search);
        const PaymentId = queryParams.get('razorpay_payment_id');

        const response = await fetch(`${SERVER_API_HOST}/paymenthistory/status/${id}`, {
            method: 'POST',
            body: JSON.stringify({ Status:'Success',  PaymentId}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            }
        });
        const result = await response.json()
        console.log(result);
        if (result.status == 'TokenExpired') {
            handleTokenExpired()
            onspinner(false);
        }else{
            toast.success('Payment Successfully Done!')

            handleRideRequestStatus(ridesharing,'Not Pickup', token);

        }
        
    }

    const handleRideRequestStatus = async (id, Status, token) => {
        onspinner(true);
        const response = await fetch(`${SERVER_API_HOST}/ridesharing/status/${id}`, {
            method: 'POST',
            body: JSON.stringify({ Status }),
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
            console.log('handleRideRequestStatus : ', result)
            
            let seekerCountResult = await handleRideRequestSeekerCount(id,token)
            
            console.log('handleRideRequestStatus seekerCountResult: ', seekerCountResult)
            
            setTimeout(() => {
                onspinner(false)
                window.location.href = '/riderequest';
            }, 2000);
        }
    }

    const handleRideRequestSeekerCount = async (id, token) => {

        const response = await fetch(`${SERVER_API_HOST}/ride/seekercount`, {
            method: 'POST',
            body: JSON.stringify({ RideSharingId:id }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        });

        const result = await response.json()
        if (result.status == 'TokenExpired') {
            handleTokenExpired()
        }

        return result;
    }

    const handleTokenExpired = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
    }

    return (
        <div>
            <ScrollViewTop />
            <ToastContainer />
            <div class="h-screen">
                <div class="bg-white p-6  md:mx-auto">
                    <svg viewBox="0 0 24 24" class="text-green-600 w-16 h-16 mx-auto my-6">
                        <path fill="currentColor"
                            d="M12,0A12,12,0,1,0,24,12,12.014,12.014,0,0,0,12,0Zm6.927,8.2-6.845,9.289a1.011,1.011,0,0,1-1.43.188L5.764,13.769a1,1,0,1,1,1.25-1.562l4.076,3.261,6.227-8.451A1,1,0,1,1,18.927,8.2Z">
                        </path>
                    </svg>
                    <div class="text-center">
                        <h3 class="md:text-2xl text-base text-gray-900 font-semibold text-center">Payment Done!</h3>
                        <p class="text-gray-600 my-2">Thank you for completing your secure online payment.</p>
                        <p> Have a great day!  </p>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default PaymentRedirect