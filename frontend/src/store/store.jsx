import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slice/authSlice";
import cartSlice from "./slice/cartSlice";
import countSlice from "./slice/countSlice";
import crewSlice from "./slice/crewSlice";
import notificationSlice from "./slice/notificationSlice";
import paymentSlice from "./slice/paymentSlice";
import subscribeSlice from "./slice/subscribeSlice";

const store = configureStore({
  reducer: {
    counter: countSlice,
    auth: authSlice,
    cart: cartSlice,
    payment: paymentSlice,
    crew: crewSlice,
    notification: notificationSlice,
    subscribe: subscribeSlice
    // 최소 하나의 reducer 필요
  },
});

export default store;
