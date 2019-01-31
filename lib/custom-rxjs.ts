import {Observable} from 'rxjs';

export function runImmediately() {
    return (source: Observable<any>) => {
        source.subscribe(undefined, () => undefined, undefined);
        return source;
    };
}
