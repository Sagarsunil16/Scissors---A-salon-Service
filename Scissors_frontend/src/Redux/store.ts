import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer,persistStore } from "redux-persist";
import userReducer from './User/userSlice'
import adminReducer from './Admin/adminSlice'
import storage from "redux-persist/lib/storage"

const persistConfigUser = {
    key:"User",
    version:1,
    storage
}

const persistConfigAdmin = {
    key:"Admin",
    version:1,
    storage
}

const persistedUserReducer = persistReducer(persistConfigUser,userReducer)
const persistedAdminReducer = persistReducer(persistConfigAdmin,adminReducer)

const rootReducer = combineReducers({
    user:persistedUserReducer,
    admin:persistedAdminReducer
})

export const store = configureStore({
    reducer:rootReducer,
    middleware:(getDefaultMiddlewate)=>getDefaultMiddlewate({
        serializableCheck:false
    })
})

export const persistor = persistStore(store)