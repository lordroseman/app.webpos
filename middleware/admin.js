export default function ({ $auth, redirect }) {
  if ($auth.loggedIn) {
    const user = $auth.user
    if (user.access_level !== 1) {
      redirect('/s')
    }
  } else {
    redirect('/login')
  }
}
