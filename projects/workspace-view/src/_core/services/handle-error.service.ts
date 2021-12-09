import { Inject, Injectable } from '@angular/core';
import {
  McFlashNotice,
  McFlashNoticeType,
  McFlashNoticeService
} from '@bamzooka/ui-kit-flash-notice';
import { McLoggerService } from '@bamzooka/ui-kit-logger';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HandleErrorService {
  constructor(
    private flashNoticeService: McFlashNoticeService,
    private logger: McLoggerService
  ) {}

  /**
   * Displays an error coming from the cloud to the user as a flash notice error
   */
  displayCloudErrorToUser(error: any): void {
    this.logger.error(error);
    let flashNotice: McFlashNotice;
    if (!error.status) {
      // cloud unreachable
      flashNotice = new McFlashNotice({
        type: McFlashNoticeType.ERROR,
        message: `Unable to access server`
      });
      this.flashNoticeService.openFlashNotice(flashNotice);
      return;
    }

    if (error.error && error.error.message) {
      flashNotice = new McFlashNotice({
        type: McFlashNoticeType.ERROR,
        message: error.error.message
      });
      this.flashNoticeService.openFlashNotice(flashNotice);
      return;
    }

    flashNotice = new McFlashNotice({
      type: McFlashNoticeType.ERROR,
      message:
        `An error occurred. Please <a href="https://bamzooka.mojohelpdesk.com">` +
        `contact support if this persists.</a>`
    });
    this.flashNoticeService.openFlashNotice(flashNotice);
  }

  /**
   * Displays a custom error message to the user as a flash notice error
   */
  displayCustomErrorToUser(errorMessage: string): void {
    const flashNotice = new McFlashNotice({ type: McFlashNoticeType.ERROR, message: errorMessage });
    this.flashNoticeService.openFlashNotice(flashNotice);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isErrorNotEnoughPrivileges(error: any): boolean {
    return !!(error && error.error && error.error.message === 'not enough privileges');

  }

  /**
   * Only log a cloud error. Not displayed to the user
   */
  logCloudError(error: unknown): void {
    this.logger.error(error);
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * The following errorHandler() is shared by many service methods so it's generalized
   * to meet their different needs.
   * Instead of handling the error directly, it returns an error handler function to catchError
   * that it has configured with both the name of the operation that failed and a safe return
   * value.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  handleError<T>(operation = 'operation', result?: T) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (error: any): Observable<T> => {
      this.logger.error(`${operation} failed: ${error.message}`); // log the error
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
