import { Component, OnInit } from '@angular/core';
import { PoMenuItem } from '@po-ui/ng-components';
import { listaIDUFs } from "./utils/listaIDUFs";
import { CityService } from './services/city.service';
import { WeatherService } from './services/weather.service';
import { IForecast } from './model/forecast.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  mapTitle: string = "Estado selecionado: ";
  state: string = "";
  cityName: string = "";
  starStyle: string = "ph ph-star";
  forecastResults: IForecast = {} as IForecast;
  nextDaysForecast: Omit<IForecast, "forecast">[] = [];
  moonPhaseImage: string = "";
  weatherConditionImage: string = "";

  constructor(
    public cityService: CityService,
    public weatherService: WeatherService
  ) {}

  ngOnInit(): void {
    // this.setupComponents();
  }

  readonly menus: Array<PoMenuItem> = [
    { label: 'Home', icon: 'ph ph-house', shortLabel: "Home" }
  ];

  setState(state: string) {
    const mapPlaceholder = "Estado selecionado: ";
    const searchServicePlaceholder: string = "https://servicodados.ibge.gov.br/api/v1/localidades/estados/{UF}/municipios";
    this.state = state;
    this.mapTitle = mapPlaceholder + state;
    this.cityService.cityAPIURL = searchServicePlaceholder.replace("{UF}", this.getIDByShortName(state));
  }

  getIDByShortName(state: string) {
    return listaIDUFs.find((stateInfo) => stateInfo.sigla === state)?.sigla;
  }

  loadWeatherByCity(city: string) {
    const cityQuery: string = `${city},${this.state}`;
    const weatherConditionPlaceholder = "https://assets.hgbrasil.com/weather/icons/conditions/{Condition}.svg";
    const moonPhasePlaceholder = "https://assets.hgbrasil.com/weather/icons/moon/{Moon}.png";
    this.cityName = city;
    this.weatherService.getWeatherInfo(cityQuery).subscribe((weatherInfo) => {
      this.forecastResults = weatherInfo.results;
      this.moonPhaseImage = moonPhasePlaceholder.replace("{Moon}", weatherInfo.results.moon_phase);
      this.weatherConditionImage = weatherConditionPlaceholder.replace("{Condition}", weatherInfo.results.condition_slug);
      this.nextDaysForecast = this.forecastResults.forecast;
    });
  }

  simpleFormatField(value: string | number, format: string): string {
    return `${(typeof value === 'number' ? value.toString() : value ?? "")} ${format}`;
  }

  timeFormatField(value: string) {
    if (value?.includes("pm")) {
      const [hour, minute] = value.split(":");
      const convertedHour: number = (parseInt(hour) + 12) % 24;
      value = value.replace(hour, convertedHour.toString());
    }
    value = value?.replace("am", "").replace("pm", "");
    return value;
  }

  changeStarStyle() {
    this.starStyle = this.starStyle === 'ph ph-star' ? "ph-fill ph-star" : "ph ph-star";
  }

}
