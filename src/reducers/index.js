import {combineReducers} from 'redux'
import {initialState} from "../initialState";
import { wsState } from '../initialState';

export function counterApp(state = initialState, action) {
    switch (action.type) {
        case 'new_messages':
            return {
                messages: [...state.messages, action.body],
                coins: [...state.coins, action.body],
                lastm: action.body.text
            }
            break;
        
        case 'new_coin':
            return {
                messages: [...state.messages],
                coins: [...state.coins, action.body],
                lastm: action.body.text
            }
        
        case 'del_coin':
            return {
                messages: [...state.messages],
                coins: state.coins.reduce((p,c) => (c['symbol'] !== action.body['symbol'] && p.push(c),p),[]),
                lastm: action.body.text
            }

        case 'reset':
            return {messages: []}
        
        default:
            return state
    }

    // return state;
}

export function websocketApp(state = wsState, action) {
    switch (action.type) {
        case 'new_message':
            return {
                messages: [...wsState.messages, action.body]
            }

        case 'reset':
            return {messages: []}

        default:
            return state
    }

    // return state;
}

const rootReducer = combineReducers({counterApp})
// const wsReducer = combineReducers({websocketApp})

export default rootReducer;
