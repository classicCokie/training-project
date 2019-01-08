import React, {Fragment} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router'

import {getBreakpoints} from 'progressive-web-sdk/dist/utils/universal-utils'
import {VIEWPORT_SIZE_NAMES as sizes} from 'progressive-web-sdk/dist/ssr/constants'

import Button from 'progressive-web-sdk/dist/components/button'
import {HeaderBar, HeaderBarActions, HeaderBarTitle} from 'progressive-web-sdk/dist/components/header-bar'
import IconLabel from 'progressive-web-sdk/dist/components/icon-label'
import MegaMenu from 'progressive-web-sdk/dist/components/mega-menu'
import Nav from 'progressive-web-sdk/dist/components/nav/'
import NavMenu from 'progressive-web-sdk/dist/components/nav-menu/'
import Sheet from 'progressive-web-sdk/dist/components/sheet'
import MediaQuery from '../media-query'


const breakpoints = getBreakpoints()


export const MobileHeader = (props) => {
    const {openNavigation, closeNavigation, navigationRoot, path, onPathChange, navigationIsOpen} = props
    return (
        <HeaderBar className="c-header">
            <HeaderBarActions>
                {
                    navigationIsOpen
                        ? <Button className="pw--black" onClick={closeNavigation}>
                            <IconLabel label={'Close'} iconName={'close'} iconSize="medium" />
                        </Button>
                        : <Button className="pw--black" onClick={openNavigation}>
                            <IconLabel label={'Menu'} iconName={'menu'} iconSize="medium" />
                        </Button>
                }

                <Sheet
                    open={navigationIsOpen}
                    onDismiss={closeNavigation}
                    className="c-header__sheet"
                >
                    <MediaQuery maxWidth={breakpoints[sizes.MEDIUM] - 1}>
                        <HeaderBar className="c-header__nav-modal">
                            <HeaderBarActions className="c-header__nav-modal-mobile">
                                <Button className="pw--black" onClick={closeNavigation}>
                                    <IconLabel label={'Close'} iconName={'close'} iconSize="medium" />
                                </Button>
                            </HeaderBarActions>
                        </HeaderBar>
                    </MediaQuery>
                    <Nav className="c-header__navigation" root={navigationRoot} path={path} onPathChange={onPathChange}>
                        <NavMenu />
                    </Nav>
                </Sheet>

            </HeaderBarActions>

            <HeaderBarTitle className="c-header__title" href="/">
                <img src="https://www.mobify.com/wp-content/uploads/logo-mobify-white.png" alt="Mobify Logo" height="35" />
            </HeaderBarTitle>
        </HeaderBar>
    )
}


MobileHeader.propTypes = {
    closeNavigation: PropTypes.func,
    navigationIsOpen: PropTypes.bool,
    navigationRoot: PropTypes.object,
    openNavigation: PropTypes.func,
    path: PropTypes.string,
    onPathChange: PropTypes.func,
}


export const DesktopHeader = (props) => {
    const {navigationRoot, path, onPathChange} = props
    return (
        <div>
            <HeaderBar className="c-header">
                <div className="c-header__content">
                    <HeaderBarTitle className="c-headerbar u-flexbox" href="/">
                        <img className="u-padding-start-lg" src="https://www.mobify.com/wp-content/uploads/logo-mobify-white.png" alt="Mobify Logo" height="50" />
                    </HeaderBarTitle>
                </div>
            </HeaderBar>

            <Nav className="c-header__navigation" root={navigationRoot} path={path} onPathChange={onPathChange}>
                <MegaMenu className="c-header__navigation-megamenu" />
            </Nav>
        </div>
    )
}


DesktopHeader.propTypes = {
    navigationIsOpen: PropTypes.bool,
    navigationRoot: PropTypes.object,
    path: PropTypes.string,
    onPathChange: PropTypes.func,
}



class Header extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            navigationIsOpen: false,
            path: '/'
        }
    }

    openNavigation() {
        this.setState({navigationIsOpen: true})
        this.setState({path: '/'})
    }

    closeNavigation() {
        this.setState({navigationIsOpen: false})
        this.setState({path: '/'})
    }

    onPathChange(path, isLeaf, trigger) {
        const {router} = this.props
        this.setState({path})
        if (trigger === 'click' && isLeaf) {
            router.push(path)
            this.setState({navigationIsOpen: false}, () => this.setState({path: '/'}))
        }
    }

    render() {
        const {navigationRoot} = this.props
        const childProps = {
            openNavigation: this.openNavigation.bind(this),
            closeNavigation: this.closeNavigation.bind(this),
            navigationRoot,
            path: this.state.path,
            navigationIsOpen: this.state.navigationIsOpen,
            onPathChange: this.onPathChange.bind(this),
        }

        return (
            <Fragment>
                <MediaQuery maxWidth={breakpoints[sizes.LARGE] - 1}>
                    <MobileHeader {...childProps} />
                </MediaQuery>

                <MediaQuery minWidth={breakpoints[sizes.LARGE]}>
                    <DesktopHeader {...childProps} />
                </MediaQuery>
            </Fragment>
        )
    }
}

Header.propTypes = {
    router: PropTypes.object.isRequired,
    navigationRoot: PropTypes.object
}

export default withRouter(Header)
