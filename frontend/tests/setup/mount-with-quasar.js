import { mount } from '@vue/test-utils'
import { EventBus, Dialog, Loading, LocalStorage, Notify, Quasar } from 'quasar'

export function mountWithQuasar(component, options = {}) {
  const {
    global = {},
    quasar: quasarOptions = {},
    bus: providedBus,
    ...rest
  } = options

  const bus = providedBus ?? new EventBus()
  const globalPlugins = global.plugins ?? []
  const globalProvide = global.provide ?? {}
  const quasarPlugins = {
    Notify,
    Dialog,
    Loading,
    LocalStorage,
    ...(quasarOptions.plugins ?? {})
  }

  const wrapper = mount(component, {
    ...rest,
    global: {
      ...global,
      plugins: [
        [Quasar, {
          plugins: quasarPlugins,
          config: quasarOptions.config ?? {}
        }],
        ...globalPlugins
      ],
      provide: {
        ...globalProvide,
        bus
      },
      stubs: {
        transition: false,
        'transition-group': false,
        ...(global.stubs ?? {})
      }
    }
  })

  return {
    wrapper,
    bus
  }
}
