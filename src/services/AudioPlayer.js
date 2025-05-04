import Sound from 'react-native-sound';

export function playAudio(filePath) {
  const sound = new Sound(filePath, '', (error) => {
    if (error) {
      console.error('Failed to load sound', error);
      return;
    }
    sound.play(() => {
      sound.release(); // Release the resource after playback
    });
  });
}