import React from 'react'
import PropTypes from 'prop-types'
import Loadable from 'react-loadable'

import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'
import {getBrand} from '../../selectors'

const LoadingComponent = () => <div>Loading...</div>

const brandSplit = (importMapping) => {
    class BrandSplit extends React.Component {
        shouldComponentUpdate(nextProps) {
            return nextProps.brand !== this.props.brand
        }

        render() {
            const {brand} = this.props

            const LoadableBar = Loadable({
                loader: () => importMapping(brand),
                loading: LoadingComponent
            })

            return <LoadableBar />
        }
    }

    const mapStateToProps = createPropsSelector({
        brand: getBrand
    })

    BrandSplit.propTypes = {
        brand: PropTypes.string
    }

    return connect(mapStateToProps)(BrandSplit)
}

export default brandSplit
