import {Component, OnInit, ViewChild, AfterViewInit, ElementRef, Inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as RecordRTC from '../assets/recordrtc';
// import StereoAudioRecorder = require('recordrtc/dev/StereoAudioRecorder.js');
// import Recorder = require('recorder-js');



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})


export class AppComponent {
  title = 'Fusion Google Voice Search Demo';
  d: any;
  // API A
  nameOfApiA: String;
  resp: any;
  public googleResponse: String;
  public googleDocuments: any;
  public bestMatchedResults: String;
  public lastDictatedQuery: String;

  public searchHistory = [];
  public numberOfResults: number;
  public search: String;

  noResults: string;
  recordStatus: boolean;
  votingStatus: boolean;
  recordRTC: any;
  app = this;
  stream: any;
  recordedBlob: any;
  apis = ['Google', 'IBM'];
  rand: string;
  serverAddress = document.location.protocol + '//' + document.location.hostname; // Get Server IP Address
  // Style button dependent on status
  recordBtnColour: string;
  recordBtnRadius: any;


  private url = this.serverAddress + ':8765/api/v1/';


  @ViewChild('audio') audio: ElementRef;
  private jsonRequest: JSON;

  constructor(private http: HttpClient) {

  }

  ngAfterViewInit() {
    this.recordStatus = true;
    this.setRecordNotActive();
    this.numberOfResults = 0;
    console.log('Fusion should be found at: ' + this.url);
  }

  onKeyDown(searchTerm) {
    this.addSearchHistory(searchTerm, this.searchHistory);
        this.http.get(this.url + 'query-pipelines/lucidfind-default/collections/lucidfind/select?q=' + searchTerm +'&wt=json')
         .subscribe(data => {
              this.d = data as JSON;
              if (this.d.hasOwnProperty('response')) {
                  this.resp = data.response.docs;
                this.numberOfResults = this.resp.length;
                }
              console.log(data);
              console.log(this.resp);

              });
      }




  recordPress(this) {

    if (this.recordStatus === true) {

      console.log('Record Button pressed');
      this.setRecordActive();

      const constraints = {audio: true};
      navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
          const audioTracks = stream.getAudioTracks();
          console.log('Got stream with constraints:', constraints);
          console.log('Using Audio device: ' + AudioTrack[0].label);
          this.stream = stream;

          stream.oninactive = function() {
            console.log('Stream ended');
          };
          console.log(stream); // make variable available to console

        })
        .catch(function(error) {
          // ...
        });

      this.startRecording();
      this.recordStatus = false;
    } else if (this.recordStatus === false) {
      this.setRecordNotActive();
      this.stopRecording(function() {
        const blob = this.getBlob();

        const file = new File([blob], 'file.wav', {
          type: 'audio/wav'
        });
        console.log('FILE' + file);

        const formData = new FormData();
        formData.append('file', file); // upload "File" object rather than a "Blob"
        // this.uploadToServer(formData);
      });
      this.clearUpForNextRecord();
      this.recordStatus = true;
      this.votingStatus = false; // Allow user to vote
    }
  }


  toggleControls() {
    const audio: HTMLAudioElement = this.audio.nativeElement;
    audio.muted = !audio.muted;
    audio.controls = !audio.controls;
    audio.autoplay = !audio.autoplay;
  }



  errorCallback() {
    // handle error here
  }


  successCallback(stream: MediaStream) {

    const options = {
      type: 'audio',
      // recorderType: StereoAudioRecorder,
      audio: 'audio/wav',
      mimeType: 'audio/wav',
      numberOfChannels: 1,
      desiredSampRate: 16000,
      checkForInactiveTracks: true
    };
    this.recordRTC = RecordRTC(stream, options);
    this.recordRTC.startRecording();
    // let audio: HTMLAudioElement = this.audio.nativeElement;
    // audio.src = window.URL.createObjectURL(stream);
    // this.toggleControls();
  }

  startRecording() {
    const mediaConstraints = {
       audio: true,
      mimeType: 'audio/wav'
    };

    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.successCallback.bind(this), this.errorCallback.bind(this));


  }


  stopRecording() {
    const recordRTC = this.recordRTC;
    recordRTC.stopRecording(this.processVideo.bind(this));
  }


  uploadToFusion(blob) {
    const uploadLocation = this.url + 'query-pipelines/lucidfind-voicesearch/collections/lucidfind/select?wt=json';
    const body = {'data': blob};
    const header = {headers: {
        'Content-Type': 'audio/wav'
      }};
    this.http.post(uploadLocation, blob, {headers: {'Content-Type': 'audio/wav'}} )
      .subscribe(data => {
        this.d = data as JSON;
        const d = this.d;
        if (d.hasOwnProperty('response')) {
          console.log('Response Found');
          this.resp = d.response.docs;
          this.numberOfResults = this.resp.length;
        } else {
          console.log('No Response found');
        }

        // If response contains response header
        if (d.hasOwnProperty('responseHeader')) {
          this.googleResponse = d.responseHeader.params.q; // Get query from header.
          this.search = this.googleResponse; // display transcription in search bar
          this.addSearchHistory(this.googleResponse, this.searchHistory);
        } else {
          //No response from API
        }

        if (this.googleDocuments.length === 0) {
          this.noResults = 'Could not find any results, try reforming your query.';
        }

      });
  }



  processVideo(audioVideoWebMURL) {
    // let audio: HTMLVideoElement = this.audio.nativeElement;
    const recordRTC = this.recordRTC;
    // audio.src = audioVideoWebMURL;
    // this.toggleControls();
     this.recordedBlob = recordRTC.getBlob();
     this.uploadToFusion(recordRTC.blob);

    // recordRTC.getDataURL(function (dataURL) { window.open(dataURL);
    // console.log(dataURL);
    // });
    console.log(this.recordedBlob);
    console.log(audioVideoWebMURL);
  }

  clearUpForNextRecord() {
    // this.recordRTC = null;
    this.recordRTC.clearRecordedData();
    // this.stream.close();
    // this.stream = null;
  }

  getRecordColour() {
    return this.recordBtnColour;
  }

  getRecordBtnRadius() {
    return this.recordBtnRadius;
  }

  setRecordActive() {
    this.recordBtnColour = 'green';
    this.recordBtnRadius = '10%';
  }

  setRecordNotActive() {
    this.recordBtnColour = 'red';
    this.recordBtnRadius = '50%';
  }

  addSearchHistory(searchTerm, searchHistory: any) {
   const size = searchHistory.length;

   if (size === 5) {
      searchHistory.shift();
   }

   searchHistory.push(searchTerm);
  }



}
