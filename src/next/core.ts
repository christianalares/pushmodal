export type DialogInstance<Props> = {
  readonly id: number;
  readonly group: string;
  readonly name: string;
  readonly props: Props;
  pop(): DialogInstance<Props> | undefined;
};

type RequiredKeys<Props> = {
  [Key in keyof Props]-?: {} extends Pick<Props, Key> ? never : Key;
}[keyof Props];

type PushArgs<Props> = RequiredKeys<Props> extends never
  ? [props?: Props]
  : [props: Props];

export type NamedDialog<Props> = {
  push(...args: PushArgs<Props>): DialogInstance<Props>;
  pop(): DialogInstance<Props> | undefined;
  popAll(): DialogInstance<Props>[];
};

type AnyInstance = DialogInstance<any>;

export type Dialogs<Groups extends Record<string, Record<string, any>>> = {
  pop(): AnyInstance | undefined;
  popAll(): AnyInstance[];
} & {
  [Group in keyof Groups]: {
    pop(): AnyInstance | undefined;
    popAll(): AnyInstance[];
  } & {
    [Name in keyof Groups[Group]]: NamedDialog<Groups[Group][Name]>;
  };
};

export type DialogSnapshot<Props = unknown> = Readonly<{
  id: number;
  group: string;
  name: string;
  props: Props;
  instance: DialogInstance<Props>;
}>;

export type DialogRegistry<Groups extends Record<string, Record<string, any>>> = {
  dialogs: Dialogs<Groups>;
  getSnapshot(): readonly DialogSnapshot[];
  subscribe(listener: () => void): () => void;
  /** Used by adapters that bind live values to an open instance. */
  setInstanceProps<Props>(instance: DialogInstance<Props>, props: Props): void;
};

type Registration = Record<string, { dialogs: Record<string, unknown> }>;
type ReservedNames<Definition extends Registration> =
  | Extract<keyof Definition, 'pop' | 'popAll'>
  | {
      [Group in keyof Definition]: Extract<
        keyof Definition[Group]['dialogs'],
        'pop' | 'popAll'
      >;
    }[keyof Definition];
export type ValidRegistration<Definition extends Registration> =
  ReservedNames<Definition> extends never
    ? Definition
    : Definition & { readonly __reservedDialogNameError: ReservedNames<Definition> };
type CoreProps<Definition> = Definition extends DialogType<infer Props> ? Props : {};
type PropsFromRegistration<Definition extends Registration> = {
  [Group in keyof Definition]: {
    [Name in keyof Definition[Group]['dialogs']]: CoreProps<
      Definition[Group]['dialogs'][Name]
    >;
  };
};

/** Describes push props to TypeScript without requiring a renderer or a runtime schema. */
export type DialogType<Props> = { readonly __pushmodalProps: Props };
export function defineDialog<Props>(): DialogType<Props> {
  return { __pushmodalProps: undefined as Props };
}

type RecordItem = {
  id: number;
  group: string;
  name: string;
  props: unknown;
  instance: AnyInstance;
};

const reserved = new Set(['pop', 'popAll']);

export function createDialogRegistry<
  Groups extends Record<string, Record<string, any>>,
>(registration: Registration): DialogRegistry<Groups> {
  let nextId = 1;
  let records: RecordItem[] = [];
  let snapshot: readonly DialogSnapshot[] = [];
  const listeners = new Set<() => void>();

  const notify = () => {
    snapshot = records.map(({ id, group, name, props, instance }) => ({
      id,
      group,
      name,
      props,
      instance,
    }));
    for (const listener of Array.from(listeners)) listener();
  };

  const popWhere = (matches: (item: RecordItem) => boolean) => {
    let index = records.length - 1;
    while (index >= 0 && !matches(records[index])) index--;
    if (index < 0) return undefined;
    const [item] = records.splice(index, 1);
    notify();
    return item.instance;
  };

  const popAllWhere = (matches: (item: RecordItem) => boolean) => {
    const popped = records.filter(matches).reverse().map((item) => item.instance);
    if (popped.length === 0) return [];
    records = records.filter((item) => !matches(item));
    notify();
    return popped;
  };

  const push = (group: string, name: string, props: unknown) => {
    const id = nextId++;
    const record: RecordItem = { id, group, name, props, instance: undefined as never };
    const instance: AnyInstance = {
      id,
      group,
      name,
      get props() {
        return record.props;
      },
      pop: () => popWhere((item) => item.id === id),
    };
    record.instance = instance;
    records.push(record);
    notify();
    return instance;
  };

  for (const [group, config] of Object.entries(registration)) {
    if (reserved.has(group)) throw new Error(`Reserved dialog group: ${group}`);
    for (const name of Object.keys(config.dialogs)) {
      if (reserved.has(name)) throw new Error(`Reserved dialog name: ${group}.${name}`);
    }
  }

  const dialogs: Record<string, unknown> = Object.assign(Object.create(null), {
    pop: () => popWhere(() => true),
    popAll: () => popAllWhere(() => true),
  });

  for (const [group, config] of Object.entries(registration)) {
    const groupApi: Record<string, unknown> = Object.assign(Object.create(null), {
      pop: () => popWhere((item) => item.group === group),
      popAll: () => popAllWhere((item) => item.group === group),
    });
    for (const name of Object.keys(config.dialogs)) {
      groupApi[name] = {
        push: (props: unknown = {}) => push(group, name, props),
        pop: () => popWhere((item) => item.group === group && item.name === name),
        popAll: () => popAllWhere((item) => item.group === group && item.name === name),
      };
    }
    dialogs[group] = groupApi;
  }

  return {
    dialogs: dialogs as Dialogs<Groups>,
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setInstanceProps(instance, props) {
      const item = records.find((record) => record.instance === instance);
      if (!item || Object.is(item.props, props)) return;
      item.props = props;
      notify();
    },
  };
}

export function createDialogs<const Definition extends Registration>(
  registration: ValidRegistration<Definition>,
): DialogRegistry<PropsFromRegistration<Definition>> {
  return createDialogRegistry<PropsFromRegistration<Definition>>(registration);
}
