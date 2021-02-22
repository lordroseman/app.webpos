export default function ({ $auth, redirect }) {
  if ($auth.loggedIn) {
    const user = $auth.user
    if (user.access_level === 1) {
      redirect('/')
    } else if (user.access_level === 3) {
      redirect('/c')
    }
  } else {
    redirect('/login')
  }
}
