import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AdminState,User } from "../../interfaces/interface";

const initialState:AdminState = {
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
        getUserDataSuccess:(state,action:PayloadAction<User[]>)=>{
            state.userData = action.payload
            state.loading = false,
            state.error = false
        },
        getUserDataFailure:(state,action:PayloadAction<string>)=>{
            state.loading =  false,
            state.error = action.payload;
        },
        updateUserStatus:(state,action:PayloadAction<User>)=>{
            const updatedUser = action.payload
            const index = state.userData.findIndex(user=>user._id===updatedUser._id);
            if(index!==-1){
                state.userData[index] = updatedUser
            }
        },
        deleteUser:(state,action:PayloadAction<string>)=>{
            const userId = action.payload
            state.userData = state.userData.filter(user=>user._id!==userId)
        }
    }
})

export const {getUserDataStart,getUserDataSuccess,getUserDataFailure,updateUserStatus,deleteUser} = adminSlice.actions
export default adminSlice.reducer