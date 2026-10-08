import * as React from 'react';
import {
  createDialogRegistry,
  type DialogInstance,
  type DialogRegistry,
  type DialogSnapshot,
  type DialogPosition,
  type Dialogs,
  type NamedDialog,
  type ValidRegistration,
} from './core';

export type { DialogPosition } from './core';

export type DialogWrapperProps = {
  open: boolean;
  onOpenChange(open: boolean): void;
  position: DialogPosition;
  /** Visual order among mounted roots, including dialogs still exiting. */
  layerIndex: number;
  /** Whether this is the highest mounted root, including dialogs still exiting. */
  isVisualTop: boolean;
  children: React.ReactNode;
  /** Optional escape hatch for wrappers that keep closed content mounted. */
  onExitComplete?(): void;
};

type DialogComponent = React.ComponentType<any>;
type DialogEntry =
  | DialogComponent
  | { component: DialogComponent; wrapper?: React.ComponentType<DialogWrapperProps> };
type GroupConfig = {
  wrapper: React.ComponentType<DialogWrapperProps>;
  dialogs: Record<string, DialogEntry>;
};
type Registration = Record<string, GroupConfig>;
type PropsOf<Entry> = Entry extends React.ComponentType<infer Props>
  ? Props
  : Entry extends { component: React.ComponentType<infer Props> }
    ? Props
    : never;
type PropsMap<Config extends Registration> = {
  [Group in keyof Config]: {
    [Name in keyof Config[Group]['dialogs']]: PropsOf<Config[Group]['dialogs'][Name]>;
  };
};

type Positioned = { item: DialogSnapshot; position: DialogPosition };
const emptySnapshot: readonly DialogSnapshot[] = [];
const bindings = new WeakMap<object, DialogRegistry<any>>();

function ExitMarker({
  children,
  onUnmount,
}: {
  children: React.ReactNode;
  onUnmount(): void;
}) {
  const callback = React.useRef(onUnmount);
  callback.current = onUnmount;
  React.useEffect(() => () => callback.current(), []);
  return <>{children}</>;
}

export function createDialogs<const Config extends Registration>(config: ValidRegistration<Config>): {
  dialogs: Dialogs<PropsMap<Config>>;
  DialogsProvider: React.ComponentType;
} {
  type Groups = PropsMap<Config>;
  const groups = config as Config;
  const names = Object.fromEntries(
    Object.entries(groups).map(([group, definition]) => [
      group,
      { dialogs: Object.fromEntries(Object.keys(definition.dialogs).map((name) => [name, {}])) },
    ]),
  );
  const registry = createDialogRegistry<Groups>(names);
  const { dialogs } = registry;

  for (const [group, definition] of Object.entries(groups)) {
    for (const name of Object.keys(definition.dialogs)) {
      bindings.set((dialogs as any)[group][name], registry);
    }
  }

  function DialogsProvider() {
    const open = React.useSyncExternalStore(
      registry.subscribe,
      registry.getSnapshot,
      () => emptySnapshot,
    );
    const [exiting, setExiting] = React.useState<Positioned[]>([]);
    const previous = React.useRef<Positioned[]>([]);
    const finished = React.useRef(new Set<number>());
    const current = open.map((item) => ({ item, position: item.position }));
    const openIds = new Set(open.map((item) => item.id));
    const justClosed = previous.current.filter(({ item }) => !openIds.has(item.id));
    const visible = [...current, ...exiting, ...justClosed]
      .filter(({ item }, index, all) => all.findIndex((entry) => entry.item.id === item.id) === index)
      .sort((a, b) => a.item.id - b.item.id);

    React.useEffect(() => {
      if (justClosed.length > 0) {
        setExiting((older) => [
          ...older,
          ...justClosed.filter(
            ({ item }) =>
              !finished.current.has(item.id) &&
              !older.some((entry) => entry.item.id === item.id),
          ),
        ]);
      }
      previous.current = current;
    }, [open]);

    const finishExit = (id: number) => {
      if (registry.getSnapshot().some((item) => item.id === id)) return;
      finished.current.add(id);
      setExiting((items) => items.filter(({ item }) => item.id !== id));
    };

    return (
      <>
        {visible.map(({ item, position }, layerIndex) => {
          const definition = groups[item.group].dialogs[item.name];
          const Component = typeof definition === 'function' ? definition : definition.component;
          const Wrapper =
            typeof definition === 'function'
              ? groups[item.group].wrapper
              : definition.wrapper ?? groups[item.group].wrapper;
          return (
            <Wrapper
              key={item.id}
              open={openIds.has(item.id)}
              onOpenChange={(isOpen) => {
                if (!isOpen) item.instance.pop();
              }}
              position={position}
              layerIndex={layerIndex}
              isVisualTop={layerIndex === visible.length - 1}
              onExitComplete={() => finishExit(item.id)}
            >
              <ExitMarker onUnmount={() => finishExit(item.id)}>
                <Component {...(item.props as object)} />
              </ExitMarker>
            </Wrapper>
          );
        })}
      </>
    );
  }

  return { dialogs, DialogsProvider };
}

export function useReactiveDialog<Props>(scope: NamedDialog<Props>, props: Props) {
  const registry = bindings.get(scope as object);
  if (!registry) throw new Error('useReactiveDialog requires a dialog from createDialogs');
  const latest = React.useRef(props);
  latest.current = props;
  const instances = React.useRef(new Set<DialogInstance<Props>>());

  React.useEffect(() => {
    const live = new Set(registry.getSnapshot().map((item) => item.id));
    for (const instance of Array.from(instances.current)) {
      if (live.has(instance.id)) registry.setInstanceProps(instance, props);
      else instances.current.delete(instance);
    }
  }, [registry, props]);

  const push = React.useCallback(() => {
    const instance = scope.push(latest.current as Props);
    instances.current.add(instance);
    return instance;
  }, [scope]);

  return React.useMemo(
    () => ({ push, pop: scope.pop, popAll: scope.popAll }),
    [push, scope],
  );
}
