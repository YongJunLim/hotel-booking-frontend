interface StarUIProps {
  rating: number
  name: string // unique name so star wont conflict
}

export default function StarUI({ rating, name }: StarUIProps) {
  const stars = []

  for (let i = 0.5; i <= 5; i += 0.5) {
    stars.push(
      <input
        key={i}
        type="radio"
        name={name} // unique name so star wont conflict
        className={`mask mask-star-2 ${
          i % 1 === 0 ? 'mask-half-2' : 'mask-half-1'
        } ${i <= rating ? 'bg-orange-400' : 'bg-orange-400'}`}
        defaultChecked={i === rating}
        readOnly
        aria-label={`${i} star`}
      />,
    )
  }

  return (
    <div className="rating rating-sm rating-half pointer-events-none">
      <input type="radio" name={name} className="rating-hidden" />
      {stars}
    </div>
  )
}
