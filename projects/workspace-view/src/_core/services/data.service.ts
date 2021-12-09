import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";
import {Checklist} from "../models";
import {Params} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {McLoggerService} from "@bamzooka/ui-kit-logger";
import {map, tap} from "rxjs/operators";
import {getUniqIDNotIncludedInList} from '@bamzooka/utils-general';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient,
              private logger: McLoggerService) {
  }

  getChecklists(params: Params, workspaceId: number): Observable<Checklist[]> {
    const url = `/api/v1/workspaces/${workspaceId}/checklists`;
    return this.http
      .get<Checklist[]>(url, {params: params})
      .pipe(tap((data) => this.logger.info(`getChecklists fetched ${data.length} checklists`)));
  }

  getFakeChecklistsFromScheduler(params: Params, workspaceId: number): Observable<Checklist[]> {
    const url = `/api/v1/workspaces/${workspaceId}/schedulers/events`;
    return this.http
      .get<Checklist[]>(url, {params: params})
      .pipe(
        map((response) => {
          // @ts-ignore
          return response.reduce((accumulator, currentValue, index, array) => {
            const ids = array.filter((c) => c.id).map((c) => c.id);
            currentValue.id = getUniqIDNotIncludedInList(ids);
            return array;
          }, []) as unknown as Checklist[];
        }),
        tap((response) => {
          this.logger.info(`got ${response.length} fake checklists from schedulers`);
        })
      );
  }

}
