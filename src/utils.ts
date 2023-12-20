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

/**
 * Returns true if all elements of the passed in array are instances of the specified type
 *
 * @export
 * @template T
 * @param {unknown[]} arr The array to check
 * @param {new (...args: any[]) => T} type The type to check against
 * @returns {boolean}
 */
/**
 * Checks if every element in an array is an instance of a specified type.
 * 
 * @template T - The type of the elements in the array.
 * @param arr - The array to check.
 * @param type - The constructor function of the type to check against.
 * @returns True if every element in the array is an instance of the specified type, false otherwise.
 */
export function isArrayOf<T>(arr: unknown[], type: new (...args: any[]) => T): boolean {
    return arr.every((elem) => elem instanceof type);
}

/**
 * Converts a string to a Uint8Array.
 * @param content The string to be converted.
 * @returns The Uint8Array representation of the string.
 */
export function convertToUint8Array(content: string): Uint8Array {
    return new TextEncoder().encode(content);
}

/**
 * Converts a Uint8Array to a string using the TextDecoder API.
 * @param content The Uint8Array to convert.
 * @returns The converted string.
 */
export function convertFromUint8Array(content: Uint8Array): string {
    return new TextDecoder().decode(content);
}