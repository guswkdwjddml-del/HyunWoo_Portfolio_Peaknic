import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


// 크루 목록을 비동기로 조회하는 Thunk
export const fetchCrewList = createAsyncThunk(
  'crew/fetchCrewList',
  async (params, { rejectWithValue }) => {
    try {
      // myJoin 여부에 따라 호출할 엔드포인트를 분기합니다.
      const endpoint = params.myJoin ? '/api/crews/myjoincrew' : '/api/crews/search';
      // 크루 목록 데이터 요청
      const response = await axios.get(`${endpoint}`, { params });
      // 성공 시 응답 데이터 반환
      return response.data;
    } catch (error) {
      // 에러 발생 시 백엔드 메시지 반환
      return rejectWithValue(error.response?.data?.message || '크루 목록 조회 실패');
    }
  }
);

// 크루 상세, 일정, 참여자를 한 번에 조회하는 Thunk
export const fetchCrewDetail = createAsyncThunk(
  'crew/fetchCrewDetail',
  async (id, { rejectWithValue }) => {
    try {
      // 3개의 API를 Promise.all로 병렬 처리하여 속도를 극대화
      const [crewRes, schRes, partRes] = await Promise.all([
        axios.get(`/api/crews/${id}`),
        axios.get(`/api/crew-schedules/crew/${id}`).catch(() => ({ data: [] })),
        axios.get(`/api/crews/${id}/participants`).catch(() => ({ data: [] }))
      ]);
      // 조회가 완료된 데이터 객체를 묶어서 반환
      return { crew: crewRes.data, schedules: schRes.data, participants: partRes.data };
    } catch (error) {
      // 에러 발생 시 백엔드 메시지를 반환
      return rejectWithValue(error.response?.data?.message || '크루 상세 정보 조회 실패');
    }
  }
);

// 크루 참여자 목록 조회 Thunk
export const fetchCrewParticipants = createAsyncThunk(
  'crew/fetchParticipants',
  async (crewId, { getState, rejectWithValue }) => {
    const state = getState();
    // 이미 해당 crewId의 참여자 목록이 Redux에 있으면 API 호출 생략 (불필요한 통신 방지)
    if (state.crew.participantsByCrew[crewId]) {
      return { crewId, data: state.crew.participantsByCrew[crewId] };
    }
    try {
      const response = await axios.get(`/api/crews/${crewId}/participants`);
      return { crewId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 크루 관련 전역 상태를 관리하는 Slice입니다.
const crewSlice = createSlice({
  name: 'crew',
  initialState: {
    crewList: [],
    totalPages: 0,
    totalElements: 0,
    crewDetail: null,
    schedules: [],
    participants: [],
    loading: false,
    error: null,
    searchFilters: { keyword: "", sido: "", sigungu: "", mountainName: "", isRecruiting: true, tags: [] },
    sort: "id,desc",
    page: 0,
    participantsByCrew: {}  // 크루 카드별 참여자 목록을 캐싱하는 객체 (예: { "1": [...], "2": [...] })
  },
  reducers: {
    // 검색 필터 상태를 전역으로 업데이트
    setSearchFilters: (state, action) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },
    // 정렬 기준 상태를 전역으로 업데이트
    setSort: (state, action) => { state.sort = action.payload; },
    // 현재 페이지 번호를 전역으로 업데이트
    setPage: (state, action) => { state.page = action.payload; },
    // 상세 페이지 진입 시 이전 데이터 잔상이 보이는 것을 방지하기 위해 초기화
    clearCrewDetail: (state) => {
      state.crewDetail = null;
      state.schedules = [];
      state.participants = [];
    },
    clearParticipantsCache: (state) => {
      state.participantsByCrew = {};
    }
  },
  extraReducers: (builder) => {
    builder
      // 크루 목록 요청 시작 시 로딩 상태를 true로 변경
      .addCase(fetchCrewList.pending, (state) => { state.loading = true; state.error = null; })
      // 크루 목록 요청 성공 시 데이터를 상태에 저장
      .addCase(fetchCrewList.fulfilled, (state, action) => {
        state.loading = false;
        state.crewList = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
      })
      // 크루 목록 요청 실패 시 에러 메시지를 저장
      .addCase(fetchCrewList.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // 크루 상세 요청 시작 시 로딩 상태를 true로 변경
      .addCase(fetchCrewDetail.pending, (state) => { state.loading = true; state.error = null; })
      // 크루 상세 요청 성공 시 상세 데이터를 상태에 저장
      .addCase(fetchCrewDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.crewDetail = action.payload.crew;
        state.schedules = action.payload.schedules;
        state.participants = action.payload.participants;
      })
      // 크루 상세 요청 실패 시 에러 메시지를 저장
      .addCase(fetchCrewDetail.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchCrewParticipants.pending, (state) => { state.loading = true; })
      .addCase(fetchCrewParticipants.fulfilled, (state, action) => {
        state.loading = false;
        // 크루 ID를 키(Key)값으로 하여 참여자 배열을 Redux 상태에 저장
        state.participantsByCrew[action.payload.crewId] = action.payload.data;
      })
      .addCase(fetchCrewParticipants.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export const { setSearchFilters, setSort, setPage, clearCrewDetail, clearParticipantsCache } = crewSlice.actions;
export default crewSlice.reducer;