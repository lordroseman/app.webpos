export default ({ $auth, route, redirect }) => {
  if ($auth.isLoggedIn) {
    const user = $auth.user
    const permissions = $auth.user.permission
    const meta = route.meta[0]

    const accessLevel = route.meta.reduce(
      (accessLevel, meta) => meta.access_level || accessLevel,
      'light'
    )
    if (accessLevel !== user.access_level) {
      switch (user.access_level) {
        case 1:
          redirect(200, '/')
          break
        case 2:
          redirect(200, '/s')
          break
      }
      return
    }

    if (meta && 'permission' in meta) {
      if (!permissions.includes(meta.permission)) {
        redirect(403, '/')
      }
    }
  }
}
