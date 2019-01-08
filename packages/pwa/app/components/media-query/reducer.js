import {SET_MEDIA_QUERY_PROPS} from './actions'
import Immutable from 'immutable'

const mediaQueryPropsReducer = (state = Immutable.fromJS({isServerSide: true, values: {}}), action) => {
    switch (action.type) {
        case SET_MEDIA_QUERY_PROPS:
            return state.mergeDeep(action.payload)
        default:
            return state
    }
}

export default mediaQueryPropsReducer
