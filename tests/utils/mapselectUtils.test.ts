import { MapLayerMouseEvent } from '@vis.gl/react-maplibre'
import marker from '../../src/assets/marker.png'
import { loadMarkerImage, handleMapClick } from '../../src/utils/mapselectUtils'
import { describe, it, expect, vi } from 'vitest'

describe('loadMarkerImage Unit Test', () => {
  it('loads marker image', async () => {
    const map = { loadImage: vi.fn().mockResolvedValue({ data: marker }), hasImage: vi.fn(), addImage: vi.fn() }
    await loadMarkerImage(map as unknown as maplibregl.Map)
    expect(map.loadImage).toHaveBeenCalledWith(expect.any(String))
    expect(map.hasImage).toHaveBeenCalledWith('marker')
    expect(map.addImage).toHaveBeenCalledWith('marker', marker)
  })

  it('handles error loading marker image', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const map = { loadImage: vi.fn().mockRejectedValue(new Error('Load error')), hasImage: vi.fn(), addImage: vi.fn() }

    await loadMarkerImage(map as unknown as maplibregl.Map)

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading marker image:', expect.any(Error))
    consoleErrorSpy.mockRestore()
  })
})

describe('handleMapClick Unit Test', () => {
  it('sets selected feature when feature exists', () => {
    const mockHotel = {
      name: 'Hotel Test',
      address: '123 Test St',
      price: 100,
      rating: 4.5,
      id: 'hotel-1',
      icon: 'icon-url',
    }
    const mockEvent = {
      type: 'click', // required by MapLayerMouseEvent
      features: [{
        type: 'Feature',
        properties: mockHotel,
        geometry: { type: 'Point', coordinates: [0, 0] },
        id: 'hotel-1',
        layer: {},
        source: 'source',
        sourceLayer: 'sourceLayer',
        state: {},
      }],
    } as unknown as MapLayerMouseEvent
    const setSelectedFeature = vi.fn()
    handleMapClick(mockEvent, setSelectedFeature)
    expect(setSelectedFeature).toHaveBeenCalledWith(mockHotel)
  })

  it('does not set selected feature when no feature exists', () => {
    const mockEvent = {
      type: 'click',
      features: [],
    } as unknown as MapLayerMouseEvent
    const setSelectedFeature = vi.fn()
    handleMapClick(mockEvent, setSelectedFeature)
    expect(setSelectedFeature).not.toHaveBeenCalled()
  })

  it('does not set selected feature when features is undefined', () => {
    const mockEvent = {
      type: 'click',
      features: undefined,
    } as MapLayerMouseEvent
    const setSelectedFeature = vi.fn()
    handleMapClick(mockEvent, setSelectedFeature)
    expect(setSelectedFeature).not.toHaveBeenCalled()
  })
})
