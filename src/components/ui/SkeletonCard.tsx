interface SkeletonCardProps {
  className?: string
}

export const SkeletonCardWithButton = ({
  className = '',
}: SkeletonCardProps) => {
  return (
    <div
      className={`card card-side bg-base-100 shadow-sm dark:shadow-xl ${className}`}
    >
      <figure className="p-10">
        <div className="skeleton h-48 w-48 shrink-0 rounded-xl"></div>
      </figure>
      <div className="card-body py-12">
        <div className="flex-1">
          <div className="skeleton h-6 w-48"></div>
          <div className="flex flex-wrap mt-4 gap-4">
            <div className="skeleton h-6 w-20 rounded-full"></div>
            <div className="skeleton h-6 w-20 rounded-full"></div>
          </div>
        </div>
        <div className="card-actions justify-end">
          <div className="skeleton h-12 w-20 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}
