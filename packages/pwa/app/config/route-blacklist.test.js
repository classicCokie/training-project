import blacklist from './route-blacklist'

describe('route-blacklist configuration', () => {
    test('blacklist check', () => {
        expect(blacklist).toBeInstanceOf(Array)
    })
})
