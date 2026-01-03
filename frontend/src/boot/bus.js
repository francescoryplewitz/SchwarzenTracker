import { EventBus } from 'quasar'
import { boot } from 'quasar/wrappers'

export default boot(({ app }) => {
  const bus = new EventBus()

  // for Composition API
  app.provide('bus', bus)
})