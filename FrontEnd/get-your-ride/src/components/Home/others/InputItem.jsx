import '../../../style/auto-complete-input.css';
// import '@geoapify/geocoder-autocomplete/styles/minimal.css'
import locationMarker from '../../../assets/svg/location-marker.svg';
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import { GEOAPIFY_API_KEY } from '../../Helper/config';

function InputItem({type}) {

  function onPlaceSelect(value) {
    console.log('onPlaceSelect',value);
  }

  // function onSuggectionChange(value) {
  //   console.log('onSuggectionChange',value);
  // }

  // function sendGeocoderRequest(value, geocoder) {
  //   console.log('sendGeocoderRequest',value); //the search term
  //   return geocoder.sendGeocoderRequest(value);
  // }
  
  // function sendPlaceDetailsRequest(feature, geocoder) {
  //   console.log('sendPlaceDetailsRequest',feature); // the result of the search
  //   return geocoder.sendPlaceDetailsRequest(feature);
  // }

  return (
    <div className='bg-slate-200 p-1 rounded-lg mt-5 flex items-center gap-4'>
        <img className='opacity-80' src={locationMarker} width={30} />
        {/* 
          <input type='text' name={type}
          placeholder={type == 'source' ? 'Search Pickup Location' : 'Search Destination Location'} 
          className='bg-transparent w-full border-none' style={{boxShadow:'none'}} /> 
        */}
        <GeoapifyContext apiKey={GEOAPIFY_API_KEY}>
            <GeoapifyGeocoderAutocomplete 
              className="bg-transparent w-full border-none" 
              placeholder={type === 'source' ? 'Search Pickup Location' : 'Search Destination Location'}
              placeSelect={onPlaceSelect}
              // suggestionsChange={onSuggectionChange}
              // sendGeocoderRequestFunc={sendGeocoderRequest}
              // sendPlaceDetailsRequestFunc={sendPlaceDetailsRequest}
            />
        </GeoapifyContext>
    </div>
  )
}

export default InputItem