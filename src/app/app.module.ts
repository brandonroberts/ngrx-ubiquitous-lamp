import {
  BrowserModule,
  BrowserTransferStateModule,
  makeStateKey,
  TransferState,
} from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { StoreModule, Store, INITIAL_STATE } from '@ngrx/store';
import { reducers, metaReducers, State, getInitialState, NGRX_STATE } from './reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import {
  StoreRouterConnectingModule,
  RouterStateSerializer,
} from './router-store';
import { CustomSerializer } from './utils';


@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'my-app' }),
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'lazy', loadChildren: './lazy/lazy.module#LazyModule' },
      { path: 'lazy/nested', loadChildren: './lazy/lazy.module#LazyModule' },
    ]),
    TransferHttpCacheModule,
    StoreModule.forRoot(reducers, {
      metaReducers
    }),
    StoreDevtoolsModule.instrument({ logOnly: false }),
    BrowserTransferStateModule,
    StoreRouterConnectingModule.forRoot({
      stateKey: 'router',
    }),
  ],
  providers: [
    { provide: RouterStateSerializer, useClass: CustomSerializer },
    //{ provide: INITIAL_STATE, useFactory: getInitialState, deps: [TransferState] }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  public constructor(
    private readonly transferState: TransferState,
    private readonly store: Store<State>,
  ) {
    const isBrowser = this.transferState.hasKey<State>(NGRX_STATE);

    if (isBrowser) {
      this.onBrowser();
    } else {
      this.onServer();
    }
  }

  onServer() {
    this.transferState.onSerialize(NGRX_STATE, () => {
      let state;
      this.store
        .subscribe((saveState: State) => {
          console.log('Set for browser', JSON.stringify(saveState));
          state = saveState;
        })
        .unsubscribe();

      return state;
    });
  }

  onBrowser() {
    const state = this.transferState.get<State>(NGRX_STATE, null);
    this.transferState.remove(NGRX_STATE);
    this.store.dispatch({ type: 'SET_ROOT_STATE', payload: state });
    console.log('Got state from server', JSON.stringify(state));
  }
}
