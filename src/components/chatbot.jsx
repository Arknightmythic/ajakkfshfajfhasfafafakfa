import { useEffect } from 'react';

const DifyChatbot = () => {
  useEffect(() => {
    if (document.getElementById('GJQPX1Y9DoUz4qK0')) return;

    const configScript = document.createElement('script');
    configScript.innerHTML = `
      window.difyChatbotConfig = {
        token: 'GJQPX1Y9DoUz4qK0',
        baseUrl: 'http://localhost/chatbot',
        systemVariables: {}
      };
    `;
    document.body.appendChild(configScript);

    const embedScript = document.createElement('script');
    embedScript.src = 'http://localhost/chatbot/embed.min.js';
    embedScript.id = 'GJQPX1Y9DoUz4qK0';
    embedScript.defer = true;
    document.body.appendChild(embedScript);

    const style = document.createElement('style');
    style.innerHTML = `
      #dify-chatbot-bubble-button {
        background-color: #1C64F2 !important;
      }
      #dify-chatbot-bubble-window {
        width: 24rem !important;
        height: 40rem !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return null;
};

export default DifyChatbot;
