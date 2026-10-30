import { billingService } from './billingService';
import { complaintService } from './complaintService';
import { resetDemoUsers } from './authService';
import { societyService } from './societyService';
import { visitorService } from './visitorService';

export const demoDataService = {
  reset() {
    billingService.reset();
    visitorService.reset();
    complaintService.reset();
    societyService.reset();
    resetDemoUsers();
  },
};
