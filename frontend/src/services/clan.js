import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const createClan = async (userId, clanName, description) => {
  const response = await axios.post(
    `${API_URL}/clan/create`,
    { userId, clanName, description },
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
  return response.data;
};

export const getClanList = async (search = '') => {
  const response = await axios.get(`${API_URL}/clan/list?search=${search}`);
  return response.data;
};

export const getClanDetails = async (clanId) => {
  const response = await axios.get(`${API_URL}/clan/${clanId}`);
  return response.data;
};

export const joinClan = async (userId, clanId, membershipDuration = 1) => {
  const response = await axios.post(
    `${API_URL}/clan/join`,
    { userId, clanId, membershipDuration },
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
  return response.data;
};

export const leaveClan = async (userId) => {
  const response = await axios.post(
    `${API_URL}/clan/leave`,
    { userId },
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
  return response.data;
};

export const upgradeClan = async (userId, clanId) => {
  const response = await axios.post(
    `${API_URL}/clan/upgrade`,
    { userId, clanId },
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
  return response.data;
};
