// utils/supportTicket.api.ts
import { getToken } from './storage';

const BASE_URL = 'http://192.168.29.108:5000/api/v1/admin';

export const createTicket = async (title: string, description: string) => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description }),
  });
  return res.json();
};

export const getMyTickets = async () => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/tickets`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getTicketById = async (id: string) => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/tickets/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const replyToTicket = async (id: string, message: string) => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/tickets/reply/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });
  return res.json();
};

export const closeTicket = async (id: string) => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/tickets/close/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};