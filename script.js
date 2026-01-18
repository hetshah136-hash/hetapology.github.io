* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ===== Base ===== */
body {
  background: #fbf8f4;
  color: #2c2c2c;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* ===== Background canvas ===== */
#bgCanvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
}

/* ===== Page ===== */
.page {
  position: relative;
  z-index: 1;
  max-width: 540px;
  margin: 0 auto;
  padding: 76px 22px 104px;
}

/* ===== Quiet lines ===== */
.quiet {
  text-align: center;
  font-size: 14.5px;
  color: #6a6a6a;
  letter-spacing: 0.2px;
}

.quiet.top {
  margin-bottom: 26px;
}

.quiet.bottom {
  margin-top: 26px;
  min-height: 22px;
}

/* ===== Heart ===== */
.heart-wrap {
  display: flex;
  justify-content: center;
  margin: 18px 0 10px;
}

#heartCanvas {
  max-width: 100%;
  height: auto;
  filter: drop-shadow(0 6px 14px rgba(0,0,0,0.06));
}

/* ===== Letter ===== */
.letter {
  margin-top: 84px;
}

.letter p {
  margin-bottom: 24px;
  line-height: 1.9;
  font-size: 17.2px;
  letter-spacing: 0.15px;
}

/* ===== Quote ===== */
.quote {
  margin: 96px 0;
  text-align: center;
  color: #3f3f3f;
}

.quote .intro {
  margin-bottom: 18px;
  font-size: 13.8px;
  color: #777;
  letter-spacing: 0.25px;
}

blockquote {
  font-style: italic;
  line-height: 1.85;
  margin: 0 auto 18px;
  max-width: 92%;
}

.quote .outro {
  font-size: 13.8px;
  color: #777;
}

/* ===== Ask ===== */
.ask {
  margin-top: 104px;
  text-align: center;
}

.ask h2 {
  font-size: 21px;
  font-weight: normal;
  margin-bottom: 36px;
  letter-spacing: 0.2px;
}

/* ===== Buttons ===== */
.buttons {
  display: flex;
  justify-content: center;
  gap: 26px;
}

button {
  padding: 13px 30px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-size: 14.8px;
  background: #ead8d8;
  color: #2c2c2c;
  transition: background 0.25s ease, transform 0.15s ease;
}

button:hover {
  background: #e1c4c4;
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* ===== Answer ===== */
.answer {
  margin-top: 36px;
  font-size: 15.5px;
  min-height: 22px;
  color: #444;
}

/* ===== Mobile ===== */
@media (max-width: 480px) {
  .page {
    padding: 64px 18px 92px;
  }
  .letter p {
    font-size: 16.8px;
  }
}
