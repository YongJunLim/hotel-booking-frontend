import { Map, type MapRef, Marker, Source, Layer, Popup, type MapLayerMouseEvent } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MAPTILER_TOKEN } from '../../config/api'
import type { StitchedHotel } from '../../types/params'
import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'wouter'

interface MapSelectProps {
  hotels: StitchedHotel[]
  checkin?: string
  checkout?: string
  guests?: string
  destinationId?: string
}

export const MapSelect = ({ hotels, destinationId, checkin, checkout, guests }: MapSelectProps) => {
  const [, navigate] = useLocation()
  const [hoverInfo, setHoverInfo] = useState<{
    longitude: number
    latitude: number
    properties: Record<string, any>
  } | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<any>(null)
  useEffect(() => {
    if (selectedFeature) {
      navigate(
        `/hotels/detail/${selectedFeature.id}?destination_id=${destinationId}&checkin=${checkin}&checkout=${checkout}&lang=en_US&currency=SGD&country_code=SG&guests=${guests}`,
      )
    }
  }, [selectedFeature]);
  const handleMapClick = (e: MapLayerMouseEvent) => {
    const feature = e.features?.[0]
    if (feature) {
      setSelectedFeature(feature.properties)
    }
  }

  const mapRef = useRef<MapRef | null>(null);

  useEffect(() => {
    if(hotels[0]) {
      mapRef.current?.flyTo({
        center: [hotels[0].longitude, hotels[0].latitude],
        zoom: 14,
        speed: 1.0,
      });
    }
  }, [hotels]);

  return (
    <div className="w-full h-100 rounded-lg overflow-hidden">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: hotels[0]?.longitude ?? 103.8198,
          latitude: hotels[0]?.latitude ?? 1.3521,
          zoom: 14,
        }}
        mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_TOKEN}`}
        onClick={handleMapClick}
        onMouseMove={(e: MapLayerMouseEvent) => {
          const feature = e.features?.[0]
          if (feature) {
            setHoverInfo({
              longitude: e.lngLat.lng,
              latitude: e.lngLat.lat,
              properties: feature.properties,
            })
          }
          else {
            setHoverInfo(null)
          }
        }}
        interactiveLayerIds={['point-layer']}
      >
        {hotels.map(hotel => (
          <Marker longitude={hotel.longitude} latitude={hotel.latitude} anchor="bottom"></Marker>
        ))}
          
        <Source
          id="my-geojson"
          type="geojson"
          data={{
            type: 'FeatureCollection',
            features: hotels.map(hotel => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [hotel.longitude, hotel.latitude],
              },
              properties: {
                name: hotel.name,
                address: hotel.address,
                price: hotel.price,
                rating: hotel.rating,
                id: hotel.id,
              },
            })),
          }}
        >
          <Layer
            id="point-layer"
            type="circle"
            paint={{ 'circle-radius': 6, 'circle-color': '#007cbf' }}
          />
        </Source>

        {hoverInfo && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="left"
          >
            <div>
              <strong>{hoverInfo.properties.name}</strong>
              <br />
              <strong>Address</strong>:
              {' '}
              {hoverInfo.properties.address}
              <br />
              <strong>Price</strong>:
              {' '}
              {hoverInfo.properties.price}
              <br />
              <strong>Rating</strong>:
              {' '}
              {hoverInfo.properties.rating}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}
