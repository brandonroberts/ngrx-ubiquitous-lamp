import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer,
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import { RouterReducerState, routerReducer } from '../router-store';
import { RouterStateUrl } from '../utils';
import { makeStateKey, TransferState } from '@angular/platform-browser';

export interface State {
  router: RouterReducerState<RouterStateUrl>;
}

export const reducers: ActionReducerMap<State> = {
  router: routerReducer
};

// make sure you export for AoT
export function stateSetter(reducer: ActionReducer<any>): ActionReducer<any> {
  return function(state: any, action: any) {
    if (action.type === 'SET_ROOT_STATE') {
      return action.payload;
    }
    return reducer(state, action);
  };
}

export const NGRX_STATE = makeStateKey('NGRX_STATE');

export function getInitialState(transferState: TransferState): Partial<State> {
  const isBrowser = transferState.hasKey<State>(NGRX_STATE);

  if (isBrowser) {
    return {
      router: {
        'state': {
          'url': window.location.pathname,
          'params': {},
          'queryParams': {}
        },
        'navigationId': 0
      }
    };
  }

  return undefined;
}

export const metaReducers: MetaReducer<State>[] = !environment.production
  ? [stateSetter]
  : [];
