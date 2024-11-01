import { configureStore } from "@reduxjs/toolkit";
import { reducer } from "./rootSlice";

export const store = configureStore({
    reducer,
})

export type IRootState = ReturnType<typeof store.getState>;
export type IAppDispatch = typeof store.dispatch;
