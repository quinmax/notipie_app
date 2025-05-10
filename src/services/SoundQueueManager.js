import SoundPlayer from 'react-native-sound-player';
import { DeviceEventEmitter } from 'react-native';

class SoundQueueManager {
  constructor() {
    this.soundQueue = [];
    this.isPlaying = false;
  }

  // Add a sound to the queue
  addToQueue(msgSrc, msgUrl, soundFile) {
    const record = { msgSrc, msgUrl, soundFile };
    this.soundQueue.push(record);

    if (!this.isPlaying) {
      this.playNextSound();
    }
  }

  // Play the next sound in the queue
  playNextSound = () => {
    if (this.soundQueue.length === 0) {
      console.log('Queue is empty.');
      return;
    }

    const { msgSrc, msgUrl, soundFile } = this.soundQueue.shift();
    console.log('Playing sound:', msgSrc, msgUrl, soundFile);

    if (msgSrc === '0') {
      // Play internal sound
      try {
        console.log(`Playing internal sound: ${soundFile}`);
        SoundPlayer.playSoundFile(soundFile.replace('.mp3', ''), 'mp3'); // Remove extension for `playSoundFile`
        this.isPlaying = true;

        // Listen for the completion event
        this.addEventListener();
      } catch (error) {
        console.error('Error playing internal sound:', error);
        this.isPlaying = false;
        this.playNextSound();
      }
    } else if (msgSrc !== '0' && msgUrl) {
      // Play external sound
      try {
        console.log(`Playing external sound from URL: ${msgUrl}`);
        SoundPlayer.playUrl(msgUrl);
        this.isPlaying = true;

        // Listen for the completion event
        this.addEventListener();
      } catch (error) {
        console.error('Error playing external sound:', error);
        this.isPlaying = false;
        this.playNextSound();
      }
    } else {
		console.log('Invalid msgSrc or msgUrl.');
		this.isPlaying = false;
		this.playNextSound();
	}
  };

  // Add event listener for sound completion
  addEventListener = () => {
    this.listener = DeviceEventEmitter.addListener('FinishedPlaying', this.onSoundComplete);
  };

  // Handle sound completion
  onSoundComplete = () => {
    console.log('Finished playing sound.');
    this.isPlaying = false;

    // Remove the event listener to avoid memory leaks
    this.removeEventListener();

    // Play the next sound in the queue
    this.playNextSound();
  };

  // Remove event listener
  removeEventListener = () => {
    if (this.listener) {
      this.listener.remove(); // Properly remove the listener
      this.listener = null;
    }
  };
}

export default new SoundQueueManager();