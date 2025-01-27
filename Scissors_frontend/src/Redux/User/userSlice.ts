import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser:null,
    loading:false,
    error:false
}

const userSlice = createSlice({
    name:"user",
    initialState,
    reducers:{
        signInstart:(state)=>{
            state.loading = true
        },
        signInSuccess:(state,action)=>{
            state.currentUser = action.payload
            state.loading = false
            state.error = false
        },
        signInFailure:(state,action)=>{
            state.error = action.payload
            state.loading =false
        },
        updateProfileStart:(state)=>{
            state.loading =true
        },
        updateProfileSuccess:(state,action)=>{
            state.currentUser = action.payload
            state.loading =false
            state.error =false
        },
        updateProfileFailure:(state,action)=>{
            state.error = action.payload,
            state.loading = false
        },
        signOut:(state)=>{
            state.currentUser = null
            state.loading = false,
            state.error = false
        }
    }
})

export const {signInstart,signInSuccess,signInFailure,updateProfileStart,updateProfileSuccess,updateProfileFailure,signOut} = userSlice.actions
export default userSlice.reducer