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
        start:((state)=>{
            state.loading= true
        }),
        stop:((state,action)=>{
            state.loading = false
            state.error = action.payload
        }),
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
       }),
       addImagesSalon:((state,action)=>{
        state.salon = action.payload
        state.loading = false
       }),
       deleteImageSalon:((state,action)=>{
        state.salon = action.payload
        state.loading = false
       }),
       addNewService:((state,action)=>{
        state.salon = action.payload
       })
    }
})

export const {signInStart,signInSuccess,signInFailure,signOut,updateSalon,addImagesSalon,deleteImageSalon,start,stop,addNewService} = salonSlice.actions
export default salonSlice.reducer