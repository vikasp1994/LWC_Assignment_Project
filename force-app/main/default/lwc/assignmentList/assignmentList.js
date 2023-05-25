import { LightningElement, wire, track } from 'lwc';
import getAssignmentList from '@salesforce/apex/AssignmentListController.getAssignmentList';
import { getFieldValue } from 'lightning/uiRecordApi';
import Title_Field from '@salesforce/schema/Assignment__c.Title__c';
import { refreshApex } from '@salesforce/apex';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

const columns = [
    { label: 'Title', fieldName: 'Title__c', type: 'text' },
    { label: 'Description', fieldName: 'Description__c', type: 'Long Text Area' },
    { label: 'Due Date', fieldName: 'DueDate__c', type: 'Date' },
    { label: 'Status', fieldName: 'Status__c', type: 'List' }
];

export default class AssignmentList extends LightningElement {

    @wire(CurrentPageReference) pageRef;

    @track allRecords;
    @track records;
    @track initialRecords;
    @track columns = columns;
    @track startingRecord = 1;
    @track page = 1;
    @track endingRecord = 0;
    @track totalRecordCount;
    @track totalPage;
    @track pageSize = 10;

    wiredAssignmentResult;

    @wire(getAssignmentList)
    WireAssignments(result){
        this.wiredAssignmentResult = result;
        if(result.data){
            this.allRecords = result.data;
            this.initialRecords = result.data;
            this.recordsInformation();
            this.error = undefined;
        }else{
            this.error = result.error;
            this.records = undefined;
        }
    }

    handleSearch(event){
        const searchKey = event.target.value.toLowerCase();
        if(searchKey){
            this.records = this.allRecords;
            if(this.records){
                let searchRecords = [];
                for(let record of this.records){
                    let rec1 = JSON.parse(JSON.stringify(record));
                    let titleValue = rec1.Title__c;
                    console.log('titleValue', titleValue);
                    let val = String(titleValue).toLowerCase();
                    console.log('val: ', val);
                    if(val){
                        if(val.includes(searchKey)){
                            searchRecords.push(record);
                            console.log('searchRecords', searchRecords);
                        }
                    }  
                }
                this.initialRecords = searchRecords;
                //this.records = this.initialRecords.slice(0,this.pageSize);
                this.recordsInformation();
            }
        }
        else{
            this.initialRecords = this.allRecords;
            this.recordsInformation();
        }
    }

    recordsInformation(){
        this.records = this.initialRecords.slice(0,this.pageSize);
        this.totalRecordCount = this.initialRecords.length;
        this.totalPage = Math.ceil(this.totalRecordCount/this.pageSize);
        this.endingRecord = this.pageSize;
    }

    handlePrevious(event){
        if(this.page>1){
            this.page = this.page - 1;
            this.displayRecordPerPage(this.page);
        }
    }

    handleNext(event){
        if(this.page < this.totalPage && this.page !== this.totalPage){
            this.page = this.page + 1;
            this.displayRecordPerPage(this.page);
        }
    }

    displayRecordPerPage(page){
        this.startingRecord = (page - 1)*this.pageSize;
        this.endingRecord = page*this.pageSize;
        this.endingRecord = (this.endingRecord > this.totalRecordCount)?this.totalRecordCount:this.endingRecord;
        this.records = this.initialRecords.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    }

    refreshComponent(event){
        console.log('Page Refreshing...');
        this.startSpinner = true;
        refreshApex(this.wiredAssignmentResult);
        this.startSpinner = false;
        console.log('Page Refreshed');
    }

    connectedCallback(){
        registerListener('recordCreated', this.refreshComponent, this);
    }

    disconnectedCallback(){
        unregisterAllListeners(this);
    }
}