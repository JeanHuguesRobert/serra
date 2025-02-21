import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    inputValue: ''
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setInputValue: (state, action) => {
      state.inputValue = action.payload;
    },
    clearInput: (state) => {
      state.inputValue = '';
    }
  }
});

export const { addMessage, setInputValue, clearInput } = chatSlice.actions;
export default chatSlice.reducer;