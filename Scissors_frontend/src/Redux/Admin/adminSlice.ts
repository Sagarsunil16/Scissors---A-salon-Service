import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    userData :[],
    loading:false,
    error:false
}

const adminSlice = createSlice({
    name:"Admin",
    initialState,
    reducers:{
        getUserDataStart:(state)=>{
            state.loading =true
        },
        getUserDataSuccess:(state,action)=>{
            state.userData = action.payload
            state.loading = false,
            state.error = false
        },
        getUserDataFailure:(state,action)=>{
            state.loading =  false,
            state.error = action.payload;
        }
    }
})

export const {getUserDataStart,getUserDataSuccess,getUserDataFailure} = adminSlice.actions
export default adminSlice.reducer