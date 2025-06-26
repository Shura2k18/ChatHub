import { createSlice } from "@reduxjs/toolkit"
import { searchChatroomsThunk, searchUsersThunk } from "./thunks/searchThunks"

const initialState = {
  data: {},
  loading: true,
  err: null,
}

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    clearSearch: (state, action) => {
      state.loading = true
      state.data = {}
    },
  },
  extraReducers: (builder) => {
    // Search users
    builder.addCase(searchUsersThunk.pending, (state, action) => {
      state.loading = true
    })
    builder.addCase(searchUsersThunk.fulfilled, (state, action) => {
      state.loading = false
      state.data = action.payload
    })
    builder.addCase(searchUsersThunk.rejected, (state, action) => {
      state.loading = false
      state.err = action.payload
    })

    // Search chatrooms
    builder.addCase(searchChatroomsThunk.pending, (state, action) => {
      state.loading = true
    })
    builder.addCase(searchChatroomsThunk.fulfilled, (state, action) => {
      state.loading = false
      state.data = action.payload
    })
    builder.addCase(searchChatroomsThunk.rejected, (state, action) => {
      state.loading = false
      state.err = action.payload
    })
  },
})

export const searchReducer = searchSlice.reducer
export const { clearSearch } = searchSlice.actions
