import { LightningElement, track, wire } from 'lwc';
import createAssignment from '@salesforce/apex/AssignmentFormHandler.createAssignment';
import { fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AssignmentForm extends LightningElement {
    @wire(CurrentPageReference) pageReference;
    title;
    description;
    dueDate;
    status;
    successMessage;

    get statusOptions() {
        return [
                 { label: 'Not Started', value: 'Not Started' },
                 { label: 'In Progress', value: 'In Progress' },
                 { label: 'Completed', value: 'Completed' },
               ];
    }

    handleTitle(event){
        this.title = event.target.value;
    }

    handleDescription(event){
        this.description = event.target.value;
    }

    handleDueDate(event){
        this.dueDate = event.target.value;
    }

    handleStatus(event){
        this.status = event.target.value;
    }

    submit(){
        var valStatus = this.handleValidation();
        if(valStatus){
            createAssignment({title:this.title, description:this.description,dueDate:this.dueDate,status:this.status}).then(response => {
                this.successMessage = response;
                if(this.successMessage = 'success'){
                    fireEvent(this.pageReference, 'recordCreated', 'success');
                    this.showSuccessToast();
                    this.handleReset();
                }
            }).catch(error=>{
                console.log('Error in creating Assignment', error.body.message);
            })
        }

    }

    showSuccessToast() {
        const evt = new ShowToastEvent({
            title: 'Success',
            message: 'Record created sucessfully',
            variant: 'success',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }

    handleReset(){
        this.template.querySelectorAll('lightning-input').forEach(element => {
          if(element.type === 'checkbox' || element.type === 'checkbox-button'){
            element.checked = false;
          }else{
            element.value = null;
          }      
        }); 

        this.template.querySelectorAll('lightning-combobox').forEach(element => {
            element.value = null;
        })
    }

    handleValidation(){
        let titleCmp = this.template.querySelector(".titleCls");
        let descriptionCmp = this.template.querySelector(".descriptionCls");
        let dateCmp = this.template.querySelector(".dateCls");
        let statusCmp = this.template.querySelector(".statusCls");

        var validationStatus = true;

        if(!titleCmp.value){
            titleCmp.setCustomValidity('Title value is required');
            validationStatus = false;
        }else {
            titleCmp.setCustomValidity(""); // clear previous value
        }
        titleCmp.reportValidity();

        if(!descriptionCmp.value){
            descriptionCmp.setCustomValidity('Description value is required');
            validationStatus = false;
        }else {
            descriptionCmp.setCustomValidity(""); // clear previous value
        }
        descriptionCmp.reportValidity();

        if(!dateCmp.value){
            dateCmp.setCustomValidity('Due Date is required');
            validationStatus = false;
        }else {
            dateCmp.setCustomValidity(""); // clear previous value
        }
        dateCmp.reportValidity();

        if(!statusCmp.value){
            statusCmp.setCustomValidity('Status is required');
            validationStatus = false;
        }else {
            statusCmp.setCustomValidity(""); // clear previous value
        }
        statusCmp.reportValidity();

        return validationStatus;
    }
}