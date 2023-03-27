import { commands } from "vscode";
import { extensionContext, store } from "./extension";
import { SortDirection, SortType } from "./FileSystem/storage";
import { GlobalStorageKeys } from "./GitHub/constants";

/**
 * Add SortType to global storage and set context.
 *
 * @export
 * @param {SortType} sortType The sort type to set.
 */
export function setSortTypeContext(sortType: SortType) {
    Object.keys(SortType).forEach((key) => {
        if (key === sortType) {
            commands.executeCommand("setContext", `VirtualGists.sortType.${key}`, true);
        } else {
            commands.executeCommand("setContext", `VirtualGists.sortType.${key}`, false);
        }
    });
    store.sortType = sortType;
    store.addToGlobalState(extensionContext, GlobalStorageKeys.sortType, sortType);
}

/**
 * Add SortDirection to global storage and set context.
 *
 * @export
 * @param {SortDirection} sortDirection The sort direction to set.
 */
export function setSortDirectionContext(sortDirection: SortDirection) {
    Object.keys(SortDirection).forEach((key) => {
        if (key === sortDirection) {
            commands.executeCommand("setContext", `VirtualGists.sortDirection.${key}`, true);
        } else {
            commands.executeCommand("setContext", `VirtualGists.sortDirection.${key}`, false);
        }
    });
    store.sortDirection = sortDirection;
    store.addToGlobalState(extensionContext, GlobalStorageKeys.sortDirection, sortDirection);
}

export const isArrayOf =
    <T>(elemGuard: (x: any) => x is T) =>
    (arr: any[]): arr is Array<T> =>
        arr.every(elemGuard);

export const isInstanceOf =
    <T>(ctor: new (...args: any) => T) =>
    (x: any): x is T =>
        x instanceof ctor;
