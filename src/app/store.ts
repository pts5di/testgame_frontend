import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { lobbySlice } from "../App";
import { colyseusSlice } from "../colyseus";

export const store = configureStore({
  reducer: {
    lobby: lobbySlice.reducer,
    colyseus: colyseusSlice.reducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
