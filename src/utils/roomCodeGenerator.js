/**
 * Generates a 6-character alphanumeric room code
 * @returns {string} A 6-character uppercase alphanumeric code
 */
function generateRoomCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
}

/**
 * Checks if a room code is unique (placeholder for Firebase check)
 * @param {string} code - The room code to check
 * @returns {Promise<boolean>} Promise that resolves to true if code is unique
 */
async function isRoomCodeUnique(code) {
  // TODO: Implement Firebase check to verify room code doesn't exist
  // For now, always return true as placeholder
  return Promise.resolve(true);
}

/**
 * Generates a unique room code
 * @param {number} maxAttempts - Maximum number of attempts to generate unique code (default: 10)
 * @returns {Promise<string>} Promise that resolves to a unique room code
 */
async function generateUniqueRoomCode(maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateRoomCode();
    const isUnique = await isRoomCodeUnique(code);
    
    if (isUnique) {
      return code;
    }
  }
  
  // If we couldn't generate a unique code after max attempts, throw error
  throw new Error('Failed to generate unique room code after maximum attempts');
}

export { generateRoomCode, generateUniqueRoomCode, isRoomCodeUnique };
