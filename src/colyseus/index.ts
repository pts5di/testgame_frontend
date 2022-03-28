import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as Colyseus from "colyseus.js";

let room: Colyseus.Room<any> | null = null;

function getRoom(): Colyseus.Room<any> {
  if (!room) {
    throw "ERROR: Tried to perform room operations without a connected room";
  }
  return room;
}
export const joinRoom = createAsyncThunk<void, string>(
  "lobby/joinRoom",
  async (userName, thunkAPI) => {
    var client = new Colyseus.Client("ws://localhost:2567");

    room = await client.joinOrCreate("battle_room", { name: userName });
  }
);
