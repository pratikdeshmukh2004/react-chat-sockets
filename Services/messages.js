 
let messages = [];

const addMessage = (message) => {
  messages.push(message);
  return message 
}


const getmessagesInRoom = (room) => messages.filter((message) => message.room === room);

const removeMessagesFromRoom = (room) =>{
    messages = messages.filter((message) => message.room != room)
}

module.exports = { getmessagesInRoom, addMessage, removeMessagesFromRoom };