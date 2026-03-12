import { io } from 'socket.io-client';

const URL = 'https://focus-together-timer.onrender.com';
export const socket = io(URL, { autoConnect: true });
