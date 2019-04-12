import React from 'react'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'
import {getAssetUrl} from 'progressive-web-sdk/dist/asset-utils'
import Helmet from 'react-helmet'
import PropTypes from 'prop-types'

import SkipLinks from 'progressive-web-sdk/dist/components/skip-links'

import {getNavigationRoot, getOfflineModeStartTime, getPageMetaData} from './selectors'

import Header from './components/example-header'
import Footer from './components/example-footer'

export const MetaData = (props) => {
    const {title, description, keywords} = props

    return (
        <Helmet>
            <html lang="en-US" />
            {title && <title key="pageMetaTitle">{title}</title>}
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0"
            />
            <meta name="charset" content="utf-8" />
            {description && <meta name="description" content={description} />}
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="theme-color" content="#0288a7" />
            <meta name="apple-mobile-web-app-title" content="Scaffold" />
            <meta name="format-detection" content="telephone=no" />
            <link
                rel="preconnect"
                href="https://engagement-collector.mobify.net"
                crossOrigin="use credentials"
            />
            <link
                rel="preconnect"
                href="https://www.google-analytics.com"
                crossOrigin="use credentials"
            />
            <link
                rel="apple-touch-icon"
                href={getAssetUrl('static/img/global/apple-touch-icon.png')}
            />
        </Helmet>
    )
}

MetaData.propTypes = {
    description: PropTypes.string,
    keywords: PropTypes.string,
    title: PropTypes.string
}

export const OfflineBanner = () => (
    <header className="t-app__offline-banner">
        <p>Currently browsing in offline mode</p>
    </header>
)

export class App extends React.Component {
    render() {
        const {children, offlineSince, pageMetaData, navigationRoot} = this.props

        const isOffline = offlineSince !== null
        const skipLinksItems = [
            // @URL: https://www.w3.org/TR/WCAG20-TECHS/G1.html
            {target: '#app-main', label: 'Skip to content'}
        ]

        return (
            <div id="app" className="t-app">
                <MetaData {...pageMetaData} />
                <SkipLinks items={skipLinksItems} />
                <Header navigationRoot={navigationRoot} />
                {isOffline && <OfflineBanner />}
                <main id="app-main" className="t-app__main" role="main">
                    {children}
                </main>
                <Footer />
            </div>
        )
    }
}

App.propTypes = {
    children: PropTypes.element.isRequired,
    navigationRoot: PropTypes.object,
    offlineSince: PropTypes.number,
    pageMetaData: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        keywords: PropTypes.string
    })
}

const mapStateToProps = createPropsSelector({
    offlineSince: getOfflineModeStartTime,
    pageMetaData: getPageMetaData,
    navigationRoot: getNavigationRoot
})

export default connect(mapStateToProps)(App)
