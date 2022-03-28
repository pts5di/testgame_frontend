import React from "react";
import "./App.css";
import { useAppSelector, useAppDispatch } from "./app/hooks";
import { RootState } from "./app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { joinRoom, PlayerInfo, spellCast, spellChanged } from "./colyseus";

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

export const selectColyseusState = (state: RootState) => {
  return state.colyseus;
};
function PlayerStatus(props: { player: PlayerInfo }) {
  const player = props.player;
  return (
    <div>
      <div>Name: {player.name}</div>
      <div>Health: {player.health}</div>
    </div>
  );
}

function App() {
  const lobbyState = useAppSelector(selectLobby);
  const colyseusState = useAppSelector(selectColyseusState);
  const dispatch = useAppDispatch();

  return (
    <div className="App">
      {lobbyState.status == LobbyStatus.DEFAULT ? (
        <JoinForm />
      ) : lobbyState.status == LobbyStatus.JOINING ? (
        "Joining your wizard arena!"
      ) : lobbyState.status == LobbyStatus.JOINED ? (
        <div className="WizardArena">
          <div>Spells: {colyseusState.spellList.toString()}</div>
          <table>
            <tr>
              <td>
                <PlayerStatus player={colyseusState.playerInfo} />
              </td>
              <td>
                {colyseusState.opponentInfo && (
                  <PlayerStatus player={colyseusState.opponentInfo} />
                )}
              </td>
            </tr>
            <tr>
              <td colSpan={2}>Active Spells</td>
            </tr>
            <tr>
              <td>
                {/* Player's active spells */}
                {colyseusState.activeSpellList
                  .filter(
                    (activeSpell) =>
                      activeSpell.caster == colyseusState.playerSessionId
                  )
                  .map((activeSpell) => (
                    <div>
                      {activeSpell.spellName}{" "}
                      <progress
                        max={100}
                        value={
                          100 -
                          ((activeSpell.castFinishTime -
                            colyseusState.lastTickElapsedTime) /
                            (activeSpell.castFinishTime -
                              activeSpell.castStartTime)) *
                            100
                        }
                      />
                    </div>
                  ))}
              </td>
              <td>
                {/* Opponent's active spells */}
                {colyseusState.activeSpellList
                  .filter(
                    (activeSpell) =>
                      activeSpell.caster != colyseusState.playerSessionId
                  )
                  .map((activeSpell) => (
                    <div>
                      {activeSpell.spellName}{" "}
                      <progress
                        max={100}
                        value={
                          100 -
                          ((activeSpell.castFinishTime -
                            colyseusState.lastTickElapsedTime) /
                            (activeSpell.castFinishTime -
                              activeSpell.castStartTime)) *
                            100
                        }
                      />
                    </div>
                  ))}
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <input
                  value={colyseusState.playerInfo.currentSpell}
                  onKeyPress={(event) => {
                    if (event.key.toUpperCase() == "ENTER") {
                      dispatch(spellCast());
                    }
                  }}
                  onChange={(event) => {
                    dispatch(spellChanged(event.currentTarget.value));
                  }}
                />
              </td>
            </tr>
          </table>
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
