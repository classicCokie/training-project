import React from 'react'
import Loadable from 'react-loadable'
import SkeletonBlock from 'progressive-web-sdk/dist/components/skeleton-block'

const LoadingComponent = () => (
    <div>
        <SkeletonBlock height="100vh" width="100vw" />
    </div>
)

/**
 * Return a lazy-loadable component using webpack's dynamic imports.
 *
 * @param loader {Promise} a dynamic import, eg. `import('my-component')`
 */
const PWALoadable = (loader) => Loadable({loader, LoadingComponent})

export default PWALoadable
