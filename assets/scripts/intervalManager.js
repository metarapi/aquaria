let intervalID = null;

export function setIntervalID(newID) {
  if (intervalID !== null) {
    clearInterval(intervalID);
  }
  intervalID = newID;
}

export function clearExistingInterval() {
  if (intervalID !== null) {
    clearInterval(intervalID);
    intervalID = null;
  }
}
