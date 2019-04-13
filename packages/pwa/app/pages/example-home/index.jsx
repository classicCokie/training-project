import React from 'react'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'
import PropTypes from 'prop-types'

import Link from 'progressive-web-sdk/dist/components/link'
import ListTile from 'progressive-web-sdk/dist/components/list-tile'
import Banner from 'progressive-web-sdk/dist/components/banner'

import * as actions from './actions'
import * as globalSelectors from '../../selectors'
import {trackPageLoad} from '../../page-actions'

class ExampleHome extends React.Component {
    constructor(props) {
        super(props)
        this.pageType = 'home'
    }

    componentDidMount() {
        const {trackPageLoad, initializeHome} = this.props
        trackPageLoad(initializeHome(), this.pageType)
    }

    render() {
        return (
            <div className="t-home">
                <h1 className="u-padding-top-md u-margin-bottom-sm">Homepage</h1>
                    <Banner icon="info" title="info">
                        Free Shipping on orders over $50
                    </Banner>
                <p className="u-margin-bottom-md">Tips for getting started on this page:</p>
                <ListTile className="pw--instructional-block">
                    <div>
                        Replace dummy products with real data using Commerce Integrations.&nbsp;
                        <Link
                            className="pw--underline"
                            openInNewTab
                            href="https://docs.mobify.com/commerce-integrations/latest/"
                        >
                            Read the guide
                        </Link>
                    </div>
                </ListTile>

                <ListTile className="pw--instructional-block">
                    <div>
                        Learn more about the grey columns which make up the responsive grid.&nbsp;
                        <Link
                            className="pw--underline"
                            openInNewTab
                            href="https://docs.mobify.com/progressive-web/latest/guides/responsive-grid/"
                        >
                            Read the guide
                        </Link>
                    </div>
                </ListTile>

                <div className="u-padding-bottom-lg">
                    View more guides on&nbsp;
                    <Link className="pw--underline" openInNewTab href="https://docs.mobify.com">
                        docs.mobify.com
                    </Link>
                </div>
            </div>
        )
    }
}

ExampleHome.propTypes = {
    initializeHome: PropTypes.func,
    trackPageLoad: PropTypes.func,
    uiState: PropTypes.object
}

const mapStateToProps = createPropsSelector({
    uiState: globalSelectors.getHome
})

const mapDispatchToProps = {
    trackPageLoad,
    initializeHome: actions.initializeHome
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExampleHome)
