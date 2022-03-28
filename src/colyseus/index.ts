import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as Colyseus from "colyseus.js";

let room: Colyseus.Room<any> | null = null;

function getRoom(): Colyseus.Room<any> {
  if (!room) {
    throw "ERROR: Tried to perform room operations without a connected room";
  }
  return room;
}

export type PlayerInfo = { health: number; name: string; currentSpell: string };

export type ColyseusState = {
  playerSessionId: string;
  playerInfo: PlayerInfo;
  opponentInfo: PlayerInfo | null;
};

const initialState: ColyseusState = {
  playerSessionId: "",
  playerInfo: { health: -9999, name: "DEFAULT_PLAYER", currentSpell: "" },
  opponentInfo: null,
};
export const colyseusSlice = createSlice({
  name: "colyseus",
  initialState: initialState,
    setPlayerSessionId: (state, action: PayloadAction<string>) => {
      state.playerSessionId = action.payload;
    },
    setPlayerInfo: (state, action: PayloadAction<PlayerInfo>) => {
      state.playerInfo = action.payload;
    },
    setOpponentInfo: (state, action: PayloadAction<PlayerInfo>) => {
      state.opponentInfo = action.payload;
    },
export const joinRoom = createAsyncThunk<void, string>(
  "lobby/joinRoom",
  async (userName, thunkAPI) => {
    var client = new Colyseus.Client("ws://localhost:2567");

    room = await client.joinOrCreate("battle_room", { name: userName });
    thunkAPI.dispatch(colyseusSlice.actions.setPlayerSessionId(room.sessionId));

    room.onStateChange((state: any) => {
      const room = getRoom();
      state = state.toJSON();
      const playerInfo = state.players[room.sessionId];
      const opponentName = Object.keys(state.players).find(
        (e: string) => e != room.sessionId
      );

      if (opponentName != undefined) {
        const opponentInfo = state.players[opponentName];
        thunkAPI.dispatch(colyseusSlice.actions.setOpponentInfo(opponentInfo));
      }
      thunkAPI.dispatch(colyseusSlice.actions.setPlayerInfo(playerInfo));
  }
);
