import React from 'react'
import PropTypes from 'prop-types'
import {Provider} from 'react-redux'
import {Router as SDKRouter, Route, IndexRoute} from 'progressive-web-sdk/dist/routing'
import {ssrRenderingCompleted} from 'progressive-web-sdk/dist/utils/universal-utils'

import PWALoadable from './components/pwa-loadable'

// Containers
import App from '.'

// Use Webpacks' import() with react-loadable to do code-splitting on a
// per-component basis. We recommend doing this for "pages" in your app.

const ExampleHome = PWALoadable(() => import('./pages/example-home' /* webpackChunkName: "home" */))
const ExampleProductDetails = PWALoadable(() => import('./pages/example-product-details' /* webpackChunkName: "product-details" */))
const ExampleProductList = PWALoadable(() => import('./pages/example-product-list' /* webpackChunkName: "product-list" */))


class Router extends React.Component {

    shouldComponentUpdate() {
        // If server-side do not re-render after the initial render
        // is complete.
        return !ssrRenderingCompleted()
    }

    render() {
        const {store} = this.props

        return (
            <Provider store={store}>
                <SDKRouter>
                    <Route path="/" component={App}>
                        <IndexRoute component={ExampleHome} />
                        <Route path="category/:categoryId" component={ExampleProductList} />
                        <Route path="products/:productId" component={ExampleProductDetails} />
                    </Route>
                </SDKRouter>
            </Provider>
        )
    }
}

Router.propTypes = {
    store: PropTypes.object
}

export default Router
