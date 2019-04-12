import * as store from './store'
import Immutable from 'immutable'

test('restoreFromFrozen should recreate the app state from a plain JS object', () => {
    expect(store.restoreFromFrozen(undefined)).toBe(undefined)
    expect(store.restoreFromFrozen({})).toEqual({})

    const frozen = {ui: {foo: {}, pages: {a: {}}}, data: {bar: {}}, anythingElse: {}}
    const restored = store.restoreFromFrozen(frozen)

    Object.keys(frozen).forEach((k) => expect(restored[k]).toBeDefined())

    expect(Immutable.Map.isMap(restored.ui)).toBe(false)
    expect(Immutable.Map.isMap(restored.ui.foo)).toBe(true)
    expect(Immutable.Map.isMap(restored.ui.pages)).toBe(false)
    expect(Immutable.Map.isMap(restored.ui.pages.a)).toBe(true)
    expect(Immutable.Map.isMap(restored.data)).toBe(false)
    expect(Immutable.Map.isMap(restored.data.bar)).toBe(true)
    expect(Immutable.Map.isMap(restored.anythingElse)).toBe(true)
})

test('configureStore should return a configured redux store', () => {
    const connector = null
    const reduxStore = store.configureStore(connector)
    expect(reduxStore.dispatch).toBeInstanceOf(Function)
})
