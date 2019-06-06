import React from 'react'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'
import PropTypes from 'prop-types'

import Link from 'progressive-web-sdk/dist/components/link'
import ListTile from 'progressive-web-sdk/dist/components/list-tile'
import Button from 'progressive-web-sdk/dist/components/button'

import * as actions from './actions'
import * as globalSelectors from '../../selectors'
import {trackPageLoad} from '../../page-actions'
import {changeBrand} from '../../actions'

import BrandedPromo from '../../components/branded-promo'

class ExampleHome extends React.Component {
    constructor(props) {
        super(props)
        this.pageType = 'home'

        // We're using a query parameter here,
        // but you can imagine using the hostname to set the brand on a real site
        const brandMatch = window.location.search.match(/brand=(.)/)
        const brand = brandMatch && brandMatch[1]
        this.props.changeBrand(brand)
    }

    componentDidMount() {
        const {trackPageLoad, initializeHome} = this.props
        trackPageLoad(initializeHome(), this.pageType)
    }

    render() {
        return (
            <div className="t-home">
                <h1 className="u-padding-top-md u-margin-bottom-sm">Homepage</h1>
                <BrandedPromo />
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
    changeBrand: PropTypes.func,
    initializeHome: PropTypes.func,
    trackPageLoad: PropTypes.func,
    uiState: PropTypes.object
}

const mapStateToProps = createPropsSelector({
    uiState: globalSelectors.getHome
})

const mapDispatchToProps = {
    trackPageLoad,
    initializeHome: actions.initializeHome,
    changeBrand
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExampleHome)
