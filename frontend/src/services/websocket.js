import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

const getWebSocketUrl = () => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return 'http://localhost:8080/ws';
  }
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  return `${protocol}//${window.location.host}/ws`;
};

export const connectWebSocket = (onMessage) => {
  const socket = new SockJS(getWebSocketUrl());
  stompClient = new Client({
    webSocketFactory: () => socket,
    onConnect: () => {
      console.log('WebSocket connected');
      stompClient.subscribe('/user/queue/messages', (msg) => {
        onMessage(JSON.parse(msg.body));
      });
    },
    onStompError: (frame) => console.error('STOMP error:', frame),
  });
  stompClient.activate();
  return stompClient;
};

export const sendMessage = (destination, body) => {
  if (stompClient?.connected) {
    stompClient.publish({ destination, body: JSON.stringify(body) });
  }
};

export const disconnectWebSocket = () => {
  if (stompClient) stompClient.deactivate();
};
