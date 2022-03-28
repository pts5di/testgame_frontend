import React from "react";
import "./App.css";
import { useAppSelector, useAppDispatch } from "./app/hooks";
import { RootState } from "./app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  joinRoom,
} from "./colyseus";
export const lobbySlice = createSlice({
  name: "lobby",
  initialState: {
    userName: "",
  reducers: {
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload;
    },
  },
});

function selectLobby(state: RootState) {
  return state.lobby;
}

function App() {
  return (
    <div className="App">
      <JoinForm />
    </div>
  );
}

function JoinForm() {
  const lobbyState = useAppSelector(selectLobby);
  const dispatch = useAppDispatch();
  return (
    <>
      <input
        value={lobbyState.userName}
        onChange={(event) => {
          dispatch(lobbySlice.actions.setUserName(event.currentTarget.value));
        }}
      ></input>
      <button
        onClick={(event) => {
          dispatch(joinRoom(lobbyState.userName));
        }}
          >
        Join a Duel
      </button>
    </>
  );
}

export default App;
