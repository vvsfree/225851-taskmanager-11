import moment from "moment";

export const formatTime = (time) => {
  return moment(time).format(`hh:mm`);
};

export const formatDate = (date) => {
  return moment(date).format(`DD MMMM`);
};
