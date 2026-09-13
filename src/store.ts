import { configureStore } from '@reduxjs/toolkit'; import { setupListeners } from '@reduxjs/toolkit/query'; import { api } from './api';
export const store = configureStore({ reducer:{ [api.reducerPath]:api.reducer }, middleware:g => g().concat(api.middleware) }); setupListeners(store.dispatch);

