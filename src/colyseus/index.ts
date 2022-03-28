import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as Colyseus from "colyseus.js";

let room: Colyseus.Room<any> | null = null;

function getRoom(): Colyseus.Room<any> {
  if (!room) {
    throw "ERROR: Tried to perform room operations without a connected room";
  }
  return room;
}

export type ActiveSpell = {
  spellName: string;
  caster: string;
  castStartTime: number;
  castFinishTime: number;
};

export type PlayerInfo = { health: number; name: string; currentSpell: string };

export type ColyseusState = {
  lastTickElapsedTime: number;
  playerSessionId: string;
  playerInfo: PlayerInfo;
  opponentInfo: PlayerInfo | null;
  spellList: string[];
  activeSpellList: ActiveSpell[];
};

const initialState: ColyseusState = {
  lastTickElapsedTime: 0,
  playerSessionId: "",
  playerInfo: { health: -9999, name: "DEFAULT_PLAYER", currentSpell: "" },
  opponentInfo: null,
  spellList: [],
  activeSpellList: [],
};

export const colyseusSlice = createSlice({
  name: "colyseus",
  initialState: initialState,
  reducers: {
    setLastTickElapsedTime: (state, action: PayloadAction<number>) => {
      state.lastTickElapsedTime = action.payload;
    },
    setPlayerSessionId: (state, action: PayloadAction<string>) => {
      state.playerSessionId = action.payload;
    },
    setPlayerCurrentSpell: (state, action: PayloadAction<string>) => {
      state.playerInfo.currentSpell = action.payload;
    },
    setPlayerInfo: (state, action: PayloadAction<PlayerInfo>) => {
      state.playerInfo = {
        ...action.payload,
        currentSpell: state.playerInfo.currentSpell,
      };
    },
    setOpponentInfo: (state, action: PayloadAction<PlayerInfo>) => {
      state.opponentInfo = action.payload;
    },
    setSpellList: (state, action: PayloadAction<string[]>) => {
      state.spellList = action.payload;
    },
    setActiveSpellList: (state, action: PayloadAction<ActiveSpell[]>) => {
      state.activeSpellList = action.payload;
    },
  },
});

export const joinRoom = createAsyncThunk<void, string>(
  "lobby/joinRoom",
  async (userName, thunkAPI) => {
    var client = new Colyseus.Client("ws://localhost:2567");

    room = await client.joinOrCreate("battle_room", { name: userName });
    thunkAPI.dispatch(colyseusSlice.actions.setPlayerSessionId(room.sessionId));

    room.onStateChange((state: any) => {
      const room = getRoom();
      state = state.toJSON();
      thunkAPI.dispatch(
        colyseusSlice.actions.setLastTickElapsedTime(state.elapsedTime)
      );

      const playerInfo = state.players[room.sessionId];
      const opponentName = Object.keys(state.players).find(
        (e: string) => e != room.sessionId
      );

      if (opponentName != undefined) {
        const opponentInfo = state.players[opponentName];
        thunkAPI.dispatch(colyseusSlice.actions.setOpponentInfo(opponentInfo));
      }
      thunkAPI.dispatch(colyseusSlice.actions.setPlayerInfo(playerInfo));
      thunkAPI.dispatch(colyseusSlice.actions.setSpellList(state.spells));
      thunkAPI.dispatch(
        colyseusSlice.actions.setActiveSpellList(state.activeSpells)
      );
    });
  }
);
const sleep = async (msToSleep: number) => {
  let resolve: (() => void) | null = null;
  const promise = new Promise<void>((_resolve) => (resolve = _resolve));
  window.setTimeout(() => resolve && resolve(), msToSleep);
  return promise;
};
let spellChangedThrottle: Promise<void> | null = null;
export const spellChanged = createAsyncThunk<void, string>(
  "lobby/spellChanged",
  async (currentSpell, thunkAPI) => {
    thunkAPI.dispatch(
      colyseusSlice.actions.setPlayerCurrentSpell(currentSpell)
    );

    if (!spellChangedThrottle) {
      spellChangedThrottle = sleep(16);
      const room = getRoom();
      room.send("spellInProgress", { currentSpell });
      await spellChangedThrottle;
      spellChangedThrottle = null;
    }
  }
);

export const spellCast = createAsyncThunk<void, void>(
  "lobby/spellCast",
  async (_, thunkAPI) => {
    const room = getRoom();
    room.send("spellCast");
    thunkAPI.dispatch(colyseusSlice.actions.setPlayerCurrentSpell(""));
  }
);
