export default function ({ $echo, $auth }) {
  // Echo is available here
  const strategy = $auth.strategy

  if (strategy.options.name === 'laravelSanctum') {
    const token = $auth.$storage.getCookies()['XSRF-TOKEN']
    $echo.connector.pusher.config.auth.headers['X-XSRF-TOKEN'] = token
  }
}
