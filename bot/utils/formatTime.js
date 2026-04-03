function formatTime(seconds) {
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    return hours + " ساعة";
  } else if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    return minutes + " دقيقة";
  } else {
    return seconds + " ثانية";
  }
}

module.exports = formatTime