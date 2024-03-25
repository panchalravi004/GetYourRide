import { BrowserRouter as Router, Route, Routes , Navigate} from "react-router-dom";
import './App.css';
import Home from "./components/Home/home";
import Login from "./components/Login/login";
import Signup from "./components/Signup/signup";
import Contact from "./components/Contact/contact";
import Profile from "./components/Profile/profile";
import Spinner from "./components/Helper/Spinner";
import { useState } from "react";
import Wrapper from "./components/Helper/Wrapper";
import Rides from "./components/Rides/Rides";
import RideRequests from "./components/RideRequests/RideRequests";
import SharedRides from "./components/SharedRides/SharedRides";
import PaymentRedirect from "./components/PaymentRedirect";

function App() {

  const [loading, setLoading] = useState(false);

  const onspinner = (val)=>{
    setLoading(val);
  }
  
  return (
    <Router>
      <Spinner isLoading={loading} />      
      <Routes>
        <Route exact path="/login" element={<Login onspinner={onspinner}/>}></Route>
        <Route exact path="/signup" element={<Signup onspinner={onspinner}/>}></Route>
        <Route exact path="/" element={ <Wrapper> <Home onspinner={onspinner}/> </Wrapper>}></Route>
        <Route exact path="/profile" element={<Wrapper> <Profile onspinner={onspinner}/> </Wrapper>}></Route>
        <Route exact path="/contact" element={<Wrapper> <Contact onspinner={onspinner}/> </Wrapper>}></Route>
        <Route exact path="/rides" element={<Wrapper> <Rides onspinner={onspinner}/> </Wrapper>}></Route>
        <Route exact path="/riderequest" element={<Wrapper> <RideRequests onspinner={onspinner}/> </Wrapper>}></Route>
        <Route exact path="/sharedrides" element={<Wrapper> <SharedRides onspinner={onspinner}/> </Wrapper>}></Route>
        <Route exact path="/paymentredirect/:ridesharing/:id" element={<Wrapper> <PaymentRedirect onspinner={onspinner}/> </Wrapper>}></Route>
        <Route exact path="/*" element={<Navigate to="/"/>}></Route>
      </Routes>
    </Router>
  );
}

export default App;