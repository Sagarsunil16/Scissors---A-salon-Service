import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const BookingSuccess = () => {
    const location = useLocation()
    const navigate =useNavigate()
    const sessionId = new URLSearchParams(location.search).get('session_id')
    useEffect(()=>{
        if(sessionId){
            alert('Payment successful! Your appointment has been booked.')
            navigate('/')
        }
    },[sessionId,navigate])
  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Your appointment is being created. Please wait...</p>
    </div>
  )
}

export default BookingSuccess
