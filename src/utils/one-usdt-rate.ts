import axios from "axios";

const BINANCE_ENDPOINT = 'https://api.binance.com/api/v3/ticker/price?symbol=ONEUSDT';

const state = {
    lastCheck: 0,
    lastRate: 0,
};

export const getOneRate = async () => {
  if (new Date().getTime() - state.lastCheck < 60 * 1000) {
    return state.lastRate;
  }
  const data = await axios(BINANCE_ENDPOINT);

  state.lastCheck = new Date().getTime();
  state.lastRate = data.data.price;
  return data.data.price;
};
