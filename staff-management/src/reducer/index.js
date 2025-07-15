import {combineReducers} from "@reduxjs/toolkit"
import authReducer from '../services/slices/authSlice'

const rootReducer = combineReducers({
    auth: authReducer,
})

export default rootReducer;