export default function ({ $axios, $auth }) {
  $axios.onError((error) => {
    // eslint-disable-next-line no-console

    if (error.response.status === 500) {
      // eslint-disable-next-line no-console
      console.log(error)
      // redirect('/sorry')
    } else if (error.response.status === 401) {
      // $auth.logout()
    }
  })
}
