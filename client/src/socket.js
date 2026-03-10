import { io } from 'socket.io-client';

// Dev server runs on 5173, backend on 3001
const URL = import.meta.env.PROD ? '/' : `http://${window.location.hostname}:3001`;
export const socket = io(URL, { autoConnect: true });
