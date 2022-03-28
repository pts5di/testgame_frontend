import React from "react";
import "./App.css";
import { useAppSelector, useAppDispatch } from "./app/hooks";
import { RootState } from "./app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  joinRoom,
} from "./colyseus";

enum LobbyStatus {
  DEFAULT = 0,
  JOINING = 1,
  JOINED = 2,
  ERROR = 3,
}
export const lobbySlice = createSlice({
  name: "lobby",
  initialState: {
    userName: "",
    status: LobbyStatus.DEFAULT,
  },
  reducers: {
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(joinRoom.pending, (state, action) => {
        state.status = LobbyStatus.JOINING;
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.status = LobbyStatus.JOINED;
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.status = LobbyStatus.ERROR;
      });
  },
});

function selectLobby(state: RootState) {
  return state.lobby;
}

function App() {
  return (
    <div className="App">
      {lobbyState.status == LobbyStatus.DEFAULT ? (
      <JoinForm />
      ) : lobbyState.status == LobbyStatus.JOINING ? (
        "Joining your wizard arena!"
      ) : lobbyState.status == LobbyStatus.JOINED ? (
        <div className="WizardArena">
        </div>
      ) : (
        "You have gone too far! An error has occurred!"
      )}
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
