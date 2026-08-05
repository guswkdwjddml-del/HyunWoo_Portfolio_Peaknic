import { createSlice } from '@reduxjs/toolkit'
import React from 'react'

const initStateData = {
  isState:false,
  isUser:null,
  expireTime: null
}

const saveAuth = localStorage.getItem("auth")
const initialState = saveAuth ? JSON.parse(saveAuth) : initStateData

const authSlice = createSlice({
  name : "auth",
  initialState,
  reducers: {
    loginF : (state, action) => {
      state.isState = true
      state.isUser = action.payload.isUser
      state.expireTime = action.payload.expireTime;
      localStorage.setItem("auth", JSON.stringify({ isState: true, isUser: action.payload.isUser, expireTime: action.payload.expireTime }));
    },
    logoutF: (state) => {
      state.isState = false
      state.isUser = null
      state.expireTime = null
      localStorage.removeItem("auth")
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("accessTokenExpirationTime")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userName")
      localStorage.removeItem("userRole")
    },
    // 🌟 회원 정보가 변경되었을 때 호출하는 reducer
    updateUserInfo: (state, action) => {
      if (state.isUser) {
        state.isUser = { ...state.isUser, ...action.payload };
        const updatedAuth = { ...state, isUser: state.isUser };
        localStorage.setItem("auth", JSON.stringify(updatedAuth));
      }
    }
  }
})


export const{loginF, logoutF, updateUserInfo}=authSlice.actions;
export default authSlice.reducer