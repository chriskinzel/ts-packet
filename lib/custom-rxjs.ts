import {MonoTypeOperatorFunction, SchedulerLike} from 'rxjs';
import {catchError, shareReplay} from 'rxjs/operators';

export function runImmediately<T>(): MonoTypeOperatorFunction<T> {
    return source => {
        source.subscribe();
        return source;
    };
}

export function ignoreErrors<T>(): MonoTypeOperatorFunction<T> {
    return source => source.pipe(catchError(() => source));
}

export function startAndRecord<T>(bufferSize: number = Number.POSITIVE_INFINITY,
                                  windowTime: number = Number.POSITIVE_INFINITY,
                                  scheduler?: SchedulerLike): MonoTypeOperatorFunction<T> {
    return source => source.pipe(
        shareReplay(bufferSize, windowTime, scheduler),
        ignoreErrors(),
        runImmediately()
    );
}
