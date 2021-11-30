import { Slide, ToastContainer as ToastifyContainer } from 'react-toastify'
import { CloseButton } from '@/src/components/toast/CloseButton'

export default function ToastContainer() {
  return (
    <ToastifyContainer
      autoClose={5000}
      closeButton={CloseButton}
      closeOnClick={false}
      draggable={false}
      hideProgressBar={false}
      newestOnTop
      pauseOnFocusLoss
      pauseOnHover
      position="top-right"
      rtl={false}
      theme={'dark'}
      transition={Slide}
    />
  )
}
