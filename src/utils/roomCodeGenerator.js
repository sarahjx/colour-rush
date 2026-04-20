function generateRoomCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
}

async function isRoomCodeUnique(code) {
  return Promise.resolve(true);
}

async function generateUniqueRoomCode(maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateRoomCode();
    const isUnique = await isRoomCodeUnique(code);
    
    if (isUnique) {
      return code;
    }
  }
  
  throw new Error('Failed to generate unique room code after maximum attempts');
}

export { generateRoomCode, generateUniqueRoomCode, isRoomCodeUnique };
