// In-app Text-to-speech audio reader utility
export class NewsSpeechReader {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;

  public static speak(
    text: string,
    lang: 'id-ID' | 'en-US' = 'id-ID',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: () => void
  ) {
    if (!this.synth) {
      if (onError) onError();
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick best matching voice if available
    const voices = this.synth.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      if (onError) onError();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public static pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public static resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public static stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public static isSpeaking(): boolean {
    return !!(this.synth && this.synth.speaking && !this.synth.paused);
  }
}
