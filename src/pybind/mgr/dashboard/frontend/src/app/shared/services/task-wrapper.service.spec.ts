import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';

import { ToastModule } from 'ng2-toastr';
import { Observable } from 'rxjs/Observable';

import { configureTestBed } from '../../../testing/unit-test-helper';
import { FinishedTask } from '../models/finished-task';
import { SharedModule } from '../shared.module';
import { NotificationService } from './notification.service';
import { SummaryService } from './summary.service';
import { TaskManagerService } from './task-manager.service';
import { TaskWrapperService } from './task-wrapper.service';

describe('TaskWrapperService', () => {
  let service: TaskWrapperService;

  configureTestBed({
    imports: [HttpClientTestingModule, ToastModule.forRoot(), SharedModule],
    providers: [TaskWrapperService]
  });

  beforeEach(inject([TaskWrapperService], (wrapper: TaskWrapperService) => {
    service = wrapper;
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('wrapTaskAroundCall', () => {
    let notify: NotificationService;
    let passed: boolean;
    let summaryService: SummaryService;

    const fakeCall = (status?) =>
      new Observable((observer) => {
        if (!status) {
          observer.error({ error: 'failed' });
        }
        observer.next({ status: status });
        observer.complete();
      });

    const callWrapTaskAroundCall = (status, name) => {
      return service.wrapTaskAroundCall({
        task: new FinishedTask(name, { sth: 'else' }),
        call: fakeCall(status)
      });
    };

    beforeEach(() => {
      passed = false;
      notify = TestBed.get(NotificationService);
      summaryService = TestBed.get(SummaryService);
      spyOn(notify, 'show');
      spyOn(service, '_handleExecutingTasks').and.callThrough();
      spyOn(summaryService, 'addRunningTask').and.callThrough();
    });

    it('should simulate a synchronous task', () => {
      callWrapTaskAroundCall(200, 'sync').subscribe(null, null, () => (passed = true));
      expect(service._handleExecutingTasks).not.toHaveBeenCalled();
      expect(passed).toBeTruthy();
      expect(summaryService.addRunningTask).not.toHaveBeenCalled();
    });

    it('should simulate a asynchronous task', () => {
      callWrapTaskAroundCall(202, 'async').subscribe(null, null, () => (passed = true));
      expect(service._handleExecutingTasks).toHaveBeenCalled();
      expect(passed).toBeTruthy();
      expect(summaryService.addRunningTask).toHaveBeenCalledTimes(1);
    });

    it('should call notifyTask if asynchronous task would have been finished', () => {
      const taskManager = TestBed.get(TaskManagerService);
      spyOn(taskManager, 'subscribe').and.callFake((name, metadata, onTaskFinished) => {
        onTaskFinished();
      });
      spyOn(notify, 'notifyTask').and.stub();
      callWrapTaskAroundCall(202, 'async').subscribe(null, null, () => (passed = true));
      expect(notify.notifyTask).toHaveBeenCalled();
    });

    it('should simulate a task failure', () => {
      callWrapTaskAroundCall(null, 'async').subscribe(null, () => (passed = true), null);
      expect(service._handleExecutingTasks).not.toHaveBeenCalled();
      expect(passed).toBeTruthy();
      expect(summaryService.addRunningTask).not.toHaveBeenCalled();
    });
  });
});
