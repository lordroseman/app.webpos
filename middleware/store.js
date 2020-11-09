export default function ({ $auth, redirect }) {
  if ($auth.loggedIn) {
    const user = $auth.user
    if (user.access_level !== 2) {
      redirect('/')
    }
  } else {
    redirect('/login')
  }
}
