import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { StatefulService } from '../services/core';
import { createBinding } from './shared/inputs';

/**
 * Creates a reactive state for a React component based on Vuex store
 */
export function useVuex<TReturnValue>(selector: () => TReturnValue): TReturnValue;
export function useVuex<T, TReturnValue>(
  target: T,
  selector: (state: T) => TReturnValue,
): TReturnValue;
export function useVuex(...args: any[]) {
  const selector = args.length === 1 ? args[0] : () => args[1](args[0]);
  const [state, setState] = useState(selector);
  useEffect(() => {
    const unsubscribe = StatefulService.store.watch(
      () => selector(),
      newState => {
        setState(newState);
      },
    );
    return () => {
      unsubscribe();
    };
  }, []);

  return state;
}

/**
 * onCreate shortcut
 * Helpful if you need to calculate an immutable initial state for a component
 */
export function useOnCreate<TReturnValue>(cb: () => TReturnValue) {
  return useMemo(cb, []);
}

/**
 * onDestroy shortcut
 */
export function useOnDestroy(cb: () => void) {
  useEffect(() => cb, []);
}

/**
 * Init state with an async callback
 */
export function useAsyncState<TStateType>(
  defaultState: TStateType | (() => TStateType),
  asyncCb?: (initialState: TStateType) => Promise<TStateType>,
): [TStateType, (newState: TStateType) => unknown, Promise<TStateType | null> | undefined] {
  // define a state
  const [state, setState] = useState(defaultState);

  let isDestroyed = false;

  // create and save the promise if provided
  const promise = useMemo(() => {
    if (asyncCb) {
      return asyncCb(state).then(newState => {
        // do not set state if the component has been destroyed
        if (isDestroyed) return null;
        setState(newState);
        return newState;
      });
    }
  }, []);

  useOnDestroy(() => {
    isDestroyed = true;
  });

  return [state, setState, promise];
}

type TStateActions<StateType> = {
  s: StateType;
  setState: (p: StateType) => unknown;
  updateState: (p: Partial<StateType>) => unknown;
  setItem: <TDict extends keyof StateType, TKey extends keyof StateType[TDict]>(
    dictionaryName: TDict,
    key: TKey,
    value: StateType[TDict][TKey],
  ) => unknown;
  bind: <TFieldName extends keyof StateType>(
    fieldName: TFieldName,
  ) => {
    name: TFieldName;
    value: StateType[TFieldName];
    onChange: (newVal: StateType[TFieldName]) => unknown;
  };
  stateRef: { current: StateType };
};

// safe for async/await
export function useStateHelper<T extends object>(initializer: T | (() => T)): TStateActions<T> {
  const [s, setStateRaw] = useState<T>(initializer);

  // create a reference to the last actual state
  const stateRef = useRef(s);

  function setState(newState: T) {
    // keep the reference in sync when we update the state
    stateRef.current = newState;
    setStateRaw(newState);
  }

  // create a function for state patching
  function updateState(patch: Partial<T>) {
    setState({ ...stateRef.current, ...patch });
  }

  return {
    s,
    setState,
    // TODO rename to setRecord or smth
    setItem<TDict extends keyof T, TKey extends keyof T[TDict]>(
      dictionaryName: TDict,
      key: TKey,
      value: T[TDict][TKey],
    ): void {
      setState({
        ...stateRef.current,
        [dictionaryName]: { ...stateRef.current[dictionaryName], [key]: value },
      });
    },
    updateState,
    bind: createBinding(s, setState),
    stateRef,
  };
}

export function useDebounce<T extends (...args: any[]) => any>(ms = 0, cb: T) {
  return useCallback(debounce(cb, ms), []);
}
