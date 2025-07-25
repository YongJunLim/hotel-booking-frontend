import { type ImageDetails } from '../../types/image'
interface ImageCarouselProps {
  imageDetails: ImageDetails
  hotelName: string
  hires_image_index: string
}

export const ImageCarousel = ({
  imageDetails,
  hotelName,
  hires_image_index,
}: ImageCarouselProps) => {
  console.log(imageDetails)
  if (!imageDetails || hires_image_index === '') {
    return null
  }
  const imageIndices = hires_image_index
    .split(',')
    .map(index => index.trim())

  return (
    <div className="carousel carousel-center bg-base-100 border-base-300 border rounded-box max-w-full space-x-4 p-4">
      {imageIndices.map((imageIndex, arrayIndex) => {
        const imageUrl = `${imageDetails.prefix}${imageIndex}${imageDetails.suffix}`

        return (
          <div key={arrayIndex} className="carousel-item">
            <img
              src={imageUrl}
              alt={`${hotelName} - Image ${parseInt(imageIndex) + 1}`}
              className="rounded-box w-64 h-48 object-cover"
            />
          </div>
        )
      })}
    </div>
  )
}
