async function verifyUser(username, retries = 70, delayMs = 1500) {
  try {
    const res = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: true
      })
    });

    if (res.status === 429) {
      if (retries <= 0) {
        return null;
      }

      console.log(`⏳ Rate limited... retrying (${retries} attempts left)`);

      const retryAfter = res.headers.get("retry-after");
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delayMs;

      await new Promise(r => setTimeout(r, waitTime));

      return verifyUser(username, retries - 1, delayMs);
    }

    const data = await res.json();
    return data;

  } catch (err) {
    console.error('Fetch Error:', err.message);
    return null;
  }
}

module.exports = verifyUser;