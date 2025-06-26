import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { userReducer } from "./slices/userSlice"
import { chatroomsReducer } from "./slices/chatroomsSlice"
import { membersReducer } from "./slices/membersSlice"
import { contactsReducer } from "./slices/contactsSlice"
import { onlineStatusReducer } from "./slices/onlineStatusSlice"
import { messagesReducer } from "./slices/messagesSlice"
import { searchReducer } from "./slices/searchSlice"

const rootReducer = combineReducers({
  user: userReducer,
  chatrooms: chatroomsReducer,
  members: membersReducer,
  contacts: contactsReducer,
  onlineStatus: onlineStatusReducer,
  messages: messagesReducer,
  search: searchReducer,
})

const store = configureStore({
  reducer: rootReducer,
})

export default store
