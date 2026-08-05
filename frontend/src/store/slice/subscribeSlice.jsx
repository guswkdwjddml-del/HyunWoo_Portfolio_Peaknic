import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// yein 작성

// 결제하기
export const subscribeInsert = createAsyncThunk(
  '/subscribe/subscribeInsert',
  async ({ subscribeType, paymentType }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/subscribe/insert`, { subscribeType, paymentType });
      return res.data; // 카카오페이: redirectUrl / 일반결제: message
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "결제 중 오류가 발생했습니다.");
    }
  }
)

// 카카오페이 결제 승인 (카카오페이 인증 완료 후 호출)
export const subscribeKakaoApprove = createAsyncThunk(
  '/subscribe/subscribeKakaoApprove',
  async ({ orderNumber, pgToken }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/subscribe/approval/${orderNumber}`, null, {
        params: { pg_token: pgToken }
      });
      return res.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "카카오페이 결제 승인 중 오류가 발생했습니다.");
    }
  }
)

// 카카오페이 결제 취소/실패
export const subscribeKakaoCancelFail = createAsyncThunk(
  '/subscribe/subscribeKakaoCancelFail',
  async ({ orderNumber, type }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/subscribe/${type}/${orderNumber}`); // type: cancel / fail
      return res.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "카카오페이 결제 처리 중 오류가 발생했습니다.");
    }
  }
)

// 구독 내역 출력 (구독 현황)
export const subscribeDetail = createAsyncThunk(
  '/subscribe/subscribeDetail',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/subscribe/detail`);
      return res.data.result; // 구독 상태 ACTIVE 아니면 null 반환
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "구독 현황 조회 중 오류가 발생했습니다.");
    }
  }
)

// 구독 결제 내역 출력
export const subscribeList = createAsyncThunk(
  '/subscribe/subscribeList',
  async (page, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/subscribe/list`, {
        params: { page, size: 5 }
      });
      return res.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "구독 결제 내역 출력 중 오류가 발생했습니다.");
    }
  }
)

// action.type('/subscribe/subscribeDetail/pending')에서 thunk 이름만 추출
const getThunkName = (actionType) => actionType.split('/')[2];

const subscribeSlice = createSlice({
  name: 'subscribe',
  initialState: {
    subscribeDetailItem: null, // 현재 구독 현황 (subscribeDetail)
    subscribeItem: [], // 구독 결제 내역 리스트 (subscribeList)
    totalPages: 0,

    insertLoading: false,
    insertError: null,

    detailLoading: false,
    detailError: null,

    listLoading: false,
    listError: null,
  },
  reducers: {
    // 로그아웃시 구독 Redux 초기화
    clearSubscribe: (state) => {
      state.subscribeDetailItem = null;
      state.subscribeItem = [];
      state.totalPages = 0;
      state.insertLoading = false;
      state.insertError = null;
      state.detailLoading = false;
      state.detailError = null;
      state.listLoading = false;
      state.listError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 개별 성공 로직 (fulfilled)
      .addCase(subscribeDetail.fulfilled, (state, action) => {
        state.subscribeDetailItem = action.payload;
      })
      .addCase(subscribeList.fulfilled, (state, action) => {
        state.subscribeItem = action.payload.content;
        state.totalPages = action.payload.totalPages;
      })
      // 공통 로직 (pending, fulfilled, rejected)
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state, action) => {
          const thunkName = getThunkName(action.type);
          if (thunkName === 'subscribeInsert') {
            state.insertLoading = true;
            state.insertError = null;
          } else if (thunkName === 'subscribeDetail') {
            state.detailLoading = true;
            state.detailError = null;
          } else if (thunkName === 'subscribeList') {
            state.listLoading = true;
            state.listError = null;
          }
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'),
        (state, action) => {
          const thunkName = getThunkName(action.type);
          if (thunkName === 'subscribeInsert') state.insertLoading = false;
          else if (thunkName === 'subscribeDetail') state.detailLoading = false;
          else if (thunkName === 'subscribeList') state.listLoading = false;
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

export const { clearSubscribe } = subscribeSlice.actions;

export default subscribeSlice.reducer