import brandSplit from '../brand-split'

const Component = brandSplit((brand) => {
    if (brand === 'a') {
        return import('./brand-a' /* webpackChunkName: "brand-a" */)
    } else {
        return import('./brand-b' /* webpackChunkName: "brand-b" */)
    }
})

export default Component
