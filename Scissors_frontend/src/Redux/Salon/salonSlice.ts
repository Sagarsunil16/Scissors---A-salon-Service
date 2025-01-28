import { createSlice } from "@reduxjs/toolkit";

const initialState ={
    salon:null,
    loading:false,
    error:false
}

const salonSlice = createSlice({
    name:"salon",
    initialState,
    reducers:{
        signInStart:((state)=>{
            state.loading=true
        }),
        signInSuccess:((state,action)=>{
            state.salon = action.payload,
            state.loading = false,
            state.error =false
        }),
        signInFailure:((state,action)=>{
            state.error = action.payload,
            state.loading = false
        }),
        signOut:((state)=>{
            state.salon = null,
            state.loading = false,
            state.error = false
        }),
       updateSalon:((state,action)=>{
        state.salon = action.payload
       })
    }
})

export const {signInStart,signInSuccess,signInFailure,signOut,updateSalon} = salonSlice.actions
export default salonSlice.reducer