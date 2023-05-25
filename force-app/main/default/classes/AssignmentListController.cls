public with sharing class AssignmentListController {
    @AuraEnabled(cacheable=true)
    public static list<Assignment__c> getAssignmentList() {
        return [Select ID, Title__c, Description__c, DueDate__c, Status__c from Assignment__c ORDER BY DueDate__c];
    }
}