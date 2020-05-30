import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  static BUFFER_SIZE = 2048;

  title = 'Audio Recorder';
  private audioSource: MediaStreamAudioSourceNode;
  private audioAnalyser?: AnalyserNode;

  static average(arr: Uint8Array): number {
    return arr.reduce((prev, current) => prev + current, 0 ) / arr.length;
  }

  recordAudio() {
    navigator.mediaDevices.getUserMedia({audio: true})
      .then( (stream) => {
        const audioContext = this.createAudioContext(stream);
        const audioNode = audioContext.createScriptProcessor(AppComponent.BUFFER_SIZE, 1, 1);
        audioNode.onaudioprocess = () => {
          const audioByteArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
          this.audioAnalyser.getByteFrequencyData(audioByteArray);
          const bar = document.getElementById('bar');
          bar.style.width = AppComponent.average(audioByteArray) * 10 + 'px';
        };
        audioNode.connect(audioContext.destination);
      })
      .catch((error) => console.log('error', error));
  }

  stopRecording(): void {
    this.audioSource.disconnect();
  }

  createAudioContext(stream: MediaStream): AudioContext | undefined {
    const audioContext = new AudioContext();
    this.audioSource = audioContext.createMediaStreamSource(stream);
    this.audioAnalyser = audioContext.createAnalyser();
    this.audioSource.connect(this.audioAnalyser);
    return audioContext;
  }
}
