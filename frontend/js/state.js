const State = (() => {
  let _username = '';
  let _room = '';
  return {
    get username() { return _username; },
    get room()     { return _room; },
    set(username, room) { _username = username; _room = room; },
    clear() { _username = ''; _room = ''; },
    isSelf(username) { return username === _username; },
  };
})();
