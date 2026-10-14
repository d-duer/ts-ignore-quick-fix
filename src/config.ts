import * as vscode from 'vscode';

export enum ConfigId {
  IgnoreOrExpect = 'ignoreOrExpect'
}

export type Configs = {
  [ConfigId.IgnoreOrExpect]?: 'ts-ignore' | 'ts-expect-error';
};

const EXTENSION_CONFIG_ID = 'ts-ignore-quick-fix';

export function getConfig<T = unknown>(configId: ConfigId | `${ConfigId}`): T | undefined {
  const config = vscode.workspace.getConfiguration(EXTENSION_CONFIG_ID);

  return config.get<T>(configId);
}