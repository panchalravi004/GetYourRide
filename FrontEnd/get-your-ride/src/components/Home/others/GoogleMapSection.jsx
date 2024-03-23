import '../../../style/map.css';
import React, { useEffect, useState, useRef } from 'react'
import { GEOAPIFY_API_KEY } from '../../Helper/config';
import { LngLat, Map, Marker, Popup, NavigationControl, FullscreenControl } from 'maplibre-gl';
import MapLibreGlDirections, { LoadingIndicatorControl } from "@maplibre/maplibre-gl-directions";

function GoogleMapSection({ name, route, marker, mapIsReadyCallback, onmapclick }){
  let mapContainer = useRef(null);
  const [currentPosition, setCurrentPosition] = useState({ lat: null, lon: null });

  useEffect(()=>{
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (currentPosition) {
          console.log('currentPosition ',currentPosition);
          setCurrentPosition({
            lat: currentPosition.coords.latitude,
            lon: currentPosition.coords.longitude,
          });
        },null, {enableHighAccuracy: true});
    } else {
      console.log("Geolocation is not available in your browser.");
    }
  },[])

  useEffect(() => {
      const myAPIKey = GEOAPIFY_API_KEY;
      const mapStyle =
        'https://maps.geoapify.com/v1/styles/osm-carto/style.json';

      const initialState = {
        lng: currentPosition.lon,
        lat: currentPosition.lat,
        zoom: 10,
      };

      const map = new Map({
        container: mapContainer.current,
        style: `${mapStyle}?apiKey=${myAPIKey}`,
        center: [initialState.lng, initialState.lat],
        zoom: initialState.zoom,
      });
    
      map.on('click', (e)=>{
        onmapclick({name,e})
      })
      
      map.on("load", () => {
        
        const markerElement = document.createElement('div');
        const fullScreenElement = document.createElement('div');
        markerElement.className = 'current-location-marker';
        new Marker(markerElement).setLngLat(new LngLat(currentPosition.lon, currentPosition.lat)).addTo(map);

        if (marker) {
          marker.forEach(cord => {
            new Marker().setLngLat(new LngLat(cord[0], cord[1])).addTo(map);
          });
        }
        
        map.addControl(new FullscreenControl(fullScreenElement));
        map.addControl(new NavigationControl({
          showCompass:true,
          showZoom:true,
          visualizePitch:true
        }));

        const directions = new MapLibreGlDirections(map);
        
        // directions.interactive = true;
        map.addControl(new LoadingIndicatorControl(directions), 'top-left');
      
        // Set the waypoints programmatically
        if(route){
          directions.setWaypoints([...route]);
        }
        // directions.removeWaypoint(0);
        // directions.addWaypoint([-73.8671258, 40.82234996], 0);
        // directions.clear();
        mapIsReadyCallback({name,map, directions});
      });

  }, [mapContainer.current, route, marker]);

  return (
    <div className="w-full h-full map-container" ref={mapContainer}>
    </div>
  )
}

export default GoogleMapSection