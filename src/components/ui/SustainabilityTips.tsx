import { useState, useEffect } from 'react'
import sustainabilityTips from '../../data/sustainabilityTips.json'

export const SustainabilityTips = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % sustainabilityTips.length)
        setIsVisible(true)
      }, 600)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const currentTip = sustainabilityTips[currentIndex]

  return (
    <div className="p-4 bg-green-50 rounded-lg">
      <h3 className="text-lg font-semibold text-green-800 mb-2">
        💡 Sustainability Tip {currentIndex + 1}/{sustainabilityTips.length}
      </h3>
      <div className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-green-700 font-medium">
          {currentTip.category}
        </p>
        <p className="text-sm text-green-600 mt-1">
          {currentTip.tip}
        </p>
      </div>
      
      {/* Progress indicator */}
      <div className="flex gap-1 mt-3">
        {sustainabilityTips.map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full flex-1 ${
              index === currentIndex ? 'bg-green-500' : 'bg-green-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}