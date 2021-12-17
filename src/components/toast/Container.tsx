import { Slide, ToastContainer as ToastifyContainer } from 'react-toastify'

export default function ToastContainer() {
  return (
    <ToastifyContainer
      autoClose={5000}
      closeButton={<div>X</div>}
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
