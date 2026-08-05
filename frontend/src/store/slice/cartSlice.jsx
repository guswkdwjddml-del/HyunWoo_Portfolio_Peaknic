import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// yein 작성

// 장바구니 담기
export const cartInsert = createAsyncThunk(
  '/cart/cartInsert',
  async ({ accessToken, guestId, crewId }, { rejectWithValue }) => {
    try {
      const url = accessToken ? `/cart/insert` : `/cart/guest/insert`;
      const data = accessToken ? { crewId } : { guestId, crewId }
      const res = await axios.post(url, data);
      return res.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "장바구니 담기 중 오류가 발생했습니다.");
    }
  }
)

// 장바구니 목록 출력
export const cartListPrint = createAsyncThunk(
  '/cart/cartListPrint',
  async ({ accessToken, guestId }, { rejectWithValue }) => {
    try {
      const url = accessToken ? `/cart/list` : `/cart/guest/list/${guestId}`;
      const res = await axios.get(`${url}`);
      return res.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "장바구니 목록 출력 중 오류가 발생했습니다.");
    }
  }
)

// 장바구니 병합
export const cartMerge = createAsyncThunk(
  '/cart/cartMerge',
  async ({ guestId }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/cart/merge/${guestId}`);
      return res.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "장바구니 병합 중 오류가 발생했습니다.");
    }
  }
)

// 장바구니 아이템 삭제
export const cartDelete = createAsyncThunk(
  '/cart/cartDelete',
  async ({ accessToken, guestId, selectIds }, { rejectWithValue }) => {
    try {
      const url = accessToken ? `/cart/delete/item` : `/cart/delete/item/${guestId}`;
      const res = await axios.delete(`${url}`, { data: selectIds });
      return {
        message: res.data.message, selectIds
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "장바구니 아이템 삭제 중 오류가 발생했습니다.");
    }
  }
)

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItem: [],
    loading: false,
    error: null
  },
  reducers: {
    // 결제한 장바구니 아이템 삭제
    removeCartItem: (state, action) => {
      state.cartItem = state.cartItem.filter(
        item => !action.payload.includes(item.id ?? item.crewId));
    },
    // 로그아웃시 장바구니 Redux 초기화
    clearCart: (state) => {
      state.cartItem = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 개별 성공 로직 (fulfilled)
      .addCase(cartListPrint.fulfilled, (state, action) => {
        state.cartItem = action.payload;
      })
      .addCase(cartDelete.fulfilled, (state, action) => {
        state.cartItem = state.cartItem.filter(
          item => !action.payload.selectIds.includes(item.id ?? item.crewId)
        );
      })
      // cartListPrint 실패 로직 (rejected)
      .addCase(cartListPrint.rejected, (state, action) => {
        state.error = action.payload || "서버 통신 중 에러가 발생했습니다";
      })
      // 공통 로직 (pending, fulfilled)
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'),
        (state) => {
          state.loading = false;
        }
      )
  }
})

export const { removeCartItem, clearCart } = cartSlice.actions;

export default cartSlice.reducer;