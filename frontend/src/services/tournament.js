import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getActiveTournaments = async () => {
  const response = await axios.get(`${API_URL}/tournament/active`);
  return response.data;
};

export const enterTournament = async (userId, tournamentId, ticketsUsed = 1) => {
  const response = await axios.post(
    `${API_URL}/tournament/enter`,
    { userId, tournamentId, ticketsUsed },
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
  return response.data;
};

export const getLeaderboard = async (type) => {
  const response = await axios.get(`${API_URL}/tournament/leaderboard/${type}`);
  return response.data;
};

export const getUserStats = async (userId) => {
  const response = await axios.get(
    `${API_URL}/tournament/stats/${userId}`,
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
  return response.data;
};

export const recordMatchResult = async (userId, tournamentId, won) => {
  const response = await axios.post(
    `${API_URL}/tournament/match-result`,
    { userId, tournamentId, won },
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
  return response.data;
};
