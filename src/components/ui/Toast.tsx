import useToastStore from '../../stores/ToastStore'

const getToastStyles = (type: string) => {
  switch (type) {
    case 'error':
      return 'alert-error'
    case 'success':
      return 'alert-success'
    case 'info':
    default:
      return 'alert-info'
  }
}

export const Toast = () => {
  const toastMsg = useToastStore(state => state.toastMsg)
  const toastType = useToastStore(state => state.toastType)

  if (!toastMsg) return null

  return (
    <div
      className={`fixed top-4 right-4 alert ${getToastStyles(toastType)} text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300`}
    >
      {toastMsg}
    </div>
  )
}
