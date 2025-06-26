import { createSlice } from "@reduxjs/toolkit"
import {
  addContactThunk,
  deleteContactThunk,
  fetchContactsThunk,
} from "./thunks/contactsThunks"

const initialState = {
  data: [],
  loading: true,
  err: null,
}

const contactsSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    clearContacts: (state, action) => {
      state.loading = true
      state.data = []
    },
    updateContact: (state, action) => {
      const { userId, data } = action.payload
      state.data = state.data.map((contact) =>
        contact._id === userId ? { ...contact, ...data } : contact,
      )
    },
    deleteContact: (state, action) => {
      state.data = state.data.filter(
        (contact) => contact._id !== action.payload,
      )
    },
    addContact: (state, action) => {
      state.data.push(action.payload)
    },
  },
  extraReducers: (builder) => {
    // Fetch contacts
    builder.addCase(fetchContactsThunk.pending, (state, action) => {
      state.loading = true
    })
    builder.addCase(fetchContactsThunk.fulfilled, (state, action) => {
      state.loading = false
      state.data = action.payload
    })
    builder.addCase(fetchContactsThunk.rejected, (state, action) => {
      state.loading = false
      state.err = action.payload
    })

    //Delete contact
    builder.addCase(deleteContactThunk.pending, (state, action) => {
      state.loading = true
    })
    builder.addCase(deleteContactThunk.fulfilled, (state, action) => {
      state.loading = false
    })
    builder.addCase(deleteContactThunk.rejected, (state, action) => {
      state.loading = false
      state.err = action.payload
    })

    //Add contact
    builder.addCase(addContactThunk.pending, (state, action) => {
      state.loading = true
    })
    builder.addCase(addContactThunk.fulfilled, (state, action) => {
      state.loading = false
    })
    builder.addCase(addContactThunk.rejected, (state, action) => {
      state.loading = false
      state.err = action.payload
    })
  },
})

export const contactsReducer = contactsSlice.reducer
export const { clearContacts, updateContact, deleteContact, addContact } =
  contactsSlice.actions
