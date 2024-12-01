import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { PoComboComponent, PoInfoOrientation, PoMenuItem, PoModalComponent, PoNotificationService, PoTableColumn } from '@po-ui/ng-components';
import { listaIDUFs } from "./utils/listaIDUFs";
import { CityService } from './services/city.service';
import { WeatherService } from './services/weather.service';
import { IForecast, RequestFormat } from './model/forecast.model';
import { Observable, of, switchMap } from 'rxjs';
import { HistoryService } from './services/history.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PoPageLoginCustomField } from '@po-ui/ng-templates';
import { IUser } from './model/user.model';
import { UserService } from './services/user.service';
import { FavoriteService } from './services/favorite.service';
import { IHistory } from './model/history.model';
import { FavoriteTableItem, IFavorite } from './model/favorite.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, AfterViewInit {

  mapTitle: string = "Estado selecionado: ";
  state: string = "";
  cityName: string = "";
  starStyle: string = "ph ph-star";
  forecastResults: IForecast = {} as IForecast;
  nextDaysForecast: Omit<IForecast, "forecast">[] = [];
  moonPhaseImage: string = "";
  weatherConditionImage: string = "";
  customLoginField: PoPageLoginCustomField = {
    property: 'username',
    value: '',
    placeholder: 'Como gostaria de ser chamado?',
    pattern: '[a-z]',
  };
  historyColumns: PoTableColumn[] = [];
  favoriteColumns: PoTableColumn[] = [];
  historyList: IHistory[] = [];
  favoriteList: FavoriteTableItem[] = [];
  tableHeight: number = window.innerHeight * 0.65;

  isAuthenticated: boolean = false;
  hasChangedView: boolean = false;

  currentUser: IUser = {} as IUser;

  orientation: PoInfoOrientation = PoInfoOrientation.Horizontal;

  menus!: Array<PoMenuItem>;
  favoriteListMenu: PoMenuItem[] = [];

  @ViewChild(PoModalComponent)
  modal!: PoModalComponent;

  @ViewChild(PoComboComponent)
  combo!: PoComboComponent;

  constructor(
    public cityService: CityService,
    public weatherService: WeatherService,
    public historyService: HistoryService,
    public formBuilder: FormBuilder,
    public userService: UserService,
    public poNotificationService: PoNotificationService,
    public favoriteService: FavoriteService,
    public changeDetector: ChangeDetectorRef
  ) {
    setInterval(() => {
      // the following is required, otherwise the view will not be updated
      this.changeDetector.markForCheck();
    }, 500);

    this.menus = [
      { label: 'Home',   icon: 'ph ph-house', shortLabel: "Home" },
      { label: 'Perfil', icon: 'ph ph-user', shortLabel: "Usuário", action: this.openModal.bind(this) },
      { label: 'Favoritos', icon: 'ph ph-star', shortLabel: "Favoritos", subItems: this.favoriteListMenu },
    ];

    this.historyColumns = [
      {
        label: "Cidade",
        property: "city_name",
        type: "string",
        width: "15%",
      },
      {
        label: "UF",
        property: "city_state",
        type: "string",
        width: "10%",
      },
      {
        label: "Previsão",
        property: "forecast_date",
        type: "date",
        width: "18%",
        format: "dd/MM/yyyy"
      },
      {
        label: "Min",
        property: "temperature_min",
        type: "number",
        width: "15%",
      },
      {
        label: "Max",
        property: "temperature_max",
        type: "number",
        width: "15%",
      },
      {
        label: "Tempo",
        property: "weather_description",
        type: "string",
        width: "27%",
      },
    ];

    this.favoriteColumns = [
      {
        label: "Cidade favoritada",
        property: "city_name",
        width: "80%",
        type: "string",
      },
      {
        label: "UF",
        property: "city_state",
        width: "10%",
        type: "string",
      },
      {
        label: "Ação",
        type: "icon",
        icons: [
          {
            value: "remove",
            color: "color-06",
            action: this.unfavoriteCity.bind(this),
            icon: "ph ph-trash"
          }
        ],
        property: "actions",
        width: "10%"
      }
    ]
  }

  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    localStorage.clear();
    this.changeDetector.markForCheck();
  }

  openModal() {
    this.modal.open();
  }

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
    const cityQuery: string = `${this.cityName},${this.state}`;
    this.weatherService.getWeatherInfo(cityQuery)
      .pipe(
        switchMap(weatherInfo => this.setTodayWeatherInfo(weatherInfo)),
        switchMap(value => this.checkSelectedCityFavorite(value))
      )
      .subscribe((favorite) => {
        if (favorite.id?.city_id === null && favorite.id?.user_id === null) {
          this.starStyle = 'ph ph-star';
        } else {
          this.starStyle = 'ph-fill ph-star';
        }
      });
  }

  checkSelectedCityFavorite(value: any) {
    if (value) {
      this.historyList = [...this.historyList, value];
      this.changeDetector.markForCheck();
    }
    if (this.isAuthenticated) {
      return this.favoriteService.checkFavorite(this.currentUser.id, this.cityName, this.state);
    }
    return of();
  }

  setTodayWeatherInfo(weatherInfo: RequestFormat): Observable<any> {
    this.forecastResults = weatherInfo?.results;
    this.moonPhaseImage = this.getMoonImage(this.forecastResults);
    this.weatherConditionImage = this.getConditionImage(this.forecastResults);
    this.nextDaysForecast = this.forecastResults.forecast.toSpliced(0, 2);

    if (this.isAuthenticated) {
      return this.historyService.saveHistory(weatherInfo, this.currentUser.id ?? 0);
    }
    return of();

  }

  getMoonImage(weatherInfo: IForecast | Omit<IForecast, "forecast">) {
    const moonPhasePlaceholder = "https://assets.hgbrasil.com/weather/icons/moon/{Moon}.png";
    return moonPhasePlaceholder.replace("{Moon}", weatherInfo.moon_phase ?? weatherInfo.condition);
  }

  getConditionImage(weatherInfo: IForecast | Omit<IForecast, "forecast">) {
    const weatherConditionPlaceholder = "https://assets.hgbrasil.com/weather/icons/conditions/{Condition}.svg";
    return weatherConditionPlaceholder.replace("{Condition}", weatherInfo.condition_slug ?? weatherInfo.condition);
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

  getLogin(event: any) {
    const user: IUser = {...event, email: event.login, created_at: new Date()};
    let loginObservable$: Observable<IUser> = user.username ? this.userService.createUser(user) : this.userService.authenticate(user);
    if (this.isAuthenticated && !this.hasChangedView) {
      user.email = this.currentUser.email;
      loginObservable$ = this.userService.updateUser(user, this.currentUser.id);
    }
    loginObservable$.subscribe((user) => {
      if (user.id) {
        localStorage.setItem("user_id", user.id.toString());
        this.isAuthenticated = true;
        this.currentUser = user;
        this.customLoginField.value = user.username;
        this.historyList = user.weather_history;
        this.favoriteList = user.favoriteCities.map((favorite) => ({
          city_name: favorite.city?.cityName,
          city_state: favorite.city?.cityState,
          actions: 'remove'
        } as FavoriteTableItem ));

        const menu: PoMenuItem[] = user.favoriteCities.map((favorite) => (
          {
            label: favorite.city?.cityName,
            shortLabel: favorite.city?.cityName,
            icon: favorite.city?.cityState,
            action: this.setCityByFavorite.bind(this, favorite.city?.cityName ?? this.cityName, favorite.city?.cityState ?? this.state)
          } as PoMenuItem
        ));
        this.updateMenu(menu);
      }
      this.poNotificationService.success("Usuário autenticado com sucesso!");
      this.modal.close();
      this.hasChangedView = false;
    });
  }

  changeView() {
    this.hasChangedView = !this.hasChangedView;
  }

  closeModal() {
    this.modal.close();
    this.hasChangedView = false;
  }

  favoriteCity() {
    this.changeStarStyle();
    this.favoriteService.favoriteCity(this.currentUser.id, this.cityName, this.state).subscribe((favorite) => {
      this.poNotificationService.success("Cidade favoritada com sucesso");
      const updatedMenu = [
        ...this.menus[2].subItems ?? [],
        {
          label: this.cityName,
          shortLabel: this.cityName,
          icon: this.state,
          action: this.setCityByFavorite.bind(this, this.cityName, this.state)
        }
      ];
      this.favoriteList = [...this.favoriteList, { actions: 'remove', city_name: this.cityName, city_state: this.state }];
      this.updateMenu(updatedMenu);
    });
  }

  unfavoriteCity(favorite?: FavoriteTableItem) {
    if (!favorite)
      this.changeStarStyle();
    const selectedCity = favorite ? favorite.city_name : this.cityName;
    const selectedState = favorite ? favorite.city_state : this.state
    this.favoriteService.removeFavorite(this.currentUser.id, selectedCity, selectedState).subscribe(() => {
      this.poNotificationService.success("Cidade removida dos favoritos com sucesso");
      this.favoriteList = this.favoriteList.filter((fav) => fav.city_name !== favorite?.city_name);
      this.updateMenu(this.menus[2].subItems?.filter((menu) => menu.label !== selectedCity) ?? []);
    });
  }

  updateMenu(menus: PoMenuItem[]) {
    this.menus[2].subItems = menus;
    this.menus = [...this.menus];
    this.changeDetector.markForCheck();
  }

  changeFavoriteCityState() {
    if (this.isAuthenticated) {
      if (this.starStyle === 'ph ph-star') {
        this.favoriteCity();
      } else {
        this.unfavoriteCity();
      }
    } else {
      this.changeStarStyle();
    }
  }

  setCityByFavorite(city: string, state: string) {
    this.cityName = city;
    this.loadWeatherByCity(city);
    this.setState(state);
  }

}
