import {MonoTypeOperatorFunction, SchedulerLike} from 'rxjs';
import {shareReplay} from 'rxjs/operators';

export function runImmediately<T>(ignoreError = false): MonoTypeOperatorFunction<T> {
    return source => {
        if (ignoreError) {
            source.subscribe({
                error: () => {/* */}
            });
        } else {
            source.subscribe();
        }

        return source;
    };
}

export function startAndRecord<T>(bufferSize: number = Number.POSITIVE_INFINITY,
                                  windowTime: number = Number.POSITIVE_INFINITY,
                                  scheduler?: SchedulerLike): MonoTypeOperatorFunction<T> {
    return source => source.pipe(
        shareReplay(bufferSize, windowTime, scheduler),
        runImmediately(true)
    );
}
