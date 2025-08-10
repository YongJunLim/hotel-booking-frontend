import marker from '../../src/assets/marker.png'
import { loadMarkerImage } from '../../src/utils/mapselectUtils'
import { describe, it, expect, vi } from 'vitest'

describe('loadMarkerImage', () => {
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