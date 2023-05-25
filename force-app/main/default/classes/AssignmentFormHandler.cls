public with sharing class AssignmentFormHandler {
    @AuraEnabled
    public static string createAssignment(String title, String description, date dueDate, String status){
        String recordStatus;
        try{
            Assignment__c a1 = new Assignment__c();
            a1.Title__c = title;
            a1.Description__c = description;
            a1.DueDate__c = dueDate;
            a1.Status__c = status;
            insert a1; 
            recordStatus = 'success';
        }catch(Exception e){
            recordStatus = e.getMessage();
        }

        return recordStatus;
    }
}