import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AdminState,ISalon,User } from "../../interfaces/interface";

const initialState:AdminState = {
    currentUser:"",
    userData :{
        userData:[],
        totalUserPages:''
    },
    salonData:{
        salonData:[],
        totalSalonPages:''
    },
    loading:false,
    error:false
}

const adminSlice = createSlice({
    name:"Admin",
    initialState,
    reducers:{
        signInStart:(state)=>{
            state.loading = false
        },
        signInSuccess:(state,action:PayloadAction<User>)=>{
            state.currentUser = action.payload
            state.loading = false
            state.error = false
        },
        signInFailure:(state,action:PayloadAction<string>)=>{
            state.loading = false
            state.error = action.payload
        },
        getUserDataStart:(state)=>{
            state.loading =true
        },
        getUserDataSuccess:(state,action:PayloadAction<User[]>)=>{
            state.userData.userData = action.payload
            state.loading = false,
            state.error = false
        },
        getUserDataFailure:(state,action:PayloadAction<string>)=>{
            state.loading =  false,
            state.error = action.payload;
        },
        updateUserData:(state,action:PayloadAction<User[]>)=>{
            state.userData.userData = action.payload
        },
        updateUserStatus:(state,action:PayloadAction<User>)=>{
            const updatedUser = action.payload
            const index = state.userData.userData.findIndex(user=>user._id===updatedUser._id);
            if(index!==-1){
                state.userData.userData[index] = updatedUser
            }
        },
        deleteUser:(state,action:PayloadAction<string>)=>{
            const userId = action.payload
            state.userData.userData = state.userData.userData.filter(user=>user._id!==userId)
        },
        getSalonDataStart:(state)=>{
            state.loading =true
        },
        getSalonDataSuccess:(state,action:PayloadAction<ISalon[]>)=>{
            state.salonData.salonData = action.payload
            state.loading = false,
            state.error = false
        },
        getSalonDataFailure:(state,action:PayloadAction<string>)=>{
            state.loading =  false,
            state.error = action.payload;
        },
        updateSalonStatus:(state,action:PayloadAction<ISalon>)=>{
            const updatedSalon = action.payload
            const index =  state.salonData.salonData.findIndex((salon)=>salon._id === updatedSalon._id)
            if(index!==-1){
                state.salonData.salonData[index] = updatedSalon
            }
        },
        updateProfileData:(state,action:PayloadAction<ISalon>)=>{
            state.currentUser = action.payload
        },
        signOut:(state)=>{
            state.currentUser = "",
            state.userData = {  userData:[],
                totalUserPages:''},
            state.salonData = {
                  salonData:[],
                totalSalonPages:''
            }   
            state.loading = false,
            state.error = ""
        }
    }
})

export const {signInStart,signInSuccess,signInFailure,getUserDataStart,getUserDataSuccess,getUserDataFailure,updateUserStatus,deleteUser,updateUserData, getSalonDataStart, getSalonDataSuccess, getSalonDataFailure,updateSalonStatus,updateProfileData,signOut} = adminSlice.actions
export default adminSlice.reducer