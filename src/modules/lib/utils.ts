import { Astal, Widget, Gtk, Variable, Binding, bind } from "astal"

export function createSurfaceFromWidget(widget: Gtk.Widget) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cairo = imports.gi.cairo as any
    const alloc = widget.get_allocation()
    const surface = new cairo.ImageSurface(
        cairo.Format.ARGB32,
        alloc.width,
        alloc.height,
    )
    const cr = new cairo.Context(surface)
    cr.setSourceRGBA(255, 255, 255, 0)
    cr.rectangle(0, 0, alloc.width, alloc.height)
    cr.fill()
    widget.draw(cr)
    return surface
}

function kebabify(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

type Dep<T> = Binding<any, any, T>

export function merge<V,
    const Deps extends Dep<unknown>[],
    Args extends { [K in keyof Deps]: Deps[K] extends Dep<infer T> ? T : never }
>(deps: Deps, fn: (...args: Args) => V) {
    const update = () => fn(...deps.map(d => d.transformFn(d.emitter[d.prop])) as Args);
    const watcher = new Variable(update());
    for (const dep of deps)
        dep.emitter.connect(`notify::${kebabify(dep.prop)}`, () => watcher.value = update());

    return bind(watcher);
}