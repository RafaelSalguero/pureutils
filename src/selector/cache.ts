import { shallowEquals } from "../logic";

export interface SelectorCache<TArgs extends {}, TResult> {
    args: TArgs;
    result: TResult;
}


export interface SelectorCacheRequest<TArgs extends {}, TResult> {
    args: TArgs;
    func: (curr: TArgs, prev: TArgs | undefined) => TResult;
}

export interface SelectorCacheResponse<TArgs, TResult> {
    result: TResult,
    cache: SelectorCache<TArgs, TResult>
}

/**
 * Realiza una petición a un cache de un selector y devuelve el nuevo cache y el resultado de la petición
 */
export function selectorCacheRequest<TArgs extends {}, TResult>(cache: SelectorCache<TArgs, TResult> | undefined, request: SelectorCacheRequest<TArgs, TResult>): SelectorCacheResponse<TArgs, TResult>{
    const item = cache && shallowEquals(cache.args, request.args) ? cache : undefined;
    if (cache == undefined || item == undefined) {
        const result = request.func(request.args, cache && cache.args);
        const newCache: SelectorCache<TArgs, TResult> = {
            args: request.args,
            result: result
        };

        return {
            result: result,
            cache: newCache
        };
    }

    //El cache no cambia
    return {
        result: item.result,
        cache: cache
    };
}