document.addEventListener('DOMContentLoaded', () => {

  const joinScreen  = document.getElementById('join-screen');
  const app         = document.getElementById('app');
  const inpUser     = document.getElementById('input-username');
  const inpRoom     = document.getElementById('input-room');
  const btnJoin     = document.getElementById('btn-join');
  const btnLeave    = document.getElementById('btn-leave');
  const btnSend     = document.getElementById('btn-send');
  const msgInput    = document.getElementById('msg-input');
  const msgsScroll  = document.getElementById('messages');
  const msgsInner   = document.getElementById('messages-inner');
  const dispUser    = document.getElementById('display-username');
  const dispRoom    = document.getElementById('display-room');
  const roomsList   = document.getElementById('rooms-list');
  const usersList   = document.getElementById('users-list');
  const typingPill  = document.getElementById('typing-indicator');
  const onlineCount = document.getElementById('online-count');
  const charCount   = document.getElementById('char-count');
  const meAvatar    = document.getElementById('me-avatar');

  let lastAuthor = null, lastTime = 0;
  let typingTimer = null, isTyping = false;

  SocketClient.connect();
  inpUser.focus();

  // ── Socket events ────────────────────────────
  SocketClient.on('history', (msgs) => {
    msgsInner.innerHTML = '';
    lastAuthor = null; lastTime = 0;
    if (!msgs.length) { renderEmpty(); return; }
    msgs.forEach(renderMsg);
    scrollBottom();
  });

  SocketClient.on('message', (msg) => {
    removeEmpty(); renderMsg(msg); scrollBottom();
  });

  SocketClient.on('system_message', (msg) => {
    removeEmpty(); renderSys(msg.text); lastAuthor = null; scrollBottom();
  });

  SocketClient.on('user_joined',   ({ users }) => renderUsers(users));
  SocketClient.on('user_left',     ({ users }) => renderUsers(users));
  SocketClient.on('rooms_update',  renderRooms);

  SocketClient.on('typing', ({ username, isTyping: t }) => {
    if (t) { typingPill.textContent = `${username} is typing…`; typingPill.classList.remove('hidden'); }
    else   { typingPill.classList.add('hidden'); typingPill.textContent = ''; }
  });

  SocketClient.on('error', ({ message }) => flashError(message));

  // ── Join ─────────────────────────────────────
  function doJoin() {
    const u = inpUser.value.trim();
    const r = inpRoom.value.trim() || 'general';
    if (!u) { shake(inpUser); inpUser.focus(); return; }
    State.set(u, r);
    SocketClient.join(u, r);
    dispUser.textContent = u;
    dispRoom.textContent = r;
    meAvatar.textContent = u[0].toUpperCase();
    joinScreen.classList.add('out');
    setTimeout(() => { joinScreen.style.display = 'none'; app.classList.remove('hidden'); msgInput.focus(); }, 460);
  }

  btnJoin.addEventListener('click', doJoin);
  inpUser.addEventListener('keydown', e => e.key === 'Enter' && inpRoom.focus());
  inpRoom.addEventListener('keydown', e => e.key === 'Enter' && doJoin());

  // ── Leave ─────────────────────────────────────
  btnLeave.addEventListener('click', () => { State.clear(); SocketClient.disconnect(); location.reload(); });

  // ── Send ──────────────────────────────────────
  function doSend() {
    const t = msgInput.value.trim();
    if (!t) return;
    SocketClient.sendMessage(t);
    msgInput.value = '';
    updateCharCount(0);
    stopTyping();
  }
  btnSend.addEventListener('click', doSend);
  msgInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } });

  // ── Typing ────────────────────────────────────
  msgInput.addEventListener('input', () => {
    updateCharCount(msgInput.value.length);
    if (!isTyping) { isTyping = true; SocketClient.sendTyping(true); }
    clearTimeout(typingTimer);
    typingTimer = setTimeout(stopTyping, 2000);
  });
  function stopTyping() {
    if (isTyping) { isTyping = false; SocketClient.sendTyping(false); }
    clearTimeout(typingTimer);
  }
  function updateCharCount(n) {
    charCount.textContent = `${n} / 500`;
    charCount.classList.toggle('warn', n > 440);
  }

  // ── Render helpers ────────────────────────────
  function renderMsg(msg) {
    const ts      = msg.timestamp;
    const self    = State.isSelf(msg.username);
    const grouped = msg.username === lastAuthor && (ts - lastTime) < 90000;

    if (!grouped) {
      const prevDate = lastTime ? new Date(lastTime).toDateString() : null;
      if (prevDate !== new Date(ts).toDateString()) {
        const sep = document.createElement('div');
        sep.className = 'date-sep';
        sep.textContent = formatDate(ts);
        msgsInner.appendChild(sep);
      }
    }
    lastAuthor = msg.username; lastTime = ts;

    const block = document.createElement('div');
    block.className = `msg-block${self ? ' is-self' : ''}${grouped ? ' grouped' : ''}`;

    const ava = document.createElement('div');
    ava.className = 'msg-ava';
    ava.textContent = msg.username[0].toUpperCase();

    const bubbles = document.createElement('div');
    bubbles.className = 'msg-bubbles';

    if (!grouped) {
      const meta = document.createElement('div');
      meta.className = 'msg-meta';
      const author = document.createElement('span');
      author.className = 'msg-author';
      author.textContent = self ? 'You' : msg.username;
      const time = document.createElement('span');
      time.className = 'msg-time';
      time.textContent = formatTime(ts);
      meta.append(author, time);
      bubbles.appendChild(meta);
    }

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = msg.text;
    bubbles.appendChild(bubble);

    block.append(ava, bubbles);
    msgsInner.appendChild(block);
  }

  function renderSys(text) {
    const el = document.createElement('div');
    el.className = 'msg-sys';
    el.textContent = `— ${text} —`;
    msgsInner.appendChild(el);
  }

  function renderEmpty() {
    if (msgsInner.querySelector('.empty-state')) return;
    msgsInner.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💬</div>
        <strong>No messages yet</strong>
        <span>Be the first to say something.</span>
      </div>`;
  }

  function removeEmpty() {
    const e = msgsInner.querySelector('.empty-state');
    if (e) e.remove();
  }

  function renderUsers(users) {
    usersList.innerHTML = '';
    onlineCount.textContent = `${users.length} online`;
    users.forEach(u => {
      const li = document.createElement('li');
      const self = State.isSelf(u.username);
      if (self) li.className = 'is-me';
      const ava = document.createElement('div');
      ava.className = 'member-avatar';
      ava.textContent = u.username[0].toUpperCase();
      const nm = document.createElement('span');
      nm.className = 'member-name';
      nm.textContent = self ? `${u.username} (you)` : u.username;
      li.append(ava, nm);
      usersList.appendChild(li);
    });
  }

  function renderRooms(rooms) {
    roomsList.innerHTML = '';
    rooms.forEach(({ room, count }) => {
      const li = document.createElement('li');
      if (room === State.room) li.className = 'active';
      li.innerHTML = `<span class="room-hash">#</span><span class="room-label">${esc(room)}</span><span class="room-badge">${count}</span>`;
      li.addEventListener('click', () => {
        if (room === State.room) return;
        State.set(State.username, room);
        SocketClient.join(State.username, room);
        dispRoom.textContent = room;
        msgsInner.innerHTML = '';
        lastAuthor = null; lastTime = 0;
      });
      roomsList.appendChild(li);
    });
  }

  function scrollBottom() { msgsScroll.scrollTop = msgsScroll.scrollHeight; }
  function formatTime(ts) { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  function formatDate(ts) {
    const d = new Date(ts), today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yest = new Date(today); yest.setDate(yest.getDate() - 1);
    if (d.toDateString() === yest.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  }
  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function shake(el) {
    el.style.animation = 'none'; void el.offsetWidth;
    el.style.animation = 'shakeEl .32s ease';
    el.addEventListener('animationend', () => el.style.animation = '', { once: true });
  }
  function flashError(msg) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1816;color:#fff;border-radius:10px;padding:10px 20px;font-size:.85rem;z-index:999;box-shadow:0 4px 20px rgba(0,0,0,.2)`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  const s = document.createElement('style');
  s.textContent = `@keyframes shakeEl{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`;
  document.head.appendChild(s);
});
