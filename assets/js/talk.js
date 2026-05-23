const TALK_RESPONSES = [
  "Thanks for reaching out. I can share details about recent projects and tech stack.",
  "Happy to chat. Ask me about Laravel, JavaScript, or performance work.",
  "I can walk you through the certificate stack or project highlights.",
  "Got it. I can also share availability and collaboration details.",
  "Great question. I will respond in more detail once the API is connected.",
];

function addTalkMessage(container, text, role, timeLabel) {
  const message = document.createElement("div");
  message.className = `talk-message ${role === "user" ? "from-user" : "from-ahmer"}`;

  const bubble = document.createElement("div");
  bubble.className = "talk-bubble";
  bubble.textContent = text;

  const time = document.createElement("span");
  time.className = "talk-time";
  time.textContent = timeLabel;

  message.appendChild(bubble);
  message.appendChild(time);
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
}

function getDemoReply() {
  const pick = Math.floor(Math.random() * TALK_RESPONSES.length);
  return TALK_RESPONSES[pick];
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("talkForm");
  const input = document.getElementById("talkInput");
  const messages = document.getElementById("talkMessages");
  const typing = document.getElementById("talkTyping");

  if (!form || !input || !messages || !typing) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    addTalkMessage(messages, value, "user", "you");
    input.value = "";
    input.focus();

    typing.classList.add("is-active");
    window.setTimeout(() => {
      typing.classList.remove("is-active");
      addTalkMessage(messages, getDemoReply(), "ahmer", "ahmer");
    }, 700);
  });
});
