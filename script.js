const API_KEY = 'AIzaSyBzxvkS6hjEF_8mmi1ogYTJOKOBRlYnR64'
let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`

let prompt = document.querySelector("#prompt");
let sendbtn = document.getElementById("sendBtn");

document.addEventListener('DOMContentLoaded',()=>{
  document.title=`Fizzup-AI Assistant`
})

const createChatBox = (input, className) => {
  let chat = document.createElement('div')
  chat.classList.add(className);
  if (className == 'user-chat') {
    chat.innerHTML = `  <p>${input}</p>`
  }
  else {
    chat.innerHTML = `  <div class="bot-chat">
                <div class="responseText">
                    <div class="img"><i class="fa-solid fa-fish"></i></div>
                    <p class="bot-reply"></p>
               
                <div class="loader">
                <div></div>
                <div></div>
                <div></div>
            </div> </div>
                <div class="line hide"></div>
                <div class="options hide">
                    <i class="fa-solid fa-copy"></i>
                    <i class="fa-solid fa-volume-high"></i>
                </div>
              
            </div>
           `
  }
  return chat

}

const handleSend = async() => {
  let userInput = prompt.value;
  if (!userInput || userInput.trim() === '') return;

  let head=document.querySelector('.head')
  head.style.display="none"
  let chat = createChatBox(userInput, 'user-chat')
  document.querySelector('.chat-container').appendChild(chat)
  prompt.value = ''

  chat = createChatBox('', 'bot-chat')
  document.querySelector('.chat-container').appendChild(chat)
  // console.log("Before Gemini call")
  let res =await getGeminiResponse(userInput)

  let bot_reply=res.candidates[0].content.parts[0].text
  bot_reply = bot_reply.replace(/\*/g, ' ');

  let loader=chat.querySelector('.loader')
  loader.style.display="none"
  let options=chat.querySelector('.options')
  let line=chat.querySelector('.line')
  line.classList.remove('hide')
  options.classList.remove('hide')
  chat.querySelector('.bot-reply').textContent=bot_reply;

  document.querySelector('.chat-container').scrollTop = document.querySelector('.chat-container').scrollHeight;


}


const getGeminiResponse = async (promptText) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  const body = {
    contents: [
      {
        parts: [
          { text: promptText }
        ]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    })
    const data = await response.json();
    console.log("AI Response :", data)
    return data
    // console.log(data.candidates[0].content.parts[0].text)
  } catch (err) {
    alert("Error :", err)
    return;
  }

}

sendbtn.addEventListener("click", handleSend);
prompt.addEventListener('keydown', (e) => {
  if (e.key == "Enter") handleSend();
})

document.querySelector('.chat-container').addEventListener('click', (e) => {
  const optionBox = e.target.closest('.options');
  if (!optionBox) return;

  const replyText = optionBox.parentElement.querySelector('.bot-reply')?.textContent;
  const volumeIcon = e.target;

  // COPY FUNCTIONALITY
  if (volumeIcon.classList.contains('fa-copy')) {
    if (replyText) {
      navigator.clipboard.writeText(replyText).catch(() => alert("Could not copy the text"));
    }
    console.log("copy clicked");
    return;
  }

  // VOLUME FUNCTIONALITY
  if (volumeIcon.classList.contains('fa-volume-high') || volumeIcon.classList.contains('fa-volume-xmark')) {
    // Check if this icon is currently the playing one
    const isCurrentlyPlaying = volumeIcon.classList.contains('fa-volume-xmark');

    // Always stop any ongoing speech first
    speechSynthesis.cancel();

    // Reset all icons to default
    document.querySelectorAll('.fa-volume-xmark').forEach(icon => {
      icon.classList.remove('fa-volume-xmark');
      icon.classList.add('fa-volume-high');
    });

    // If the clicked icon was already speaking, we just stop and return
    if (isCurrentlyPlaying) return;

    // Start new speech
    if (replyText) {
      const utterance = new SpeechSynthesisUtterance(replyText);

      volumeIcon.classList.remove('fa-volume-high');
      volumeIcon.classList.add('fa-volume-xmark');

      utterance.onend = () => {
        volumeIcon.classList.remove('fa-volume-xmark');
        volumeIcon.classList.add('fa-volume-high');
      };

      speechSynthesis.speak(utterance);
    }
  }
});
