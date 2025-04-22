import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser:null,
    loading:false,
    error:null
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
            state.error = null
        },
        signInFailure:(state,action)=>{
            state.error = action.payload
            state.loading =false
        },
        signUpStart: (state) => {
            state.loading = true;
        },
        signUpSuccess: (state) => {
            state.loading = false;
            state.error = null;
        },
        signUpFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        updateProfileStart:(state)=>{
            state.loading =true
        },
        updateProfileSuccess:(state,action)=>{
            state.currentUser = action.payload
            state.loading =false
            state.error = null
        },
        updateProfileFailure:(state,action)=>{
            state.error = action.payload,
            state.loading = false
        },
        signOut:(state)=>{
            state.currentUser = null
            state.loading = false,
            state.error = null
        },
        
    }
})

export const {signInstart,signInSuccess,signInFailure,updateProfileStart,updateProfileSuccess,updateProfileFailure,signOut,signUpStart,signUpSuccess,signUpFailure} = userSlice.actions
export default userSlice.reducer