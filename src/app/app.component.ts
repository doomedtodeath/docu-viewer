import {Component, HostListener} from '@angular/core';
import * as moment from 'moment';
import {PDFDocumentProxy} from "ng2-pdf-viewer";
import {forEach} from 'lodash';
import {AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask} from "@angular/fire/compat/storage";
import {Observable} from "rxjs";
import {AsyncPipe} from "@angular/common";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'docviewer';
  pdfSrc = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';
  current = moment();
  previous = moment();
  data: { [key: string]: number } = {};
  prevPage: number = 1;
  totalPages: number = 0;
  currentPage: number = 0;
  chartData: any = [];
  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;
  uploadProgress: Observable<any>;
  downloadURL: Observable<any>;
  randomId = '';

  constructor(private afStorage: AngularFireStorage) {
  }

  onClick(e: any) {
    console.log(e.target)
  }

  upload(event: any) {
    this.randomId = Math.random().toString(36).substring(2);
    this.ref = this.afStorage.ref(this.randomId);
    this.task = this.ref.put(event.target.files[0]);
    this.uploadProgress = this.task.percentageChanges();
    // this.downloadURL = this.task.downloadURL();
    this.task.snapshotChanges().subscribe((res) => {if(res?.state === 'success'){this.download()}})
    // this.download();
  }

  download(){
    this.downloadURL = this.afStorage.ref(this.randomId).getDownloadURL();
    this.downloadURL.subscribe((data) => {this.pdfSrc = data})
  }

  page(e: number) {
    this.current = moment();
    this.currentPage = e;
    // console.log(this.current);
    // console.log(moment(this.current).diff(this.previous, 'second'));
    console.log(this.prevPage);
    this.data[this.prevPage] = this.data[this.prevPage] + moment(this.current).diff(this.previous, 'second')
    this.prevPage = e;
    console.log(this.prevPage);
    this.previous = moment();
    console.log(this.data);
    this.mapData()
  }

  mapData(){
    forEach(this.data, (v, k) => {
      console.log(k,v)
      this.chartData = [...this.chartData, {name: k, value: v}]
    })
  }

  afterLoadComplete(e: PDFDocumentProxy) {
    console.log(e);
    this.totalPages = e.numPages
    this.makeObj(e.numPages)
  }

  makeObj(num: number) {
    for (let i = 1; i <= num; i++) {
      this.data[i] = 0;
    }
  }

  ended(){
      this.page(this.totalPages);
  }
}
