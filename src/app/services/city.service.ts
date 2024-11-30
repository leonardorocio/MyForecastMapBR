import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PoComboFilter, PoComboOption } from '@po-ui/ng-components';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CityService implements PoComboFilter {

  cityAPIURL: string = "";

  constructor(private http: HttpClient) { }

  getFilteredData(params: any, filterParams?: any): Observable<Array<PoComboOption>> {
    return this.http.get<any>(this.cityAPIURL).pipe(
      map((cities: any[]) => cities.filter((city) => city.nome.includes(params.value)).map((city) => ({ value: city.nome, label: city.nome })))
    );
  }

  getObjectByValue(value: string, filterParams?: any): Observable<PoComboOption> {
    return of({} as PoComboOption);
  }
}
