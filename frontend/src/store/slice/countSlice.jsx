import React from 'react'
import { createSlice } from '@reduxjs/toolkit'

const initialStateData={
  num:1
}

const countSlice = createSlice({
  name:'counter',
  initialState:initialStateData,
  reducers:{
    plus:state=>{
      state.num+=1
    },
    minus:state=>{
      state.num<=1?state.num=1:state.num-=1
    },
    reset:state=>{
      state.num=0
    }
  }
})


export const {plus, minus, reset} = countSlice.actions;
export default countSlice.reducer;