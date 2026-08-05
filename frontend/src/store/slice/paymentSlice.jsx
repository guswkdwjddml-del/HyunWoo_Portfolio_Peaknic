import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// yein 작성

// 결제하기 (단건 / 장바구니)
export const paymentInsert = createAsyncThunk(
  '/payment/paymentInsert',
  async ({ crewId, selectIds, paymentType }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/payment/insert`, { crewId, selectIds, paymentType });
      return res.data; // 카카오페이: redirectUrl / 일반결제: message
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "결제 중 오류가 발생했습니다.");
    }
  }
)

// 카카오페이 결제 승인 (카카오페이 인증 완료 후 호출)
export const paymentKakaoApprove = createAsyncThunk(
  '/payment/paymentKakaoApprove',
  async ({ orderNumber, pgToken }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/payment/approval/${orderNumber}`, null, {
        params: { pg_token: pgToken }
      });
      return res.data.cartItemIds; // 장바구니 아이템(결제 승인된 크루) ID (프론트 장바구니 상태 정리용)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "카카오페이 결제 승인 중 오류가 발생했습니다.");
    }
  }
)

// 카카오페이 결제 취소/실패
export const paymentKakaoCancelFail = createAsyncThunk(
  '/payment/paymentKakaoCancelFail',
  async ({ orderNumber, type }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/payment/${type}/${orderNumber}`); // type: cancel / fail
      return res.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "카카오페이 결제 처리 중 오류가 발생했습니다.");
    }
  }
)

// 결제 내역 출력
export const paymentList = createAsyncThunk(
  '/payment/paymentList',
  async (page, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/payment/list`, {
        params: { page, size: 5 }
      });
      return res.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "결제 내역 출력 중 오류가 발생했습니다.");
    }
  }
)

// 결제 상세 내역 출력
export const paymentDetail = createAsyncThunk(
  '/payment/paymentDetail',
  async (orderNumber, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/payment/detail/${orderNumber}`);
      return res.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "결제 상세 내역 출력 중 오류가 발생했습니다.");
    }
  }
)

// 참여 확정
export const paymentConfirmParticipation = createAsyncThunk(
  '/payment/paymentConfirmParticipation',
  async (paymentItemId, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/payment/confirm/${paymentItemId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "참여 확정 처리 중 오류가 발생했습니다.");
    }
  }
)

// 결제 내역 삭제 (숨기기)
export const paymentHidden = createAsyncThunk(
  '/payment/paymentHidden',
  async (paymentId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`/payment/hidden/${paymentId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "결제 내역 삭제 중 오류가 발생했습니다.");
    }
  }
)

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    paymentItem: [],
    paymentDetailItem: null,
    totalPages: 0,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 개별 성공 로직 (fulfilled)
      .addCase(paymentList.fulfilled, (state, action) => {
        state.paymentItem = action.payload.content;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(paymentDetail.fulfilled, (state, action) => {
        console.log(action.payload);
        state.paymentDetailItem = action.payload;
      })
      .addCase(paymentConfirmParticipation.fulfilled, (state, action) => {
        // 전체 결제 내역 중 해당 paymentItemId를 찾아서 참여 확정 상태를 true로 변경
        state.paymentItem.forEach(payment => {
          const item = payment.paymentItemDtos.find(i => i.id === action.payload.paymentItemId);
          if (item) item.participationConfirmed = true;
        })
      })
      .addCase(paymentHidden.fulfilled, (state, action) => {
        // 결제 내역 목록에서 해당 결제 건 제거
        state.paymentItem = state.paymentItem.filter(payment => payment.id !== action.payload.paymentId);
      })
      // 공통 로직 (pending, fulfilled, rejected)
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
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.error = action.payload || "서버 통신 중 에러가 발생했습니다";
        }
      )
  }
})

export default paymentSlice.reducer