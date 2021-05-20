import Swal from 'sweetalert2'

export default function ({ $axios, $auth }) {
  $axios.onError((error) => {
    // eslint-disable-next-line no-console

    if (error.response.status === 500) {
      // eslint-disable-next-line no-console
      console.log(error)
      // redirect('/sorry')
    } else if (error.response.status === 401) {
      // alert('You have been logout, Page will reload')
      // window.location.reload()

      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'You have been logout! Page will reload',
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then(() => {
        window.location.reload()
      })
    } else {
      // eslint-disable-next-line no-console
      console.log(error)
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: error.message,
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then(() => {})
    }
  })
}
