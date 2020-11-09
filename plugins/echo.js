export default function ({ $echo, $auth }) {
  // Echo is available here

  const token = $auth.strategy.token.get()

  $echo.connector.pusher.config.auth.headers.Authorization = token
}
