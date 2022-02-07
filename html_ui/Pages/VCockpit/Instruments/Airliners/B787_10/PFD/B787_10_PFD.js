/**
 * Types of subscribable array change event.
 */
var SubscribableArrayEventType;
(function (SubscribableArrayEventType) {
    /** An element was added. */
    SubscribableArrayEventType["Added"] = "Added";
    /** An element was removed. */
    SubscribableArrayEventType["Removed"] = "Removed";
    /** The array was cleared. */
    SubscribableArrayEventType["Cleared"] = "Cleared";
})(SubscribableArrayEventType || (SubscribableArrayEventType = {}));
/**
 * An abstract implementation of a subscribable which allows adding, removing, and notifying subscribers.
 */
class AbstractSubscribable {
    constructor() {
        this.subs = [];
    }
    /** @inheritdoc */
    sub(fn, initialNotify) {
        this.subs.push(fn);
        if (initialNotify) {
            fn(this.get());
        }
    }
    /** @inheritdoc */
    unsub(fn) {
        const index = this.subs.indexOf(fn);
        if (index >= 0) {
            this.subs.splice(index, 1);
        }
    }
    /**
     * Notifies subscribers that this subscribable's value has changed.
     */
    notify() {
        const subLen = this.subs.length;
        for (let i = 0; i < subLen; i++) {
            try {
                this.subs[i](this.get());
            }
            catch (error) {
                console.error(`AbstractSubscribable: error in handler: ${error}`);
                if (error instanceof Error) {
                    console.error(error.stack);
                }
            }
        }
    }
}
/**
 * Checks if two values are equal using the strict equality operator.
 * @param a The first value.
 * @param b The second value.
 * @returns whether a and b are equal.
 */
AbstractSubscribable.DEFAULT_EQUALITY_FUNC = (a, b) => a === b;

/**
 * A subscribable subject whose value can be freely manipulated.
 */
class Subject extends AbstractSubscribable {
    /**
     * Constructs an observable Subject.
     * @param value The initial value.
     * @param equalityFunc The function to use to check for equality.
     * @param mutateFunc The function to use to mutate the subject's value.
     */
    constructor(value, equalityFunc, mutateFunc) {
        super();
        this.value = value;
        this.equalityFunc = equalityFunc;
        this.mutateFunc = mutateFunc;
    }
    /**
     * Creates and returns a new Subject.
     * @param v The initial value of the subject.
     * @param equalityFunc The function to use to check for equality between subject values. Defaults to the strict
     * equality comparison (`===`).
     * @param mutateFunc The function to use to change the subject's value. If not defined, new values will replace
     * old values by variable assignment.
     * @returns A Subject instance.
     */
    static create(v, equalityFunc, mutateFunc) {
        return new Subject(v, equalityFunc !== null && equalityFunc !== void 0 ? equalityFunc : Subject.DEFAULT_EQUALITY_FUNC, mutateFunc);
    }
    /**
     * Sets the value of this subject and notifies subscribers if the value changed.
     * @param value The new value.
     */
    set(value) {
        if (!this.equalityFunc(value, this.value)) {
            if (this.mutateFunc) {
                this.mutateFunc(this.value, value);
            }
            else {
                this.value = value;
            }
            this.notify();
        }
    }
    /**
     * Applies a partial set of properties to this subject's value and notifies subscribers if the value changed as a
     * result.
     * @param value The properties to apply.
     */
    apply(value) {
        let changed = false;
        for (const prop in value) {
            changed = value[prop] !== this.value[prop];
            if (changed) {
                break;
            }
        }
        Object.assign(this.value, value);
        changed && this.notify();
    }
    /** @inheritdoc */
    notify() {
        super.notify();
    }
    /**
     * Gets the value of this subject.
     * @returns The value of this subject.
     */
    get() {
        return this.value;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    map(fn, equalityFunc, mutateFunc, initialVal) {
        const mapFunc = (inputs, previousVal) => fn(inputs[0], previousVal);
        return mutateFunc
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ? MappedSubject.create(mapFunc, equalityFunc, mutateFunc, initialVal, this)
            : MappedSubject.create(mapFunc, equalityFunc !== null && equalityFunc !== void 0 ? equalityFunc : AbstractSubscribable.DEFAULT_EQUALITY_FUNC, this);
    }
}
/**
 * A subscribable subject that is a mapped stream from one or more input subscribables.
 */
class MappedSubject extends AbstractSubscribable {
    /**
     * Creates a new MappedSubject.
     * @param mapFunc The function which maps this subject's inputs to a value.
     * @param equalityFunc The function which this subject uses to check for equality between values.
     * @param mutateFunc The function which this subject uses to change its value.
     * @param initialVal The initial value of this subject.
     * @param inputs The subscribables which provide the inputs to this subject.
     */
    constructor(mapFunc, equalityFunc, mutateFunc, initialVal, ...inputs) {
        super();
        this.mapFunc = mapFunc;
        this.equalityFunc = equalityFunc;
        this.inputs = inputs;
        this.inputValues = inputs.map(input => input.get());
        if (initialVal && mutateFunc) {
            this.value = initialVal;
            mutateFunc(this.value, this.mapFunc(this.inputValues));
            this.mutateFunc = (newVal) => { mutateFunc(this.value, newVal); };
        }
        else {
            this.value = this.mapFunc(this.inputValues);
            this.mutateFunc = (newVal) => { this.value = newVal; };
        }
        this.inputHandlers = this.inputs.map((input, index) => this.updateValue.bind(this, index));
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].sub(this.inputHandlers[i]);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    static create(mapFunc, ...args) {
        let equalityFunc, mutateFunc, initialVal;
        if (typeof args[0] === 'function') {
            equalityFunc = args.shift();
        }
        else {
            equalityFunc = MappedSubject.DEFAULT_EQUALITY_FUNC;
        }
        if (typeof args[0] === 'function') {
            mutateFunc = args.shift();
            initialVal = args.shift();
        }
        return new MappedSubject(mapFunc, equalityFunc, mutateFunc, initialVal, ...args);
    }
    /**
     * Updates an input value, then re-maps this subject's value, and notifies subscribers if this results in a change to
     * the mapped value according to this subject's equality function.
     * @param index The index of the input value to update.
     */
    updateValue(index) {
        this.inputValues[index] = this.inputs[index].get();
        const value = this.mapFunc(this.inputValues, this.value);
        if (!this.equalityFunc(this.value, value)) {
            this.mutateFunc(value);
            this.notify();
        }
    }
    /**
     * Gets the current value of the subject.
     * @returns The current value.
     */
    get() {
        return this.value;
    }
    /**
     * Destroys the subscription to the parent subscribable.
     */
    destroy() {
        for (let i = 0; i < this.inputs.length; i++) {
            this.inputs[i].unsub(this.inputHandlers[i]);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    map(fn, equalityFunc, mutateFunc, initialVal) {
        const mapFunc = (inputs, previousVal) => fn(inputs[0], previousVal);
        return new MappedSubject(mapFunc, equalityFunc !== null && equalityFunc !== void 0 ? equalityFunc : MappedSubject.DEFAULT_EQUALITY_FUNC, mutateFunc, initialVal, this);
    }
}

/**
 * A class for subjects that return a computed value.
 * @class ComputedSubject
 * @template I The type of the input value.
 * @template T The type of the computed output value.
 */
class ComputedSubject {
    /**
     * Creates an instance of ComputedSubject.
     * @param value The initial value.
     * @param computeFn The computation function.
     */
    constructor(value, computeFn) {
        this.computeFn = computeFn;
        this._subs = [];
        this._value = value;
        this._computedValue = computeFn(value);
    }
    /**
     * Creates and returns a new ComputedSubject.
     * @param v The initial value of the Subject.
     * @param fn A function which transforms raw values to computed values.
     * @returns A ComputedSubject instance.
     */
    static create(v, fn) {
        return new ComputedSubject(v, fn);
    }
    /**
     * Sets the new value and notifies the subscribers when value changed.
     * @param value The new value.
     */
    set(value) {
        this._value = value;
        const compValue = this.computeFn(value);
        if (compValue !== this._computedValue) {
            this._computedValue = compValue;
            const subLen = this._subs.length;
            for (let i = 0; i < subLen; i++) {
                this._subs[i](this._computedValue, this._value);
            }
        }
    }
    /**
     * Gets the computed value of the Subject.
     * @returns The computed value.
     */
    get() {
        return this._computedValue;
    }
    /**
     * Gets the raw value of the Subject.
     * @returns The raw value.
     */
    getRaw() {
        return this._value;
    }
    /**
     * Subscribes to the subject with a callback function. The function will be called whenever the computed value of
     * this Subject changes.
     * @param fn A callback function.
     * @param initialNotify Whether to immediately notify the callback function with the current compured and raw values
     * of this Subject after it is subscribed. False by default.
     */
    sub(fn, initialNotify) {
        this._subs.push(fn);
        if (initialNotify) {
            fn(this._computedValue, this._value);
        }
    }
    /**
     * Unsubscribes a callback function from this Subject.
     * @param fn The callback function to unsubscribe.
     */
    unsub(fn) {
        const index = this._subs.indexOf(fn);
        if (index >= 0) {
            this._subs.splice(index, 1);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    map(fn, equalityFunc, mutateFunc, initialVal) {
        const mapFunc = (inputs, previousVal) => fn(inputs[0], previousVal);
        return mutateFunc
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ? MappedSubject.create(mapFunc, equalityFunc, mutateFunc, initialVal, this)
            : MappedSubject.create(mapFunc, equalityFunc !== null && equalityFunc !== void 0 ? equalityFunc : AbstractSubscribable.DEFAULT_EQUALITY_FUNC, this);
    }
}

/* eslint-disable no-inner-declarations */
/** A releative render position. */
var RenderPosition;
(function (RenderPosition) {
    RenderPosition[RenderPosition["Before"] = 0] = "Before";
    RenderPosition[RenderPosition["After"] = 1] = "After";
    RenderPosition[RenderPosition["In"] = 2] = "In";
})(RenderPosition || (RenderPosition = {}));
/**
 * A display component in the component framework.
 * @typedef P The type of properties for this component.
 * @typedef C The type of context that this component might have.
 */
class DisplayComponent {
    /**
     * Creates an instance of a DisplayComponent.
     * @param props The propertis of the component.
     */
    constructor(props) {
        /** The context on this component, if any. */
        this.context = undefined;
        /** The type of context for this component, if any. */
        this.contextType = undefined;
        this.props = props;
    }
    /**
     * A callback that is called before the component is rendered.
     */
    onBeforeRender() { return; }
    /**
     * A callback that is called after the component is rendered.
     * @param node The component's VNode.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onAfterRender(node) { return; }
    /**
     * Destroys this component.
     */
    destroy() { return; }
    /**
     * Gets a context data subscription from the context collection.
     * @param context The context to get the subscription for.
     * @returns The requested context.
     * @throws An error if no data for the specified context type could be found.
     */
    getContext(context) {
        if (this.context !== undefined && this.contextType !== undefined) {
            const index = this.contextType.indexOf(context);
            return this.context[index];
        }
        throw new Error('Could not find the provided context type.');
    }
}
/**
 * A reference to a component or element node.
 */
class NodeReference {
    constructor() {
        /** The internal reference instance. */
        this._instance = null;
    }
    /**
     * The instance of the element or component.
     * @returns The instance of the element or component.
     */
    get instance() {
        if (this._instance !== null) {
            return this._instance;
        }
        throw new Error('Instance was null.');
    }
    /**
     * Sets the value of the instance.
     */
    set instance(val) {
        this._instance = val;
    }
    /**
     * Gets the instance, or null if the instance is not populated.
     * @returns The component or element instance.
     */
    getOrDefault() {
        return this._instance;
    }
}
/**
 * Provides a context of data that can be passed down to child components via a provider.
 */
class Context {
    /**
     * Creates an instance of a Context.
     * @param defaultValue The default value of this context.
     */
    constructor(defaultValue) {
        this.defaultValue = defaultValue;
        /**
         * The provider component that can be set to a specific context value.
         * @param props The props of the provider component.
         * @returns A new context provider.
         */
        this.Provider = (props) => new ContextProvider(props, this);
    }
}
/**
 * A provider component that can be set to a specific context value.
 */
class ContextProvider extends DisplayComponent {
    /**
     * Creates an instance of a ContextProvider.
     * @param props The props on the component.
     * @param parent The parent context instance for this provider.
     */
    constructor(props, parent) {
        super(props);
        this.parent = parent;
    }
    /** @inheritdoc */
    render() {
        var _a;
        const children = (_a = this.props.children) !== null && _a !== void 0 ? _a : [];
        return FSComponent.buildComponent(FSComponent.Fragment, this.props, ...children);
    }
}
/**
 * The FS component namespace.
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
var FSComponent;
(function (FSComponent) {
    /**
     * Valid SVG element tags.
     */
    const svgTags = {
        'circle': true,
        'clipPath': true,
        'color-profile': true,
        'cursor': true,
        'defs': true,
        'desc': true,
        'ellipse': true,
        'g': true,
        'image': true,
        'line': true,
        'linearGradient': true,
        'marker': true,
        'mask': true,
        'path': true,
        'pattern': true,
        'polygon': true,
        'polyline': true,
        'radialGradient': true,
        'rect': true,
        'stop': true,
        'svg': true,
        'text': true
    };
    /**
     * A fragment of existing elements with no specific root.
     * @param props The fragment properties.
     * @returns The fragment children.
     */
    function Fragment(props) {
        return props.children;
    }
    FSComponent.Fragment = Fragment;
    /**
     * Builds a JSX based FSComponent.
     * @param type The DOM element tag that will be built.
     * @param props The properties to apply to the DOM element.
     * @param children Any children of this DOM element.
     * @returns The JSX VNode for the component or element.
     */
    // eslint-disable-next-line no-inner-declarations
    function buildComponent(type, props, ...children) {
        let vnode = null;
        if (typeof type === 'string') {
            let element;
            if (svgTags[type] !== undefined) {
                element = document.createElementNS('http://www.w3.org/2000/svg', type);
            }
            else {
                element = document.createElement(type);
            }
            if (props !== null) {
                for (const key in props) {
                    if (key === 'ref' && props.ref !== undefined) {
                        props.ref.instance = element;
                    }
                    else {
                        const prop = props[key];
                        if (prop instanceof Subject || prop instanceof MappedSubject || prop instanceof ComputedSubject) {
                            element.setAttribute(key, prop.get());
                            prop.sub((v) => {
                                element.setAttribute(key, v);
                            });
                        }
                        else {
                            element.setAttribute(key, prop);
                        }
                    }
                }
            }
            vnode = {
                instance: element,
                props: props,
                children: null
            };
            vnode.children = createChildNodes(vnode, children);
        }
        else if (typeof type === 'function') {
            if (children !== null && props === null) {
                props = {
                    children: children
                };
            }
            else if (props !== null) {
                props.children = children;
            }
            if (typeof type === 'function' && type.name === 'Fragment') {
                let childNodes = type(props);
                //Handle the case where the single fragment children is an array of nodes passsed down from above
                if (childNodes !== null && childNodes.length > 0 && Array.isArray(childNodes[0])) {
                    childNodes = childNodes[0];
                }
                vnode = {
                    instance: null,
                    props,
                    children: childNodes
                };
            }
            else {
                let instance;
                try {
                    instance = type(props);
                }
                catch (_a) {
                    instance = new type(props);
                }
                if (props !== null && props.ref !== null && props.ref !== undefined) {
                    props.ref.instance = instance;
                }
                if (instance.contextType !== undefined) {
                    instance.context = instance.contextType.map(c => Subject.create(c.defaultValue));
                }
                vnode = {
                    instance,
                    props,
                    children: [instance.render()]
                };
            }
        }
        return vnode;
    }
    FSComponent.buildComponent = buildComponent;
    /**
     * Creates the collection of child VNodes.
     * @param parent The parent VNode.
     * @param children The JSX children to convert to nodes.
     * @returns A collection of child VNodes.
     */
    function createChildNodes(parent, children) {
        let vnodes = null;
        if (children !== null && children !== undefined && children.length > 0) {
            vnodes = [];
            for (const child of children) {
                if (child !== null) {
                    if (child instanceof Subject || child instanceof MappedSubject || child instanceof ComputedSubject) {
                        const subjectValue = child.get().toString();
                        const node = {
                            instance: subjectValue === '' ? ' ' : subjectValue,
                            children: null,
                            props: null,
                            root: undefined,
                        };
                        child.sub((v) => {
                            if (node.root !== undefined) {
                                // TODO workaround. gotta find a solution for the text node vanishing when text is empty
                                node.root.nodeValue = v === '' ? ' ' : v.toString();
                            }
                        });
                        vnodes.push(node);
                    }
                    else if (child instanceof Array) {
                        const arrayNodes = createChildNodes(parent, child);
                        if (arrayNodes !== null) {
                            vnodes.push(...arrayNodes);
                        }
                    }
                    else if (typeof child === 'string' || typeof child === 'number') {
                        vnodes.push(createStaticContentNode(child));
                    }
                    else if (typeof child === 'object') {
                        vnodes.push(child);
                    }
                }
            }
        }
        return vnodes;
    }
    FSComponent.createChildNodes = createChildNodes;
    /**
     * Creates a static content VNode.
     * @param content The content to create a node for.
     * @returns A static content VNode.
     */
    function createStaticContentNode(content) {
        return {
            instance: content,
            children: null,
            props: null
        };
    }
    FSComponent.createStaticContentNode = createStaticContentNode;
    /**
     * Renders a VNode to a DOM element.
     * @param node The node to render.
     * @param element The DOM element to render to.
     * @param position The RenderPosition to put the item in.
     */
    function render(node, element, position = RenderPosition.In) {
        if (node.children && node.children.length > 0 && element !== null) {
            const componentInstance = node.instance;
            if (componentInstance !== null && componentInstance.onBeforeRender !== undefined) {
                componentInstance.onBeforeRender();
            }
            if (node.instance instanceof HTMLElement || node.instance instanceof SVGElement) {
                insertNode(node, position, element);
            }
            else {
                for (const child of node.children) {
                    insertNode(child, position, element);
                }
            }
            const instance = node.instance;
            if (instance instanceof ContextProvider) {
                visitNodes(node, (n) => {
                    const nodeInstance = n.instance;
                    if (nodeInstance !== null && nodeInstance.contextType !== undefined) {
                        const contextSlot = nodeInstance.contextType.indexOf(instance.parent);
                        if (contextSlot >= 0) {
                            if (nodeInstance.context === undefined) {
                                nodeInstance.context = [];
                            }
                            nodeInstance.context[contextSlot].set(instance.props.value);
                        }
                        if (nodeInstance instanceof ContextProvider && nodeInstance !== instance && nodeInstance.parent === instance.parent) {
                            return true;
                        }
                    }
                    return false;
                });
            }
            if (componentInstance !== null && componentInstance.onAfterRender !== undefined) {
                componentInstance.onAfterRender(node);
            }
        }
    }
    FSComponent.render = render;
    /**
     * Inserts a node into the DOM.
     * @param node The node to insert.
     * @param position The position to insert the node in.
     * @param element The element to insert relative to.
     */
    function insertNode(node, position, element) {
        var _a, _b, _c, _d, _e, _f;
        if (node.instance instanceof HTMLElement || node.instance instanceof SVGElement) {
            switch (position) {
                case RenderPosition.In:
                    element.appendChild(node.instance);
                    node.root = (_a = element.lastChild) !== null && _a !== void 0 ? _a : undefined;
                    break;
                case RenderPosition.Before:
                    element.insertAdjacentElement('beforebegin', node.instance);
                    node.root = (_b = element.previousSibling) !== null && _b !== void 0 ? _b : undefined;
                    break;
                case RenderPosition.After:
                    element.insertAdjacentElement('afterend', node.instance);
                    node.root = (_c = element.nextSibling) !== null && _c !== void 0 ? _c : undefined;
                    break;
            }
            if (node.children !== null) {
                for (const child of node.children) {
                    insertNode(child, RenderPosition.In, node.instance);
                }
            }
        }
        else if (typeof node.instance === 'string') {
            switch (position) {
                case RenderPosition.In:
                    element.insertAdjacentHTML('beforeend', node.instance);
                    node.root = (_d = element.lastChild) !== null && _d !== void 0 ? _d : undefined;
                    break;
                case RenderPosition.Before:
                    element.insertAdjacentHTML('beforebegin', node.instance);
                    node.root = (_e = element.previousSibling) !== null && _e !== void 0 ? _e : undefined;
                    break;
                case RenderPosition.After:
                    element.insertAdjacentHTML('afterend', node.instance);
                    node.root = (_f = element.nextSibling) !== null && _f !== void 0 ? _f : undefined;
                    break;
            }
        }
        else if (Array.isArray(node)) {
            for (let i = 0; i < node.length; i++) {
                render(node[i], element);
            }
        }
        else {
            render(node, element);
        }
    }
    /**
     * Render a node before a DOM element.
     * @param node The node to render.
     * @param element The element to render boeore.
     */
    function renderBefore(node, element) {
        render(node, element, RenderPosition.Before);
    }
    FSComponent.renderBefore = renderBefore;
    /**
     * Render a node after a DOM element.
     * @param node The node to render.
     * @param element The element to render after.
     */
    function renderAfter(node, element) {
        render(node, element, RenderPosition.After);
    }
    FSComponent.renderAfter = renderAfter;
    /**
     * Remove a previously rendered element.  Currently, this is just a simple
     * wrapper so that all of our high-level "component maniuplation" state is kept
     * in the FSComponent API, but it's not doing anything other than a simple
     * remove() on the element.   This can probably be enhanced.
     * @param element The element to remove.
     */
    function remove(element) {
        if (element !== null) {
            element.remove();
        }
    }
    FSComponent.remove = remove;
    /**
     * Creates a component or element node reference.
     * @returns A new component or element node reference.
     */
    function createRef() {
        return new NodeReference();
    }
    FSComponent.createRef = createRef;
    /**
     * Creates a new context to hold data for passing to child components.
     * @param defaultValue The default value of this context.
     * @returns A new context.
     */
    function createContext(defaultValue) {
        return new Context(defaultValue);
    }
    FSComponent.createContext = createContext;
    /**
     * Visits VNodes with a supplied visitor function within the given children tree.
     * @param node The node to visit.
     * @param visitor The visitor function to inspect VNodes with. Return true if the search should stop at the visited
     * node and not proceed any further down the node's children.
     * @returns True if the visitation should break, or false otherwise.
     */
    function visitNodes(node, visitor) {
        const stopVisitation = visitor(node);
        if (!stopVisitation && node.children !== null) {
            for (let i = 0; i < node.children.length; i++) {
                visitNodes(node.children[i], visitor);
            }
        }
        return true;
    }
    FSComponent.visitNodes = visitNodes;
    /**
     * An empty callback handler.
     */
    FSComponent.EmptyHandler = () => { return; };
})(FSComponent || (FSComponent = {}));
FSComponent.Fragment;

/**
 * A number with an associated unit. Each NumberUnit is created with a reference unit type,
 * which cannot be changed after instantiation. The reference unit type determines how the
 * value of the NumberUnit is internally represented. Each NumberUnit also maintains an
 * active unit type, which can be dynamically changed at any time.
 */
class NumberUnit {
    /**
     * Constructor.
     * @param number - the initial numeric value of the new NumberUnit.
     * @param unit - the unit type of the new NumberUnit.
     */
    constructor(number, unit) {
        this._number = number;
        this._unit = unit;
        this.readonly = new NumberUnitReadOnly(this);
    }
    /**
     * Gets this NumberUnit's numeric value.
     * @returns This NumberUnit's numeric value.
     */
    get number() {
        return this._number;
    }
    /**
     * Gets this NumberUnit's unit type.
     * @returns This NumberUnit's unit type.
     */
    get unit() {
        return this._unit;
    }
    /**
     * Converts a value to a numeric value with this NumberUnit's unit type.
     * @param value - the value.
     * @param unit - the unit type of the new value. Defaults to this NumberUnit's unit type. This argument is ignored if
     * value is a NumberUnit.
     * @returns the numeric of the value with this NumberUnit's unit type.
     */
    toNumberOfThisUnit(value, unit) {
        if ((typeof value !== 'number') && this.unit.canConvert(value.unit)) {
            return this.unit.convertFrom(value.number, value.unit);
        }
        if (typeof value === 'number' && (!unit || this.unit.canConvert(unit))) {
            return unit ? this.unit.convertFrom(value, unit) : value;
        }
        return undefined;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    set(arg1, arg2) {
        const converted = this.toNumberOfThisUnit(arg1, arg2);
        if (converted !== undefined) {
            this._number = converted;
            return this;
        }
        throw new Error('Invalid unit conversion attempted.');
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    add(arg1, arg2, arg3) {
        const isArg2NumberUnit = arg2 instanceof NumberUnit;
        const converted = this.toNumberOfThisUnit(arg1, isArg2NumberUnit ? undefined : arg2);
        if (converted !== undefined) {
            let out = isArg2NumberUnit ? arg2 : arg3;
            if (out) {
                out.set(this.number + converted, this.unit);
            }
            else {
                out = this;
                this._number += converted;
            }
            return out;
        }
        throw new Error('Invalid unit conversion attempted.');
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    subtract(arg1, arg2, arg3) {
        const isArg2NumberUnit = arg2 instanceof NumberUnit;
        const converted = this.toNumberOfThisUnit(arg1, isArg2NumberUnit ? undefined : arg2);
        if (converted !== undefined) {
            let out = isArg2NumberUnit ? arg2 : arg3;
            if (out) {
                out.set(this.number - converted, this.unit);
            }
            else {
                out = this;
                this._number -= converted;
            }
            return out;
        }
        throw new Error('Invalid unit conversion attempted.');
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    scale(factor, out) {
        if (out) {
            return out.set(this.number * factor, this.unit);
        }
        else {
            this._number *= factor;
            return this;
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    ratio(value, unit) {
        const converted = this.toNumberOfThisUnit(value, unit);
        if (converted) {
            return this.number / converted;
        }
        throw new Error('Invalid unit conversion attempted.');
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    abs(out) {
        if (out) {
            return out.set(Math.abs(this.number), this.unit);
        }
        else {
            this._number = Math.abs(this._number);
            return this;
        }
    }
    /**
     * Returns the numeric value of this NumberUnit after conversion to a specified unit.
     * @param unit The unit to which to convert.
     * @returns The converted numeric value.
     * @throws Error if this NumberUnit's unit type cannot be converted to the specified unit.
     */
    asUnit(unit) {
        return this.unit.convertTo(this.number, unit);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    compare(value, unit) {
        const converted = this.toNumberOfThisUnit(value, unit);
        if (converted === undefined) {
            throw new Error('Invalid unit conversion attempted.');
        }
        const diff = this.number - converted;
        if (Math.abs(diff) < 1e-14) {
            return 0;
        }
        return Math.sign(diff);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    equals(value, unit) {
        const converted = this.toNumberOfThisUnit(value, unit);
        if (converted === undefined) {
            return false;
        }
        const diff = this.number - converted;
        return Math.abs(diff) < 1e-14;
    }
    /**
     * Checks whether this NumberUnit has a numeric value of NaN.
     * @returns Whether this NumberUnit has a numeric value of NaN.
     */
    isNaN() {
        return isNaN(this.number);
    }
    /**
     * Copies this NumberUnit.
     * @returns A copy of this NumberUnit.
     */
    copy() {
        return new NumberUnit(this.number, this.unit);
    }
}
/**
 * A read-only interface for a WT_NumberUnit.
 */
class NumberUnitReadOnly {
    /**
     * Constructor.
     * @param source - the source of the new read-only NumberUnit.
     */
    constructor(source) {
        this.source = source;
    }
    /**
     * Gets this NumberUnit's numeric value.
     * @returns This NumberUnit's numeric value.
     */
    get number() {
        return this.source.number;
    }
    /**
     * Gets this NumberUnit's unit type.
     * @returns This NumberUnit's unit type.
     */
    get unit() {
        return this.source.unit;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    add(arg1, arg2, arg3) {
        const isArg2NumberUnit = arg2 instanceof NumberUnit;
        const out = (isArg2NumberUnit ? arg2 : arg3);
        if (typeof arg1 === 'number') {
            return this.source.add(arg1, arg2, out);
        }
        else {
            return this.source.add(arg1, out);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    subtract(arg1, arg2, arg3) {
        const isArg2NumberUnit = arg2 instanceof NumberUnit;
        const out = (isArg2NumberUnit ? arg2 : arg3);
        if (typeof arg1 === 'number') {
            return this.source.subtract(arg1, arg2, out);
        }
        else {
            return this.source.subtract(arg1, out);
        }
    }
    /**
     * Scales this NumberUnit by a unit-less factor and returns the result.
     * @param factor The factor by which to scale.
     * @param out The NumberUnit to which to write the result.
     * @returns The scaled value.
     */
    scale(factor, out) {
        return this.source.scale(factor, out);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    ratio(arg1, arg2) {
        if (typeof arg1 === 'number') {
            return this.source.ratio(arg1, arg2);
        }
        else {
            return this.source.ratio(arg1);
        }
    }
    /**
     * Calculates the absolute value of this NumberUnit and returns the result.
     * @param out The NumberUnit to which to write the result.
     * @returns The absolute value.
     */
    abs(out) {
        return this.source.abs(out);
    }
    /**
     * Returns the numeric value of this NumberUnit after conversion to a specified unit.
     * @param unit The unit to which to convert.
     * @returns The converted numeric value.
     * @throws Error if this NumberUnit's unit type cannot be converted to the specified unit.
     */
    asUnit(unit) {
        return this.source.asUnit(unit);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    compare(arg1, arg2) {
        if (typeof arg1 === 'number') {
            return this.source.compare(arg1, arg2);
        }
        else {
            return this.source.compare(arg1);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    equals(arg1, arg2) {
        if (typeof arg1 === 'number') {
            return this.source.equals(arg1, arg2);
        }
        else {
            return this.source.equals(arg1);
        }
    }
    /**
     * Checks whether this NumberUnit has a numeric value of NaN.
     * @returns Whether this NumberUnit has a numeric value of NaN.
     */
    isNaN() {
        return this.source.isNaN();
    }
    /**
     * Copies this NumberUnit.
     * @returns A copy of this NumberUnit.
     */
    copy() {
        return this.source.copy();
    }
}
/**
 * A unit of measurement.
 */
class AbstractUnit {
    /**
     * Constructor.
     * @param name The name of this unit.
     */
    constructor(name) {
        this.name = name;
    }
    /** @inheritdoc */
    canConvert(otherUnit) {
        return this.family === otherUnit.family;
    }
    /** @inheritdoc */
    createNumber(value) {
        return new NumberUnit(value, this);
    }
    /** @inheritdoc */
    equals(other) {
        return this.family === other.family && this.name === other.name;
    }
}
/**
 * A unit that can be converted to another unit of the same type via a fixed linear transformation.
 */
class SimpleUnit extends AbstractUnit {
    /**
     * Constructor.
     * @param family The family to which this unit belongs.
     * @param name The name of this unit.
     * @param scaleFactor The relative linear scale of the new unit compared to the standard unit of the same family.
     * @param zeroOffset The zero offset of the new unit compared to the standard unit of the same family.
     */
    constructor(family, name, scaleFactor, zeroOffset = 0) {
        super(name);
        this.family = family;
        this.scaleFactor = scaleFactor;
        this.zeroOffset = zeroOffset;
    }
    /** @inheritdoc */
    canConvert(otherUnit) {
        return otherUnit instanceof SimpleUnit && super.canConvert(otherUnit);
    }
    /** @inheritdoc */
    convertTo(value, toUnit) {
        if (!this.canConvert(toUnit)) {
            throw new Error(`Invalid conversion from ${this.name} to ${toUnit.name}.`);
        }
        return (value + this.zeroOffset) * (this.scaleFactor / toUnit.scaleFactor) - toUnit.zeroOffset;
    }
    /** @inheritdoc */
    convertFrom(value, fromUnit) {
        if (!this.canConvert(fromUnit)) {
            throw new Error(`Invalid conversion from ${fromUnit.name} to ${this.name}.`);
        }
        return (value + fromUnit.zeroOffset) * (fromUnit.scaleFactor / this.scaleFactor) - this.zeroOffset;
    }
}
/**
 * A unit of measure composed of the multiplicative combination of multiple elementary units.
 */
class CompoundUnit extends AbstractUnit {
    /**
     * Constructor.
     * @param family The family to which this unit belongs.
     * @param numerator An array of CompoundableUnits containing all the units in the numerator of the compound unit.
     * @param denominator An array of CompoundableUnits containing all the units in the denominator of the compound unit.
     * @param name The name of this unit. If not defined, one will be automatically generated.
     */
    constructor(family, numerator, denominator, name) {
        // if not specified, build name from component units.
        if (name === undefined) {
            name = '';
            let i = 0;
            while (i < numerator.length - 1) {
                name += `${numerator[i].name}-`;
            }
            name += `${numerator[i].name}`;
            if (denominator.length > 0) {
                name += ' per ';
                i = 0;
                while (i < denominator.length - 1) {
                    name += `${denominator[i].name}-`;
                }
                name += `${denominator[i].name}`;
            }
        }
        super(name);
        this.family = family;
        this.numerator = Array.from(numerator);
        this.denominator = Array.from(denominator);
        this.numerator.sort((a, b) => a.family.localeCompare(b.family));
        this.denominator.sort((a, b) => a.family.localeCompare(b.family));
        this.scaleFactor = this.getScaleFactor();
    }
    /**
     * Gets the scale factor for this unit.
     * @returns the scale factor for this unit.
     */
    getScaleFactor() {
        let factor = 1;
        factor = this.numerator.reduce((prev, curr) => prev * curr.scaleFactor, factor);
        factor = this.denominator.reduce((prev, curr) => prev / curr.scaleFactor, factor);
        return factor;
    }
    /** @inheritdoc */
    canConvert(otherUnit) {
        return otherUnit instanceof CompoundUnit && super.canConvert(otherUnit);
    }
    /** @inheritdoc */
    convertTo(value, toUnit) {
        if (!this.canConvert(toUnit)) {
            throw new Error(`Invalid conversion from ${this.name} to ${toUnit.name}.`);
        }
        return value * (this.scaleFactor / toUnit.scaleFactor);
    }
    /** @inheritdoc */
    convertFrom(value, fromUnit) {
        if (!this.canConvert(fromUnit)) {
            throw new Error(`Invalid conversion from ${fromUnit.name} to ${this.name}.`);
        }
        return value * (fromUnit.scaleFactor / this.scaleFactor);
    }
}
/**
 * Predefined unit families.
 */
var UnitFamily;
(function (UnitFamily) {
    UnitFamily["Distance"] = "distance";
    UnitFamily["Angle"] = "angle";
    UnitFamily["Duration"] = "duration";
    UnitFamily["Weight"] = "weight";
    UnitFamily["Volume"] = "volume";
    UnitFamily["Pressure"] = "pressure";
    UnitFamily["Temperature"] = "temperature";
    UnitFamily["Speed"] = "speed";
    UnitFamily["WeightFlux"] = "weight_flux";
    UnitFamily["VolumeFlux"] = "volume_flux";
})(UnitFamily || (UnitFamily = {}));
/**
 * Predefined unit types.
 */
class UnitType {
}
UnitType.METER = new SimpleUnit(UnitFamily.Distance, 'meter', 1);
UnitType.FOOT = new SimpleUnit(UnitFamily.Distance, 'foot', 0.3048);
UnitType.KILOMETER = new SimpleUnit(UnitFamily.Distance, 'kilometer', 1000);
UnitType.MILE = new SimpleUnit(UnitFamily.Distance, 'mile', 1609.34);
UnitType.NMILE = new SimpleUnit(UnitFamily.Distance, 'nautical mile', 1852);
UnitType.GA_RADIAN = new SimpleUnit(UnitFamily.Distance, 'great arc radian', 6378100);
UnitType.RADIAN = new SimpleUnit(UnitFamily.Angle, 'radian', 1);
UnitType.DEGREE = new SimpleUnit(UnitFamily.Angle, 'degree', Math.PI / 180);
UnitType.ARC_MIN = new SimpleUnit(UnitFamily.Angle, 'minute', Math.PI / 180 / 60);
UnitType.ARC_SEC = new SimpleUnit(UnitFamily.Angle, 'second', Math.PI / 180 / 3600);
UnitType.MILLISECOND = new SimpleUnit(UnitFamily.Duration, 'millisecond', 0.001);
UnitType.SECOND = new SimpleUnit(UnitFamily.Duration, 'second', 1);
UnitType.MINUTE = new SimpleUnit(UnitFamily.Duration, 'minute', 60);
UnitType.HOUR = new SimpleUnit(UnitFamily.Duration, 'hour', 3600);
UnitType.KILOGRAM = new SimpleUnit(UnitFamily.Weight, 'kilogram', 1);
UnitType.POUND = new SimpleUnit(UnitFamily.Weight, 'pound', 0.453592);
UnitType.TON = new SimpleUnit(UnitFamily.Weight, 'ton', 907.185);
UnitType.TONNE = new SimpleUnit(UnitFamily.Weight, 'tonne', 1000);
// the following fuel units use the generic conversion factor of 1 gal = 6.7 lbs
UnitType.LITER_FUEL = new SimpleUnit(UnitFamily.Weight, 'liter', 0.80283679);
UnitType.GALLON_FUEL = new SimpleUnit(UnitFamily.Weight, 'gallon', 3.0390664);
UnitType.LITER = new SimpleUnit(UnitFamily.Volume, 'liter', 1);
UnitType.GALLON = new SimpleUnit(UnitFamily.Volume, 'gallon', 3.78541);
UnitType.HPA = new SimpleUnit(UnitFamily.Pressure, 'hectopascal', 1);
UnitType.ATM = new SimpleUnit(UnitFamily.Pressure, 'atmosphere', 1013.25);
UnitType.IN_HG = new SimpleUnit(UnitFamily.Pressure, 'inch of mercury', 33.8639);
UnitType.MM_HG = new SimpleUnit(UnitFamily.Pressure, 'millimeter of mercury', 1.33322);
UnitType.CELSIUS = new SimpleUnit(UnitFamily.Temperature, '° Celsius', 1, 273.15);
UnitType.FAHRENHEIT = new SimpleUnit(UnitFamily.Temperature, '° Fahrenheit', 5 / 9, 459.67);
UnitType.KNOT = new CompoundUnit(UnitFamily.Speed, [UnitType.NMILE], [UnitType.HOUR], 'knot');
UnitType.KPH = new CompoundUnit(UnitFamily.Speed, [UnitType.KILOMETER], [UnitType.HOUR]);
UnitType.MPM = new CompoundUnit(UnitFamily.Speed, [UnitType.METER], [UnitType.MINUTE]);
UnitType.MPS = new CompoundUnit(UnitFamily.Speed, [UnitType.METER], [UnitType.SECOND]);
UnitType.FPM = new CompoundUnit(UnitFamily.Speed, [UnitType.FOOT], [UnitType.MINUTE]);
UnitType.FPS = new CompoundUnit(UnitFamily.Speed, [UnitType.FOOT], [UnitType.SECOND]);
UnitType.KGH = new CompoundUnit(UnitFamily.WeightFlux, [UnitType.KILOGRAM], [UnitType.HOUR]);
UnitType.PPH = new CompoundUnit(UnitFamily.WeightFlux, [UnitType.POUND], [UnitType.HOUR]);
UnitType.LPH_FUEL = new CompoundUnit(UnitFamily.WeightFlux, [UnitType.LITER_FUEL], [UnitType.HOUR]);
UnitType.GPH_FUEL = new CompoundUnit(UnitFamily.WeightFlux, [UnitType.GALLON_FUEL], [UnitType.HOUR]);

/**
 * A class for conversions of degree units.
 */
class Degrees {
    constructor() {
        /**
         * Converts degrees to radians.
         * @param degrees The degrees to convert.
         * @returns The result as radians.
         */
        this.toRadians = (degrees) => degrees * (Math.PI / 180);
    }
}
/**
 * A class for conversions of foot units.
 */
class Feet {
    constructor() {
        /**
         * Converts feet to meters.
         * @param feet The feet to convert.
         * @returns The result as meters.
         */
        this.toMeters = (feet) => feet * 0.3048;
        /**
         * Converts feet to nautical miles.
         * @param feet The feet to convert.
         * @returns The result as nautical miles.
         */
        this.toNauticalMiles = (feet) => feet / 6076.11549;
    }
}
/**
 * A class for conversions of meter units.
 */
class Meters {
    constructor() {
        /**
         * Converts meters to feet.
         * @param meters The meters to convert.
         * @returns The result as feet.
         */
        this.toFeet = (meters) => meters / 0.3048;
        /**
         * Converts meters to nautical miles.
         * @param meters The meters to convert.
         * @returns The result as nautical miles.
         */
        this.toNauticalMiles = (meters) => meters / 1852;
    }
}
/**
 * A class for conversions of nautical mile units.
 */
class NauticalMiles {
    constructor() {
        /**
         * Converts nautical miles to feet.
         * @param nm The nautical miles to convert.
         * @returns The result as feet.
         */
        this.toFeet = (nm) => nm * 6076.11549;
        /**
         * Converts nautical miles to meters.
         * @param nm The nautical miles to convert.
         * @returns The result as meters.
         */
        this.toMeters = (nm) => nm * 1852;
    }
}
/**
 * A class for conversions of radian units.
 */
class Radians {
    constructor() {
        /**
         * Converts radians to degrees.
         * @param radians The radians to convert.
         * @returns The result as degrees.
         */
        this.toDegrees = (radians) => radians * 180 / Math.PI;
    }
}
/**
 * A class for unit conversions.
 */
class Units {
}
/** The degrees unit. */
Units.Degrees = new Degrees();
/** The radians unit. */
Units.Radians = new Radians();
/** The feet unit. */
Units.Feet = new Feet();
/** The meters unit. */
Units.Meters = new Meters();
/** The nautical miles unit. */
Units.NauticalMiles = new NauticalMiles();

/**
 * 2D vector mathematical opertaions.
 */
/**
 * 3D vector mathematical opertaions.
 */
class Vec3Math {
    /**
     * Gets the spherical angle theta of a vector in radians.
     * @param vec - a vector.
     * @returns the spherical angle theta of the vector.
     */
    static theta(vec) {
        return Math.atan2(Math.hypot(vec[0], vec[1]), vec[2]);
    }
    /**
     * Gets the spherical angle phi of a vector in radians.
     * @param vec - a vector.
     * @returns the spherical angle phi of the vector.
     */
    static phi(vec) {
        return Math.atan2(vec[1], vec[0]);
    }
    /**
     * Sets the components of a vector.
     * @param x - the new x-component.
     * @param y - the new y-component.
     * @param z - the new z-component.
     * @param vec - the vector to change.
     * @returns the vector after it has been changed.
     */
    static set(x, y, z, vec) {
        vec[0] = x;
        vec[1] = y;
        vec[2] = z;
        return vec;
    }
    /**
     * Sets the spherical components of a vector.
     * @param r - the new length (magnitude).
     * @param theta - the new spherical angle theta, in radians.
     * @param phi - the new spherical angle phi, in radians.
     * @param vec - the vector to change.
     * @returns the vector after it has been changed.
     */
    static setFromSpherical(r, theta, phi, vec) {
        const sinTheta = Math.sin(theta);
        vec[0] = sinTheta * Math.cos(phi);
        vec[1] = sinTheta * Math.sin(phi);
        vec[2] = Math.cos(theta);
        return vec;
    }
    /**
     * Add one vector to another.
     * @param v1 The first vector.
     * @param v2 The second vector.
     * @param out The vector to write the results to.
     * @returns the vector sum.
     */
    static add(v1, v2, out) {
        out[0] = v1[0] + v2[0];
        out[1] = v1[1] + v2[1];
        out[2] = v1[2] + v2[2];
        return out;
    }
    /**
     * Subtracts one vector from another.
     * @param v1 The first vector.
     * @param v2 The second vector.
     * @param out The vector to write the results to.
     * @returns the vector difference.
     */
    static sub(v1, v2, out) {
        out[0] = v1[0] - v2[0];
        out[1] = v1[1] - v2[1];
        out[2] = v1[2] - v2[2];
        return out;
    }
    /**
     * Gets the dot product of two vectors.
     * @param v1 The first vector.
     * @param v2 The second vector.
     * @returns The dot product of the vectors.
     */
    static dot(v1, v2) {
        return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    }
    /**
     * Gets the cross product of two vectors.
     * @param v1 - the first vector.
     * @param v2 - the second vector.
     * @param out - the vector to which to write the result.
     * @returns the cross product.
     */
    static cross(v1, v2, out) {
        const x1 = v1[0];
        const y1 = v1[1];
        const z1 = v1[2];
        const x2 = v2[0];
        const y2 = v2[1];
        const z2 = v2[2];
        out[0] = y1 * z2 - z1 * y2;
        out[1] = z1 * x2 - x1 * z2;
        out[2] = x1 * y2 - y1 * x2;
        return out;
    }
    /**
     * Multiplies a vector by a scalar.
     * @param v1 The vector to multiply.
     * @param scalar The scalar to apply.
     * @param out The vector to write the results to.
     * @returns The scaled vector.
     */
    static multScalar(v1, scalar, out) {
        out[0] = v1[0] * scalar;
        out[1] = v1[1] * scalar;
        out[2] = v1[2] * scalar;
        return out;
    }
    /**
     * Gets the magnitude of a vector.
     * @param v1 The vector to get the magnitude for.
     * @returns the vector's magnitude.
     */
    static abs(v1) {
        return Math.hypot(v1[0], v1[1], v1[2]);
    }
    /**
     * Normalizes the vector to a unit vector.
     * @param v1 The vector to normalize.
     * @param out The vector to write the results to.
     * @returns the normalized vector.
     */
    static normalize(v1, out) {
        const mag = Vec3Math.abs(v1);
        out[0] = v1[0] / mag;
        out[1] = v1[1] / mag;
        out[2] = v1[2] / mag;
        return out;
    }
    /**
     * Gets the Euclidean distance between two vectors.
     * @param vec1 The first vector.
     * @param vec2 The second vector.
     * @returns the Euclidean distance between the two vectors.
     */
    static distance(vec1, vec2) {
        return Math.hypot(vec2[0] - vec1[0], vec2[1] - vec1[0], vec2[2] - vec1[2]);
    }
    /**
     * Checks if two vectors are equal.
     * @param vec1 - the first vector.
     * @param vec2 - the second vector.
     * @returns whether the two vectors are equal.
     */
    static equals(vec1, vec2) {
        return vec1.length === vec2.length && vec1.every((element, index) => element === vec2[index]);
    }
    /**
     * Copies one vector to another.
     * @param from - the vector from which to copy.
     * @param to - the vector to which to copy.
     * @returns the changed vector.
     */
    static copy(from, to) {
        return Vec3Math.set(from[0], from[1], from[2], to);
    }
}

/**
 * A read-only wrapper for a GeoPoint.
 */
class GeoPointReadOnly {
    /**
     * Constructor.
     * @param source - the source of the new read-only point.
     */
    constructor(source) {
        this.source = source;
    }
    /**
     * The latitude of this point, in degrees.
     * @returns the latitude of this point.
     */
    get lat() {
        return this.source.lat;
    }
    /**
     * The longitude of this point, in degrees.
     * @returns the longitude of this point.
     */
    get lon() {
        return this.source.lon;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    distance(arg1, arg2) {
        if (typeof arg1 === 'number') {
            return this.source.distance(arg1, arg2);
        }
        else {
            return this.source.distance(arg1);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    distanceRhumb(arg1, arg2) {
        if (typeof arg1 === 'number') {
            return this.source.distanceRhumb(arg1, arg2);
        }
        else {
            return this.source.distanceRhumb(arg1);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    bearingTo(arg1, arg2) {
        if (typeof arg1 === 'number') {
            return this.source.bearingTo(arg1, arg2);
        }
        else {
            return this.source.bearingTo(arg1);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    bearingFrom(arg1, arg2) {
        if (typeof arg1 === 'number') {
            return this.source.bearingFrom(arg1, arg2);
        }
        else {
            return this.source.bearingFrom(arg1);
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    bearingRhumb(arg1, arg2) {
        if (typeof arg1 === 'number') {
            return this.source.bearingRhumb(arg1, arg2);
        }
        else {
            return this.source.bearingRhumb(arg1);
        }
    }
    /**
     * Offsets this point by an initial bearing and distance along a great circle.
     * @param bearing - the initial bearing (forward azimuth) by which to offset.
     * @param distance - the distance, in great-arc radians, by which to offset.
     * @param out - the GeoPoint to which to write the results. If not supplied, a new GeoPoint object is created.
     * @returns the offset point.
     * @throws {Error} argument out cannot be undefined.
     */
    offset(bearing, distance, out) {
        if (!out) {
            throw new Error('Cannot mutate a read-only GeoPoint.');
        }
        return this.source.offset(bearing, distance, out);
    }
    /**
     * Offsets this point by a constant bearing and distance along a rhumb line.
     * @param bearing - the bearing by which to offset.
     * @param distance - the distance, in great-arc radians, by which to offset.
     * @param out - the GeoPoint to which to write the results. If not supplied, a new GeoPoint object is created.
     * @returns the offset point.
     * @throws {Error} argument out cannot be undefined.
     */
    offsetRhumb(bearing, distance, out) {
        if (!out) {
            throw new Error('Cannot mutate a read-only GeoPoint.');
        }
        return this.source.offsetRhumb(bearing, distance, out);
    }
    /**
     * Calculates the cartesian (x, y, z) representation of this point, in units of great-arc radians. By convention,
     * in the cartesian coordinate system the origin is at the center of the Earth, the positive x-axis passes through
     * 0 degrees N, 0 degrees E, and the positive z-axis passes through the north pole.
     * @param out - the vector array to which to write the result.
     * @returns the cartesian representation of this point.
     */
    toCartesian(out) {
        return this.source.toCartesian(out);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    equals(arg1, arg2, arg3) {
        if (typeof arg1 === 'number') {
            return this.source.equals(arg1, arg2, arg3);
        }
        else {
            return this.source.equals(arg1, arg2);
        }
    }
    /**
     * Copies this point.
     * @param to - an optional point to which to copy this point. If this argument is not supplied, a new GeoPoint object
     * will be created.
     * @returns a copy of this point.
     */
    copy(to) {
        return this.source.copy(to);
    }
}
/**
 * A point on Earth's surface. This class uses a spherical Earth model.
 */
class GeoPoint {
    /**
     * Constructor.
     * @param lat - the latitude, in degrees.
     * @param lon - the longitude, in degrees.
     */
    constructor(lat, lon) {
        this._lat = 0;
        this._lon = 0;
        this.set(lat, lon);
        this.readonly = new GeoPointReadOnly(this);
    }
    /**
     * The latitude of this point, in degrees.
     * @returns the latitude of this point.
     */
    get lat() {
        return this._lat;
    }
    /**
     * The longitude of this point, in degrees.
     * @returns the longitude of this point.
     */
    get lon() {
        return this._lon;
    }
    /**
     * Converts an argument list consisting of either a LatLonInterface or lat/lon coordinates into an equivalent
     * LatLonInterface.
     * @param arg1 Argument 1.
     * @param arg2 Argument 2.
     * @returns a LatLonInterface.
     */
    static asLatLonInterface(arg1, arg2) {
        if (typeof arg1 === 'number') {
            return GeoPoint.tempGeoPoint.set(arg1, arg2);
        }
        else {
            return arg1;
        }
    }
    /**
     * Converts an argument list consisting of either a 3D vector or x, y, z components into an equivalent 3D vector.
     * @param arg1 Argument 1.
     * @param arg2 Argument 2.
     * @param arg3 Argument 3.
     * @returns a 3D vector.
     */
    static asVec3(arg1, arg2, arg3) {
        if (typeof arg1 === 'number') {
            return Vec3Math.set(arg1, arg2, arg3, GeoPoint.tempVec3);
        }
        else {
            return arg1;
        }
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    set(arg1, arg2) {
        let lat, lon;
        if (typeof arg1 === 'number') {
            lat = arg1;
            lon = arg2;
        }
        else {
            lat = arg1.lat;
            lon = arg1.lon;
        }
        lat = GeoPoint.toPlusMinus180(lat);
        lon = GeoPoint.toPlusMinus180(lon);
        if (Math.abs(lat) > 90) {
            lat = 180 - lat;
            lat = GeoPoint.toPlusMinus180(lat);
            lon += 180;
            lon = GeoPoint.toPlusMinus180(lon);
        }
        this._lat = lat;
        this._lon = lon;
        return this;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    setFromCartesian(arg1, arg2, arg3) {
        const vec = GeoPoint.asVec3(arg1, arg2, arg3);
        const theta = Vec3Math.theta(vec);
        const phi = Vec3Math.phi(vec);
        return this.set(90 - theta * Avionics.Utils.RAD2DEG, phi * Avionics.Utils.RAD2DEG);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    distance(arg1, arg2) {
        const other = GeoPoint.asLatLonInterface(arg1, arg2);
        const lat1 = this.lat * Avionics.Utils.DEG2RAD;
        const lat2 = other.lat * Avionics.Utils.DEG2RAD;
        const lon1 = this.lon * Avionics.Utils.DEG2RAD;
        const lon2 = other.lon * Avionics.Utils.DEG2RAD;
        // haversine formula
        const sinHalfDeltaLat = Math.sin((lat2 - lat1) / 2);
        const sinHalfDeltaLon = Math.sin((lon2 - lon1) / 2);
        const a = sinHalfDeltaLat * sinHalfDeltaLat + Math.cos(lat1) * Math.cos(lat2) * sinHalfDeltaLon * sinHalfDeltaLon;
        return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    distanceRhumb(arg1, arg2) {
        const other = GeoPoint.asLatLonInterface(arg1, arg2);
        const lat1 = this.lat * Avionics.Utils.DEG2RAD;
        const lat2 = other.lat * Avionics.Utils.DEG2RAD;
        const lon1 = this.lon * Avionics.Utils.DEG2RAD;
        const lon2 = other.lon * Avionics.Utils.DEG2RAD;
        const deltaLat = lat2 - lat1;
        let deltaLon = lon2 - lon1;
        const deltaPsi = GeoPoint.deltaPsi(lat1, lat2);
        const correction = GeoPoint.rhumbCorrection(deltaPsi, lat1, lat2);
        if (Math.abs(deltaLon) > Math.PI) {
            deltaLon += -Math.sign(deltaLon) * 2 * Math.PI;
        }
        return Math.sqrt(deltaLat * deltaLat + correction * correction * deltaLon * deltaLon);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    bearingTo(arg1, arg2) {
        const other = GeoPoint.asLatLonInterface(arg1, arg2);
        return GeoPoint.calculateInitialBearing(this, other);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    bearingFrom(arg1, arg2) {
        const other = GeoPoint.asLatLonInterface(arg1, arg2);
        return (GeoPoint.calculateInitialBearing(this, other) + 180) % 360;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    bearingRhumb(arg1, arg2) {
        const other = GeoPoint.asLatLonInterface(arg1, arg2);
        const lat1 = this.lat * Avionics.Utils.DEG2RAD;
        const lon1 = this.lon * Avionics.Utils.DEG2RAD;
        const lat2 = other.lat * Avionics.Utils.DEG2RAD;
        const lon2 = other.lon * Avionics.Utils.DEG2RAD;
        let deltaLon = lon2 - lon1;
        const deltaPsi = GeoPoint.deltaPsi(lat1, lat2);
        if (Math.abs(deltaLon) > Math.PI) {
            deltaLon += -Math.sign(deltaLon) * 2 * Math.PI;
        }
        return Math.atan2(deltaLon, deltaPsi) * Avionics.Utils.RAD2DEG;
    }
    /**
     * Offsets this point by an initial bearing and distance along a great circle.
     * @param bearing - the initial bearing (forward azimuth) by which to offset.
     * @param distance - the distance, in great-arc radians, by which to offset.
     * @param out - the GeoPoint to which to write the results. By default this point.
     * @returns the offset point.
     */
    offset(bearing, distance, out) {
        const latRad = this.lat * Avionics.Utils.DEG2RAD;
        const lonRad = this.lon * Avionics.Utils.DEG2RAD;
        const sinLat = Math.sin(latRad);
        const cosLat = Math.cos(latRad);
        const sinBearing = Math.sin(bearing * Avionics.Utils.DEG2RAD);
        const cosBearing = Math.cos(bearing * Avionics.Utils.DEG2RAD);
        const angularDistance = distance;
        const sinAngularDistance = Math.sin(angularDistance);
        const cosAngularDistance = Math.cos(angularDistance);
        const offsetLatRad = Math.asin(sinLat * cosAngularDistance + cosLat * sinAngularDistance * cosBearing);
        const offsetLonDeltaRad = Math.atan2(sinBearing * sinAngularDistance * cosLat, cosAngularDistance - sinLat * Math.sin(offsetLatRad));
        const offsetLat = offsetLatRad * Avionics.Utils.RAD2DEG;
        const offsetLon = (lonRad + offsetLonDeltaRad) * Avionics.Utils.RAD2DEG;
        return (out !== null && out !== void 0 ? out : this).set(offsetLat, offsetLon);
    }
    /**
     * Offsets this point by a constant bearing and distance along a rhumb line.
     * @param bearing - the bearing by which to offset.
     * @param distance - the distance, in great-arc radians, by which to offset.
     * @param out - the GeoPoint to which to write the results. By default this point.
     * @returns the offset point.
     */
    offsetRhumb(bearing, distance, out) {
        const latRad = this.lat * Avionics.Utils.DEG2RAD;
        const lonRad = this.lon * Avionics.Utils.DEG2RAD;
        const bearingRad = bearing * Avionics.Utils.DEG2RAD;
        const deltaLat = distance * Math.cos(bearingRad);
        let offsetLat = latRad + deltaLat;
        let offsetLon;
        if (Math.abs(offsetLat) >= Math.PI / 2) {
            // you can't technically go past the poles along a rhumb line, so we will simply terminate the path at the pole
            offsetLat = Math.sign(offsetLat) * 90;
            offsetLon = 0; // since longitude is meaningless at the poles, we'll arbitrarily pick a longitude of 0 degrees.
        }
        else {
            const deltaPsi = GeoPoint.deltaPsi(latRad, offsetLat);
            const correction = GeoPoint.rhumbCorrection(deltaPsi, latRad, offsetLat);
            const deltaLon = distance * Math.sin(bearingRad) / correction;
            offsetLon = lonRad + deltaLon;
            offsetLat *= Avionics.Utils.RAD2DEG;
            offsetLon *= Avionics.Utils.RAD2DEG;
        }
        return (out !== null && out !== void 0 ? out : this).set(offsetLat, offsetLon);
    }
    /**
     * Calculates the cartesian (x, y, z) representation of this point, in units of great-arc radians. By convention,
     * in the cartesian coordinate system the origin is at the center of the Earth, the positive x-axis passes through
     * 0 degrees N, 0 degrees E, and the positive z-axis passes through the north pole.
     * @param out - the vector array to which to write the result.
     * @returns the cartesian representation of this point.
     */
    toCartesian(out) {
        return GeoPoint.sphericalToCartesian(this, out);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    equals(arg1, arg2, arg3) {
        const other = GeoPoint.asLatLonInterface(arg1, arg2);
        const tolerance = typeof arg1 === 'number' ? arg3 : arg2;
        if (other) {
            return this.distance(other) <= (tolerance !== null && tolerance !== void 0 ? tolerance : GeoPoint.EQUALITY_TOLERANCE);
        }
        else {
            return false;
        }
    }
    /**
     * Copies this point.
     * @param to - an optional point to which to copy this point. If this argument is not supplied, a new GeoPoint object
     * will be created.
     * @returns a copy of this point.
     */
    copy(to) {
        return to ? to.set(this.lat, this.lon) : new GeoPoint(this.lat, this.lon);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    static sphericalToCartesian(arg1, arg2, arg3) {
        const point = GeoPoint.asLatLonInterface(arg1, arg2);
        const theta = (90 - point.lat) * Avionics.Utils.DEG2RAD;
        const phi = point.lon * Avionics.Utils.DEG2RAD;
        return Vec3Math.setFromSpherical(1, theta, phi, arg3 !== null && arg3 !== void 0 ? arg3 : arg2);
    }
    /**
     * Converts an angle, in degrees, to an equivalent value in the range [-180, 180).
     * @param angle - an angle in degrees.
     * @returns the angle's equivalent in the range [-180, 180).
     */
    static toPlusMinus180(angle) {
        return ((angle % 360) + 540) % 360 - 180;
    }
    /**
     * Calculates the initial bearing (forward azimuth) from an origin point to a destination point.
     * @param origin - the origin point.
     * @param destination - the destination point.
     * @returns the initial bearing from the origin to destination.
     */
    static calculateInitialBearing(origin, destination) {
        const lat1 = origin.lat * Avionics.Utils.DEG2RAD;
        const lat2 = destination.lat * Avionics.Utils.DEG2RAD;
        const lon1 = origin.lon * Avionics.Utils.DEG2RAD;
        const lon2 = destination.lon * Avionics.Utils.DEG2RAD;
        const cosLat2 = Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * cosLat2 * Math.cos(lon2 - lon1);
        const y = Math.sin(lon2 - lon1) * cosLat2;
        const bearing = Math.atan2(y, x) * Avionics.Utils.RAD2DEG;
        return (bearing + 360) % 360; // enforce range [0, 360)
    }
    /**
     * Calculates the difference in isometric latitude from a pair of geodetic (geocentric) latitudes.
     * @param latRad1 - geodetic latitude 1, in radians.
     * @param latRad2 - geodetic latitude 2, in radians.
     * @returns the difference in isometric latitude from latitude 1 to latitude 2, in radians.
     */
    static deltaPsi(latRad1, latRad2) {
        return Math.log(Math.tan(latRad2 / 2 + Math.PI / 4) / Math.tan(latRad1 / 2 + Math.PI / 4));
    }
    /**
     * Calculates the rhumb correction factor between two latitudes.
     * @param deltaPsi - the difference in isometric latitude beween the two latitudes.
     * @param latRad1 - geodetic latitude 1, in radians.
     * @param latRad2 - geodetic latitude 2, in radians.
     * @returns the rhumb correction factor between the two latitudes.
     */
    static rhumbCorrection(deltaPsi, latRad1, latRad2) {
        return Math.abs(deltaPsi) > 1e-12 ? ((latRad2 - latRad1) / deltaPsi) : Math.cos(latRad1);
    }
}
/**
 * The default equality tolerance, defined as the maximum allowed distance between two equal points in great-arc
 * radians.
 */
GeoPoint.EQUALITY_TOLERANCE = 1e-7; // ~61 cm
GeoPoint.tempVec3 = new Float64Array(3);
GeoPoint.tempGeoPoint = new GeoPoint(0, 0);

/**
 * A circle on Earth's surface, defined as the set of points on the Earth's surface equidistant (as measured
 * geodetically) from a central point.
 */
class GeoCircle {
    /**
     * Constructor.
     * @param center The center of the new small circle, represented as a position vector in the standard geographic
     * cartesian reference system.
     * @param radius The radius of the new small circle in great-arc radians.
     */
    constructor(center, radius) {
        this._center = new Float64Array(3);
        this._radius = 0;
        this.set(center, radius);
    }
    // eslint-disable-next-line jsdoc/require-returns
    /**
     * The center of this circle.
     */
    get center() {
        return this._center;
    }
    // eslint-disable-next-line jsdoc/require-returns
    /**
     * The radius of this circle, in great-arc radians.
     */
    get radius() {
        return this._radius;
    }
    /**
     * Checks whether this circle is a great circle, or equivalently, whether its radius is equal to pi / 2 great-arc
     * radians.
     * @returns Whether this circle is a great circle.
     */
    isGreatCircle() {
        return this._radius === Math.PI / 2;
    }
    /**
     * Calculates the length of an arc along this circle subtended by a central angle.
     * @param angle A central angle, in radians.
     * @returns the length of the arc subtended by the angle, in great-arc radians.
     */
    arcLength(angle) {
        return Math.sin(this._radius) * angle;
    }
    /**
     * Sets the center and radius of this circle.
     * @param center The new center.
     * @param radius The new radius in great-arc radians.
     * @returns this circle, after it has been changed.
     */
    set(center, radius) {
        if (center instanceof Float64Array) {
            if (Vec3Math.abs(center) === 0) {
                // if center has no direction, arbitrarily set the center to 0 N, 0 E.
                Vec3Math.set(1, 0, 0, this._center);
            }
            else {
                Vec3Math.normalize(center, this._center);
            }
        }
        else {
            GeoPoint.sphericalToCartesian(center, this._center);
        }
        this._radius = Math.abs(radius) % Math.PI;
        return this;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    setAsGreatCircle(arg1, arg2) {
        this.set(GeoCircle._getGreatCircleNormal(arg1, arg2, GeoCircle.vec3Cache[0]), Math.PI / 2);
        return this;
    }
    /**
     * Gets the distance from a point to the center of this circle, in great-arc radians.
     * @param point The point to which to measure the distance.
     * @returns the distance from the point to the center of this circle.
     */
    distanceToCenter(point) {
        if (point instanceof Float64Array) {
            point = Vec3Math.normalize(point, GeoCircle.vec3Cache[0]);
        }
        else {
            point = GeoPoint.sphericalToCartesian(point, GeoCircle.vec3Cache[0]);
        }
        const dot = Vec3Math.dot(point, this._center);
        return Math.acos(Utils.Clamp(dot, -1, 1));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    closest(point, out) {
        if (!(point instanceof Float64Array)) {
            point = GeoPoint.sphericalToCartesian(point, GeoCircle.vec3Cache[0]);
        }
        const offset = Vec3Math.multScalar(this._center, Math.cos(this._radius), GeoCircle.vec3Cache[1]);
        const dot = Vec3Math.dot(Vec3Math.sub(point, offset, GeoCircle.vec3Cache[2]), this._center);
        const planeProjected = Vec3Math.sub(point, Vec3Math.multScalar(this._center, dot, GeoCircle.vec3Cache[2]), GeoCircle.vec3Cache[2]);
        if (Vec3Math.dot(planeProjected, planeProjected) === 0 || Math.abs(Vec3Math.dot(planeProjected, this._center)) === 1) {
            // the point is equidistant from all points on this circle
            return out instanceof GeoPoint ? out.set(NaN, NaN) : Vec3Math.set(NaN, NaN, NaN, out);
        }
        const displacement = Vec3Math.multScalar(Vec3Math.normalize(Vec3Math.sub(planeProjected, offset, GeoCircle.vec3Cache[2]), GeoCircle.vec3Cache[2]), Math.sin(this._radius), GeoCircle.vec3Cache[2]);
        const closest = Vec3Math.add(offset, displacement, GeoCircle.vec3Cache[2]);
        return out instanceof Float64Array ? Vec3Math.normalize(closest, out) : out.setFromCartesian(closest);
    }
    /**
     * Calculates and returns the great-circle distance from a specified point to the closest point that lies on this
     * circle. In other words, calculates the shortest distance from a point to this circle. The distance is signed, with
     * positive distances representing deviation away from the center of the circle, and negative distances representing
     * deviation toward the center of the circle.
     * @param point A point, represented as either a position vector or lat/long coordinates.
     * @returns the great circle distance, in great-arc radians, from the point to the closest point on this circle.
     */
    distance(point) {
        const distanceToCenter = this.distanceToCenter(point);
        return distanceToCenter - this._radius;
    }
    /**
     * Checks whether a point lies on this circle.
     * @param point A point, represented as either a position vector or lat/long coordinates.
     * @param tolerance The error tolerance, in great-arc radians, of this operation. Defaults to
     * `GeoCircle.ANGULAR_TOLERANCE` if not specified.
     * @returns whether the point lies on this circle.
     */
    includes(point, tolerance = GeoCircle.ANGULAR_TOLERANCE) {
        const distance = this.distance(point);
        return Math.abs(distance) < tolerance;
    }
    /**
     * Checks whether a point lies within the boundary defined by this circle. This is equivalent to checking whether
     * the distance of the point from the center of this circle is less than or equal to this circle's radius.
     * @param point A point, represented as either a position vector or lat/long coordinates.
     * @param inclusive Whether points that lie on this circle should pass the check. True by default.
     * @param tolerance The error tolerance, in great-arc radians, of this operation. Defaults to
     * `GeoCircle.ANGULAR_TOLERANCE` if not specified.
     * @returns whether the point lies within the boundary defined by this circle.
     */
    encircles(point, inclusive = true, tolerance = GeoCircle.ANGULAR_TOLERANCE) {
        const distance = this.distance(point);
        return inclusive
            ? distance <= tolerance
            : distance < -tolerance;
    }
    /**
     * Gets the angular distance along an arc between two points that lie on this circle. The arc extends from the first
     * point to the second in a counterclockwise direction when viewed from above the center of the circle.
     * @param start A point on this circle which marks the beginning of an arc.
     * @param end A point on this circle which marks the end of an arc.
     * @param tolerance The error tolerance, in great-arc radians, when checking if `start` and `end` lie on this circle.
     * Defaults to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
     * @returns the angular width of the arc between the two points, in radians.
     * @throws Error if either point does not lie on this circle.
     */
    angleAlong(start, end, tolerance = GeoCircle.ANGULAR_TOLERANCE) {
        if (!(start instanceof Float64Array)) {
            start = GeoPoint.sphericalToCartesian(start, GeoCircle.vec3Cache[1]);
        }
        if (!(end instanceof Float64Array)) {
            end = GeoPoint.sphericalToCartesian(end, GeoCircle.vec3Cache[2]);
        }
        if (!this.includes(start, tolerance) || !this.includes(end, tolerance)) {
            throw new Error(`GeoCircle: at least one of the two specified arc end points does not lie on this circle (start point distance of ${this.distance(start)}, end point distance of ${this.distance(end)}, vs tolerance of ${tolerance}).`);
        }
        if (this._radius <= GeoCircle.ANGULAR_TOLERANCE) {
            return 0;
        }
        const startRadialNormal = Vec3Math.normalize(Vec3Math.cross(this._center, start, GeoCircle.vec3Cache[3]), GeoCircle.vec3Cache[3]);
        const endRadialNormal = Vec3Math.normalize(Vec3Math.cross(this._center, end, GeoCircle.vec3Cache[4]), GeoCircle.vec3Cache[4]);
        const angularDistance = Math.acos(Utils.Clamp(Vec3Math.dot(startRadialNormal, endRadialNormal), -1, 1));
        const isArcGreaterThanSemi = Vec3Math.dot(startRadialNormal, end) < 0;
        return isArcGreaterThanSemi ? 2 * Math.PI - angularDistance : angularDistance;
    }
    /**
     * Gets the distance along an arc between two points that lie on this circle. The arc extends from the first point
     * to the second in a counterclockwise direction when viewed from above the center of the circle.
     * @param start A point on this circle which marks the beginning of an arc.
     * @param end A point on this circle which marks the end of an arc.
     * @param tolerance The error tolerance, in great-arc radians, when checking if `start` and `end` lie on this circle.
     * Defaults to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
     * @returns the length of the arc between the two points, in great-arc radians.
     * @throws Error if either point does not lie on this circle.
     */
    distanceAlong(start, end, tolerance = GeoCircle.ANGULAR_TOLERANCE) {
        return this.arcLength(this.angleAlong(start, end, tolerance));
    }
    /**
     * Calculates the true bearing along this circle at a point on the circle.
     * @param point A point on this circle.
     * @param tolerance The error tolerance, in great-arc radians, when checking if `point` lies on this circle. Defaults
     * to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
     * @returns the bearing along this circle at the point.
     * @throws Error if the point does not lie on this circle.
     */
    bearingAt(point, tolerance = GeoCircle.ANGULAR_TOLERANCE) {
        if (!(point instanceof Float64Array)) {
            point = GeoPoint.sphericalToCartesian(point, GeoCircle.vec3Cache[1]);
        }
        if (!this.includes(point, tolerance)) {
            throw new Error(`GeoCircle: the specified point does not lie on this circle (distance of ${Math.abs(this.distance(point))} vs tolerance of ${tolerance}).`);
        }
        if (this._radius <= GeoCircle.ANGULAR_TOLERANCE || 1 - Math.abs(Vec3Math.dot(point, GeoCircle.NORTH_POLE)) <= GeoCircle.ANGULAR_TOLERANCE) {
            // Meaningful bearings cannot be defined along a circle with 0 radius (effectively a point) and at the north and south poles.
            return NaN;
        }
        const radialNormal = Vec3Math.normalize(Vec3Math.cross(this._center, point, GeoCircle.vec3Cache[2]), GeoCircle.vec3Cache[2]);
        const northNormal = Vec3Math.normalize(Vec3Math.cross(point, GeoCircle.NORTH_POLE, GeoCircle.vec3Cache[3]), GeoCircle.vec3Cache[3]);
        return (Math.acos(Utils.Clamp(Vec3Math.dot(radialNormal, northNormal), -1, 1)) * (radialNormal[2] >= 0 ? 1 : -1) * Avionics.Utils.RAD2DEG - 90 + 360) % 360;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    offsetDistanceAlong(point, distance, out, tolerance = GeoCircle.ANGULAR_TOLERANCE) {
        const angle = distance / Math.sin(this.radius);
        return this._offsetAngleAlong(point, angle, out, tolerance);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    offsetAngleAlong(point, angle, out, tolerance = GeoCircle.ANGULAR_TOLERANCE) {
        return this._offsetAngleAlong(point, angle, out, tolerance);
    }
    /**
     * Offsets a point on this circle by a specified angular distance. The direction of the offset for positive distances
     * is counterclockwise when viewed from above the center of this circle.
     * @param point The point to offset.
     * @param angle The angular distance by which to offset, in radians.
     * @param out A Float64Array or GeoPoint object to which to write the result.
     * @param tolerance The error tolerance, in great-arc radians, when checking if `point` lies on this circle. Defaults
     * to `GeoCircle.ANGULAR_TOLERANCE` if not specified.
     * @returns The offset point.
     * @throws Error if the point does not lie on this circle.
     */
    _offsetAngleAlong(point, angle, out, tolerance = GeoCircle.ANGULAR_TOLERANCE) {
        if (!(point instanceof Float64Array)) {
            point = GeoPoint.sphericalToCartesian(point, GeoCircle.vec3Cache[3]);
        }
        if (!this.includes(point, tolerance)) {
            throw new Error(`GeoCircle: the specified point does not lie on this circle (distance of ${Math.abs(this.distance(point))} vs tolerance of ${tolerance}).`);
        }
        if (this.radius === 0) {
            return out instanceof GeoPoint ? out.setFromCartesian(point) : Vec3Math.copy(point, out);
        }
        // Since point may not lie exactly on this circle due to error tolerance, project point onto this circle to ensure
        // the offset point lies exactly on this circle.
        point = this.closest(point, GeoCircle.vec3Cache[3]);
        const sin = Math.sin(angle / 2);
        const q0 = Math.cos(angle / 2);
        const q1 = sin * this._center[0];
        const q2 = sin * this._center[1];
        const q3 = sin * this._center[2];
        const q0Sq = q0 * q0;
        const q1Sq = q1 * q1;
        const q2Sq = q2 * q2;
        const q3Sq = q3 * q3;
        const q01 = q0 * q1;
        const q02 = q0 * q2;
        const q03 = q0 * q3;
        const q12 = q1 * q2;
        const q13 = q1 * q3;
        const q23 = q2 * q3;
        const rot_11 = q0Sq + q1Sq - q2Sq - q3Sq;
        const rot_12 = 2 * (q12 - q03);
        const rot_13 = 2 * (q13 + q02);
        const rot_21 = 2 * (q12 + q03);
        const rot_22 = q0Sq - q1Sq + q2Sq - q3Sq;
        const rot_23 = 2 * (q23 - q01);
        const rot_31 = 2 * (q13 - q02);
        const rot_32 = 2 * (q23 + q01);
        const rot_33 = (q0Sq - q1Sq - q2Sq + q3Sq);
        const x = point[0];
        const y = point[1];
        const z = point[2];
        const rotX = rot_11 * x + rot_12 * y + rot_13 * z;
        const rotY = rot_21 * x + rot_22 * y + rot_23 * z;
        const rotZ = rot_31 * x + rot_32 * y + rot_33 * z;
        return out instanceof Float64Array
            ? Vec3Math.set(rotX, rotY, rotZ, out)
            : out.setFromCartesian(Vec3Math.set(rotX, rotY, rotZ, GeoCircle.vec3Cache[2]));
    }
    /**
     * Calculates and returns the set of intersection points between this circle and another one, and writes the results
     * to an array of position vectors.
     * @param other The other circle to test for intersections.
     * @param out An array in which to store the results. The results will be stored at indexes 0 and 1. If these indexes
     * are empty, then new Float64Array objects will be created and inserted into the array.
     * @returns The number of solutions written to the out array. Either 0, 1, or 2.
     */
    intersection(other, out) {
        const center1 = this._center;
        const center2 = other._center;
        const radius1 = this._radius;
        const radius2 = other._radius;
        /**
         * Theory: We can model geo circles as the intersection between a sphere and the unit sphere (Earth's surface).
         * Therefore, the intersection of two geo circles is the intersection between two spheres AND the unit sphere.
         * First, we find the intersection of the two non-Earth spheres (which can either be a sphere, a circle, or a
         * point), then we find the intersection of that geometry with the unit sphere.
         */
        const dot = Vec3Math.dot(center1, center2);
        const dotSquared = dot * dot;
        if (dotSquared === 1) {
            // the two circles are concentric; either there are zero solutions or infinite solutions; either way we don't
            // write any solutions to the array.
            return 0;
        }
        // find the position vector to the center of the circle which defines the intersection of the two geo circle
        // spheres.
        const a = (Math.cos(radius1) - dot * Math.cos(radius2)) / (1 - dotSquared);
        const b = (Math.cos(radius2) - dot * Math.cos(radius1)) / (1 - dotSquared);
        const intersection = Vec3Math.add(Vec3Math.multScalar(center1, a, GeoCircle.vec3Cache[0]), Vec3Math.multScalar(center2, b, GeoCircle.vec3Cache[1]), GeoCircle.vec3Cache[0]);
        const intersectionLengthSquared = Vec3Math.dot(intersection, intersection);
        if (intersectionLengthSquared > 1) {
            // the two geo circle spheres do not intersect.
            return 0;
        }
        const cross = Vec3Math.cross(center1, center2, GeoCircle.vec3Cache[1]);
        const crossLengthSquared = Vec3Math.dot(cross, cross);
        if (crossLengthSquared === 0) {
            // this technically can't happen (since we already check if center1 dot center2 === +/-1 above, but just in
            // case...)
            return 0;
        }
        const offset = Math.sqrt((1 - intersectionLengthSquared) / crossLengthSquared);
        let solutionCount = 1;
        if (!out[0]) {
            out[0] = new Float64Array(3);
        }
        out[0].set(cross);
        Vec3Math.multScalar(out[0], offset, out[0]);
        Vec3Math.add(out[0], intersection, out[0]);
        if (offset > 0) {
            if (!out[1]) {
                out[1] = new Float64Array(3);
            }
            out[1].set(cross);
            Vec3Math.multScalar(out[1], -offset, out[1]);
            Vec3Math.add(out[1], intersection, out[1]);
            solutionCount++;
        }
        return solutionCount;
    }
    /**
     * Calculates and returns the set of intersection points between this circle and another one, and writes the results
     * to an array of GeoPoint objects.
     * @param other The other circle to test for intersections.
     * @param out An array in which to store the results. The results will be stored at indexes 0 and 1. If these indexes
     * are empty, then new GeoPoint objects will be created and inserted into the array.
     * @returns The number of solutions written to the out array. Either 0, 1, or 2.
     */
    intersectionGeoPoint(other, out) {
        const solutionCount = this.intersection(other, GeoCircle.intersectionCache);
        for (let i = 0; i < solutionCount; i++) {
            if (!out[i]) {
                out[i] = new GeoPoint(0, 0);
            }
            out[i].setFromCartesian(GeoCircle.intersectionCache[i]);
        }
        return solutionCount;
    }
    /**
     * Calculates and returns the number of intersection points between this circle and another one. Returns NaN if there
     * are an infinite number of intersection points.
     * @param other The other circle to test for intersections.
     * @param tolerance The error tolerance, in great-arc radians, of this operation. Defaults to
     * `GeoCircle.ANGULAR_TOLERANCE` if not specified.
     * @returns the number of intersection points between this circle and the other one.
     */
    numIntersectionPoints(other, tolerance = GeoCircle.ANGULAR_TOLERANCE) {
        const center1 = this.center;
        const center2 = other.center;
        const radius1 = this.radius;
        const radius2 = other.radius;
        const dot = Vec3Math.dot(center1, center2);
        const dotSquared = dot * dot;
        if (dotSquared === 1) {
            // the two circles are concentric; if they are the same circle there are an infinite number of intersections,
            // otherwise there are none.
            if (dot === 1) {
                // centers are the same
                return (Math.abs(this.radius - other.radius) <= tolerance) ? NaN : 0;
            }
            else {
                // centers are antipodal
                return (Math.abs(Math.PI - this.radius - other.radius) <= tolerance) ? NaN : 0;
            }
        }
        const a = (Math.cos(radius1) - dot * Math.cos(radius2)) / (1 - dotSquared);
        const b = (Math.cos(radius2) - dot * Math.cos(radius1)) / (1 - dotSquared);
        const intersection = Vec3Math.add(Vec3Math.multScalar(center1, a, GeoCircle.vec3Cache[0]), Vec3Math.multScalar(center2, b, GeoCircle.vec3Cache[1]), GeoCircle.vec3Cache[1]);
        const intersectionLengthSquared = Vec3Math.dot(intersection, intersection);
        if (intersectionLengthSquared > 1) {
            return 0;
        }
        const cross = Vec3Math.cross(center1, center2, GeoCircle.vec3Cache[1]);
        const crossLengthSquared = Vec3Math.dot(cross, cross);
        if (crossLengthSquared === 0) {
            return 0;
        }
        const sinTol = Math.sin(tolerance);
        return ((1 - intersectionLengthSquared) / crossLengthSquared > sinTol * sinTol) ? 2 : 1;
    }
    /**
     * Creates a new small circle from a lat/long coordinate pair and radius.
     * @param point The center of the new small circle.
     * @param radius The radius of the new small circle, in great-arc radians.
     * @returns a small circle.
     */
    static createFromPoint(point, radius) {
        return new GeoCircle(GeoPoint.sphericalToCartesian(point, GeoCircle.vec3Cache[0]), radius);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    static createGreatCircle(arg1, arg2) {
        return new GeoCircle(GeoCircle._getGreatCircleNormal(arg1, arg2, GeoCircle.vec3Cache[0]), Math.PI / 2);
    }
    /**
     * Creates a new great circle defined by one point and a bearing offset. The new great circle will be equivalent to
     * the path projected from the point with the specified initial bearing (forward azimuth).
     * @param point A point that lies on the new great circle.
     * @param bearing The initial bearing from the point.
     * @returns a great circle.
     */
    static createGreatCircleFromPointBearing(point, bearing) {
        return new GeoCircle(GeoCircle.getGreatCircleNormalFromPointBearing(point, bearing, GeoCircle.vec3Cache[0]), Math.PI / 2);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    static getGreatCircleNormal(arg1, arg2, out) {
        return GeoCircle._getGreatCircleNormal(arg1, arg2, out);
    }
    /**
     * Calculates a normal vector for a great circle given two points which lie on the circle, or a point and initial bearing.
     * @param arg1 A point that lies on the great circle.
     * @param arg2 A second point that lies on the great circle, or an initial bearing from the first point.
     * @param out The vector to which to write the result.
     * @returns the normal vector for the great circle.
     */
    static _getGreatCircleNormal(arg1, arg2, out) {
        if (typeof arg2 === 'number') {
            return GeoCircle.getGreatCircleNormalFromPointBearing(arg1, arg2, out);
        }
        else {
            return GeoCircle.getGreatCircleNormalFromPoints(arg1, arg2, out);
        }
    }
    /**
     * Calculates a normal vector for a great circle given two points which lie on the cirlce.
     * @param point1 The first point that lies on the great circle.
     * @param point2 The second point that lies on the great circle.
     * @param out The vector to which to write the result.
     * @returns the normal vector for the great circle.
     */
    static getGreatCircleNormalFromPoints(point1, point2, out) {
        if (!(point1 instanceof Float64Array)) {
            point1 = GeoPoint.sphericalToCartesian(point1, GeoCircle.vec3Cache[0]);
        }
        if (!(point2 instanceof Float64Array)) {
            point2 = GeoPoint.sphericalToCartesian(point2, GeoCircle.vec3Cache[1]);
        }
        return Vec3Math.normalize(Vec3Math.cross(point1, point2, out), out);
    }
    /**
     * Calculates a normal vector for a great circle given a point and initial bearing.
     * @param point A point that lies on the great circle.
     * @param bearing The initial bearing from the point.
     * @param out The vector to which to write the result.
     * @returns the normal vector for the great circle.
     */
    static getGreatCircleNormalFromPointBearing(point, bearing, out) {
        if (point instanceof Float64Array) {
            point = GeoCircle.tempGeoPoint.setFromCartesian(point);
        }
        const lat = point.lat * Avionics.Utils.DEG2RAD;
        const long = point.lon * Avionics.Utils.DEG2RAD;
        bearing *= Avionics.Utils.DEG2RAD;
        const sinLat = Math.sin(lat);
        const sinLon = Math.sin(long);
        const cosLon = Math.cos(long);
        const sinBearing = Math.sin(bearing);
        const cosBearing = Math.cos(bearing);
        const x = sinLon * cosBearing - sinLat * cosLon * sinBearing;
        const y = -cosLon * cosBearing - sinLat * sinLon * sinBearing;
        const z = Math.cos(lat) * sinBearing;
        return Vec3Math.set(x, y, z, out);
    }
}
GeoCircle.ANGULAR_TOLERANCE = 1e-7; // ~61cm
GeoCircle.NORTH_POLE = new Float64Array([0, 0, 1]);
GeoCircle.tempGeoPoint = new GeoPoint(0, 0);
GeoCircle.vec3Cache = [new Float64Array(3), new Float64Array(3), new Float64Array(3), new Float64Array(3), new Float64Array(3)];
GeoCircle.intersectionCache = [new Float64Array(3), new Float64Array(3)];

/**
 * Navigational mathematics functions.
 */
class NavMath {
    /**
     * Clamps a value to a min and max.
     * @param val The value to clamp.
     * @param min The minimum value to clamp to.
     * @param max The maximum value to clamp to.
     * @returns The clamped value.
     */
    static clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }
    /**
     * Normalizes a heading to a 0-360 range.
     * @param heading The heading to normalize.
     * @returns The normalized heading.
     */
    static normalizeHeading(heading) {
        if (isFinite(heading)) {
            return (heading % 360 + 360) % 360;
        }
        else {
            console.error(`normalizeHeading: Invalid heading: ${heading}`);
            return NaN;
        }
    }
    /**
     * Gets the turn radius for a given true airspeed.
     * @param airspeedTrue The true airspeed of the plane.
     * @param bankAngle The bank angle of the plane, in degrees.
     * @returns The airplane turn radius.
     */
    static turnRadius(airspeedTrue, bankAngle) {
        return (Math.pow(airspeedTrue, 2) / (11.26 * Math.tan(bankAngle * NavMath.DEG2RAD)))
            / 3.2808399;
    }
    /**
     * Gets the required bank angle for a given true airspeed and turn radius.
     * @param airspeedTrue The true airspeed of the plane.
     * @param radius The airplane turn radius.
     * @returns The required bank angle, in degrees.
     */
    static bankAngle(airspeedTrue, radius) {
        const airspeedMS = airspeedTrue * 0.51444444;
        return Units.Radians.toDegrees(Math.atan(Math.pow(airspeedMS, 2) / (radius * 9.80665)));
    }
    /**
     * Get the turn direction for a given course change.
     * @param startCourse The start course.
     * @param endCourse The end course.
     * @returns The turn direction for the course change.
     */
    static getTurnDirection(startCourse, endCourse) {
        return NavMath.normalizeHeading(endCourse - startCourse) > 180 ? 'left' : 'right';
    }
    /**
     * Converts polar radians to degrees north.
     * @param radians The radians to convert.
     * @returns The angle, in degrees north.
     */
    static polarToDegreesNorth(radians) {
        return NavMath.normalizeHeading((180 / Math.PI) * (Math.PI / 2 - radians));
    }
    /**
     * Converts degrees north to polar radians.
     * @param degrees The degrees to convert.
     * @returns The angle radians, in polar.
     */
    static degreesNorthToPolar(degrees) {
        return NavMath.normalizeHeading(degrees - 90) / (180 / Math.PI);
    }
    /**
     * Calculates the distance along an arc on Earth's surface. The arc begins at the intersection of the great circle
     * passing through the center of a circle of radius `radius` meters in the direction of 'startBearing', and ends at
     * the intersection of the great circle passing through the center of the circle in the direction of 'endBearing',
     * proceeding clockwise (as viewed from above).
     * @param startBearing The degrees of the start of the arc.
     * @param endBearing The degrees of the end of the arc.
     * @param radius The radius of the arc, in meters.
     * @returns The arc distance.
     */
    static calculateArcDistance(startBearing, endBearing, radius) {
        const angularWidth = ((endBearing - startBearing + 360) % 360) * Avionics.Utils.DEG2RAD;
        const conversion = UnitType.GA_RADIAN.convertTo(1, UnitType.METER);
        return angularWidth * Math.sin(radius / conversion) * conversion;
    }
    /**
     * Calculates the intersection of a line and a circle.
     * @param x1 The start x of the line.
     * @param y1 The start y of the line.
     * @param x2 The end x of the line.
     * @param y2 The end y of the line.
     * @param cx The circle center x.
     * @param cy The circle center y.
     * @param r The radius of the circle.
     * @param sRef The reference to the solution object to write the solution to.
     * @returns The number of solutions (0, 1 or 2).
     */
    static circleIntersection(x1, y1, x2, y2, cx, cy, r, sRef) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const a = dx * dx + dy * dy;
        const b = 2 * (dx * (x1 - cx) + dy * (y1 - cy));
        const c = (x1 - cx) * (x1 - cx) + (y1 - cy) * (y1 - cy) - r * r;
        const det = b * b - 4 * a * c;
        if (a < 0.0000001 || det < 0) {
            sRef.x1 = NaN;
            sRef.x2 = NaN;
            sRef.y1 = NaN;
            sRef.y2 = NaN;
            return 0;
        }
        else if (det == 0) {
            const t = -b / (2 * a);
            sRef.x1 = x1 + t * dx;
            sRef.y1 = y1 + t * dy;
            sRef.x2 = NaN;
            sRef.y2 = NaN;
            return 1;
        }
        else {
            const t1 = ((-b + Math.sqrt(det)) / (2 * a));
            sRef.x1 = x1 + t1 * dx;
            sRef.y1 = y1 + t1 * dy;
            const t2 = ((-b - Math.sqrt(det)) / (2 * a));
            sRef.x2 = x1 + t2 * dx;
            sRef.y2 = y1 + t2 * dy;
            return 2;
        }
    }
    /**
     * Gets the degrees north that a point lies on a circle.
     * @param cx The x point of the center of the circle.
     * @param cy The y point of the center of the circle.
     * @param x The x point to get the bearing for.
     * @param y The y point to get the bearing for.
     * @returns The angle in degrees north that the point is relative to the center.
     */
    static northAngle(cx, cy, x, y) {
        return NavMath.polarToDegreesNorth(Math.atan2(y - cy, x - cx));
    }
    /**
     * Checks if a degrees north bearing is between two other degrees north bearings.
     * @param bearing The bearing in degrees north to check.
     * @param start The start bearing in degrees north.
     * @param end The end bearing, in degrees north.
     * @returns True if the bearing is between the two provided bearings, false otherwise.
     */
    static bearingIsBetween(bearing, start, end) {
        const range = this.normalizeHeading(end - start);
        const relativeBearing = this.normalizeHeading(bearing - start);
        return relativeBearing >= 0 && relativeBearing <= range;
    }
    /**
     * Converts a degrees north heading to a degrees north turn circle angle.
     * @param heading The heading to convert.
     * @param turnDirection The direction of the turn.
     * @returns A degrees north turn circle angle.
     */
    static headingToAngle(heading, turnDirection) {
        return NavMath.normalizeHeading(heading + (turnDirection === 'left' ? 90 : -90));
    }
    /**
     * Converts a degrees north turn circle angle to a degrees north heading.
     * @param angle The turn circle angle to convert.
     * @param turnDirection The direction of the turn.
     * @returns A degrees north heading.
     */
    static angleToHeading(angle, turnDirection) {
        return NavMath.normalizeHeading(angle + (turnDirection === 'left' ? -90 : 90));
    }
    /**
     * Calculates the wind correction angle.
     * @param course The current plane true course.
     * @param airspeedTrue The current plane true airspeed.
     * @param windDirection The direction of the wind, in degrees true.
     * @param windSpeed The current speed of the wind.
     * @returns The calculated wind correction angle.
     */
    static windCorrectionAngle(course, airspeedTrue, windDirection, windSpeed) {
        const currCrosswind = windSpeed * (Math.sin((course * Math.PI / 180) - (windDirection * Math.PI / 180)));
        const windCorrection = 180 * Math.asin(currCrosswind / airspeedTrue) / Math.PI;
        return windCorrection;
    }
    /**
     * Calculates the cross track deviation from the provided leg fixes.
     * @param start The location of the starting fix of the leg.
     * @param end The location of the ending fix of the leg.
     * @param pos The current plane location coordinates.
     * @returns The amount of cross track deviation, in nautical miles.
     */
    static crossTrack(start, end, pos) {
        const path = NavMath.geoCircleCache[0].setAsGreatCircle(start, end);
        if (isNaN(path.center[0])) {
            return NaN;
        }
        return UnitType.GA_RADIAN.convertTo(path.distance(pos), UnitType.NMILE);
    }
    /**
     * Calculates the along-track distance from a starting point to another point along a great-circle track running
     * through the starting point.
     * @param start The start of the great-circle track.
     * @param end The end of the great-circle track.
     * @param pos The point for which to calculate the along-track distance.
     * @returns The along-track distance, in nautical miles.
     */
    static alongTrack(start, end, pos) {
        const path = NavMath.geoCircleCache[0].setAsGreatCircle(start, end);
        if (isNaN(path.center[0])) {
            return NaN;
        }
        const distance = path.distanceAlong(start, path.closest(pos, NavMath.vec3Cache[0]));
        return UnitType.GA_RADIAN.convertTo((distance + Math.PI) % (2 * Math.PI) - Math.PI, UnitType.NMILE);
    }
    /**
     * Calculates the desired track from the provided leg fixes.
     * @param start The location of the starting fix of the leg.
     * @param end The location of the ending fix of the leg.
     * @param pos The current plane location coordinates.
     * @returns The desired track, in degrees true.
     */
    static desiredTrack(start, end, pos) {
        const path = NavMath.geoCircleCache[0].setAsGreatCircle(start, end);
        if (isNaN(path.center[0])) {
            return NaN;
        }
        return path.bearingAt(path.closest(pos, NavMath.vec3Cache[0]));
    }
    /**
     * Gets the desired track for a given arc.
     * @param center The center of the arc.
     * @param turnDirection The direction of the turn.
     * @param pos The current plane position.
     * @returns The desired track.
     */
    static desiredTrackArc(center, turnDirection, pos) {
        const northAngle = NavMath.geoPointCache[0].set(pos).bearingFrom(center);
        //TODO: Clamp the arc angle to the start and end angles
        return NavMath.angleToHeading(northAngle, turnDirection);
    }
    /**
     * Gets the percentage along the arc path that the plane currently is.
     * @param start The start of the arc, in degrees north.
     * @param end The end of the arc, in degrees north.
     * @param center The center location of the arc.
     * @param turnDirection The direction of the turn.
     * @param pos The current plane position.
     * @returns The percentage along the arc the plane is.
     */
    static percentAlongTrackArc(start, end, center, turnDirection, pos) {
        const bearingFromCenter = NavMath.geoPointCache[0].set(center).bearingTo(pos);
        const sign = turnDirection === 'right' ? 1 : -1;
        const alpha = ((end - start) * sign + 360) % 360;
        const mid = (start + alpha / 2 * sign + 360) % 360;
        const rotBearing = ((bearingFromCenter - mid) + 540) % 360 - 180;
        const frac = rotBearing * sign / alpha + 0.5;
        return frac;
    }
    /**
     * Gets a position given an arc and a distance from the arc start.
     * @param start The start bearing of the arc.
     * @param center The center of the arc.
     * @param radius The radius of the arc.
     * @param turnDirection The turn direction for the arc.
     * @param distance The distance along the arc to get the position for.
     * @param out The position to write to.
     * @returns The position along the arc that was written to.
     */
    static positionAlongArc(start, center, radius, turnDirection, distance, out) {
        const convertedRadius = UnitType.GA_RADIAN.convertTo(Math.sin(UnitType.METER.convertTo(radius, UnitType.GA_RADIAN)), UnitType.METER);
        const theta = UnitType.RADIAN.convertTo(distance / convertedRadius, UnitType.DEGREE);
        const bearing = turnDirection === 'right' ? start + theta : start - theta;
        center.offset(NavMath.normalizeHeading(bearing), UnitType.METER.convertTo(radius, UnitType.GA_RADIAN), out);
        return out;
    }
    /**
     * Gets the cross track distance for a given arc.
     * @param center The center of the arc.
     * @param radius The radius of the arc, in meters.
     * @param pos The current plane position.
     * @returns The cross track distance, in NM.
     */
    static crossTrackArc(center, radius, pos) {
        return UnitType.METER.convertTo(radius, UnitType.NMILE) - UnitType.GA_RADIAN.convertTo(NavMath.geoPointCache[0].set(pos).distance(center), UnitType.NMILE);
    }
    /**
     * Gets the total difference in degrees between two angles.
     * @param a The first angle.
     * @param b The second angle.
     * @returns The difference between the two angles, in degrees.
     */
    static diffAngle(a, b) {
        let diff = b - a;
        while (diff > 180) {
            diff -= 360;
        }
        while (diff <= -180) {
            diff += 360;
        }
        return diff;
    }
    /**
     * Finds side a given sides b, c, and angles beta, gamma.
     * @param b The length of side b, as a trigonometric ratio.
     * @param c The length of side c, as a trigonometric ratio.
     * @param beta The angle, in radians, of the opposite of side b.
     * @param gamma The angle, in radians, of the opposite of side c
     * @returns The length of side a, as a trigonometric ratio.
     */
    static napierSide(b, c, beta, gamma) {
        return 2 * Math.atan(Math.tan(0.5 * (b - c))
            * (Math.sin(0.5 * (beta + gamma)) / Math.sin(0.5 * (beta - gamma))));
    }
    /**
     * Calculates a normal vector to a provided course in degrees north.
     * @param course The course in degrees north.
     * @param turnDirection The direction of the turn to orient the normal.
     * @param outVector The normal vector for the provided course.
     */
    static normal(course, turnDirection, outVector) {
        const normalCourse = NavMath.headingToAngle(course, turnDirection);
        const polarCourse = NavMath.degreesNorthToPolar(normalCourse);
        outVector[0] = Math.cos(polarCourse);
        outVector[1] = Math.sin(polarCourse);
    }
}
NavMath.DEG2RAD = Math.PI / 180;
NavMath.RAD2DEG = 180 / Math.PI;
NavMath.vec3Cache = [new Float64Array(3)];
NavMath.geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0)];
NavMath.geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];

/// <reference types="msfstypes/Coherent/Facilities" />
/**
 * A utility class for working with magnetic variation (magnetic declination).
 */
class MagVar {
    // eslint-disable-next-line jsdoc/require-jsdoc
    static get(arg1, arg2) {
        return MagVar.getMagVar(arg1, arg2);
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    static magneticToTrue(bearing, arg1, arg2) {
        return NavMath.normalizeHeading(bearing + (typeof arg1 === 'number' && arg2 === undefined ? arg1 : MagVar.getMagVar(arg1, arg2)));
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    static trueToMagnetic(bearing, arg1, arg2) {
        return NavMath.normalizeHeading(bearing - (typeof arg1 === 'number' && arg2 === undefined ? arg1 : MagVar.getMagVar(arg1, arg2)));
    }
    /**
     * Gets the magnetic variation (magnetic declination) at a specific point on Earth.
     * @param arg1 The query point, or the latitude of the query point.
     * @param arg2 The longitude of the query point.
     * @returns The magnetic variation (magnetic declination) at the point.
     */
    static getMagVar(arg1, arg2) {
        if (typeof Facilities === 'undefined') {
            // In case this code is executed before the Facilities class is created.
            return 0;
        }
        let lat, lon;
        if (typeof arg1 === 'number') {
            lat = arg1;
            lon = arg2;
        }
        else {
            lat = arg1.lat;
            lon = arg1.lon;
        }
        return Facilities.getMagVar(lat, lon);
    }
}

/**
 * The possible reference norths for navigation angle units.
 */
var NavAngleUnitReferenceNorth;
(function (NavAngleUnitReferenceNorth) {
    NavAngleUnitReferenceNorth["True"] = "true";
    NavAngleUnitReferenceNorth["Magnetic"] = "magnetic";
})(NavAngleUnitReferenceNorth || (NavAngleUnitReferenceNorth = {}));
/**
 * A navigation angle unit, which is a measure of angular degrees relative to either true or magnetic north.
 *
 * Unlike most other unit types, each instance of navigation angle unit contains state specific to that instance,
 * namely the location used to retrieve magnetic variation for conversions. Therefore, it is generally recommended
 * not to re-use the same NavAngleUnit instance to instantiate multiple NumberUnits.
 *
 * Conversions use the location of the NavAngleUnit instance whose conversion method is called; this also means that
 * when using `NumberUnit.asUnit()`, the location of the unit of the NumberUnit whose `asUnit()` method was called
 * will be used.
 */
class NavAngleUnit extends AbstractUnit {
    // eslint-disable-next-line jsdoc/require-jsdoc
    constructor(type, arg1, arg2) {
        super(type === NavAngleUnitReferenceNorth.True ? 'true bearing' : 'magnetic bearing');
        /** @inheritdoc */
        this.family = NavAngleUnit.FAMILY;
        /** This location used to retrieve magnetic variation for conversions related to this unit. */
        this.location = new GeoPoint(0, 0);
        typeof arg1 === 'number' ? this.location.set(arg1, arg2) : this.location.set(arg1);
    }
    /**
     * Checks whether this nav angle unit is relative to magnetic north.
     * @returns Whether this nav angle unit is relative to magnetic north.
     */
    isMagnetic() {
        return this.name === 'magnetic bearing';
    }
    /**
     * Converts a value of this unit to another unit. This unit's location is used for the conversion.
     * @param value The value to convert.
     * @param toUnit The unit to which to convert.
     * @returns The converted value.
     * @throws Error if attempting an invalid conversion.
     */
    convertTo(value, toUnit) {
        if (!this.canConvert(toUnit)) {
            throw new Error(`Invalid conversion from ${this.name} to ${toUnit.name}.`);
        }
        if (!isFinite(value)) {
            return NaN;
        }
        if (toUnit.name === this.name) {
            return value;
        }
        return this.isMagnetic() ? MagVar.magneticToTrue(value, this.location) : MagVar.trueToMagnetic(value, this.location);
    }
    /**
     * Converts a value of another unit to this unit. This unit's location is used for the conversion.
     * @param value The value to convert.
     * @param fromUnit The unit from which to convert.
     * @returns The converted value.
     * @throws Error if attempting an invalid conversion.
     */
    convertFrom(value, fromUnit) {
        if (!this.canConvert(fromUnit)) {
            throw new Error(`Invalid conversion from ${fromUnit.name} to ${this.name}.`);
        }
        if (!isFinite(value)) {
            return NaN;
        }
        if (fromUnit.name === this.name) {
            return value;
        }
        return this.isMagnetic() ? MagVar.trueToMagnetic(value, this.location) : MagVar.magneticToTrue(value, this.location);
    }
    /** @inheritdoc */
    equals(other) {
        return other instanceof NavAngleUnit && this.name === other.name && this.location.equals(other.location);
    }
    /**
     * Creates an instance of NavAngleUnit. The location of the unit is initialized to {0 N, 0 E}.
     * @param isMagnetic Whether the new unit is relative to magnetic north.
     * @returns An instance of NavAngleUnit.
     */
    static create(isMagnetic) {
        return new NavAngleUnit(isMagnetic ? NavAngleUnitReferenceNorth.Magnetic : NavAngleUnitReferenceNorth.True, 0, 0);
    }
}
NavAngleUnit.FAMILY = 'navangle';

/**
 * Bitflags describing the relative location of a point with respect to a rectangular bounding box.
 */
var Outcode;
(function (Outcode) {
    Outcode[Outcode["Inside"] = 0] = "Inside";
    Outcode[Outcode["Left"] = 1] = "Left";
    Outcode[Outcode["Top"] = 2] = "Top";
    Outcode[Outcode["Right"] = 4] = "Right";
    Outcode[Outcode["Bottom"] = 8] = "Bottom";
})(Outcode || (Outcode = {}));
Array.from({ length: 8 }, () => {
    return { point: new Float64Array(2), radial: 0 };
});

[new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0)];

var DmsDirection;
(function (DmsDirection) {
    DmsDirection["NORTH"] = "N";
    DmsDirection["SOUTH"] = "S";
    DmsDirection["WEST"] = "W";
    DmsDirection["EAST"] = "E";
})(DmsDirection || (DmsDirection = {}));

// eslint-disable-next-line @typescript-eslint/no-namespace
var Wait;
(function (Wait) {
    /**
     * Waits for a set amount of time.
     * @param delay The amount of time to wait in milliseconds.
     * @returns a Promise which is fulfilled after the delay.
     */
    // eslint-disable-next-line no-inner-declarations
    function awaitDelay(delay) {
        return new Promise(resolve => setTimeout(() => resolve(), delay));
    }
    Wait.awaitDelay = awaitDelay;
    /**
     * Waits for a condition to be satisfied.
     * @param predicate A function which evaluates whether the condition is satisfied.
     * @param interval The interval, in milliseconds, at which to evaluate the condition. A zero or negative value
     * causes the condition to be evaluated every frame. Defaults to 0.
     * @param timeout The amount of time, in milliseconds, before the returned Promise is rejected if the condition is
     * not satisfied. A zero or negative value causes the Promise to never be rejected and the condition to be
     * continually evaluated until it is satisfied. Defaults to 0.
     * @returns a Promise which is fulfilled when the condition is satisfied.
     */
    // eslint-disable-next-line no-inner-declarations
    function awaitCondition(predicate, interval = 0, timeout = 0) {
        const t0 = Date.now();
        if (interval <= 0) {
            const loopFunc = (resolve, reject) => {
                if (timeout > 0 && Date.now() - t0 >= timeout) {
                    reject('Await condition timed out.');
                }
                else {
                    predicate() ? resolve() : requestAnimationFrame(loopFunc.bind(undefined, resolve, reject));
                }
            };
            return new Promise((resolve, reject) => { loopFunc(resolve, reject); });
        }
        else {
            return new Promise((resolve, reject) => {
                const timer = setInterval(() => {
                    if (timeout > 0 && Date.now() - t0 > timeout) {
                        clearInterval(timer);
                        reject('Await condition timed out.');
                    }
                    else if (predicate()) {
                        clearInterval(timer);
                        resolve();
                    }
                }, interval);
            });
        }
    }
    Wait.awaitCondition = awaitCondition;
})(Wait || (Wait = {}));

/**
 * An event bus consumer for a specific topic.
 */
class Consumer {
    /**
     * Creates an instance of a Consumer.
     * @param bus The event bus to subscribe to.
     * @param topic The topic of the subscription.
     * @param state The state for the consumer to track.
     * @param currentHandler The current build filter handler stack, if any.
     */
    constructor(bus, topic, state = {}, currentHandler) {
        this.bus = bus;
        this.topic = topic;
        this.state = state;
        this.currentHandler = currentHandler;
    }
    /**
     * Handles an event using the provided event handler.
     * @param handler The event handler for the event.
     */
    handle(handler) {
        if (this.currentHandler !== undefined) {
            /**
             * The handler reference to store.
             * @param data The input data to the handler.
             */
            this.handlerReference = (data) => {
                if (this.currentHandler !== undefined) {
                    this.currentHandler(data, this.state, handler);
                }
            };
            this.bus.on(this.topic, this.handlerReference);
        }
        else {
            this.bus.on(this.topic, handler);
        }
    }
    /**
     * Disables handling of the event.
     * @param handler The handler to disable.
     */
    off(handler) {
        if (this.handlerReference !== undefined) {
            this.bus.off(this.topic, this.handlerReference);
        }
        else {
            this.bus.off(this.topic, handler);
        }
    }
    /**
     * Caps the event subscription to a specified frequency, in Hz.
     * @param frequency The frequency, in Hz, to cap to.
     * @returns A new consumer with the applied frequency filter.
     */
    atFrequency(frequency) {
        const deltaTimeTrigger = 1000 / frequency;
        return new Consumer(this.bus, this.topic, { previousTime: Date.now() }, (data, state, next) => {
            const currentTime = Date.now();
            const deltaTime = currentTime - state.previousTime;
            if (deltaTimeTrigger <= deltaTime) {
                while ((state.previousTime + deltaTimeTrigger) < currentTime) {
                    state.previousTime += deltaTimeTrigger;
                }
                this.with(data, next);
            }
        });
    }
    /**
     * Quantizes the numerical event data to consume only at the specified decimal precision.
     * @param precision The decimal precision to snap to.
     * @returns A new consumer with the applied precision filter.
     */
    withPrecision(precision) {
        return new Consumer(this.bus, this.topic, { lastValue: 0 }, (data, state, next) => {
            const dataValue = data;
            const multiplier = Math.pow(10, precision);
            const currentValueAtPrecision = Math.round(dataValue * multiplier) / multiplier;
            if (currentValueAtPrecision !== state.lastValue) {
                state.lastValue = currentValueAtPrecision;
                this.with(currentValueAtPrecision, next);
            }
        });
    }
    /**
     * Filter the subscription to consume only when the value has changed by a minimum amount.
     * @param amount The minimum amount threshold below which the consumer will not consume.
     * @returns A new consumer with the applied change threshold filter.
     */
    whenChangedBy(amount) {
        return new Consumer(this.bus, this.topic, { lastValue: 0 }, (data, state, next) => {
            const dataValue = data;
            const diff = Math.abs(dataValue - state.lastValue);
            if (diff >= amount) {
                state.lastValue = dataValue;
                this.with(data, next);
            }
        });
    }
    /**
     * Filter the subscription to consume only if the value has changed. At all.  Really only
     * useful for strings or other events that don't change much.
     * @returns A new consumer with the applied change threshold filter.
     */
    whenChanged() {
        return new Consumer(this.bus, this.topic, { lastValue: '' }, (data, state, next) => {
            if (state.lastValue !== data) {
                state.lastValue = data;
                this.with(data, next);
            }
        });
    }
    /**
     * Filters events by time such that events will not be consumed until a minimum duration
     * has passed since the previous event.
     * @param deltaTime The minimum delta time between events.
     * @returns A new consumer with the applied change threshold filter.
     */
    onlyAfter(deltaTime) {
        return new Consumer(this.bus, this.topic, { previousTime: Date.now() }, (data, state, next) => {
            const currentTime = Date.now();
            const timeDiff = currentTime - state.previousTime;
            if (timeDiff > deltaTime) {
                state.previousTime += deltaTime;
                this.with(data, next);
            }
        });
    }
    /**
     * Builds a handler stack from the current handler.
     * @param data The data to send in to the handler.
     * @param handler The handler to use for processing.
     */
    with(data, handler) {
        if (this.currentHandler !== undefined) {
            this.currentHandler(data, this.state, handler);
        }
        else {
            handler(data);
        }
    }
}

/**
 * A typed container for subscribers interacting with the Event Bus.
 */
class EventSubscriber {
    /**
     * Creates an instance of an EventSubscriber.
     * @param bus The EventBus that is the parent of this instance.
     */
    constructor(bus) {
        this.bus = bus;
    }
    /**
     * Subscribes to a topic on the bus.
     * @param topic The topic to subscribe to.
     * @returns A consumer to bind the event handler to.
     */
    on(topic) {
        return new Consumer(this.bus, topic);
    }
}

/// <reference types="msfstypes/JS/common" />
/**
 * An event bus that can be used to publish data from backend
 * components and devices to consumers.
 */
class EventBus {
    /**
     * Creates an instance of an EventBus.
     * @param useStorageSync Whether or not to use storage sync (optional, default false)
     */
    constructor(useStorageSync) {
        this._topicHandlersMap = new Map();
        this._wildcardHandlers = new Array();
        this._eventCache = new Map();
        this._busId = Math.floor(Math.random() * 2147483647);
        const syncFunc = useStorageSync ? EventBusStorageSync : EventBusCoherentSync;
        this._busSync = new syncFunc(this.pub.bind(this), this._busId);
        this.syncEvent('event_bus', 'resync_request', false);
        this.on('event_bus', (data) => {
            if (data == 'resync_request') {
                this.resyncEvents();
            }
        });
    }
    /**
     * Subscribes to a topic on the bus.
     * @param topic The topic to subscribe to.
     * @param handler The handler to be called when an event happens.
     */
    on(topic, handler) {
        var _a;
        const handlers = this._topicHandlersMap.get(topic);
        const isNew = !(handlers && handlers.push(handler));
        if (isNew) {
            this._topicHandlersMap.set(topic, [handler]);
        }
        const lastState = (_a = this._eventCache.get(topic)) === null || _a === void 0 ? void 0 : _a.data;
        if (this._eventCache.get(topic) !== undefined) {
            handler(lastState);
        }
    }
    /**
     * Unsubscribes a handler from the topic's events.
     * @param topic The topic to unsubscribe from.
     * @param handler The handler to unsubscribe from topic.
     */
    off(topic, handler) {
        const handlers = this._topicHandlersMap.get(topic);
        if (handlers) {
            handlers.splice(handlers.indexOf(handler) >>> 0, 1);
        }
    }
    /**
     * Subscribe to the handler as * to all topics.
     * @param handler The handler to subscribe to all events.
     */
    onAll(handler) {
        this._wildcardHandlers.push(handler);
    }
    /**
     * Unsubscribe the handler from all topics.
     * @param handler The handler to unsubscribe from all events.
     */
    offAll(handler) {
        const handlerIndex = this._wildcardHandlers.indexOf(handler);
        if (handlerIndex > -1) {
            this._wildcardHandlers.splice(handlerIndex >>> 0, 1);
        }
    }
    /**
     * Publishes an event to the topic on the bus.
     * @param topic The topic to publish to.
     * @param data The data portion of the event.
     * @param sync Whether or not this message needs to be synced on local stoage.
     * @param isCached Whether or not this message will be resync'd across the bus on load.
     */
    pub(topic, data, sync = false, isCached = true) {
        if (isCached) {
            this._eventCache.set(topic, { data: data, synced: sync });
        }
        const handlers = this._topicHandlersMap.get(topic);
        if (handlers !== undefined) {
            const len = handlers.length;
            for (let i = 0; i < len; i++) {
                try {
                    handlers[i](data);
                }
                catch (error) {
                    console.error(`Error in EventBus Handler: ${error}`);
                    if (error instanceof Error) {
                        console.error(error.stack);
                    }
                }
            }
        }
        // We don't know if anything is subscribed on busses in other instruments,
        // so we'll unconditionally sync if sync is true and trust that the
        // publisher knows what it's doing.
        if (sync) {
            this.syncEvent(topic, data, isCached);
        }
        // always push to wildcard handlers
        const wcLen = this._wildcardHandlers.length;
        for (let i = 0; i < wcLen; i++) {
            this._wildcardHandlers[i](topic, data);
        }
    }
    /**
     * Re-sync all synced events
     */
    resyncEvents() {
        for (const [topic, event] of this._eventCache) {
            if (event.synced) {
                this.syncEvent(topic, event.data, true);
            }
        }
    }
    /**
     * Publish an event to the sync bus.
     * @param topic The topic to publish to.
     * @param data The data to publish.
     * @param isCached Whether or not this message will be resync'd across the bus on load.
     */
    syncEvent(topic, data, isCached) {
        this._busSync.sendEvent(topic, data, isCached);
    }
    /**
     * Gets a typed publisher from the event bus..
     * @returns The typed publisher.
     */
    getPublisher() {
        return this;
    }
    /**
     * Gets a typed subscriber from the event bus.
     * @returns The typed subscriber.
     */
    getSubscriber() {
        return new EventSubscriber(this);
    }
}
/**
 * A class that manages event bus synchronization via data storage.
 */
class EventBusStorageSync {
    /**
     * Creates an instance of EventBusStorageSync.
     * @param recvEventCb A callback to execute when an event is received on the bus.
     * @param busId The ID of the bus.  Derp.
     */
    constructor(recvEventCb, busId) {
        this.recvEventCb = recvEventCb;
        this.busId = busId;
        window.addEventListener('storage', this.receiveEvent.bind(this));
    }
    /**
     * Sends an event via storage events.
     * @param topic The topic to send data on.
     * @param data The data to send.
     */
    sendEvent(topic, data) {
        // TODO can we do the stringing more gc friendly?
        // TODO we could not stringify on simple types, but the receiver wouldn't know I guess
        // TODO add handling for busIds to avoid message loops
        localStorage.setItem(EventBusStorageSync.EB_KEY, `${topic.toString()},${data !== undefined ? JSON.stringify(data) : EventBusStorageSync.EMPTY_DATA}`);
        // TODO move removeItem to a function called at intervals instead of every time?
        localStorage.removeItem(EventBusStorageSync.EB_KEY);
    }
    /**
     * Receives an event from storage and syncs onto the bus.
     * @param e The storage event that was received.
     */
    receiveEvent(e) {
        // TODO only react on topics that have subscribers
        if (e.key === EventBusStorageSync.EB_KEY && e.newValue) {
            const val = e.newValue.split(',');
            this.recvEventCb(val[0], val.length > 1 ? JSON.parse(val[1]) : undefined, true);
        }
    }
}
EventBusStorageSync.EMPTY_DATA = '{}';
EventBusStorageSync.EB_KEY = 'eb.evt';
/**
 * A class that manages event bus synchronization via Coherent notifications.
 */
class EventBusCoherentSync {
    /**
     * Creates an instance of EventBusCoherentSync.
     * @param recvEventCb A callback to execute when an event is received on the bus.
     * @param busId The ID of the bus.  Derp.
     */
    constructor(recvEventCb, busId) {
        this.evtNum = 0;
        this.lastEventSynced = -1;
        this.recvEventCb = recvEventCb;
        this.busId = busId;
        this.listener = RegisterViewListener(EventBusCoherentSync.EB_LISTENER_KEY);
        this.listener.on(EventBusCoherentSync.EB_KEY, this.receiveEvent.bind(this));
    }
    /**
     * Sends an event via Coherent events.
     * @param topic The topic to send data on.
     * @param data The data to send.
     * @param isCached Whether or not this event is cached.
     */
    sendEvent(topic, data, isCached) {
        this.listener.triggerToAllSubscribers(EventBusCoherentSync.EB_KEY, { topic, data, isCached, busId: this.busId, evtNum: this.evtNum++ });
    }
    /**
     * Receives an event via Coherent and syncs onto the bus.
     * @param e The storage event that was received.
     */
    receiveEvent(e) {
        // If we've sent this event, don't act on it.
        if (e.busId == this.busId) {
            return;
        }
        if (this.lastEventSynced !== e.evtNum) {
            // TODO only react on topics that have subscribers
            this.lastEventSynced = e.evtNum;
            this.recvEventCb(e['topic'], e['data'], undefined, e['isCached']);
        }
    }
}
EventBusCoherentSync.EMPTY_DATA = '{}';
EventBusCoherentSync.EB_KEY = 'eb.evt';
EventBusCoherentSync.EB_LISTENER_KEY = 'JS_LISTENER_SIMVARS';

/**
 * A basic event-bus publisher.
 */
class BasePublisher {
    /**
     * Creates an instance of BasePublisher.
     * @param bus The common event bus.
     * @param pacer An optional pacer to control the rate of publishing.
     */
    constructor(bus, pacer = undefined) {
        this.bus = bus;
        this.publisher = this.bus.getPublisher();
        this.publishActive = false;
        this.pacer = pacer;
    }
    /**
     * Start publishing.
     */
    startPublish() {
        this.publishActive = true;
    }
    /**
     * Stop publishing.
     */
    stopPublish() {
        this.publishActive = false;
    }
    /**
     * Tells whether or not the publisher is currently active.
     * @returns True if the publisher is active, false otherwise.
     */
    isPublishing() {
        return this.publishActive;
    }
    /**
     * A callback called when the publisher receives an update cycle.
     */
    onUpdate() {
        return;
    }
    /**
     * Publish a message if publishing is acpive
     * @param topic The topic key to publish to.
     * @param data The data type for chosen topic.
     * @param sync Whether or not the event should be synced via local storage.
     * @param isCached Whether or not the event should be cached.
     */
    publish(topic, data, sync = false, isCached = true) {
        if (this.publishActive && (!this.pacer || this.pacer.canPublish(topic, data))) {
            this.publisher.pub(topic, data, sync, isCached);
        }
    }
}
/**
 * A base class for publishers that need to handle simvars with built-in
 * support for pacing callbacks.
 */
class SimVarPublisher extends BasePublisher {
    /**
     * Create a SimVarPublisher
     * @param simVarMap A map of simvar event type keys to a SimVarDefinition.
     * @param bus The EventBus to use for publishing.
     * @param pacer An optional pacer to control the rate of publishing.
     */
    constructor(simVarMap, bus, pacer = undefined) {
        super(bus, pacer);
        this.simvars = simVarMap;
        this.subscribed = new Set();
    }
    /**
     * Subscribe to an event type to begin publishing.
     * @param data Key of the event type in the simVarMap
     */
    subscribe(data) {
        this.subscribed.add(data);
    }
    /**
     * Unsubscribe to an event to stop publishing.
     * @param data Key of the event type in the simVarMap
     */
    unsubscribe(data) {
        // TODO If we have multiple subscribers we may want to add reference counting here.
        this.subscribed.delete(data);
    }
    /**
     * Read the value of a given simvar by its key.
     * @param key The key of the simvar in simVarMap
     * @returns The value returned by SimVar.GetSimVarValue()
     */
    getValue(key) {
        const simvar = this.simvars.get(key);
        if (simvar === undefined) {
            return undefined;
        }
        return SimVar.GetSimVarValue(simvar.name, simvar.type);
    }
    /**
     * Publish all subscribed data points to the bus.
     */
    onUpdate() {
        for (const data of this.subscribed.values()) {
            const value = this.getValue(data);
            if (value !== undefined) {
                this.publish(data, value);
            }
        }
    }
    /**
     * Change the simvar read for a given key.
     * @param key The key of the simvar in simVarMap
     * @param value The new value to set the simvar to.
     */
    updateSimVarSource(key, value) {
        this.simvars.set(key, value);
    }
}

/**
 * A publisher for publishing H:Events on the bus.
 */
class HEventPublisher extends BasePublisher {
    /**
     * Dispatches an H:Event to the event bus.
     * @param hEvent The H:Event to dispatch.
     * @param sync Whether this event should be synced (optional, default false)
     */
    dispatchHEvent(hEvent, sync = false) {
        //console.log(`dispaching hevent:  ${hEvent}`);
        this.publish('hEvent', hEvent, sync, false);
    }
}

/**
 * Valid type arguments for Set/GetSimVarValue
 */
var SimVarValueType;
(function (SimVarValueType) {
    SimVarValueType["Number"] = "number";
    SimVarValueType["Degree"] = "degrees";
    SimVarValueType["Knots"] = "knots";
    SimVarValueType["Feet"] = "feet";
    SimVarValueType["Meters"] = "meters";
    SimVarValueType["FPM"] = "feet per minute";
    SimVarValueType["Radians"] = "radians";
    SimVarValueType["InHG"] = "inches of mercury";
    SimVarValueType["MB"] = "Millibars";
    SimVarValueType["Bool"] = "Bool";
    SimVarValueType["Celsius"] = "celsius";
    SimVarValueType["MHz"] = "MHz";
    SimVarValueType["KHz"] = "KHz";
    SimVarValueType["NM"] = "nautical mile";
    SimVarValueType["String"] = "string";
    SimVarValueType["RPM"] = "Rpm";
    SimVarValueType["PPH"] = "Pounds per hour";
    SimVarValueType["GPH"] = "gph";
    SimVarValueType["Farenheit"] = "farenheit";
    SimVarValueType["PSI"] = "psi";
    SimVarValueType["GAL"] = "gallons";
    SimVarValueType["Hours"] = "Hours";
    SimVarValueType["Volts"] = "Volts";
    SimVarValueType["Amps"] = "Amperes";
    SimVarValueType["Seconds"] = "seconds";
    SimVarValueType["Enum"] = "Enum";
    SimVarValueType["LLA"] = "latlonalt";
    SimVarValueType["MetersPerSecond"] = "meters per second";
})(SimVarValueType || (SimVarValueType = {}));

/// <reference types="msfstypes/Pages/VCockpit/Instruments/Shared/utils/XMLLogic" />
/** The kind of data to return. */
var CompositeLogicXMLValueType;
(function (CompositeLogicXMLValueType) {
    CompositeLogicXMLValueType[CompositeLogicXMLValueType["Any"] = 0] = "Any";
    CompositeLogicXMLValueType[CompositeLogicXMLValueType["Number"] = 1] = "Number";
    CompositeLogicXMLValueType[CompositeLogicXMLValueType["String"] = 2] = "String";
})(CompositeLogicXMLValueType || (CompositeLogicXMLValueType = {}));

/// <reference types="msfstypes/JS/dataStorage" />
/* eslint-disable no-inner-declarations */
// eslint-disable-next-line @typescript-eslint/no-namespace
var DataStore;
(function (DataStore) {
    /**
     * Writes a keyed value to the data store.
     * @param key A key.
     * @param value The value to set.
     */
    function set(key, value) {
        SetStoredData(key, JSON.stringify(value));
    }
    DataStore.set = set;
    /**
     * Retrieves a keyed value from the data store.
     * @param key A key.
     * @returns the value stored under the key, or undefined if one could not be retrieved.
     */
    function get(key) {
        try {
            const string = GetStoredData(key);
            return JSON.parse(string);
        }
        catch (e) {
            return undefined;
        }
    }
    DataStore.get = get;
    /**
     * Removes a key from the data store.
     * @param key The key to remove.
     */
    function remove(key) {
        DeleteStoredData(key);
    }
    DataStore.remove = remove;
})(DataStore || (DataStore = {}));

/**
 * Types of airspaces.
 */
var AirspaceType;
(function (AirspaceType) {
    AirspaceType[AirspaceType["None"] = 0] = "None";
    AirspaceType[AirspaceType["Center"] = 1] = "Center";
    AirspaceType[AirspaceType["ClassA"] = 2] = "ClassA";
    AirspaceType[AirspaceType["ClassB"] = 3] = "ClassB";
    AirspaceType[AirspaceType["ClassC"] = 4] = "ClassC";
    AirspaceType[AirspaceType["ClassD"] = 5] = "ClassD";
    AirspaceType[AirspaceType["ClassE"] = 6] = "ClassE";
    AirspaceType[AirspaceType["ClassF"] = 7] = "ClassF";
    AirspaceType[AirspaceType["ClassG"] = 8] = "ClassG";
    AirspaceType[AirspaceType["Tower"] = 9] = "Tower";
    AirspaceType[AirspaceType["Clearance"] = 10] = "Clearance";
    AirspaceType[AirspaceType["Ground"] = 11] = "Ground";
    AirspaceType[AirspaceType["Departure"] = 12] = "Departure";
    AirspaceType[AirspaceType["Approach"] = 13] = "Approach";
    AirspaceType[AirspaceType["MOA"] = 14] = "MOA";
    AirspaceType[AirspaceType["Restricted"] = 15] = "Restricted";
    AirspaceType[AirspaceType["Prohibited"] = 16] = "Prohibited";
    AirspaceType[AirspaceType["Warning"] = 17] = "Warning";
    AirspaceType[AirspaceType["Alert"] = 18] = "Alert";
    AirspaceType[AirspaceType["Danger"] = 19] = "Danger";
    AirspaceType[AirspaceType["Nationalpark"] = 20] = "Nationalpark";
    AirspaceType[AirspaceType["ModeC"] = 21] = "ModeC";
    AirspaceType[AirspaceType["Radar"] = 22] = "Radar";
    AirspaceType[AirspaceType["Training"] = 23] = "Training";
    AirspaceType[AirspaceType["Max"] = 24] = "Max";
})(AirspaceType || (AirspaceType = {}));

/**
 * A viewlistener that gets autopilot mode information.
 */
var MSFSAPStates;
(function (MSFSAPStates) {
    MSFSAPStates[MSFSAPStates["LogicOn"] = 1] = "LogicOn";
    MSFSAPStates[MSFSAPStates["APOn"] = 2] = "APOn";
    MSFSAPStates[MSFSAPStates["FDOn"] = 4] = "FDOn";
    MSFSAPStates[MSFSAPStates["FLC"] = 8] = "FLC";
    MSFSAPStates[MSFSAPStates["Alt"] = 16] = "Alt";
    MSFSAPStates[MSFSAPStates["AltArm"] = 32] = "AltArm";
    MSFSAPStates[MSFSAPStates["GS"] = 64] = "GS";
    MSFSAPStates[MSFSAPStates["GSArm"] = 128] = "GSArm";
    MSFSAPStates[MSFSAPStates["Pitch"] = 256] = "Pitch";
    MSFSAPStates[MSFSAPStates["VS"] = 512] = "VS";
    MSFSAPStates[MSFSAPStates["Heading"] = 1024] = "Heading";
    MSFSAPStates[MSFSAPStates["Nav"] = 2048] = "Nav";
    MSFSAPStates[MSFSAPStates["NavArm"] = 4096] = "NavArm";
    MSFSAPStates[MSFSAPStates["WingLevel"] = 8192] = "WingLevel";
    MSFSAPStates[MSFSAPStates["Attitude"] = 16384] = "Attitude";
    MSFSAPStates[MSFSAPStates["ThrottleSpd"] = 32768] = "ThrottleSpd";
    MSFSAPStates[MSFSAPStates["ThrottleMach"] = 65536] = "ThrottleMach";
    MSFSAPStates[MSFSAPStates["ATArm"] = 131072] = "ATArm";
    MSFSAPStates[MSFSAPStates["YD"] = 262144] = "YD";
    MSFSAPStates[MSFSAPStates["EngineRPM"] = 524288] = "EngineRPM";
    MSFSAPStates[MSFSAPStates["TOGAPower"] = 1048576] = "TOGAPower";
    MSFSAPStates[MSFSAPStates["Autoland"] = 2097152] = "Autoland";
    MSFSAPStates[MSFSAPStates["TOGAPitch"] = 4194304] = "TOGAPitch";
    MSFSAPStates[MSFSAPStates["Bank"] = 8388608] = "Bank";
    MSFSAPStates[MSFSAPStates["FBW"] = 16777216] = "FBW";
    MSFSAPStates[MSFSAPStates["AvionicsManaged"] = 33554432] = "AvionicsManaged";
    MSFSAPStates[MSFSAPStates["None"] = -2147483648] = "None";
})(MSFSAPStates || (MSFSAPStates = {}));

/// <reference types="msfstypes/JS/Simplane" />
/**
 * The available facility frequency types.
 */
var FacilityFrequencyType;
(function (FacilityFrequencyType) {
    FacilityFrequencyType[FacilityFrequencyType["None"] = 0] = "None";
    FacilityFrequencyType[FacilityFrequencyType["ATIS"] = 1] = "ATIS";
    FacilityFrequencyType[FacilityFrequencyType["Multicom"] = 2] = "Multicom";
    FacilityFrequencyType[FacilityFrequencyType["Unicom"] = 3] = "Unicom";
    FacilityFrequencyType[FacilityFrequencyType["CTAF"] = 4] = "CTAF";
    FacilityFrequencyType[FacilityFrequencyType["Ground"] = 5] = "Ground";
    FacilityFrequencyType[FacilityFrequencyType["Tower"] = 6] = "Tower";
    FacilityFrequencyType[FacilityFrequencyType["Clearance"] = 7] = "Clearance";
    FacilityFrequencyType[FacilityFrequencyType["Approach"] = 8] = "Approach";
    FacilityFrequencyType[FacilityFrequencyType["Departure"] = 9] = "Departure";
    FacilityFrequencyType[FacilityFrequencyType["Center"] = 10] = "Center";
    FacilityFrequencyType[FacilityFrequencyType["FSS"] = 11] = "FSS";
    FacilityFrequencyType[FacilityFrequencyType["AWOS"] = 12] = "AWOS";
    FacilityFrequencyType[FacilityFrequencyType["ASOS"] = 13] = "ASOS";
    /** Clearance Pre-Taxi*/
    FacilityFrequencyType[FacilityFrequencyType["CPT"] = 14] = "CPT";
    /** Remote Clearance Delivery */
    FacilityFrequencyType[FacilityFrequencyType["GCO"] = 15] = "GCO";
})(FacilityFrequencyType || (FacilityFrequencyType = {}));
/** Additional Approach Types (additive to those defined in simplane). */
var AdditionalApproachType;
(function (AdditionalApproachType) {
    AdditionalApproachType[AdditionalApproachType["APPROACH_TYPE_VISUAL"] = 99] = "APPROACH_TYPE_VISUAL";
})(AdditionalApproachType || (AdditionalApproachType = {}));
/**
 * Flags indicating the approach fix type.
 */
var FixTypeFlags;
(function (FixTypeFlags) {
    FixTypeFlags[FixTypeFlags["None"] = 0] = "None";
    FixTypeFlags[FixTypeFlags["IAF"] = 1] = "IAF";
    FixTypeFlags[FixTypeFlags["IF"] = 2] = "IF";
    FixTypeFlags[FixTypeFlags["MAP"] = 4] = "MAP";
    FixTypeFlags[FixTypeFlags["FAF"] = 8] = "FAF";
    FixTypeFlags[FixTypeFlags["MAHP"] = 16] = "MAHP";
})(FixTypeFlags || (FixTypeFlags = {}));
/**
 * Flags indicating the rnav approach type.
 */
var RnavTypeFlags;
(function (RnavTypeFlags) {
    RnavTypeFlags[RnavTypeFlags["None"] = 0] = "None";
    RnavTypeFlags[RnavTypeFlags["LNAV"] = 1] = "LNAV";
    RnavTypeFlags[RnavTypeFlags["LNAVVNAV"] = 2] = "LNAVVNAV";
    RnavTypeFlags[RnavTypeFlags["LP"] = 4] = "LP";
    RnavTypeFlags[RnavTypeFlags["LPV"] = 8] = "LPV";
})(RnavTypeFlags || (RnavTypeFlags = {}));
/**
 * The class of airport facility.
 */
var AirportClass;
(function (AirportClass) {
    /** No other airport class could be identified. */
    AirportClass[AirportClass["None"] = 0] = "None";
    /** The airport has at least one hard surface runway. */
    AirportClass[AirportClass["HardSurface"] = 1] = "HardSurface";
    /** The airport has no hard surface runways. */
    AirportClass[AirportClass["SoftSurface"] = 2] = "SoftSurface";
    /** The airport has only water surface runways. */
    AirportClass[AirportClass["AllWater"] = 3] = "AllWater";
    /** The airport has no runways, but does contain helipads. */
    AirportClass[AirportClass["HeliportOnly"] = 4] = "HeliportOnly";
    /** The airport is a non-public use airport. */
    AirportClass[AirportClass["Private"] = 5] = "Private";
})(AirportClass || (AirportClass = {}));
/**
 * The class of an airport facility, expressed as a mask for nearest airport search session filtering.
 */
var AirportClassMask;
(function (AirportClassMask) {
    /** No other airport class could be identified. */
    AirportClassMask[AirportClassMask["None"] = 0] = "None";
    /** The airport has at least one hard surface runway. */
    AirportClassMask[AirportClassMask["HardSurface"] = 2] = "HardSurface";
    /** The airport has no hard surface runways. */
    AirportClassMask[AirportClassMask["SoftSurface"] = 4] = "SoftSurface";
    /** The airport has only water surface runways. */
    AirportClassMask[AirportClassMask["AllWater"] = 8] = "AllWater";
    /** The airport has no runways, but does contain helipads. */
    AirportClassMask[AirportClassMask["HeliportOnly"] = 16] = "HeliportOnly";
    /** The airport is a non-public use airport. */
    AirportClassMask[AirportClassMask["Private"] = 32] = "Private";
})(AirportClassMask || (AirportClassMask = {}));
var UserFacilityType;
(function (UserFacilityType) {
    UserFacilityType[UserFacilityType["RADIAL_RADIAL"] = 0] = "RADIAL_RADIAL";
    UserFacilityType[UserFacilityType["RADIAL_DISTANCE"] = 1] = "RADIAL_DISTANCE";
    UserFacilityType[UserFacilityType["LAT_LONG"] = 2] = "LAT_LONG";
})(UserFacilityType || (UserFacilityType = {}));
/**
 * ARINC 424 Leg Types
 */
var LegType;
(function (LegType) {
    /** An unknown leg type. */
    LegType[LegType["Unknown"] = 0] = "Unknown";
    /** An arc-to-fix leg. This indicates a DME arc leg to a specified fix.*/
    LegType[LegType["AF"] = 1] = "AF";
    /** A course-to-altitude leg. */
    LegType[LegType["CA"] = 2] = "CA";
    /**
     * A course-to-DME-distance leg. This leg is flown on a wind corrected course
     * to a specific DME distance from another fix.
     */
    LegType[LegType["CD"] = 3] = "CD";
    /** A course-to-fix leg.*/
    LegType[LegType["CF"] = 4] = "CF";
    /** A course-to-intercept leg. */
    LegType[LegType["CI"] = 5] = "CI";
    /** A course-to-radial intercept leg. */
    LegType[LegType["CR"] = 6] = "CR";
    /** A direct-to-fix leg, from an unspecified starting position. */
    LegType[LegType["DF"] = 7] = "DF";
    /**
     * A fix-to-altitude leg. A FA leg is flown on a track from a fix to a
     * specified altitude.
     */
    LegType[LegType["FA"] = 8] = "FA";
    /**
     * A fix-to-distance leg. This leg is flown on a track from a fix to a
     * specific distance from the fix.
     */
    LegType[LegType["FC"] = 9] = "FC";
    /**
     * A fix to DME distance leg. This leg is flown on a track from a fix to
     * a specific DME distance from another fix.
     */
    LegType[LegType["FD"] = 10] = "FD";
    /** A course-to-manual-termination leg. */
    LegType[LegType["FM"] = 11] = "FM";
    /** A hold-to-altitude leg. The hold is flown until a specified altitude is reached. */
    LegType[LegType["HA"] = 12] = "HA";
    /**
     * A hold-to-fix leg. This indicates one time around the hold circuit and
     * then an exit.
     */
    LegType[LegType["HF"] = 13] = "HF";
    /** A hold-to-manual-termination leg. */
    LegType[LegType["HM"] = 14] = "HM";
    /** Initial procedure fix. */
    LegType[LegType["IF"] = 15] = "IF";
    /** A procedure turn leg. */
    LegType[LegType["PI"] = 16] = "PI";
    /** A radius-to-fix leg, with endpoint fixes, a center fix, and a radius. */
    LegType[LegType["RF"] = 17] = "RF";
    /** A track-to-fix leg, from the previous fix to the terminator. */
    LegType[LegType["TF"] = 18] = "TF";
    /** A heading-to-altitude leg. */
    LegType[LegType["VA"] = 19] = "VA";
    /** A heading-to-DME-distance leg. */
    LegType[LegType["VD"] = 20] = "VD";
    /** A heading-to-intercept leg. */
    LegType[LegType["VI"] = 21] = "VI";
    /** A heading-to-manual-termination leg. */
    LegType[LegType["VM"] = 22] = "VM";
    /** A heading-to-radial intercept leg. */
    LegType[LegType["VR"] = 23] = "VR";
    /** A leg representing a discontinuity in the flight plan. */
    LegType[LegType["Discontinuity"] = 99] = "Discontinuity";
})(LegType || (LegType = {}));
/**
 * Types of altitude restrictions on procedure legs.
 */
var AltitudeRestrictionType;
(function (AltitudeRestrictionType) {
    AltitudeRestrictionType[AltitudeRestrictionType["Unused"] = 0] = "Unused";
    AltitudeRestrictionType[AltitudeRestrictionType["At"] = 1] = "At";
    AltitudeRestrictionType[AltitudeRestrictionType["AtOrAbove"] = 2] = "AtOrAbove";
    AltitudeRestrictionType[AltitudeRestrictionType["AtOrBelow"] = 3] = "AtOrBelow";
    AltitudeRestrictionType[AltitudeRestrictionType["Between"] = 4] = "Between";
})(AltitudeRestrictionType || (AltitudeRestrictionType = {}));
var LegTurnDirection;
(function (LegTurnDirection) {
    LegTurnDirection[LegTurnDirection["None"] = 0] = "None";
    LegTurnDirection[LegTurnDirection["Left"] = 1] = "Left";
    LegTurnDirection[LegTurnDirection["Right"] = 2] = "Right";
    LegTurnDirection[LegTurnDirection["Either"] = 3] = "Either";
})(LegTurnDirection || (LegTurnDirection = {}));
var AirwayType;
(function (AirwayType) {
    AirwayType[AirwayType["None"] = 0] = "None";
    AirwayType[AirwayType["Victor"] = 1] = "Victor";
    AirwayType[AirwayType["Jet"] = 2] = "Jet";
    AirwayType[AirwayType["Both"] = 3] = "Both";
})(AirwayType || (AirwayType = {}));
var NdbType;
(function (NdbType) {
    NdbType[NdbType["CompassPoint"] = 0] = "CompassPoint";
    NdbType[NdbType["MH"] = 1] = "MH";
    NdbType[NdbType["H"] = 2] = "H";
    NdbType[NdbType["HH"] = 3] = "HH";
})(NdbType || (NdbType = {}));
var VorType;
(function (VorType) {
    VorType[VorType["Unknown"] = 0] = "Unknown";
    VorType[VorType["VOR"] = 1] = "VOR";
    VorType[VorType["VORDME"] = 2] = "VORDME";
    VorType[VorType["DME"] = 3] = "DME";
    VorType[VorType["TACAN"] = 4] = "TACAN";
    VorType[VorType["VORTAC"] = 5] = "VORTAC";
    VorType[VorType["ILS"] = 6] = "ILS";
    VorType[VorType["VOT"] = 7] = "VOT";
})(VorType || (VorType = {}));
var RunwaySurfaceType;
(function (RunwaySurfaceType) {
    RunwaySurfaceType[RunwaySurfaceType["Concrete"] = 0] = "Concrete";
    RunwaySurfaceType[RunwaySurfaceType["Grass"] = 1] = "Grass";
    RunwaySurfaceType[RunwaySurfaceType["WaterFSX"] = 2] = "WaterFSX";
    RunwaySurfaceType[RunwaySurfaceType["GrassBumpy"] = 3] = "GrassBumpy";
    RunwaySurfaceType[RunwaySurfaceType["Asphalt"] = 4] = "Asphalt";
    RunwaySurfaceType[RunwaySurfaceType["ShortGrass"] = 5] = "ShortGrass";
    RunwaySurfaceType[RunwaySurfaceType["LongGrass"] = 6] = "LongGrass";
    RunwaySurfaceType[RunwaySurfaceType["HardTurf"] = 7] = "HardTurf";
    RunwaySurfaceType[RunwaySurfaceType["Snow"] = 8] = "Snow";
    RunwaySurfaceType[RunwaySurfaceType["Ice"] = 9] = "Ice";
    RunwaySurfaceType[RunwaySurfaceType["Urban"] = 10] = "Urban";
    RunwaySurfaceType[RunwaySurfaceType["Forest"] = 11] = "Forest";
    RunwaySurfaceType[RunwaySurfaceType["Dirt"] = 12] = "Dirt";
    RunwaySurfaceType[RunwaySurfaceType["Coral"] = 13] = "Coral";
    RunwaySurfaceType[RunwaySurfaceType["Gravel"] = 14] = "Gravel";
    RunwaySurfaceType[RunwaySurfaceType["OilTreated"] = 15] = "OilTreated";
    RunwaySurfaceType[RunwaySurfaceType["SteelMats"] = 16] = "SteelMats";
    RunwaySurfaceType[RunwaySurfaceType["Bituminous"] = 17] = "Bituminous";
    RunwaySurfaceType[RunwaySurfaceType["Brick"] = 18] = "Brick";
    RunwaySurfaceType[RunwaySurfaceType["Macadam"] = 19] = "Macadam";
    RunwaySurfaceType[RunwaySurfaceType["Planks"] = 20] = "Planks";
    RunwaySurfaceType[RunwaySurfaceType["Sand"] = 21] = "Sand";
    RunwaySurfaceType[RunwaySurfaceType["Shale"] = 22] = "Shale";
    RunwaySurfaceType[RunwaySurfaceType["Tarmac"] = 23] = "Tarmac";
    RunwaySurfaceType[RunwaySurfaceType["WrightFlyerTrack"] = 24] = "WrightFlyerTrack";
    //SURFACE_TYPE_LAST_FSX
    RunwaySurfaceType[RunwaySurfaceType["Ocean"] = 26] = "Ocean";
    RunwaySurfaceType[RunwaySurfaceType["Water"] = 27] = "Water";
    RunwaySurfaceType[RunwaySurfaceType["Pond"] = 28] = "Pond";
    RunwaySurfaceType[RunwaySurfaceType["Lake"] = 29] = "Lake";
    RunwaySurfaceType[RunwaySurfaceType["River"] = 30] = "River";
    RunwaySurfaceType[RunwaySurfaceType["WasteWater"] = 31] = "WasteWater";
    RunwaySurfaceType[RunwaySurfaceType["Paint"] = 32] = "Paint";
    // UNUSED
    // SURFACE_TYPE_ERASE_GRASS
})(RunwaySurfaceType || (RunwaySurfaceType = {}));
var RunwayLightingType;
(function (RunwayLightingType) {
    RunwayLightingType[RunwayLightingType["Unknown"] = 0] = "Unknown";
    RunwayLightingType[RunwayLightingType["None"] = 1] = "None";
    RunwayLightingType[RunwayLightingType["PartTime"] = 2] = "PartTime";
    RunwayLightingType[RunwayLightingType["FullTime"] = 3] = "FullTime";
    RunwayLightingType[RunwayLightingType["Frequency"] = 4] = "Frequency";
})(RunwayLightingType || (RunwayLightingType = {}));
var AirportPrivateType;
(function (AirportPrivateType) {
    AirportPrivateType[AirportPrivateType["Uknown"] = 0] = "Uknown";
    AirportPrivateType[AirportPrivateType["Public"] = 1] = "Public";
    AirportPrivateType[AirportPrivateType["Military"] = 2] = "Military";
    AirportPrivateType[AirportPrivateType["Private"] = 3] = "Private";
})(AirportPrivateType || (AirportPrivateType = {}));
var GpsBoolean;
(function (GpsBoolean) {
    GpsBoolean[GpsBoolean["Unknown"] = 0] = "Unknown";
    GpsBoolean[GpsBoolean["No"] = 1] = "No";
    GpsBoolean[GpsBoolean["Yes"] = 2] = "Yes";
})(GpsBoolean || (GpsBoolean = {}));
var VorClass;
(function (VorClass) {
    VorClass[VorClass["Unknown"] = 0] = "Unknown";
    VorClass[VorClass["Terminal"] = 1] = "Terminal";
    VorClass[VorClass["LowAlt"] = 2] = "LowAlt";
    VorClass[VorClass["HighAlt"] = 3] = "HighAlt";
    VorClass[VorClass["ILS"] = 4] = "ILS";
    VorClass[VorClass["VOT"] = 5] = "VOT";
})(VorClass || (VorClass = {}));
var FacilityType;
(function (FacilityType) {
    FacilityType["Airport"] = "LOAD_AIRPORT";
    FacilityType["Intersection"] = "LOAD_INTERSECTION";
    FacilityType["VOR"] = "LOAD_VOR";
    FacilityType["NDB"] = "LOAD_NDB";
    FacilityType["USR"] = "USR";
    FacilityType["RWY"] = "RWY";
    FacilityType["VIS"] = "VIS";
})(FacilityType || (FacilityType = {}));
var FacilitySearchType;
(function (FacilitySearchType) {
    FacilitySearchType[FacilitySearchType["None"] = 0] = "None";
    FacilitySearchType[FacilitySearchType["Airport"] = 1] = "Airport";
    FacilitySearchType[FacilitySearchType["Intersection"] = 2] = "Intersection";
    FacilitySearchType[FacilitySearchType["Vor"] = 3] = "Vor";
    FacilitySearchType[FacilitySearchType["Ndb"] = 4] = "Ndb";
    FacilitySearchType[FacilitySearchType["Boundary"] = 5] = "Boundary";
    FacilitySearchType[FacilitySearchType["User"] = 6] = "User";
})(FacilitySearchType || (FacilitySearchType = {}));
/**
 * A type of airspace boundary.
 */
var BoundaryType;
(function (BoundaryType) {
    BoundaryType[BoundaryType["None"] = 0] = "None";
    BoundaryType[BoundaryType["Center"] = 1] = "Center";
    BoundaryType[BoundaryType["ClassA"] = 2] = "ClassA";
    BoundaryType[BoundaryType["ClassB"] = 3] = "ClassB";
    BoundaryType[BoundaryType["ClassC"] = 4] = "ClassC";
    BoundaryType[BoundaryType["ClassD"] = 5] = "ClassD";
    BoundaryType[BoundaryType["ClassE"] = 6] = "ClassE";
    BoundaryType[BoundaryType["ClassF"] = 7] = "ClassF";
    BoundaryType[BoundaryType["ClassG"] = 8] = "ClassG";
    BoundaryType[BoundaryType["Tower"] = 9] = "Tower";
    BoundaryType[BoundaryType["Clearance"] = 10] = "Clearance";
    BoundaryType[BoundaryType["Ground"] = 11] = "Ground";
    BoundaryType[BoundaryType["Departure"] = 12] = "Departure";
    BoundaryType[BoundaryType["Approach"] = 13] = "Approach";
    BoundaryType[BoundaryType["MOA"] = 14] = "MOA";
    BoundaryType[BoundaryType["Restricted"] = 15] = "Restricted";
    BoundaryType[BoundaryType["Prohibited"] = 16] = "Prohibited";
    BoundaryType[BoundaryType["Warning"] = 17] = "Warning";
    BoundaryType[BoundaryType["Alert"] = 18] = "Alert";
    BoundaryType[BoundaryType["Danger"] = 19] = "Danger";
    BoundaryType[BoundaryType["NationalPark"] = 20] = "NationalPark";
    BoundaryType[BoundaryType["ModeC"] = 21] = "ModeC";
    BoundaryType[BoundaryType["Radar"] = 22] = "Radar";
    BoundaryType[BoundaryType["Training"] = 23] = "Training";
})(BoundaryType || (BoundaryType = {}));
/**
 * A type of airspace boundary altitude maxima.
 */
var BoundaryAltitudeType;
(function (BoundaryAltitudeType) {
    BoundaryAltitudeType[BoundaryAltitudeType["Unknown"] = 0] = "Unknown";
    BoundaryAltitudeType[BoundaryAltitudeType["MSL"] = 1] = "MSL";
    BoundaryAltitudeType[BoundaryAltitudeType["AGL"] = 2] = "AGL";
    BoundaryAltitudeType[BoundaryAltitudeType["Unlimited"] = 3] = "Unlimited";
})(BoundaryAltitudeType || (BoundaryAltitudeType = {}));
/**
 * A type of boundary geometry vector.
 */
var BoundaryVectorType;
(function (BoundaryVectorType) {
    BoundaryVectorType[BoundaryVectorType["None"] = 0] = "None";
    BoundaryVectorType[BoundaryVectorType["Start"] = 1] = "Start";
    BoundaryVectorType[BoundaryVectorType["Line"] = 2] = "Line";
    BoundaryVectorType[BoundaryVectorType["Origin"] = 3] = "Origin";
    BoundaryVectorType[BoundaryVectorType["ArcCW"] = 4] = "ArcCW";
    BoundaryVectorType[BoundaryVectorType["ArcCCW"] = 5] = "ArcCCW";
    BoundaryVectorType[BoundaryVectorType["Circle"] = 6] = "Circle";
})(BoundaryVectorType || (BoundaryVectorType = {}));
/**
 * Wind speed units used by METAR.
 */
var MetarWindSpeedUnits;
(function (MetarWindSpeedUnits) {
    MetarWindSpeedUnits[MetarWindSpeedUnits["Knot"] = 0] = "Knot";
    MetarWindSpeedUnits[MetarWindSpeedUnits["MeterPerSecond"] = 1] = "MeterPerSecond";
    MetarWindSpeedUnits[MetarWindSpeedUnits["KilometerPerHour"] = 2] = "KilometerPerHour";
})(MetarWindSpeedUnits || (MetarWindSpeedUnits = {}));
/** Visibility distance units used by METAR. */
var MetarVisibilityUnits;
(function (MetarVisibilityUnits) {
    MetarVisibilityUnits[MetarVisibilityUnits["Meter"] = 0] = "Meter";
    MetarVisibilityUnits[MetarVisibilityUnits["StatuteMile"] = 1] = "StatuteMile";
})(MetarVisibilityUnits || (MetarVisibilityUnits = {}));
/**
 * METAR cloud layer coverage/sky condition.
 */
var MetarCloudLayerCoverage;
(function (MetarCloudLayerCoverage) {
    MetarCloudLayerCoverage[MetarCloudLayerCoverage["SkyClear"] = 0] = "SkyClear";
    MetarCloudLayerCoverage[MetarCloudLayerCoverage["Clear"] = 1] = "Clear";
    MetarCloudLayerCoverage[MetarCloudLayerCoverage["NoSignificant"] = 2] = "NoSignificant";
    MetarCloudLayerCoverage[MetarCloudLayerCoverage["Few"] = 3] = "Few";
    MetarCloudLayerCoverage[MetarCloudLayerCoverage["Scattered"] = 4] = "Scattered";
    MetarCloudLayerCoverage[MetarCloudLayerCoverage["Broken"] = 5] = "Broken";
    MetarCloudLayerCoverage[MetarCloudLayerCoverage["Overcast"] = 6] = "Overcast";
})(MetarCloudLayerCoverage || (MetarCloudLayerCoverage = {}));
/**
 * METAR significant cloud types.
 */
var MetarCloudLayerType;
(function (MetarCloudLayerType) {
    MetarCloudLayerType[MetarCloudLayerType["Unspecified"] = -1] = "Unspecified";
    MetarCloudLayerType[MetarCloudLayerType["ToweringCumulus"] = 0] = "ToweringCumulus";
    MetarCloudLayerType[MetarCloudLayerType["Cumulonimbus"] = 1] = "Cumulonimbus";
    MetarCloudLayerType[MetarCloudLayerType["AltocumulusCastellanus"] = 2] = "AltocumulusCastellanus";
})(MetarCloudLayerType || (MetarCloudLayerType = {}));
/** METAR phenomenon types. */
var MetarPhenomenonType;
(function (MetarPhenomenonType) {
    MetarPhenomenonType[MetarPhenomenonType["None"] = 0] = "None";
    MetarPhenomenonType[MetarPhenomenonType["Mist"] = 1] = "Mist";
    MetarPhenomenonType[MetarPhenomenonType["Duststorm"] = 2] = "Duststorm";
    MetarPhenomenonType[MetarPhenomenonType["Dust"] = 3] = "Dust";
    MetarPhenomenonType[MetarPhenomenonType["Drizzle"] = 4] = "Drizzle";
    MetarPhenomenonType[MetarPhenomenonType["FunnelCloud"] = 5] = "FunnelCloud";
    MetarPhenomenonType[MetarPhenomenonType["Fog"] = 6] = "Fog";
    MetarPhenomenonType[MetarPhenomenonType["Smoke"] = 7] = "Smoke";
    MetarPhenomenonType[MetarPhenomenonType["Hail"] = 8] = "Hail";
    MetarPhenomenonType[MetarPhenomenonType["SmallHail"] = 9] = "SmallHail";
    MetarPhenomenonType[MetarPhenomenonType["Haze"] = 10] = "Haze";
    MetarPhenomenonType[MetarPhenomenonType["IceCrystals"] = 11] = "IceCrystals";
    MetarPhenomenonType[MetarPhenomenonType["IcePellets"] = 12] = "IcePellets";
    MetarPhenomenonType[MetarPhenomenonType["DustSandWhorls"] = 13] = "DustSandWhorls";
    MetarPhenomenonType[MetarPhenomenonType["Spray"] = 14] = "Spray";
    MetarPhenomenonType[MetarPhenomenonType["Rain"] = 15] = "Rain";
    MetarPhenomenonType[MetarPhenomenonType["Sand"] = 16] = "Sand";
    MetarPhenomenonType[MetarPhenomenonType["SnowGrains"] = 17] = "SnowGrains";
    MetarPhenomenonType[MetarPhenomenonType["Shower"] = 18] = "Shower";
    MetarPhenomenonType[MetarPhenomenonType["Snow"] = 19] = "Snow";
    MetarPhenomenonType[MetarPhenomenonType["Squalls"] = 20] = "Squalls";
    MetarPhenomenonType[MetarPhenomenonType["Sandstorm"] = 21] = "Sandstorm";
    MetarPhenomenonType[MetarPhenomenonType["UnknownPrecip"] = 22] = "UnknownPrecip";
    MetarPhenomenonType[MetarPhenomenonType["VolcanicAsh"] = 23] = "VolcanicAsh";
})(MetarPhenomenonType || (MetarPhenomenonType = {}));
/** METAR phenomenon intensities. */
var MetarPhenomenonIntensity;
(function (MetarPhenomenonIntensity) {
    MetarPhenomenonIntensity[MetarPhenomenonIntensity["Light"] = -1] = "Light";
    MetarPhenomenonIntensity[MetarPhenomenonIntensity["Normal"] = 0] = "Normal";
    MetarPhenomenonIntensity[MetarPhenomenonIntensity["Heavy"] = 1] = "Heavy";
})(MetarPhenomenonIntensity || (MetarPhenomenonIntensity = {}));

({
    [RunwayDesignator.RUNWAY_DESIGNATOR_NONE]: '',
    [RunwayDesignator.RUNWAY_DESIGNATOR_LEFT]: 'L',
    [RunwayDesignator.RUNWAY_DESIGNATOR_RIGHT]: 'R',
    [RunwayDesignator.RUNWAY_DESIGNATOR_CENTER]: 'C',
    [RunwayDesignator.RUNWAY_DESIGNATOR_WATER]: 'W',
    [RunwayDesignator.RUNWAY_DESIGNATOR_A]: 'A',
    [RunwayDesignator.RUNWAY_DESIGNATOR_B]: 'B',
});
new GeoPoint(0, 0);

/// <reference types="msfstypes/JS/common" />
/**
 * A type map of facility type to facility search type.
 */
({
    /** Airport facility type. */
    [FacilityType.Airport]: FacilitySearchType.Airport,
    /** Intersection facility type. */
    [FacilityType.Intersection]: FacilitySearchType.Intersection,
    /** NDB facility type. */
    [FacilityType.NDB]: FacilitySearchType.Ndb,
    /** VOR facility type. */
    [FacilityType.VOR]: FacilitySearchType.Vor,
    /** USR facility type. */
    [FacilityType.USR]: FacilitySearchType.User
});
[FacilityType.USR];
/**
 * WT Airway Status Enum
 */
var AirwayStatus;
(function (AirwayStatus) {
    /**
     * @readonly
     * @property {number} INCOMPLETE - indicates waypoints have not been loaded yet.
     */
    AirwayStatus[AirwayStatus["INCOMPLETE"] = 0] = "INCOMPLETE";
    /**
     * @readonly
     * @property {number} COMPLETE - indicates all waypoints have been successfully loaded.
     */
    AirwayStatus[AirwayStatus["COMPLETE"] = 1] = "COMPLETE";
    /**
     * @readonly
     * @property {number} PARTIAL - indicates some, but not all, waypoints have been successfully loaded.
     */
    AirwayStatus[AirwayStatus["PARTIAL"] = 2] = "PARTIAL";
})(AirwayStatus || (AirwayStatus = {}));

var FacilityRepositorySyncType;
(function (FacilityRepositorySyncType) {
    FacilityRepositorySyncType[FacilityRepositorySyncType["Add"] = 0] = "Add";
    FacilityRepositorySyncType[FacilityRepositorySyncType["Remove"] = 1] = "Remove";
    FacilityRepositorySyncType[FacilityRepositorySyncType["DumpRequest"] = 2] = "DumpRequest";
    FacilityRepositorySyncType[FacilityRepositorySyncType["DumpResponse"] = 3] = "DumpResponse";
})(FacilityRepositorySyncType || (FacilityRepositorySyncType = {}));

/**
 * A type map of search type to concrete facility loader query type.
 */
new Map([
    [FacilitySearchType.Airport, FacilityType.Airport],
    [FacilitySearchType.Intersection, FacilityType.Intersection],
    [FacilitySearchType.Vor, FacilityType.VOR],
    [FacilitySearchType.Ndb, FacilityType.NDB],
    [FacilitySearchType.User, FacilityType.USR]
]);

[new GeoCircle(new Float64Array(3), 0)];

var IcaoSearchFilter;
(function (IcaoSearchFilter) {
    IcaoSearchFilter[IcaoSearchFilter["ALL"] = 0] = "ALL";
    IcaoSearchFilter[IcaoSearchFilter["AIRPORT"] = 1] = "AIRPORT";
    IcaoSearchFilter[IcaoSearchFilter["VOR"] = 2] = "VOR";
    IcaoSearchFilter[IcaoSearchFilter["NDB"] = 3] = "NDB";
    IcaoSearchFilter[IcaoSearchFilter["INTERSECTION"] = 4] = "INTERSECTION";
    IcaoSearchFilter[IcaoSearchFilter["USR"] = 5] = "USR";
})(IcaoSearchFilter || (IcaoSearchFilter = {}));

/// <reference types="msfstypes/JS/simvar" />
/**
 * A publisher for basic ADC/AHRS information.
 */
class ADCPublisher extends SimVarPublisher {
    /**
     * Create an ADCPublisher
     * @param bus The EventBus to publish to
     * @param pacer An optional pacer to use to control the rate of publishing
     */
    constructor(bus, pacer = undefined) {
        super(ADCPublisher.simvars, bus, pacer);
    }
    /**
     * Updates the ADC publisher.
     */
    onUpdate() {
        super.onUpdate();
    }
}
ADCPublisher.simvars = new Map([
    ['ias', { name: 'AIRSPEED INDICATED', type: SimVarValueType.Knots }],
    ['tas', { name: 'AIRSPEED TRUE', type: SimVarValueType.Knots }],
    ['alt', { name: 'INDICATED ALTITUDE', type: SimVarValueType.Feet }],
    ['vs', { name: 'VERTICAL SPEED', type: SimVarValueType.FPM }],
    ['hdg_deg', { name: 'PLANE HEADING DEGREES MAGNETIC', type: SimVarValueType.Degree }],
    ['pitch_deg', { name: 'PLANE PITCH DEGREES', type: SimVarValueType.Degree }],
    ['roll_deg', { name: 'PLANE BANK DEGREES', type: SimVarValueType.Degree }],
    ['hdg_deg_true', { name: 'PLANE HEADING DEGREES TRUE', type: SimVarValueType.Degree }],
    ['kohlsman_setting_hg_1', { name: 'KOHLSMAN SETTING HG', type: SimVarValueType.InHG }],
    ['turn_coordinator_ball', { name: 'TURN COORDINATOR BALL', type: SimVarValueType.Number }],
    ['delta_heading_rate', { name: 'DELTA HEADING RATE', type: SimVarValueType.Degree }],
    ['ambient_temp_c', { name: 'AMBIENT TEMPERATURE', type: SimVarValueType.Celsius }],
    ['ambient_wind_velocity', { name: 'AMBIENT WIND VELOCITY', type: SimVarValueType.Knots }],
    ['ambient_wind_direction', { name: 'AMBIENT WIND DIRECTION', type: SimVarValueType.Degree }],
    ['kohlsman_setting_mb_1', { name: 'KOHLSMAN SETTING MB', type: SimVarValueType.MB }],
    ['baro_units_hpa_1', { name: 'L:XMLVAR_Baro_Selector_HPA_1', type: SimVarValueType.Bool }],
    ['on_ground', { name: 'SIM ON GROUND', type: SimVarValueType.Bool }],
    ['aoa', { name: 'INCIDENCE ALPHA', type: SimVarValueType.Degree }]
]);

// Common definitions relevant to all radio types.
/** The basic radio types. */
var RadioType;
(function (RadioType) {
    RadioType["Com"] = "COM";
    RadioType["Nav"] = "NAV";
    RadioType["Adf"] = "ADF";
})(RadioType || (RadioType = {}));
/** The two frequency "banks", active and standby. */
var FrequencyBank;
(function (FrequencyBank) {
    FrequencyBank[FrequencyBank["Active"] = 0] = "Active";
    FrequencyBank[FrequencyBank["Standby"] = 1] = "Standby";
})(FrequencyBank || (FrequencyBank = {}));
/** COM frequency spacing on COM radios. */
var ComSpacing;
(function (ComSpacing) {
    /** 25Khz spacing */
    ComSpacing[ComSpacing["Spacing25Khz"] = 0] = "Spacing25Khz";
    /** 8.33Khz spacing */
    ComSpacing[ComSpacing["Spacing833Khz"] = 1] = "Spacing833Khz";
})(ComSpacing || (ComSpacing = {}));

/// <reference types="msfstypes/JS/simvar" />
/** Publish simvars for ourselves */
class NavProcSimVarPublisher extends SimVarPublisher {
    /**
     * Create a NavProcSimVarPublisher
     * @param bus The EventBus to publish to
     * @param pacer An optional pacer to use to control the pace of publishing
     */
    constructor(bus, pacer = undefined) {
        super(NavProcSimVarPublisher.simvars, bus, pacer);
    }
}
NavProcSimVarPublisher.simvars = new Map([
    ['nav1_obs', { name: 'NAV OBS:1', type: SimVarValueType.Degree }],
    ['nav1_cdi', { name: 'NAV CDI:1', type: SimVarValueType.Number }],
    ['nav1_dme', { name: 'NAV DME:1', type: SimVarValueType.NM }],
    ['nav1_has_dme', { name: 'NAV HAS DME:1', type: SimVarValueType.Bool }],
    ['nav1_has_nav', { name: 'NAV HAS NAV:1', type: SimVarValueType.Bool }],
    ['nav1_radial', { name: 'NAV RADIAL:1', type: SimVarValueType.Radians }],
    ['nav1_signal', { name: 'NAV SIGNAL:1', type: SimVarValueType.Number }],
    ['nav1_ident', { name: 'NAV IDENT:1', type: SimVarValueType.String }],
    ['nav1_to_from', { name: 'NAV TOFROM:1', type: SimVarValueType.Enum }],
    ['nav1_localizer', { name: 'NAV HAS LOCALIZER:1', type: SimVarValueType.Bool }],
    ['nav1_localizer_crs', { name: 'NAV LOCALIZER:1', type: SimVarValueType.Number }],
    ['nav1_glideslope', { name: 'NAV HAS GLIDE SLOPE:1', type: SimVarValueType.Bool }],
    ['nav1_gs_error', { name: 'NAV GLIDE SLOPE ERROR:1', type: SimVarValueType.Degree }],
    ['nav1_raw_gs', { name: 'NAV RAW GLIDE SLOPE:1', type: SimVarValueType.Degree }],
    ['nav1_gs_lla', { name: 'NAV GS LATLONALT:1', type: SimVarValueType.LLA }],
    ['nav1_lla', { name: 'NAV VOR LATLONALT:1', type: SimVarValueType.LLA }],
    ['nav1_magvar', { name: 'NAV MAGVAR:1', type: SimVarValueType.Number }],
    ['nav2_obs', { name: 'NAV OBS:2', type: SimVarValueType.Degree }],
    ['nav2_cdi', { name: 'NAV CDI:2', type: SimVarValueType.Number }],
    ['nav2_dme', { name: 'NAV DME:2', type: SimVarValueType.NM }],
    ['nav2_has_dme', { name: 'NAV HAS DME:2', type: SimVarValueType.Bool }],
    ['nav2_has_nav', { name: 'NAV HAS NAV:2', type: SimVarValueType.Bool }],
    ['nav2_radial', { name: 'NAV RADIAL:2', type: SimVarValueType.Radians }],
    ['nav2_signal', { name: 'NAV SIGNAL:2', type: SimVarValueType.Number }],
    ['nav2_ident', { name: 'NAV IDENT:2', type: SimVarValueType.String }],
    ['nav2_to_from', { name: 'NAV TOFROM:2', type: SimVarValueType.Enum }],
    ['nav2_localizer', { name: 'NAV HAS LOCALIZER:2', type: SimVarValueType.Bool }],
    ['nav2_localizer_crs', { name: 'NAV LOCALIZER:2', type: SimVarValueType.Number }],
    ['nav2_glideslope', { name: 'NAV HAS GLIDE SLOPE:2', type: SimVarValueType.Bool }],
    ['nav2_gs_error', { name: 'NAV GLIDE SLOPE ERROR:2', type: SimVarValueType.Degree }],
    ['nav2_raw_gs', { name: 'NAV RAW GLIDE SLOPE:2', type: SimVarValueType.Degree }],
    ['nav2_gs_lla', { name: 'NAV GS LATLONALT:2', type: SimVarValueType.LLA }],
    ['nav2_lla', { name: 'NAV VOR LATLONALT:2', type: SimVarValueType.LLA }],
    ['nav2_magvar', { name: 'NAV MAGVAR:2', type: SimVarValueType.Number }],
    ['gps_dtk', { name: 'GPS WP DESIRED TRACK', type: SimVarValueType.Degree }],
    ['gps_xtk', { name: 'GPS WP CROSS TRK', type: SimVarValueType.NM }],
    ['gps_wp', { name: 'GPS WP NEXT ID', type: SimVarValueType.NM }],
    ['gps_wp_bearing', { name: 'GPS WP BEARING', type: SimVarValueType.Degree }],
    ['gps_wp_distance', { name: 'GPS WP DISTANCE', type: SimVarValueType.NM }],
    ['adf1_bearing', { name: 'ADF RADIAL:1', type: SimVarValueType.Radians }],
    ['adf1_signal', { name: 'ADF SIGNAL:1', type: SimVarValueType.Number }],
    ['mkr_bcn_state_simvar', { name: 'MARKER BEACON STATE', type: SimVarValueType.Number }],
    ['gps_obs_active_simvar', { name: 'GPS OBS ACTIVE', type: SimVarValueType.Bool }],
    ['gps_obs_value_simvar', { name: 'GPS OBS VALUE', type: SimVarValueType.Degree }]
]);
//
// Navigation event configurations
//
var NavSourceType;
(function (NavSourceType) {
    NavSourceType[NavSourceType["Nav"] = 0] = "Nav";
    NavSourceType[NavSourceType["Gps"] = 1] = "Gps";
    NavSourceType[NavSourceType["Adf"] = 2] = "Adf";
})(NavSourceType || (NavSourceType = {}));
//* ENUM for VOR To/From Flag */
var VorToFrom;
(function (VorToFrom) {
    VorToFrom[VorToFrom["OFF"] = 0] = "OFF";
    VorToFrom[VorToFrom["TO"] = 1] = "TO";
    VorToFrom[VorToFrom["FROM"] = 2] = "FROM";
})(VorToFrom || (VorToFrom = {}));
/** Marker beacon signal state. */
var MarkerBeaconState;
(function (MarkerBeaconState) {
    MarkerBeaconState[MarkerBeaconState["Inactive"] = 0] = "Inactive";
    MarkerBeaconState[MarkerBeaconState["Outer"] = 1] = "Outer";
    MarkerBeaconState[MarkerBeaconState["Middle"] = 2] = "Middle";
    MarkerBeaconState[MarkerBeaconState["Inner"] = 3] = "Inner";
})(MarkerBeaconState || (MarkerBeaconState = {}));

/** A publisher to poll and publish nav/com simvars. */
class NavComSimVarPublisher extends SimVarPublisher {
    /**
     * Create a NavComSimVarPublisher
     * @param bus The EventBus to publish to
     * @param pacer An optional pacer to use to control the pace of publishing
     */
    constructor(bus, pacer = undefined) {
        super(NavComSimVarPublisher.simvars, bus, pacer);
    }
}
NavComSimVarPublisher.simvars = new Map([
    ['nav1ActiveFreq', { name: 'NAV ACTIVE FREQUENCY:1', type: SimVarValueType.MHz }],
    ['nav1StandbyFreq', { name: 'NAV STANDBY FREQUENCY:1', type: SimVarValueType.MHz }],
    ['nav1Ident', { name: 'NAV IDENT:1', type: SimVarValueType.String }],
    ['nav2ActiveFreq', { name: 'NAV ACTIVE FREQUENCY:2', type: SimVarValueType.MHz }],
    ['nav2StandbyFreq', { name: 'NAV STANDBY FREQUENCY:2', type: SimVarValueType.MHz }],
    ['nav2Ident', { name: 'NAV IDENT:2', type: SimVarValueType.String }],
    ['com1ActiveFreq', { name: 'COM ACTIVE FREQUENCY:1', type: SimVarValueType.MHz }],
    ['com1StandbyFreq', { name: 'COM STANDBY FREQUENCY:1', type: SimVarValueType.MHz }],
    ['com2ActiveFreq', { name: 'COM ACTIVE FREQUENCY:2', type: SimVarValueType.MHz }],
    ['com2StandbyFreq', { name: 'COM STANDBY FREQUENCY:2', type: SimVarValueType.MHz }],
    ['adf1StandbyFreq', { name: 'ADF STANDBY FREQUENCY:1', type: SimVarValueType.KHz }],
    ['adf1ActiveFreq', { name: 'ADF ACTIVE FREQUENCY:1', type: SimVarValueType.KHz }]
]);

/// <reference types="msfstypes/JS/simvar" />
var APLockType;
(function (APLockType) {
    APLockType[APLockType["Heading"] = 0] = "Heading";
    APLockType[APLockType["Nav"] = 1] = "Nav";
    APLockType[APLockType["Alt"] = 2] = "Alt";
    APLockType[APLockType["Bank"] = 3] = "Bank";
    APLockType[APLockType["WingLevel"] = 4] = "WingLevel";
    APLockType[APLockType["Vs"] = 5] = "Vs";
    APLockType[APLockType["Flc"] = 6] = "Flc";
    APLockType[APLockType["Pitch"] = 7] = "Pitch";
    APLockType[APLockType["Approach"] = 8] = "Approach";
    APLockType[APLockType["Backcourse"] = 9] = "Backcourse";
    APLockType[APLockType["Glideslope"] = 10] = "Glideslope";
    APLockType[APLockType["VNav"] = 11] = "VNav";
})(APLockType || (APLockType = {}));
/** base publisher for simvars */
class APSimVarPublisher extends SimVarPublisher {
    /**
     * Create an APSimVarPublisher
     * @param bus The EventBus to publish to
     * @param pacer An optional pacer to use to control the pace of publishing
     */
    constructor(bus, pacer = undefined) {
        super(APSimVarPublisher.simvars, bus, pacer);
    }
}
APSimVarPublisher.simvars = new Map([
    // TODO extend the next two to handle multiple APs?
    ['selected_heading', { name: 'AUTOPILOT HEADING LOCK DIR:1', type: SimVarValueType.Degree }],
    ['selected_altitude', { name: 'AUTOPILOT ALTITUDE LOCK VAR:1', type: SimVarValueType.Feet }],
    ['ap_master_status', { name: 'AUTOPILOT MASTER', type: SimVarValueType.Bool }],
    ['ap_heading_lock', { name: 'AUTOPILOT HEADING LOCK', type: SimVarValueType.Bool }],
    ['ap_nav_lock', { name: 'AUTOPILOT NAV1 LOCK', type: SimVarValueType.Bool }],
    ['ap_bank_hold', { name: 'AUTOPILOT BANK HOLD', type: SimVarValueType.Bool }],
    ['ap_wing_lvl', { name: 'AUTOPILOT WING LEVELER', type: SimVarValueType.Bool }],
    ['ap_approach_hold', { name: 'AUTOPILOT APPROACH HOLD', type: SimVarValueType.Bool }],
    ['ap_backcourse_hold', { name: 'AUTOPILOT BACKCOURSE HOLD', type: SimVarValueType.Bool }],
    ['ap_vs_hold', { name: 'AUTOPILOT VERTICAL HOLD', type: SimVarValueType.Bool }],
    ['ap_flc_hold', { name: 'AUTOPILOT FLIGHT LEVEL CHANGE', type: SimVarValueType.Bool }],
    ['ap_alt_lock', { name: 'AUTOPILOT ALTITUDE LOCK', type: SimVarValueType.Bool }],
    ['ap_glideslope_hold', { name: 'AUTOPILOT GLIDESLOPE HOLD', type: SimVarValueType.Bool }],
    ['ap_pitch_hold', { name: 'AUTOPILOT PITCH HOLD', type: SimVarValueType.Bool }],
    ['vs_hold_fpm', { name: 'AUTOPILOT VERTICAL HOLD VAR:1', type: SimVarValueType.FPM }],
    ['flc_hold_knots', { name: 'AUTOPILOT AIRSPEED HOLD VAR', type: SimVarValueType.Knots }],
    ['flight_director_bank', { name: 'AUTOPILOT FLIGHT DIRECTOR BANK', type: SimVarValueType.Degree }],
    ['flight_director_pitch', { name: 'AUTOPILOT FLIGHT DIRECTOR PITCH', type: SimVarValueType.Degree }],
    ['flight_director_lock', { name: 'AUTOPILOT FLIGHT DIRECTOR ACTIVE', type: SimVarValueType.Bool }],
    ['vnav_active', { name: 'L:XMLVAR_VNAVButtonValue', type: SimVarValueType.Bool }],
    ['alt_lock', { name: 'AUTOPILOT ALTITUDE LOCK', type: SimVarValueType.Bool }],
    ['pitch_ref', { name: 'AUTOPILOT PITCH HOLD REF', type: SimVarValueType.Degree }],
    ['kap_140_simvar', { name: 'L:WT1000_AP_KAP140_INSTALLED', type: SimVarValueType.Bool }]
]);

/// <reference types="msfstypes/JS/simvar" />
/**
 * A publisher for Engine information.
 */
class EISPublisher extends SimVarPublisher {
    /**
     * Create an EISPublisher
     * @param bus The EventBus to publish to
     * @param pacer An optional pacer to use to control the rate of publishing
     */
    constructor(bus, pacer = undefined) {
        const simvars = new Map(EISPublisher.simvars);
        // add engine-indexed simvars
        const engineCount = SimVar.GetSimVarValue('NUMBER OF ENGINES', SimVarValueType.Number);
        for (let i = 1; i <= engineCount; i++) {
            simvars.set(`fuel_flow_${i}`, { name: `ENG FUEL FLOW GPH:${i}`, type: SimVarValueType.GPH });
        }
        super(simvars, bus, pacer);
        this.engineCount = engineCount;
    }
    /** @inheritdoc */
    onUpdate() {
        super.onUpdate();
        if (this.subscribed.has('fuel_flow_total')) {
            let totalFuelFlow = 0;
            for (let i = 1; i <= this.engineCount; i++) {
                totalFuelFlow += SimVar.GetSimVarValue(`ENG FUEL FLOW GPH:${i}`, SimVarValueType.GPH);
            }
            this.publish('fuel_flow_total', totalFuelFlow);
        }
    }
}
EISPublisher.simvars = new Map([
    ['rpm_1', { name: 'GENERAL ENG RPM:1', type: SimVarValueType.RPM }],
    ['recip_ff_1', { name: 'RECIP ENG FUEL FLOW:1', type: SimVarValueType.PPH }],
    ['oil_press_1', { name: 'ENG OIL PRESSURE:1', type: SimVarValueType.PSI }],
    ['oil_temp_1', { name: 'ENG OIL TEMPERATURE:1', type: SimVarValueType.Farenheit }],
    ['egt_1', { name: 'ENG EXHAUST GAS TEMPERATURE:1', type: SimVarValueType.Farenheit }],
    ['vac', { name: 'SUCTION PRESSURE', type: SimVarValueType.InHG }],
    ['fuel_total', { name: 'FUEL TOTAL QUANTITY', type: SimVarValueType.GAL }],
    ['fuel_left', { name: 'FUEL LEFT QUANTITY', type: SimVarValueType.GAL }],
    ['fuel_right', { name: 'FUEL RIGHT QUANTITY', type: SimVarValueType.GAL }],
    ['eng_hours_1', { name: 'GENERAL ENG ELAPSED TIME:1', type: SimVarValueType.Hours }],
    ['elec_bus_main_v', { name: 'ELECTRICAL MAIN BUS VOLTAGE', type: SimVarValueType.Volts }],
    ['elec_bus_main_a', { name: 'ELECTRICAL MAIN BUS AMPS', type: SimVarValueType.Amps }],
    ['elec_bus_avionics_v', { name: 'ELECTRICAL AVIONICS BUS VOLTAGE', type: SimVarValueType.Volts }],
    ['elec_bus_avionics_a', { name: 'ELECTRICAL AVIONICS BUS AMPS', type: SimVarValueType.Amps }],
    ['elec_bus_genalt_1_v', { name: 'ELECTRICAL GENALT BUS VOLTAGE:1', type: SimVarValueType.Volts }],
    ['elec_bus_genalt_1_a', { name: 'ELECTRICAL GENALT BUS AMPS:1', type: SimVarValueType.Amps }],
    ['elec_bat_a', { name: 'ELECTRICAL BATTERY LOAD', type: SimVarValueType.Amps }],
    ['elec_bat_v', { name: 'ELECTRICAL BATTERY VOLTAGE', type: SimVarValueType.Volts }]
]);

/** Transponder modes. */
var XPDRMode;
(function (XPDRMode) {
    XPDRMode[XPDRMode["OFF"] = 0] = "OFF";
    XPDRMode[XPDRMode["STBY"] = 1] = "STBY";
    XPDRMode[XPDRMode["TEST"] = 2] = "TEST";
    XPDRMode[XPDRMode["ON"] = 3] = "ON";
    XPDRMode[XPDRMode["ALT"] = 4] = "ALT";
    XPDRMode[XPDRMode["GROUND"] = 5] = "GROUND";
})(XPDRMode || (XPDRMode = {}));
/** A publiher to poll transponder simvars. */
class XPDRSimVarPublisher extends SimVarPublisher {
    /**
     * Create an XPDRSimVarPublisher
     * @param bus The EventBus to publish to
     * @param pacer An optional pacer to use to control the pace of publishing
     */
    constructor(bus, pacer = undefined) {
        super(XPDRSimVarPublisher.simvars, bus, pacer);
    }
}
XPDRSimVarPublisher.simvars = new Map([
    ['xpdrMode1', { name: 'TRANSPONDER STATE:1', type: SimVarValueType.Number }],
    ['xpdrCode1', { name: 'TRANSPONDER CODE:1', type: SimVarValueType.Number }],
    ['xpdrIdent', { name: 'TRANSPONDER IDENT:1', type: SimVarValueType.Bool }]
]);

new GeoPoint(0, 0);

/// <reference types="msfstypes/JS/simvar" />
/**
 * A publisher for electrical information.
 */
class ElectricalPublisher extends SimVarPublisher {
    /**
     * Create an ElectricalPublisher
     * @param bus The EventBus to publish to
     * @param pacer An optional pacer to use to control the rate of publishing
     */
    constructor(bus, pacer = undefined) {
        super(ElectricalPublisher.simvars, bus, pacer);
    }
    /** @inheritdoc */
    onUpdate() {
        super.onUpdate();
        if (this.av1BusLogic && this.subscribed.has('elec_av1_bus')) {
            this.publish('elec_av1_bus', this.av1BusLogic.getValue() !== 0);
        }
        if (this.av2BusLogic && this.subscribed.has('elec_av2_bus')) {
            this.publish('elec_av2_bus', this.av2BusLogic.getValue() !== 0);
        }
    }
    /**
     * Sets the logic element to use for the avionics 1 bus.
     * @param logicElement The logic element to use.
     */
    setAv1Bus(logicElement) {
        this.av1BusLogic = logicElement;
    }
    /**
     * Sets the logic element to use for the avionics 2 bus.
     * @param logicElement The logic element to use.
     */
    setAv2Bus(logicElement) {
        this.av2BusLogic = logicElement;
    }
}
ElectricalPublisher.simvars = new Map([
    ['elec_master_battery', { name: 'ELECTRICAL MASTER BATTERY', type: SimVarValueType.Bool }],
    ['elec_circuit_avionics_on', { name: 'CIRCUIT AVIONICS ON', type: SimVarValueType.Bool }],
    ['elec_circuit_navcom1_on', { name: 'CIRCUIT NAVCOM1 ON', type: SimVarValueType.Bool }],
    ['elec_circuit_navcom2_on', { name: 'CIRCUIT NAVCOM2 ON', type: SimVarValueType.Bool }],
    ['elec_circuit_navcom3_on', { name: 'CIRCUIT NAVCOM3 ON', type: SimVarValueType.Bool }]
]);

/**
 * The transition type to which a flight path vector belongs.
 */
var FlightPathVectorFlags;
(function (FlightPathVectorFlags) {
    FlightPathVectorFlags[FlightPathVectorFlags["None"] = 0] = "None";
    FlightPathVectorFlags[FlightPathVectorFlags["TurnToCourse"] = 1] = "TurnToCourse";
    FlightPathVectorFlags[FlightPathVectorFlags["Arc"] = 2] = "Arc";
    FlightPathVectorFlags[FlightPathVectorFlags["HoldEntry"] = 4] = "HoldEntry";
    FlightPathVectorFlags[FlightPathVectorFlags["HoldLeg"] = 8] = "HoldLeg";
    FlightPathVectorFlags[FlightPathVectorFlags["CourseReversal"] = 16] = "CourseReversal";
    FlightPathVectorFlags[FlightPathVectorFlags["LegToLegTurn"] = 32] = "LegToLegTurn";
    FlightPathVectorFlags[FlightPathVectorFlags["AnticipatedTurn"] = 64] = "AnticipatedTurn";
})(FlightPathVectorFlags || (FlightPathVectorFlags = {}));
/**
 * A prototype for signalling application-specific type metadata for plan segments.
 */
var FlightPlanSegmentType;
(function (FlightPlanSegmentType) {
    FlightPlanSegmentType["Origin"] = "Origin";
    FlightPlanSegmentType["Departure"] = "Departure";
    FlightPlanSegmentType["Enroute"] = "Enroute";
    FlightPlanSegmentType["Arrival"] = "Arrival";
    FlightPlanSegmentType["Approach"] = "Approach";
    FlightPlanSegmentType["Destination"] = "Destination";
    FlightPlanSegmentType["MissedApproach"] = "MissedApproach";
    FlightPlanSegmentType["RandomDirectTo"] = "RandomDirectTo";
})(FlightPlanSegmentType || (FlightPlanSegmentType = {}));
/**
 * A segment of a flight plan.
 */
class FlightPlanSegment {
    /**
     * Creates a new FlightPlanSegment.
     * @param segmentIndex The index of the segment within the flight plan.
     * @param offset The leg offset within the original flight plan that
     * the segment starts at.
     * @param legs The legs in the flight plan segment.
     * @param segmentType The type of segment this is.
     * @param airway The airway associated with this segment, if any.
     */
    constructor(segmentIndex, offset, legs, segmentType = FlightPlanSegmentType.Enroute, airway) {
        this.segmentIndex = segmentIndex;
        this.offset = offset;
        this.legs = legs;
        this.segmentType = segmentType;
        this.airway = airway;
    }
}
/** An empty flight plan segment. */
FlightPlanSegment.Empty = new FlightPlanSegment(-1, -1, []);
/**
 * Bitflags describing a leg definition.
 */
var LegDefinitionFlags;
(function (LegDefinitionFlags) {
    LegDefinitionFlags[LegDefinitionFlags["None"] = 0] = "None";
    LegDefinitionFlags[LegDefinitionFlags["DirectTo"] = 1] = "DirectTo";
    LegDefinitionFlags[LegDefinitionFlags["MissedApproach"] = 2] = "MissedApproach";
    LegDefinitionFlags[LegDefinitionFlags["Obs"] = 4] = "Obs";
    LegDefinitionFlags[LegDefinitionFlags["VectorsToFinal"] = 8] = "VectorsToFinal";
})(LegDefinitionFlags || (LegDefinitionFlags = {}));

[new GeoPoint(0, 0), new GeoPoint(0, 0)];
[new GeoCircle(new Float64Array(3), 0)];

/* eslint-disable @typescript-eslint/no-non-null-assertion */
[new GeoPoint(0, 0), new GeoPoint(0, 0)];
[new GeoCircle(new Float64Array(3), 0)];
[new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0)];
[new GeoCircle(new Float64Array(3), 0)];
[new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0)];
[new GeoCircle(new Float64Array(3), 0)];
[new GeoCircle(new Float64Array(3), 0), new GeoCircle(new Float64Array(3), 0)];
[
    new GeoCircle(new Float64Array(3), 0),
    new GeoCircle(new Float64Array(3), 0),
    new GeoCircle(new Float64Array(3), 0),
    new GeoCircle(new Float64Array(3), 0),
    new GeoCircle(new Float64Array(3), 0)
];
[new GeoCircle(new Float64Array(3), 0), new GeoCircle(new Float64Array(3), 0), new GeoCircle(new Float64Array(3), 0)];
[new GeoCircle(new Float64Array(3), 0), new GeoCircle(new Float64Array(3), 0), new GeoCircle(new Float64Array(3), 0)];
[
    new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0),
    new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0)
];
[new GeoCircle(new Float64Array(3), 0)];

[new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0)];
[
    new GeoCircle(new Float64Array(3), 0), new GeoCircle(new Float64Array(3), 0),
    new GeoCircle(new Float64Array(3), 0), new GeoCircle(new Float64Array(3), 0)
];
[new GeoPoint(0, 0), new GeoPoint(0, 0)];
({
    geoPoint: [new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0)],
    geoCircle: [new GeoCircle(new Float64Array(3), 0), new GeoCircle(new Float64Array(3), 0)]
});

var PlanChangeType;
(function (PlanChangeType) {
    PlanChangeType["Added"] = "Added";
    PlanChangeType["Inserted"] = "Inserted";
    PlanChangeType["Removed"] = "Removed";
    PlanChangeType["Changed"] = "Changed";
    PlanChangeType["Cleared"] = "Cleared";
})(PlanChangeType || (PlanChangeType = {}));
var ActiveLegType;
(function (ActiveLegType) {
    ActiveLegType["Lateral"] = "Lateral";
    ActiveLegType["Vertical"] = "Vertical";
    ActiveLegType["Calculating"] = "Calculating";
})(ActiveLegType || (ActiveLegType = {}));
var OriginDestChangeType;
(function (OriginDestChangeType) {
    OriginDestChangeType["OriginAdded"] = "OriginAdded";
    OriginDestChangeType["OriginRemoved"] = "OriginRemoved";
    OriginDestChangeType["DestinationAdded"] = "DestinationAdded";
    OriginDestChangeType["DestinationRemoved"] = "DestinationRemoved";
})(OriginDestChangeType || (OriginDestChangeType = {}));

/**
 * TCAS operating modes.
 */
var TCASOperatingMode;
(function (TCASOperatingMode) {
    TCASOperatingMode[TCASOperatingMode["Standby"] = 0] = "Standby";
    TCASOperatingMode[TCASOperatingMode["TAOnly"] = 1] = "TAOnly";
    TCASOperatingMode[TCASOperatingMode["TA_RA"] = 2] = "TA_RA";
})(TCASOperatingMode || (TCASOperatingMode = {}));
/**
 * TCAS alert level.
 */
var TCASAlertLevel;
(function (TCASAlertLevel) {
    TCASAlertLevel[TCASAlertLevel["None"] = 0] = "None";
    TCASAlertLevel[TCASAlertLevel["ProximityAdvisory"] = 1] = "ProximityAdvisory";
    TCASAlertLevel[TCASAlertLevel["TrafficAdvisory"] = 2] = "TrafficAdvisory";
    TCASAlertLevel[TCASAlertLevel["ResolutionAdvisory"] = 3] = "ResolutionAdvisory";
})(TCASAlertLevel || (TCASAlertLevel = {}));
UnitType.KNOT.createNumber(30);

var APVerticalModes;
(function (APVerticalModes) {
    APVerticalModes[APVerticalModes["NONE"] = 0] = "NONE";
    APVerticalModes[APVerticalModes["PITCH"] = 1] = "PITCH";
    APVerticalModes[APVerticalModes["VS"] = 2] = "VS";
    APVerticalModes[APVerticalModes["FLC"] = 3] = "FLC";
    APVerticalModes[APVerticalModes["ALT"] = 4] = "ALT";
    APVerticalModes[APVerticalModes["VNAV"] = 5] = "VNAV";
    APVerticalModes[APVerticalModes["GP"] = 6] = "GP";
    APVerticalModes[APVerticalModes["GS"] = 7] = "GS";
    APVerticalModes[APVerticalModes["CAP"] = 8] = "CAP";
})(APVerticalModes || (APVerticalModes = {}));
var APLateralModes;
(function (APLateralModes) {
    APLateralModes[APLateralModes["NONE"] = 0] = "NONE";
    APLateralModes[APLateralModes["ROLL"] = 1] = "ROLL";
    APLateralModes[APLateralModes["LEVEL"] = 2] = "LEVEL";
    APLateralModes[APLateralModes["GPSS"] = 3] = "GPSS";
    APLateralModes[APLateralModes["HEADING"] = 4] = "HEADING";
    APLateralModes[APLateralModes["VOR"] = 5] = "VOR";
    APLateralModes[APLateralModes["LOC"] = 6] = "LOC";
    APLateralModes[APLateralModes["BC"] = 7] = "BC";
    APLateralModes[APLateralModes["NAV"] = 8] = "NAV";
})(APLateralModes || (APLateralModes = {}));
var APAltitudeModes;
(function (APAltitudeModes) {
    APAltitudeModes[APAltitudeModes["NONE"] = 0] = "NONE";
    APAltitudeModes[APAltitudeModes["ALTS"] = 1] = "ALTS";
    APAltitudeModes[APAltitudeModes["ALTV"] = 2] = "ALTV";
})(APAltitudeModes || (APAltitudeModes = {}));

/** AP Mode Types */
var APModeType;
(function (APModeType) {
    APModeType[APModeType["LATERAL"] = 0] = "LATERAL";
    APModeType[APModeType["VERTICAL"] = 1] = "VERTICAL";
    APModeType[APModeType["APPROACH"] = 2] = "APPROACH";
})(APModeType || (APModeType = {}));

var APStates;
(function (APStates) {
    APStates[APStates["None"] = 0] = "None";
    APStates[APStates["APActive"] = 1] = "APActive";
    APStates[APStates["YawDamper"] = 2] = "YawDamper";
    APStates[APStates["Heading"] = 4] = "Heading";
    APStates[APStates["Nav"] = 8] = "Nav";
    APStates[APStates["NavArmed"] = 16] = "NavArmed";
    APStates[APStates["Approach"] = 32] = "Approach";
    APStates[APStates["ApproachArmed"] = 64] = "ApproachArmed";
    APStates[APStates["Backcourse"] = 128] = "Backcourse";
    APStates[APStates["BackcourseArmed"] = 256] = "BackcourseArmed";
    APStates[APStates["Alt"] = 512] = "Alt";
    APStates[APStates["AltS"] = 1024] = "AltS";
    APStates[APStates["AltV"] = 2048] = "AltV";
    APStates[APStates["VS"] = 4096] = "VS";
    APStates[APStates["FLC"] = 8192] = "FLC";
    APStates[APStates["GP"] = 16384] = "GP";
    APStates[APStates["GPArmed"] = 32768] = "GPArmed";
    APStates[APStates["GS"] = 65536] = "GS";
    APStates[APStates["GSArmed"] = 131072] = "GSArmed";
    APStates[APStates["Path"] = 262144] = "Path";
    APStates[APStates["PathArmed"] = 524288] = "PathArmed";
    APStates[APStates["PathInvalid"] = 1048576] = "PathInvalid";
    APStates[APStates["Pitch"] = 2097152] = "Pitch";
    APStates[APStates["Roll"] = 4194304] = "Roll";
    APStates[APStates["VNAV"] = 8388608] = "VNAV";
    APStates[APStates["ATSpeed"] = 16777216] = "ATSpeed";
    APStates[APStates["ATMach"] = 33554432] = "ATMach";
    APStates[APStates["ATArmed"] = 67108864] = "ATArmed";
    APStates[APStates["FD"] = 134217728] = "FD";
})(APStates || (APStates = {}));

/**
 * The state of a given plane director.
 */
var DirectorState;
(function (DirectorState) {
    /** The plane director is not currently armed or active. */
    DirectorState["Inactive"] = "Inactive";
    /** The plane director is currently armed. */
    DirectorState["Armed"] = "Armed";
    /** The plane director is currently active. */
    DirectorState["Active"] = "Active";
})(DirectorState || (DirectorState = {}));

/**
 * The current vertical navigation state.
 */
var VNavMode;
(function (VNavMode) {
    /** VNAV Disabled. */
    VNavMode[VNavMode["Disabled"] = 0] = "Disabled";
    /** VNAV Enabled. */
    VNavMode[VNavMode["Enabled"] = 1] = "Enabled";
})(VNavMode || (VNavMode = {}));
/**
 * The current VNAV path mode.
 */
var VNavPathMode;
(function (VNavPathMode) {
    /** VNAV path is not active. */
    VNavPathMode[VNavPathMode["None"] = 0] = "None";
    /** VNAV path is armed for capture. */
    VNavPathMode[VNavPathMode["PathArmed"] = 1] = "PathArmed";
    /** VNAV path is actively navigating. */
    VNavPathMode[VNavPathMode["PathActive"] = 2] = "PathActive";
    /** The current VNAV path is not valid. */
    VNavPathMode[VNavPathMode["PathInvalid"] = 3] = "PathInvalid";
})(VNavPathMode || (VNavPathMode = {}));
/**
 * The current VNAV approach guidance mode.
 */
var VNavApproachGuidanceMode;
(function (VNavApproachGuidanceMode) {
    /** VNAV is not currently following approach guidance. */
    VNavApproachGuidanceMode[VNavApproachGuidanceMode["None"] = 0] = "None";
    /** VNAV has armed ILS glideslope guidance for capture. */
    VNavApproachGuidanceMode[VNavApproachGuidanceMode["GSArmed"] = 1] = "GSArmed";
    /** VNAV is actively following ILS glideslope guidance. */
    VNavApproachGuidanceMode[VNavApproachGuidanceMode["GSActive"] = 2] = "GSActive";
    /** VNAV RNAV glidepath guidance is armed for capture. */
    VNavApproachGuidanceMode[VNavApproachGuidanceMode["GPArmed"] = 3] = "GPArmed";
    /** VNAV is actively follow RNAV glidepath guidance. */
    VNavApproachGuidanceMode[VNavApproachGuidanceMode["GPActive"] = 4] = "GPActive";
})(VNavApproachGuidanceMode || (VNavApproachGuidanceMode = {}));
/**
 * The current VNAV altitude capture type.
 */
var VNavAltCaptureType;
(function (VNavAltCaptureType) {
    /** Altitude capture is not armed. */
    VNavAltCaptureType[VNavAltCaptureType["None"] = 0] = "None";
    /** Altitude will capture the selected altitude. */
    VNavAltCaptureType[VNavAltCaptureType["Selected"] = 1] = "Selected";
    /** Altitude will capture the VANV target altitude. */
    VNavAltCaptureType[VNavAltCaptureType["VNAV"] = 2] = "VNAV";
})(VNavAltCaptureType || (VNavAltCaptureType = {}));

class AUXDisplayComponent extends DisplayComponent {
    constructor(props) {
        super(props);
        this.flightNumber = Subject.create('0');
        this.vhfFrequency = Subject.create(0);
        this.transponderCode = Subject.create(0);
        this.zulu = Subject.create('');
        this.date = Subject.create('');
        this.flightDuration = Subject.create('');
        this.chronoVisible = true;
        this.chronoStarted = true;
        this.chronoDigitalTime = Subject.create('');
        this.chronoRef = FSComponent.createRef();
        this.chronoHoursRef = FSComponent.createRef();
        this.chronoMinutesRef = FSComponent.createRef();
        /**
         * Subscribers definitions
         */
        this.props.bus.getSubscriber().on('flightNumber').whenChanged().handle((value) => {
            this.flightNumber.set(value);
        });
        this.props.bus.getSubscriber().on('vhfFrequency').whenChanged().handle((value) => {
            this.vhfFrequency.set(value);
        });
        this.props.bus.getSubscriber().on('transponderCode').whenChanged().handle((value) => {
            this.transponderCode.set(value);
        });
        this.props.bus.getSubscriber().on('zulu').whenChanged().handle((value) => {
            this.zulu.set(value);
        });
        this.props.bus.getSubscriber().on('date').whenChanged().handle((value) => {
            this.date.set(value);
        });
        this.props.bus.getSubscriber().on('flightDuration').whenChanged().handle((value) => {
            this.flightDuration.set(value);
        });
        this.props.bus.getSubscriber().on('chronoDigitalTime').whenChanged().handle((value) => {
            if (this.chronoStarted) {
                this.chronoDigitalTime.set(value);
            }
        });
        this.props.bus.getSubscriber().on('chronoMinutesDegrees').whenChanged().handle((value) => {
            if (this.chronoStarted) {
                this.chronoHoursRef.instance.setAttribute('transform', `rotate(${value} 250 250)`);
            }
        });
        this.props.bus.getSubscriber().on('chronoSecondsDegrees').whenChanged().handle((value) => {
            if (this.chronoStarted) {
                this.chronoMinutesRef.instance.setAttribute('transform', `rotate(${value} 250 250)`);
            }
        });
        this.props.bus.getSubscriber().on('hEvent').handle((eventName) => {
            if (eventName === 'AS01B_PFD_BTN_Clock') {
                this.handleClockButton_onPush();
            }
        });
        this.tailNumber = SimVar.GetSimVarValue('ATC ID', SimVarValueType.String);
    }
    handleClockButton_onPush() {
        if (this.chronoVisible) {
            if (this.chronoStarted) {
                this.chronoStarted = false;
            }
            else {
                this.chronoVisible = false;
                this.chronoRef.instance.style.visibility = 'hidden';
            }
        }
        else {
            this.props.bus.getPublisher().pub('resetChrono', true);
            this.chronoRef.instance.style.visibility = 'visible';
            this.chronoVisible = true;
            this.chronoStarted = true;
        }
    }
    render() {
        return (FSComponent.buildComponent("div", { class: "aux-display" },
            FSComponent.buildComponent("div", { class: "content" },
                FSComponent.buildComponent("hr", { class: "AUXDisplaySeparator", noshade: true }),
                FSComponent.buildComponent("div", { id: "aircraft-info" },
                    FSComponent.buildComponent("div", { id: "aircraft-info-titles" },
                        FSComponent.buildComponent("div", null, "FLT"),
                        FSComponent.buildComponent("div", null, "MIC"),
                        FSComponent.buildComponent("div", null, "XPDR"),
                        FSComponent.buildComponent("div", null, "SECAL"),
                        FSComponent.buildComponent("div", null, "TAIL")),
                    FSComponent.buildComponent("div", { id: "aircraft-info-values" },
                        FSComponent.buildComponent("div", null, this.flightNumber),
                        FSComponent.buildComponent("div", null, this.vhfFrequency),
                        FSComponent.buildComponent("div", null, this.transponderCode),
                        FSComponent.buildComponent("div", null, "AS-BO"),
                        FSComponent.buildComponent("div", null, this.tailNumber)),
                    FSComponent.buildComponent("div", { id: "Watch", ref: this.chronoRef },
                        FSComponent.buildComponent("svg", { id: "Analog", viewBox: "0 0 500 500", xmlns: "http://www.w3.org/2000/svg" },
                            FSComponent.buildComponent("circle", { cx: "250", cy: "250", r: "240", fill: "#1E1B1C", stroke: "white", "stroke-width": "9" }),
                            FSComponent.buildComponent("rect", { ref: this.chronoHoursRef, id: "Analog_Hour", x: "242.5", y: "152", width: "15", height: "101.35", rx: "3.5", ry: "3.5", fill: "white" }),
                            FSComponent.buildComponent("rect", { ref: this.chronoMinutesRef, id: "Analog_Minutes", x: "242.5", y: "50.6", width: "15", height: "202.71", rx: "3.5", ry: "3.5", fill: "white" }),
                            FSComponent.buildComponent("rect", { id: "Analog_Seconds", x: "248", y: "50.6", width: "4", height: "202.71", rx: "1.2", ry: "1.2", fill: "red" }),
                            FSComponent.buildComponent("circle", { cx: "250", cy: "250", r: "16", fill: "white" }),
                            FSComponent.buildComponent("rect", { x: "245", y: "10", width: "10", height: "45", fill: "white" }),
                            FSComponent.buildComponent("rect", { x: "245", y: "10", width: "10", height: "45", fill: "white", transform: "rotate(30, 250, 250)" }),
                            FSComponent.buildComponent("rect", { x: "245", y: "10", width: "10", height: "45", fill: "white", transform: "rotate(60, 250, 250)" }),
                            FSComponent.buildComponent("rect", { x: "245", y: "10", width: "10", height: "45", fill: "white", transform: "rotate(90, 250, 250)" }),
                            FSComponent.buildComponent("rect", { x: "245", y: "10", width: "10", height: "45", fill: "white", transform: "rotate(120, 250, 250)" }),
                            FSComponent.buildComponent("rect", { x: "245", y: "10", width: "10", height: "45", fill: "white", transform: "rotate(150, 250, 250)" }),
                            FSComponent.buildComponent("rect", { x: "245", y: "10", width: "10", height: "45", fill: "white", transform: "rotate(180, 250, 250)" }),
                            FSComponent.buildComponent("rect", { x: "245", y: "10", width: "10", height: "45", fill: "white", transform: "rotate(-150, 250, 250)" }),
                            FSComponent.buildComponent("rect", { x: "245", y: "10", width: "10", height: "45", fill: "white", transform: "rotate(-120, 250, 250)" }),
                            FSComponent.buildComponent("rect", { x: "245", y: "10", width: "10", height: "45", fill: "white", transform: "rotate(-90, 250, 250)" }),
                            FSComponent.buildComponent("rect", { x: "245", y: "10", width: "10", height: "45", fill: "white", transform: "rotate(-60, 250, 250)" }),
                            FSComponent.buildComponent("rect", { x: "245", y: "10", width: "10", height: "45", fill: "white", transform: "rotate(-30, 250, 250)" })),
                        FSComponent.buildComponent("div", { id: "Digital" }, this.chronoDigitalTime))),
                FSComponent.buildComponent("hr", { class: "AUXDisplaySeparator", noshade: true }),
                FSComponent.buildComponent("div", { id: "date-info" },
                    FSComponent.buildComponent("div", null, "UTC TIME"),
                    FSComponent.buildComponent("div", null, "DATE"),
                    FSComponent.buildComponent("div", null, "ELAPSED TIME")),
                FSComponent.buildComponent("div", { id: "date-info-values" },
                    FSComponent.buildComponent("div", null, this.zulu),
                    FSComponent.buildComponent("div", null, this.date),
                    FSComponent.buildComponent("div", null, this.flightDuration)),
                FSComponent.buildComponent("hr", { class: "AUXDisplaySeparator", noshade: true }))));
    }
}

class PFDDisplayComponent extends DisplayComponent {
    render() {
        return (FSComponent.buildComponent("div", { class: 'test' }));
    }
}

class AttitudeIndicatorComponent extends DisplayComponent {
    constructor(props) {
        super(props);
        /**
         * TODO: These harcoded properties are not ready for HUD
         */
        this.pitchFactor = -6.5;
        this.horizonAngleFactor = -6.5;
        this.horizonTopColor = '#0471cb';
        this.horizonBottomColor = '#704e05';
        /**
         * Transformers
         */
        this.horizonTopRef = FSComponent.createRef();
        this.horizonBottomRef = FSComponent.createRef();
        this.pitchRef = FSComponent.createRef();
        this.pitchGradsRef = FSComponent.createRef();
        this.slipSkidRef = FSComponent.createRef();
        this.slipSkidTriangleRef = FSComponent.createRef();
        this.radioAltitudeRef = FSComponent.createRef();
        this.radioAltitudeTextRef = FSComponent.createRef();
        this.flightDirectorHeadingLineRef = FSComponent.createRef();
        this.flightDirectorPitchLineRef = FSComponent.createRef();
        this._pitchIsNotReadyYet = true;
        this._flightDirectorPitch = 0;
        this._flightDirectorBank = 0;
        /**
         * Subjects definitions
         */
        this.pitchAngle = props.pitchAngle;
        this.bankAngle = props.bankAngle;
        this.slipSkid = props.slipSkid;
        this.altitudeAboveGround = props.altitudeAboveGround;
        /**
         * Transformers definitions
         */
        /**
         * Subscribers definitions
         */
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.pitchAngle.sub((value) => {
            this.horizonBottomRef.instance.setAttribute('transform', `rotate( ${this.bankAngle.get()}, 0, 0) translate(0, ${(value * this.horizonAngleFactor)})`);
            this.pitchGradsRef.instance.setAttribute('transform', `translate(0, ${value * this.pitchFactor})`);
            this.updateFlightDirectorPitch();
        });
        this.props.bankAngle.sub((value) => {
            this.horizonBottomRef.instance.setAttribute('transform', `rotate( ${value}, 0, 0) translate(0, ${(this.pitchAngle.get() * this.horizonAngleFactor)})`);
            this.pitchRef.instance.setAttribute('transform', `rotate(${value}, 0, 0)`);
            this.slipSkidRef.instance.setAttribute('transform', `rotate(${value} 0, 0) translate(${this.slipSkid.get() * 40}, 0)`);
            this.slipSkidTriangleRef.instance.setAttribute('transform', `rotate(${value}, 0, 0)`);
            this.updateFlightDirectorBank();
        });
        this.props.flightDirectorPitchAngle.sub(() => {
            this.updateFlightDirectorPitch();
        });
        this.props.flightDirectorBankAngle.sub(() => {
            this.updateFlightDirectorBank();
        });
        this.props.slipSkid.sub((value) => {
            this.slipSkidRef.instance.setAttribute('transform', `rotate(${this.bankAngle.get()} 0, 0) translate(${value * 40}, 0)`);
        });
        this.props.altitudeAboveGround.sub((value) => {
            const roundedValue = Math.round(value);
            if (roundedValue < 2600) {
                this.radioAltitudeTextRef.instance.textContent = fastToFixed(roundedValue, 0);
            }
            if (roundedValue < 2501) {
                this.radioAltitudeRef.instance.removeAttribute('visibility');
            }
            else {
                this.radioAltitudeRef.instance.setAttribute('visibility', 'hidden');
            }
        });
        /**
         *         getLineLength() { return 140; }
         *         getStrokeWidth() { return "4"; }
         *         getFDBankLimit() { return 30; }
         *         getFDBankDisplayLimit() { return 75; }
         */
    }
    updateFlightDirectorBank() {
        const planeBank = this.bankAngle.get();
        const altitudeAboveGround = this.altitudeAboveGround.get();
        let flightDirectorBank = this.props.flightDirectorBankAngle.get();
        if (altitudeAboveGround > 0 && altitudeAboveGround < 10) {
            flightDirectorBank = 0;
        }
        this._flightDirectorBank += (flightDirectorBank - this._flightDirectorBank) * Math.min(1, this.props.deltaTime.get() * 0.001);
        const lineX = Math.max(-1, Math.min(1, (planeBank - this._flightDirectorBank) / 30)) * 75;
        //console.log("Calculated FD bank" + this._flightDirectorBank)
        this.flightDirectorHeadingLineRef.instance.setAttribute('transform', `translate(${lineX}, 0)`);
    }
    updateFlightDirectorPitch() {
        const planePitch = this.pitchAngle.get();
        const altitudeAboveGround = this.altitudeAboveGround.get();
        let flightDirectorPitch = this.props.flightDirectorPitchAngle.get();
        if (altitudeAboveGround > 0 && altitudeAboveGround < 10) {
            flightDirectorPitch = -8;
        }
        if (this._pitchIsNotReadyYet) {
            this._pitchIsNotReadyYet = (Math.abs(flightDirectorPitch) < 2);
        }
        if (this._pitchIsNotReadyYet) {
            flightDirectorPitch = planePitch;
        }
        this._flightDirectorPitch += (flightDirectorPitch - this._flightDirectorPitch) * Math.min(1, this.props.deltaTime.get() * 0.001);
        const pitchDiff = this._flightDirectorPitch - planePitch;
        //console.log("Calculated FD pitch" + this._flightDirectorPitch)
        const lineY = Utils.Clamp(pitchDiff * 6.66666666667, -100, 100);
        this.flightDirectorPitchLineRef.instance.setAttribute('transform', `translate(0, ${lineY})`);
    }
    render() {
        return (FSComponent.buildComponent("div", { id: "root", style: "width: 100%; height: 100%" },
            FSComponent.buildComponent("svg", { id: "Background", viewBox: "-200 -200 400 300", width: "100%", height: "100%", overflow: "visible", style: "position:absolute; z-index: 3; width: 100%; height: 100%;", xmlns: "http://www.w3.org/2000/svg" },
                FSComponent.buildComponent("rect", { fill: this.horizonTopColor, ref: this.horizonTopRef, x: "-1000", y: "-1000", width: "2000", height: "2000" }),
                FSComponent.buildComponent("g", { ref: this.horizonBottomRef },
                    FSComponent.buildComponent("rect", { fill: this.horizonBottomColor, x: "-1500", y: "0", width: "3000", height: "3000" }),
                    FSComponent.buildComponent("rect", { fill: "white", x: "-190", y: "-1", width: "380", height: "3" }))),
            FSComponent.buildComponent("div", { class: "Pitch", style: "position: absolute; top: -14%; left: -10%; width: 120%; height:120%;" },
                FSComponent.buildComponent("svg", { viewBox: "-200 -200 400 300", width: "100%", height: "100%", overflow: "visible", style: "position:absolute; z-index: 8;", xmlns: "http://www.w3.org/2000/svg" },
                    FSComponent.buildComponent("g", { ref: this.pitchRef },
                        FSComponent.buildComponent("svg", { viewBox: "-115 -120 230 280", width: "230", height: "280", overflow: "hidden", x: "-115", y: "-120", style: "background-color: red", fill: "red", xmlns: "http://www.w3.org/2000/svg" },
                            FSComponent.buildComponent("g", { ref: this.pitchGradsRef },
                                FSComponent.buildComponent("rect", { fill: "white", width: "120", height: "3", x: (-120 / 2), y: this.pitchFactor * -80 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "120", height: "3", x: (-120 / 2), y: this.pitchFactor * -70 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "120", height: "3", x: (-120 / 2), y: this.pitchFactor * -60 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "120", height: "3", x: (-120 / 2), y: this.pitchFactor * -50 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "120", height: "3", x: (-120 / 2), y: this.pitchFactor * -40 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "120", height: "3", x: (-120 / 2), y: this.pitchFactor * -30 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "60", height: "3", x: (-60 / 2), y: this.pitchFactor * -25 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "40", height: "2", x: (-40 / 2), y: this.pitchFactor * -22.5 - 2 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "120", height: "3", x: (-120 / 2), y: this.pitchFactor * -20 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "40", height: "2", x: (-40 / 2), y: this.pitchFactor * -17.5 - 2 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "60", height: "3", x: (-60 / 2), y: this.pitchFactor * -15 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "40", height: "2", x: (-40 / 2), y: this.pitchFactor * -12.5 - 2 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "120", height: "3", x: (-120 / 2), y: this.pitchFactor * -10 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "40", height: "2", x: (-40 / 2), y: this.pitchFactor * -7.5 - 2 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "60", height: "3", x: (-60 / 2), y: this.pitchFactor * -5 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "40", height: "2", x: (-40 / 2), y: this.pitchFactor * -2.5 - 2 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "40", height: "2", x: (-40 / 2), y: this.pitchFactor * 2.5 - 2 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "60", height: "3", x: (-60 / 2), y: this.pitchFactor * 5 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "40", height: "2", x: (-40 / 2), y: this.pitchFactor * 7.5 - 2 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "120", height: "3", x: (-120 / 2), y: this.pitchFactor * 10 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "40", height: "2", x: (-40 / 2), y: this.pitchFactor * 12.5 - 2 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "60", height: "3", x: (-60 / 2), y: this.pitchFactor * 15 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "40", height: "2", x: (-40 / 2), y: this.pitchFactor * 17.5 - 2 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "120", height: "3", x: (-120 / 2), y: this.pitchFactor * 20 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "40", height: "2", x: (-40 / 2), y: this.pitchFactor * 22.5 - 2 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "60", height: "3", x: (-60 / 2), y: this.pitchFactor * 25 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "120", height: "3", x: (-120 / 2), y: this.pitchFactor * 30 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "120", height: "3", x: (-120 / 2), y: this.pitchFactor * 40 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "120", height: "3", x: (-120 / 2), y: this.pitchFactor * 50 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "120", height: "3", x: (-120 / 2), y: this.pitchFactor * 60 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "120", height: "3", x: (-120 / 2), y: this.pitchFactor * 70 - 3 / 2 }),
                                FSComponent.buildComponent("rect", { fill: "white", width: "120", height: "3", x: (-120 / 2), y: this.pitchFactor * 80 - 3 / 2 }),
                                FSComponent.buildComponent("text", { x: (120 / 2) + 5, y: this.pitchFactor * 10 - 3 / 2 + 20 / 2, "text-anchor": "start", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "10"),
                                FSComponent.buildComponent("text", { x: (-120 / 2) - 5, y: this.pitchFactor * 10 - 3 / 2 + 20 / 2, "text-anchor": "end", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "10"),
                                FSComponent.buildComponent("text", { x: (120 / 2) + 5, y: this.pitchFactor * -10 - 3 / 2 + 20 / 2, "text-anchor": "start", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "10"),
                                FSComponent.buildComponent("text", { x: (-120 / 2) - 5, y: this.pitchFactor * -10 - 3 / 2 + 20 / 2, "text-anchor": "end", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "10"),
                                FSComponent.buildComponent("text", { x: (120 / 2) + 5, y: this.pitchFactor * 20 - 3 / 2 + 20 / 2, "text-anchor": "start", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "20"),
                                FSComponent.buildComponent("text", { x: (-120 / 2) - 5, y: this.pitchFactor * 20 - 3 / 2 + 20 / 2, "text-anchor": "end", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "20"),
                                FSComponent.buildComponent("text", { x: (120 / 2) + 5, y: this.pitchFactor * -20 - 3 / 2 + 20 / 2, "text-anchor": "start", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "20"),
                                FSComponent.buildComponent("text", { x: (-120 / 2) - 5, y: this.pitchFactor * -20 - 3 / 2 + 20 / 2, "text-anchor": "end", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "20"),
                                FSComponent.buildComponent("text", { x: (120 / 2) + 5, y: this.pitchFactor * 30 - 3 / 2 + 20 / 2, "text-anchor": "start", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "30"),
                                FSComponent.buildComponent("text", { x: (-120 / 2) - 5, y: this.pitchFactor * 30 - 3 / 2 + 20 / 2, "text-anchor": "end", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "30"),
                                FSComponent.buildComponent("text", { x: (120 / 2) + 5, y: this.pitchFactor * -30 - 3 / 2 + 20 / 2, "text-anchor": "start", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "30"),
                                FSComponent.buildComponent("text", { x: (-120 / 2) - 5, y: this.pitchFactor * -30 - 3 / 2 + 20 / 2, "text-anchor": "end", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "30"),
                                FSComponent.buildComponent("text", { x: (120 / 2) + 5, y: this.pitchFactor * 40 - 3 / 2 + 20 / 2, "text-anchor": "start", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "40"),
                                FSComponent.buildComponent("text", { x: (-120 / 2) - 5, y: this.pitchFactor * 40 - 3 / 2 + 20 / 2, "text-anchor": "end", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "40"),
                                FSComponent.buildComponent("text", { x: (120 / 2) + 5, y: this.pitchFactor * -40 - 3 / 2 + 20 / 2, "text-anchor": "start", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "40"),
                                FSComponent.buildComponent("text", { x: (-120 / 2) - 5, y: this.pitchFactor * -40 - 3 / 2 + 20 / 2, "text-anchor": "end", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "40"),
                                FSComponent.buildComponent("text", { x: (120 / 2) + 5, y: this.pitchFactor * 50 - 3 / 2 + 20 / 2, "text-anchor": "start", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "50"),
                                FSComponent.buildComponent("text", { x: (-120 / 2) - 5, y: this.pitchFactor * 50 - 3 / 2 + 20 / 2, "text-anchor": "end", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "50"),
                                FSComponent.buildComponent("text", { x: (120 / 2) + 5, y: this.pitchFactor * -50 - 3 / 2 + 20 / 2, "text-anchor": "start", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "50"),
                                FSComponent.buildComponent("text", { x: (-120 / 2) - 5, y: this.pitchFactor * -50 - 3 / 2 + 20 / 2, "text-anchor": "end", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "50"),
                                FSComponent.buildComponent("text", { x: (120 / 2) + 5, y: this.pitchFactor * 60 - 3 / 2 + 20 / 2, "text-anchor": "start", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "60"),
                                FSComponent.buildComponent("text", { x: (-120 / 2) - 5, y: this.pitchFactor * 60 - 3 / 2 + 20 / 2, "text-anchor": "end", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "60"),
                                FSComponent.buildComponent("text", { x: (120 / 2) + 5, y: this.pitchFactor * -60 - 3 / 2 + 20 / 2, "text-anchor": "start", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "60"),
                                FSComponent.buildComponent("text", { x: (-120 / 2) - 5, y: this.pitchFactor * -60 - 3 / 2 + 20 / 2, "text-anchor": "end", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "60"),
                                FSComponent.buildComponent("text", { x: (120 / 2) + 5, y: this.pitchFactor * 70 - 3 / 2 + 20 / 2, "text-anchor": "start", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "70"),
                                FSComponent.buildComponent("text", { x: (-120 / 2) - 5, y: this.pitchFactor * 70 - 3 / 2 + 20 / 2, "text-anchor": "end", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "70"),
                                FSComponent.buildComponent("text", { x: (120 / 2) + 5, y: this.pitchFactor * -70 - 3 / 2 + 20 / 2, "text-anchor": "start", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "70"),
                                FSComponent.buildComponent("text", { x: (-120 / 2) - 5, y: this.pitchFactor * -70 - 3 / 2 + 20 / 2, "text-anchor": "end", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "70"),
                                FSComponent.buildComponent("text", { x: (120 / 2) + 5, y: this.pitchFactor * 80 - 3 / 2 + 20 / 2, "text-anchor": "start", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "80"),
                                FSComponent.buildComponent("text", { x: (-120 / 2) - 5, y: this.pitchFactor * 80 - 3 / 2 + 20 / 2, "text-anchor": "end", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "80"),
                                FSComponent.buildComponent("text", { x: (120 / 2) + 5, y: this.pitchFactor * -80 - 3 / 2 + 20 / 2, "text-anchor": "start", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "80"),
                                FSComponent.buildComponent("text", { x: (-120 / 2) - 5, y: this.pitchFactor * -80 - 3 / 2 + 20 / 2, "text-anchor": "end", "font-size": "20", "font-family": "Roboto-Light", fill: "white" }, "80")))))),
            FSComponent.buildComponent("div", { id: "Attitude", style: "position: absolute; top: -13%; left: -10%; width: 120%; height: 120%" },
                FSComponent.buildComponent("svg", { viewBox: "-200 -200 400 300", width: "100%", height: "100%", overflow: "visible", style: "position:absolute; z-index: 4;", xmlns: "http://www.w3.org/2000/svg" },
                    FSComponent.buildComponent("g", null,
                        FSComponent.buildComponent("path", { d: "M0 -152 l-8 -12 l16 0 Z", fill: "white" }),
                        FSComponent.buildComponent("line", { x1: "0", y1: "-150", y2: "-176", x2: "0", stroke: "white", "stroke-width": "3", transform: "rotate(-60,0,0)" }),
                        FSComponent.buildComponent("line", { x1: "0", y1: "-150", y2: "-163", x2: "0", stroke: "white", "stroke-width": "3", transform: "rotate(-45,0,0)" }),
                        FSComponent.buildComponent("line", { x1: "0", y1: "-150", y2: "-176", x2: "0", stroke: "white", "stroke-width": "3", transform: "rotate(-30,0,0)" }),
                        FSComponent.buildComponent("line", { x1: "0", y1: "-150", y2: "-163", x2: "0", stroke: "white", "stroke-width": "3", transform: "rotate(-20,0,0)" }),
                        FSComponent.buildComponent("line", { x1: "0", y1: "-150", y2: "-163", x2: "0", stroke: "white", "stroke-width": "3", transform: "rotate(-10,0,0)" }),
                        FSComponent.buildComponent("line", { x1: "0", y1: "-150", y2: "-163", x2: "0", stroke: "white", "stroke-width": "3", transform: "rotate(10,0,0)" }),
                        FSComponent.buildComponent("line", { x1: "0", y1: "-150", y2: "-163", x2: "0", stroke: "white", "stroke-width": "3", transform: "rotate(20,0,0)" }),
                        FSComponent.buildComponent("line", { x1: "0", y1: "-150", y2: "-176", x2: "0", stroke: "white", "stroke-width": "3", transform: "rotate(30,0,0)" }),
                        FSComponent.buildComponent("line", { x1: "0", y1: "-150", y2: "-163", x2: "0", stroke: "white", "stroke-width": "3", transform: "rotate(45,0,0)" }),
                        FSComponent.buildComponent("line", { x1: "0", y1: "-150", y2: "-176", x2: "0", stroke: "white", "stroke-width": "3", transform: "rotate(60,0,0)" })),
                    FSComponent.buildComponent("g", null,
                        FSComponent.buildComponent("path", { d: "M-125 2 l0 -6 l55 0 l0 28 l-5 0 l0 -22 l-40 0 Z", fill: "black", stroke: "white", "stroke-width": "1" }),
                        FSComponent.buildComponent("path", { d: "M125 2 l0 -6 l-55 0 l0 28 l5 0 l0 -22 l40 0 Z", fill: "black", stroke: "white", "stroke-width": "1" }),
                        FSComponent.buildComponent("rect", { x: "-4", y: "-5", width: "8", height: "8", stroke: "white", "stroke-width": "3" })),
                    FSComponent.buildComponent("g", null,
                        FSComponent.buildComponent("path", { d: "M0 -149 l-13 18 l26 0 Z", stroke: "white", "stroke-width": "1.5", fill: "transparent", ref: this.slipSkidTriangleRef }),
                        FSComponent.buildComponent("path", { d: "M-14 -122 L-14 -128 L14 -128 L14 -122 Z", stroke: "white", "stroke-width": "1.5", fill: "transparent", ref: this.slipSkidRef })),
                    FSComponent.buildComponent("g", { id: "RadioAltitude", ref: this.radioAltitudeRef },
                        FSComponent.buildComponent("rect", { x: "-45", y: "206", width: "90", height: "38", fill: "black" }),
                        FSComponent.buildComponent("text", { ref: this.radioAltitudeTextRef, x: "0", y: "225", "text-anchor": "middle", "font-size": "32", "font-family": "Roboto-Bold", fill: "white", "alignment-baseline": "central" })),
                    FSComponent.buildComponent("g", { id: "CommandBars", style: "display: block" },
                        FSComponent.buildComponent("line", { ref: this.flightDirectorHeadingLineRef, x1: 0, y1: -70, x2: 0, y2: 70, stroke: "magenta", "stroke-width": 4, fill: "none" }),
                        FSComponent.buildComponent("line", { ref: this.flightDirectorPitchLineRef, x1: -70, y1: 0, x2: 70, y2: 0, stroke: "magenta", "stroke-width": 4, fill: "none" }))))));
    }
}

class TargetAltitudeComponent extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.selectedAltitudeText1 = Subject.create('');
        this.selectedAltitudeText2 = Subject.create('');
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.selectedAltitude.sub((value) => {
            let integral = Math.floor(value / 1000);
            let modulo = Math.floor(value - (integral * 1000));
            this.selectedAltitudeText1.set(String(integral));
            this.selectedAltitudeText2.set(Utils.leadingZeros(modulo, 3));
        });
    }
    render() {
        return (FSComponent.buildComponent("svg", { id: "ViewBox", viewBox: "0 0 250 800", xmlns: "http://www.w3.org/2000/svg" },
            FSComponent.buildComponent("rect", { x: "67.5", y: "45", width: "105", height: "44", fill: "black" }),
            FSComponent.buildComponent("text", { x: "115", y: 30 + 75 * 0.5 + 12, fill: "#D570FF", "font-size": 25 * 1.55, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "bottom" }, this.selectedAltitudeText1),
            FSComponent.buildComponent("text", { x: "115", y: 30 + 75 * 0.5 + 12, width: "105", fill: "#D570FF", "font-size": 25 * 1.25, "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "bottom" }, this.selectedAltitudeText2)));
    }
}

class GroundRibbonComponent extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.groundReferencePositionY = Subject.create(0);
        this.groundRibbonRef = FSComponent.createRef();
        this.groundLineGroupRef = FSComponent.createRef();
        this.groundReference = 0;
    }
    calculateGroundReferencePosition(altitude, groundReference) {
        let delta = (altitude - groundReference) * 160 / 200;
        let positionY = 320 + delta;
        return positionY;
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.altitude.sub((value) => {
            this.groundReference = Utils.SmoothPow(this.groundReference, value - this.props.altitudeAboveGround.get(), 1.2, this.props.deltaTime.get() / 1000);
            this.groundReferencePositionY.set(this.calculateGroundReferencePosition(value, this.groundReference));
        });
        this.props.altitudeAboveGround.sub((value) => {
            this.groundReference = Utils.SmoothPow(this.groundReference, this.props.altitude.get() - value, 1.2, this.props.deltaTime.get() / 1000);
            this.groundReferencePositionY.set(this.calculateGroundReferencePosition(this.props.altitude.get(), this.groundReference));
        });
        this.groundReferencePositionY.sub((value) => {
            if (value < 640) {
                this.groundRibbonRef.instance.setAttribute('visibility', 'visible');
                this.groundRibbonRef.instance.setAttribute('y', value.toString());
            }
            else {
                this.groundRibbonRef.instance.setAttribute('visibility', 'hidden');
            }
            if (value > 0) {
                this.groundLineGroupRef.instance.setAttribute('visibility', 'visible');
                this.groundLineGroupRef.instance.setAttribute('y', (value - 800).toString());
            }
            else {
                this.groundLineGroupRef.instance.setAttribute('visibility', 'hidden');
            }
        });
    }
    render() {
        return (FSComponent.buildComponent("g", null,
            FSComponent.buildComponent("svg", { id: "GroundRibbonGroup", ref: this.groundRibbonRef, viewBox: "0 0 116 40", x: "9", y: "0", width: "116", height: "40", xmlns: "http://www.w3.org/2000/svg" },
                FSComponent.buildComponent("path", { fill: "orange", d: "M 0,-2 V 3 H 14 L 51,40 H 56 L 19,3 H 24 L 61,40 H 66 L 29,3 H 34 L 71,40 H 76 L 39,3 H 44 L 81,40 H 86 L 49,3 H 54 L 91,40 H 96 L 59,3 H 64 L 101,40 H 106 L 69,3 H 74 L 111,40 H 116 L 79,3 H 84 L 121,40 V 35 L 89,3 H 94 L 121,30 V 25 L 99,3 H 104 L 121,20 V 15 L 109,3 H 114 L 121,10 V 5 L 119,3 H 121 V -2 H 116 111 Z M 11,5 V 10 L 41,40 H 46 Z M 11,15 V 20 L 31,40 H 36 Z M 11,25 V 30 L 21,40 H 26 Z M 11,35 V 40 H 16 Z" })),
            FSComponent.buildComponent("svg", { id: "GroundLineGroup", ref: this.groundLineGroupRef, viewBox: "0 0 105 800", x: "10", y: "0", width: "105", height: "800", xmlns: "http://www.w3.org/2000/svg" },
                FSComponent.buildComponent("path", { fill: 'none', stroke: 'white', "stroke-width": '6', d: 'M 0 400 l 0 -400 L 10 0 L 0 0 Z' }),
                FSComponent.buildComponent("path", { fill: 'none', stroke: 'orange', "stroke-width": '6', d: 'M 0 800 l 0 -400 L 10 400 L 0 400 Z' }))));
    }
}

class GraduationsComponent$1 extends DisplayComponent {
    constructor(props) {
        super(props);
        this.nbPrimaryGraduations = 7;
        this.nbSecondaryGraduations = 1;
        this.graduationSpacing = 80;
        this.totalGraduations = 13;
        this.graduationScroller = new Avionics.Scroller(this.nbPrimaryGraduations, 200, true);
        this.graduationScrollPosX = 20;
        this.graduationScrollPosY = 320;
        this.graduationsReferences = [];
        this.thousandIndicator1Ref = FSComponent.createRef();
        this.thousandIndicator2Ref = FSComponent.createRef();
        this.prepareGraduationsReferences();
    }
    prepareGraduationsReferences() {
        for (let i = 0; i < this.totalGraduations; i++) {
            let text1 = undefined;
            let text2 = undefined;
            if (i % 2 === 0) {
                text1 = FSComponent.createRef();
                text2 = FSComponent.createRef();
            }
            this.graduationsReferences.push(new GraduationItem$1(FSComponent.createRef(), text1, text2));
        }
    }
    render() {
        return (FSComponent.buildComponent("g", null,
            FSComponent.buildComponent("svg", { id: "Graduations", xmlns: "http://www.w3.org/2000/svg" },
                FSComponent.buildComponent("rect", { ref: this.graduationsReferences[0].line, x: "0", width: "22", height: "3", fill: "white" }),
                FSComponent.buildComponent("text", { ref: this.graduationsReferences[0].text1, x: "62", y: "10", fill: "white", "font-size": "28.75", "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "bottom" }),
                FSComponent.buildComponent("text", { ref: this.graduationsReferences[0].text2, x: "62", y: "10", fill: "white", "font-size": "21.25", "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "bottom" }),
                FSComponent.buildComponent("rect", { ref: this.graduationsReferences[1].line, x: "0", width: "22", height: "3", fill: "white" }),
                FSComponent.buildComponent("rect", { ref: this.graduationsReferences[2].line, x: "0", width: "22", height: "3", fill: "white" }),
                FSComponent.buildComponent("text", { ref: this.graduationsReferences[2].text1, x: "62", y: "10", fill: "white", "font-size": "28.75", "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "bottom" }),
                FSComponent.buildComponent("text", { ref: this.graduationsReferences[2].text2, x: "62", y: "10", fill: "white", "font-size": "21.25", "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "bottom" }),
                FSComponent.buildComponent("rect", { ref: this.graduationsReferences[3].line, x: "0", width: "22", height: "3", fill: "white" }),
                FSComponent.buildComponent("rect", { ref: this.graduationsReferences[4].line, x: "0", width: "22", height: "3", fill: "white" }),
                FSComponent.buildComponent("text", { ref: this.graduationsReferences[4].text1, x: "62", y: "10", fill: "white", "font-size": "28.75", "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "bottom" }),
                FSComponent.buildComponent("text", { ref: this.graduationsReferences[4].text2, x: "62", y: "10", fill: "white", "font-size": "21.25", "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "bottom" }),
                FSComponent.buildComponent("rect", { ref: this.graduationsReferences[5].line, x: "0", width: "22", height: "3", fill: "white" }),
                FSComponent.buildComponent("rect", { ref: this.graduationsReferences[6].line, x: "0", width: "22", height: "3", fill: "white" }),
                FSComponent.buildComponent("text", { ref: this.graduationsReferences[6].text1, x: "62", y: "10", fill: "white", "font-size": "28.75", "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "bottom" }),
                FSComponent.buildComponent("text", { ref: this.graduationsReferences[6].text2, x: "62", y: "10", fill: "white", "font-size": "21.25", "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "bottom" }),
                FSComponent.buildComponent("rect", { ref: this.graduationsReferences[7].line, x: "0", width: "22", height: "3", fill: "white" }),
                FSComponent.buildComponent("rect", { ref: this.graduationsReferences[8].line, x: "0", width: "22", height: "3", fill: "white" }),
                FSComponent.buildComponent("text", { ref: this.graduationsReferences[8].text1, x: "62", y: "10", fill: "white", "font-size": "28.75", "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "bottom" }),
                FSComponent.buildComponent("text", { ref: this.graduationsReferences[8].text2, x: "62", y: "10", fill: "white", "font-size": "21.25", "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "bottom" }),
                FSComponent.buildComponent("rect", { ref: this.graduationsReferences[9].line, x: "0", width: "22", height: "3", fill: "white" }),
                FSComponent.buildComponent("rect", { ref: this.graduationsReferences[10].line, x: "0", width: "22", height: "3", fill: "white" }),
                FSComponent.buildComponent("text", { ref: this.graduationsReferences[10].text1, x: "62", y: "10", fill: "white", "font-size": "28.75", "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "bottom" }),
                FSComponent.buildComponent("text", { ref: this.graduationsReferences[10].text2, x: "62", y: "10", fill: "white", "font-size": "21.25", "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "bottom" }),
                FSComponent.buildComponent("rect", { ref: this.graduationsReferences[11].line, x: "0", width: "22", height: "3", fill: "white" }),
                FSComponent.buildComponent("rect", { ref: this.graduationsReferences[12].line, x: "0", width: "22", height: "3", fill: "white" }),
                FSComponent.buildComponent("text", { ref: this.graduationsReferences[12].text1, x: "62", y: "10", fill: "white", "font-size": "28.75", "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "bottom" }),
                FSComponent.buildComponent("text", { ref: this.graduationsReferences[12].text2, x: "62", y: "10", fill: "white", "font-size": "21.25", "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "bottom" })),
            FSComponent.buildComponent("g", { id: "ThousandGroup1", ref: this.thousandIndicator1Ref },
                FSComponent.buildComponent("line", { x1: "25", y1: "-18", x2: "105", y2: "-18", stroke: "white", "stroke-width": "3" }),
                FSComponent.buildComponent("line", { x1: "25", y1: "18", x2: "105", y2: "18", stroke: "white", "stroke-width": "3" })),
            FSComponent.buildComponent("g", { id: "ThousandGroup2", ref: this.thousandIndicator2Ref },
                FSComponent.buildComponent("line", { x1: "25", y1: "-18", x2: "105", y2: "-18", stroke: "white", "stroke-width": "3" }),
                FSComponent.buildComponent("line", { x1: "25", y1: "18", x2: "105", y2: "18", stroke: "white", "stroke-width": "3" }))));
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        /**
         * Update only when difference between old and new value is 0.1ft+
         */
        this.props.altitude.sub((value) => {
            this.updateGraduation(value);
        });
    }
    /**
     * Update graduation
     *
     * TODO: Use text + 2 tspans instead of using two text fields (two text fields causing that numbers are not synced)
     * @param {number} altitude
     */
    updateGraduation(altitude) {
        let showThousandIndicator1 = false;
        let showThousandIndicator2 = false;
        if (this.graduationScroller.scroll(altitude)) {
            let currentValue = this.graduationScroller.firstValue;
            let currentY = this.graduationScrollPosY + this.graduationScroller.offsetY * this.graduationSpacing * (this.nbSecondaryGraduations + 1);
            const customIncrement = 100;
            const firstValue = this.graduationScroller.firstValue;
            for (let i = 0; i < this.totalGraduations; i++) {
                const line = this.graduationsReferences[i].line;
                const text1 = this.graduationsReferences[i].text1;
                const text2 = this.graduationsReferences[i].text2;
                let positionX = this.graduationScrollPosX;
                let positionY = currentY;
                const realProcessedValue = i * customIncrement + firstValue;
                if (realProcessedValue % 1000 === 0) {
                    line.instance.setAttribute('width', '32');
                    line.instance.setAttribute('height', '9');
                    line.instance.setAttribute('transform', `translate(${positionX - 10} ${positionY - 2.5})`);
                }
                else if (realProcessedValue % 500 === 0) {
                    line.instance.setAttribute('width', '22');
                    line.instance.setAttribute('height', '9');
                    line.instance.setAttribute('transform', `translate(${positionX} ${positionY - 2.5})`);
                }
                else {
                    line.instance.setAttribute('width', '22');
                    line.instance.setAttribute('height', '3');
                    line.instance.setAttribute('transform', `translate(${positionX} ${positionY})`);
                }
                if (text1) {
                    /**
                     * Text value handling
                     */
                    let roundedValue = Math.floor(Math.abs(currentValue));
                    let divider = 1000;
                    if (!text2) {
                        text1.instance.textContent = Utils.leadingZeros(roundedValue, 3);
                    }
                    else {
                        const integral = Math.floor(roundedValue / divider);
                        const modulo = Math.floor(roundedValue - (integral * divider));
                        text1.instance.textContent = (integral > 0) ? integral + '' : '';
                        text2.instance.textContent = Utils.leadingZeros(modulo, 3);
                    }
                    /**
                     * Position handling
                     */
                    text1.instance.setAttribute('transform', `translate(${positionX} ${positionY})`);
                    if (text2) {
                        text2.instance.setAttribute('transform', `translate(${positionX} ${positionY})`);
                    }
                    if (currentValue % 1000 === 0) {
                        if (showThousandIndicator1 && !showThousandIndicator2) {
                            this.thousandIndicator2Ref.instance.setAttribute('transform', `translate(${positionX} ${positionY})`);
                            showThousandIndicator2 = true;
                        }
                        if (!showThousandIndicator1 && !showThousandIndicator2) {
                            this.thousandIndicator1Ref.instance.setAttribute('transform', `translate(${positionX} ${positionY})`);
                            showThousandIndicator1 = true;
                        }
                    }
                    currentValue = this.graduationScroller.nextValue;
                }
                currentY -= this.graduationSpacing;
            }
            this.thousandIndicator1Ref.instance.setAttribute('visibility', (showThousandIndicator1) ? 'visible' : 'hidden');
            this.thousandIndicator2Ref.instance.setAttribute('visibility', (showThousandIndicator2) ? 'visible' : 'hidden');
        }
    }
}
class GraduationItem$1 {
    constructor(line, text1, text2) {
        this.line = line;
        this.text1 = text1;
        this.text2 = text2;
    }
}

class TargetAltitudeIndicatorComponent extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.targetAltitudeIndicatorRef = FSComponent.createRef();
    }
    render() {
        return (FSComponent.buildComponent("svg", { id: "TargetAltitudeIndicator", ref: this.targetAltitudeIndicatorRef, viewBox: "0 0 100 100", x: "0", width: "100", height: "100", xmlns: "http://www.w3.org/2000/svg" },
            FSComponent.buildComponent("path", { fill: "none", stroke: "#D570FF", "stroke-width": "3", d: "M 10 20 L 55 20 L 55 80 L 10 80 L 10 60 L 18 50 L 10 40 Z" })));
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.altitudeSelected.sub((value) => {
            this.calculateTargetAltitudeIndicator(value, this.props.altitude.get());
        });
        this.props.altitude.sub((value) => {
            this.calculateTargetAltitudeIndicator(this.props.altitudeSelected.get(), value);
        });
    }
    calculateTargetAltitudeIndicator(selectedAltitude, indicatedAltitude) {
        let deltaAltitude = Utils.Clamp(selectedAltitude - indicatedAltitude, -410 * 0.99, 410 * 0.99);
        let delta = (indicatedAltitude - (indicatedAltitude + deltaAltitude)) * 160 / 200;
        let positionY = 320 + delta - 48;
        this.targetAltitudeIndicatorRef.instance.setAttribute('y', String(positionY));
        this.targetAltitudeIndicatorRef.instance.setAttribute('visibility', 'visible');
    }
}

class CursorItemIntegralsComponent$1 extends DisplayComponent {
    constructor(props) {
        super(props);
        this.textReferences = [];
        this.scroller = new Avionics.Scroller(3, this.props.increment, false, this.props.modulo, this.props.notched);
        this.prepareTextsReferences();
    }
    prepareTextsReferences() {
        this.textReferences.push(new CursorItem$1(FSComponent.createRef()));
        this.textReferences.push(new CursorItem$1(FSComponent.createRef()));
        this.textReferences.push(new CursorItem$1(FSComponent.createRef()));
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.cursorValue.sub((value) => {
            this.updateTexts(value);
        });
    }
    render() {
        return (FSComponent.buildComponent("g", null,
            FSComponent.buildComponent("text", { fill: "white", ref: this.textReferences[0].text, width: "105", "font-size": this.props.fontSize, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("text", { fill: "white", ref: this.textReferences[1].text, width: "105", "font-size": this.props.fontSize, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("text", { fill: "white", ref: this.textReferences[2].text, width: "105", "font-size": this.props.fontSize, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" })));
    }
    updateTexts(altitude) {
        if (!this.scroller.scroll(Math.abs(altitude) / this.props.divider)) {
            return;
        }
        let currentValue = this.scroller.firstValue;
        let currentY = this.props.positionY + this.scroller.offsetY * this.props.spacing;
        for (let i = 0; i < this.textReferences.length; i++) {
            let positionX = this.props.positionX;
            let positionY = currentY;
            if (currentValue === 0 && this.props.modulo === 100) {
                this.textReferences[i].text.instance.textContent = '00';
            }
            else {
                this.textReferences[i].text.instance.textContent = String(Math.abs(currentValue));
            }
            this.textReferences[i].text.instance.setAttribute('transform', `translate(${positionX} ${positionY})`);
            currentY -= this.props.spacing;
            currentValue = this.scroller.nextValue;
        }
    }
}
class CursorItem$1 {
    constructor(text) {
        this.text = text;
    }
}

class CursorItemDecimalsComponent extends CursorItemIntegralsComponent$1 {
    constructor(props) {
        super(props);
        this.textReferences = [];
        this.scroller = new Avionics.Scroller(5, this.props.increment, false, this.props.modulo, this.props.notched);
        this.prepareTextsReferences();
    }
    prepareTextsReferences() {
        this.textReferences.push(new CursorItem$1(FSComponent.createRef()));
        this.textReferences.push(new CursorItem$1(FSComponent.createRef()));
        this.textReferences.push(new CursorItem$1(FSComponent.createRef()));
        this.textReferences.push(new CursorItem$1(FSComponent.createRef()));
        this.textReferences.push(new CursorItem$1(FSComponent.createRef()));
    }
    render() {
        return (FSComponent.buildComponent("g", null,
            FSComponent.buildComponent("text", { fill: "white", ref: this.textReferences[0].text, width: "105", "font-size": this.props.fontSize, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("text", { fill: "white", ref: this.textReferences[1].text, width: "105", "font-size": this.props.fontSize, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("text", { fill: "white", ref: this.textReferences[2].text, width: "105", "font-size": this.props.fontSize, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("text", { fill: "white", ref: this.textReferences[3].text, width: "105", "font-size": this.props.fontSize, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("text", { fill: "white", ref: this.textReferences[4].text, width: "105", "font-size": this.props.fontSize, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" })));
    }
}

class CursorComponent$1 extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.altitudeLevelShapeRef = FSComponent.createRef();
    }
    render() {
        return (FSComponent.buildComponent("svg", { id: "CursorGroup", viewBox: "0 0 177 80", x: "33", y: "282", width: "177", height: "80", xmlns: "http://www.w3.org/2000/svg" },
            FSComponent.buildComponent("defs", null,
                FSComponent.buildComponent("clipPath", { id: "cut-level-shape-group" },
                    FSComponent.buildComponent("rect", { x: "20", y: "26", width: "20", height: "32" }))),
            FSComponent.buildComponent("path", { fill: "black", stroke: "white", "stroke-width": "3", d: "M 15 0 L 132 0 L 132 80 L 15 80 L 15 53 L 0 40 L 15 27 Z" }),
            FSComponent.buildComponent(CursorItemIntegralsComponent$1, { cursorValue: this.props.altitude, divider: fastPow10(2), spacing: 55, increment: 1, modulo: 10, notched: 10, positionX: 92, positionY: 40, fontSize: 40 }),
            FSComponent.buildComponent(CursorItemIntegralsComponent$1, { cursorValue: this.props.altitude, divider: fastPow10(3), spacing: 55, increment: 1, modulo: 10, notched: 100, positionX: 67, positionY: 40, fontSize: 40 }),
            FSComponent.buildComponent(CursorItemIntegralsComponent$1, { cursorValue: this.props.altitude, divider: fastPow10(4), spacing: 55, increment: 1, modulo: 10, notched: 1000, positionX: 42, positionY: 40, fontSize: 40 }),
            FSComponent.buildComponent(CursorItemDecimalsComponent, { cursorValue: this.props.altitude, divider: 1, spacing: 25, increment: 20, modulo: 100, notched: 0, positionX: 127, positionY: 40, fontSize: 28.75 }),
            FSComponent.buildComponent("g", { "clip-path": "url(#cut-level-shape-group)", ref: this.altitudeLevelShapeRef },
                FSComponent.buildComponent("rect", { fill: "black", x: "20", y: "26", width: "20", height: "32" }),
                FSComponent.buildComponent("rect", { x: "20", y: "-40", width: "32", height: "5", transform: "skewY(60)", fill: "#24F000" }),
                FSComponent.buildComponent("rect", { x: "20", y: "-30", width: "32", height: "5", transform: "skewY(60)", fill: "#24F000" }),
                FSComponent.buildComponent("rect", { x: "20", y: "-20", width: "32", height: "5", transform: "skewY(60)", fill: "#24F000" }),
                FSComponent.buildComponent("rect", { x: "20", y: "-10", width: "32", height: "5", transform: "skewY(60)", fill: "#24F000" }),
                FSComponent.buildComponent("rect", { x: "20", y: "0", width: "32", height: "5", transform: "skewY(60)", fill: "#24F000" }),
                FSComponent.buildComponent("rect", { x: "20", y: "10", width: "32", height: "5", transform: "skewY(60)", fill: "#24F000" }),
                FSComponent.buildComponent("rect", { x: "20", y: "20", width: "32", height: "5", transform: "skewY(60)", fill: "#24F000" }),
                FSComponent.buildComponent("rect", { x: "20", y: "30", width: "32", height: "5", transform: "skewY(60)", fill: "#24F000" }))));
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.altitude.sub((value) => {
            if (value >= 9990) {
                this.altitudeLevelShapeRef.instance.setAttribute('visibility', 'hidden');
            }
            else {
                this.altitudeLevelShapeRef.instance.setAttribute('visibility', 'visible');
            }
        });
    }
}

class CenterGroupComponent extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.minimumReferenceCursorRef = FSComponent.createRef();
    }
    render() {
        return (FSComponent.buildComponent("svg", { id: "CenterGroup", viewBox: "0 0 175 640", x: 100 - 105 * 0.5, y: "105", width: "175", height: "640", xmlns: "http://www.w3.org/2000/svg" },
            FSComponent.buildComponent("rect", { x: "20", y: "0", width: "105", height: "640", fill: "#525252", "fill-opacity": 0.6, stroke: "black", "stroke-width": 1, "stroke-opacity": 0.5 }),
            FSComponent.buildComponent("g", null,
                FSComponent.buildComponent(GraduationsComponent$1, { altitude: this.props.altitude })),
            FSComponent.buildComponent(GroundRibbonComponent, { altitude: this.props.altitude, altitudeAboveGround: this.props.altitudeAboveGround, deltaTime: this.props.deltaTime }),
            FSComponent.buildComponent(TargetAltitudeIndicatorComponent, { altitude: this.props.altitude, altitudeSelected: this.props.altitudeSelected, showMeters: this.props.showMeters }),
            FSComponent.buildComponent(CursorComponent$1, { altitude: this.props.altitude }),
            FSComponent.buildComponent("path", { ref: this.minimumReferenceCursorRef, fill: "none", stroke: "#24F000", "stroke-width": 3, d: "M 25 0 L 2 25 L 2 -25 L 25 0 L 120 0" })));
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.minimimReferenceMode.sub((value) => {
            let positionY = this.calculateMinimumPosition();
            this.minimumReferenceCursorRef.instance.setAttribute('transform', `translate(0, ${positionY})`);
        });
        this.props.minimumValue.sub((value) => {
            let positionY = this.calculateMinimumPosition();
            this.minimumReferenceCursorRef.instance.setAttribute('transform', `translate(0, ${positionY})`);
        });
        this.props.altitude.sub((value) => {
            let positionY = this.calculateMinimumPosition();
            this.minimumReferenceCursorRef.instance.setAttribute('transform', `translate(0, ${positionY})`);
        });
    }
    calculateMinimumPosition() {
        let positionY;
        let target;
        if (this.props.minimimReferenceMode.get() === MinimumReferenceMode.BARO) {
            target = this.props.minimumValue.get();
        }
        else {
            target = this.props.minimumValue.get() - this.props.altitudeAboveGround.get() + this.props.altitude.get();
        }
        let delta = (this.props.altitude.get() - target) * 160 / 200;
        positionY = 320 + delta;
        return positionY;
    }
}

class MetersComponent extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.selectedAltitudeRef = FSComponent.createRef();
        this.altitudeRef = FSComponent.createRef();
        this.metersGroupRef = FSComponent.createRef();
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.showMeters.sub((value) => {
            if (value) {
                this.metersGroupRef.instance.style.display = 'block';
            }
            else {
                this.metersGroupRef.instance.style.display = 'none';
            }
        });
        this.props.altitude.sub((value) => {
            this.altitudeRef.instance.textContent = Math.round(value * 0.3048).toString();
        });
        this.props.altitudeSelected.sub((value) => {
            this.selectedAltitudeRef.instance.textContent = Math.round(value * 0.3048).toString();
        });
    }
    render() {
        return (FSComponent.buildComponent("g", { id: "MetersGroup", ref: this.metersGroupRef },
            FSComponent.buildComponent("g", { id: "SelectedGroup" },
                FSComponent.buildComponent("rect", { x: 67, y: 0, width: 105, height: 30, fill: "#525252", "fill-opacity": 0.6, stroke: "black", "stroke-width": 1, "stroke-opacity": 0.5 }),
                FSComponent.buildComponent("text", { ref: this.selectedAltitudeRef, x: 158, y: 25, fill: "#D570FF", "font-size": 30, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "bottom" }),
                FSComponent.buildComponent("text", { x: 158, y: 25, fill: "cyan", "font-size": 22.5, "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "bottom" }, "M")),
            FSComponent.buildComponent("svg", { id: "MetersCursorGroup", xmlns: "http://www.w3.org/2000/svg", x: 82.5, y: 350, width: 175, height: 36, viewBox: "0 0 175 36" },
                FSComponent.buildComponent("path", { fill: "black", stroke: "white", "stroke-width": 3, d: "M 15 0 L 130 0 L 130 36 L 15 36 Z" }),
                FSComponent.buildComponent("text", { ref: this.altitudeRef, x: 110, y: 30.24, fill: "#D570FF", "font-size": 30, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "bottom" }),
                FSComponent.buildComponent("text", { x: 110, y: 30.24, fill: "cyan", "font-size": 22.5, "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "bottom" }, "M"))));
    }
}
/**
 * var posX = 100;
 *         var posY = 0;
 *         var width = 105;
 *         var height = 640;
 *         var arcWidth = 70;
 *         _left = 20
 *         _top = 0
 *
 *         mtrsCursorPosX = 82.5;
 *         mtrsCursorPosY = 357.12;
 *         mtrsCursorWidth = 175;
 *         mtrsCursorHeight = 36;
 */

class AltimeterIndicatorComponent extends DisplayComponent {
    render() {
        return (FSComponent.buildComponent("svg", { id: "ViewBox", viewBox: "0 0 250 800", xmlns: "http://www.w3.org/2000/svg" },
            FSComponent.buildComponent("g", { id: "Altimeter" },
                FSComponent.buildComponent(TargetAltitudeComponent, { selectedAltitude: this.props.altitudeSelected }),
                FSComponent.buildComponent(CenterGroupComponent, { deltaTime: this.props.deltaTime, altitude: this.props.altitude, altitudeAboveGround: this.props.altitudeAboveGround, altitudeSelected: this.props.altitudeSelected, minimimReferenceMode: this.props.minimimReferenceMode, minimumValue: this.props.minimumValue, showMeters: this.props.showMeters }),
                FSComponent.buildComponent(MetersComponent, { altitude: this.props.altitude, altitudeSelected: this.props.altitudeSelected, showMeters: this.props.showMeters }))));
    }
}

class VerticalSpeedIndicatorComponent extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.gradSpeeds = [500, 1000, 1500, 2000, 4000, 6000];
        this.gradYPos = [60, 120, 170, 220, 250, 280];
        this.gradYPosConverted = [45, 90, 127.5, 165, 187.5, 210];
        this.maxSpeed = 6000;
        this.cursorPosX1 = 40;
        this.cursorPosY1 = 300;
        this.cursorPosX2 = 130;
        this.cursorPosY2 = 300;
        this.cursorLineRef = FSComponent.createRef();
        this.selectedCursorRef = FSComponent.createRef();
        this.topTextRef = FSComponent.createRef();
        this.bottomTextRef = FSComponent.createRef();
    }
    render() {
        return (FSComponent.buildComponent("svg", { id: "ViewBox", viewBox: "0 0 250 600", xmlns: "http://www.w3.org/2000/svg" },
            FSComponent.buildComponent("defs", null,
                FSComponent.buildComponent("clipPath", { id: "cut" },
                    FSComponent.buildComponent("rect", { x: "0", y: "0", width: "74", height: "600" }))),
            FSComponent.buildComponent("g", { id: "VerticalSpeed" },
                FSComponent.buildComponent("g", { id: "CenterGroup" },
                    FSComponent.buildComponent("path", { fill: "#525252", "fill-opacity": 0.6, stroke: "black", "stroke-width": 1, "stroke-opacity": 0.5, transform: "translate(0 75)", d: "M 0 0 l 0 153 l 30 15 l 0 114 l -30 15 L 0 450 L 45 450 L 75 360 L 75 90 L 45 0 Z" }),
                    FSComponent.buildComponent("g", { id: "GraduationsGroup" },
                        FSComponent.buildComponent("rect", { x: "33", y: "345", width: "9", height: "2", fill: "white" }),
                        FSComponent.buildComponent("rect", { x: "30", y: "390", width: "12", height: "3", fill: "white" }),
                        FSComponent.buildComponent("text", { x: "10", y: "390", fill: "white", "font-size": "22.5", "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }, "1"),
                        FSComponent.buildComponent("rect", { x: "33", y: "427.5", width: "9", height: "2", fill: "white" }),
                        FSComponent.buildComponent("rect", { x: "30", y: "465", width: "12", height: "3", fill: "white" }),
                        FSComponent.buildComponent("text", { x: "10", y: "465", fill: "white", "font-size": "22.5", "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }, "2"),
                        FSComponent.buildComponent("rect", { x: "33", y: "487.5", width: "9", height: "2", fill: "white" }),
                        FSComponent.buildComponent("rect", { x: "30", y: "510", width: "12", height: "3", fill: "white" }),
                        FSComponent.buildComponent("text", { x: "10", y: "510", fill: "white", "font-size": "22.5", "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }, "6"),
                        FSComponent.buildComponent("rect", { x: "33", y: "255", width: "9", height: "2", fill: "white" }),
                        FSComponent.buildComponent("rect", { x: "30", y: "210", width: "12", height: "3", fill: "white" }),
                        FSComponent.buildComponent("text", { x: "10", y: "210", fill: "white", "font-size": "22.5", "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }, "1"),
                        FSComponent.buildComponent("rect", { x: "33", y: "17172.5", width: "9", height: "2", fill: "white" }),
                        FSComponent.buildComponent("rect", { x: "30", y: "135", width: "12", height: "3", fill: "white" }),
                        FSComponent.buildComponent("text", { x: "10", y: "135", fill: "white", "font-size": "22.5", "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }, "2"),
                        FSComponent.buildComponent("rect", { x: "33", y: "112.5", width: "9", height: "2", fill: "white" }),
                        FSComponent.buildComponent("rect", { x: "30", y: "90", width: "12", height: "3", fill: "white" }),
                        FSComponent.buildComponent("text", { x: "10", y: "90", fill: "white", "font-size": "22.5", "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }, "6"))),
                FSComponent.buildComponent("text", { ref: this.topTextRef, x: "5", y: "50", fill: "white", "font-size": "21.25", "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }),
                FSComponent.buildComponent("g", { id: "CursorGroup" },
                    FSComponent.buildComponent("line", { ref: this.cursorLineRef, x1: this.cursorPosX1, x2: this.cursorPosX2, y1: this.cursorPosY1, y2: this.cursorPosY2, stroke: "white", "stroke-width": "3", "clip-path": "url(#cut)" }),
                    FSComponent.buildComponent("line", { x1: "30", y1: "300", x2: "60", y2: "300", stroke: "white", "stroke-width": "3" }),
                    FSComponent.buildComponent("rect", { ref: this.selectedCursorRef, x: "30", y: "0", width: "18", height: "12", fill: "#D570FF", visibility: "hidden" })),
                FSComponent.buildComponent("text", { ref: this.bottomTextRef, x: "5", y: "550", fill: "white", "font-size": "21.25", "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }))));
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.bus.getSubscriber().on('verticalSpeed').whenChangedBy(1).handle((value) => {
            this.updateVerticalSpeed(value);
        });
        this.props.bus.getSubscriber().on('verticalSpeedSelected').whenChanged().handle((value) => {
            this.updateVerticalSpeedSelected(value);
        });
        this.props.bus.getSubscriber().on('verticalSpeedHoldActive').whenChanged().handle((value) => {
            this.updateVerticalSpeedHoldActive(value);
        });
    }
    updateVerticalSpeedHoldActive(value) {
        this.selectedCursorRef.instance.setAttribute('visibility', (value ? 'visible' : 'hidden'));
    }
    updateVerticalSpeed(speed) {
        let vSpeed = Math.min(this.maxSpeed, Math.max(-this.maxSpeed, speed));
        let height = this.heightFromSpeed(vSpeed);
        if (vSpeed >= 0) {
            this.cursorPosY1 = this.cursorPosY2 - height;
        }
        else {
            this.cursorPosY1 = this.cursorPosY2 + height;
        }
        const line = this.cursorLineRef.instance;
        line.setAttribute('x1', String(this.cursorPosX1));
        line.setAttribute('y1', String(this.cursorPosY1));
        line.setAttribute('x2', String(this.cursorPosX2));
        line.setAttribute('y2', String(this.cursorPosY2));
        line.setAttribute('stroke', 'white');
        let threshold = 400;
        let displaySpeed = Math.abs(Math.floor(speed));
        displaySpeed = Math.round(displaySpeed / 5) * 5;
        if (speed >= threshold) {
            this.topTextRef.instance.textContent = String(displaySpeed);
        }
        else {
            this.topTextRef.instance.textContent = '';
        }
        if (speed <= -threshold) {
            this.bottomTextRef.instance.textContent = String(displaySpeed);
        }
        else {
            this.bottomTextRef.instance.textContent = '';
        }
    }
    updateVerticalSpeedSelected(speed) {
        let vSpeed = Math.min(this.maxSpeed, Math.max(-this.maxSpeed, speed));
        let height = this.heightFromSpeed(vSpeed);
        let posY = 0;
        if (vSpeed >= 0) {
            posY = this.cursorPosY2 - height;
        }
        else {
            posY = this.cursorPosY2 + height;
        }
        this.selectedCursorRef.instance.setAttribute('transform', `translate(0 ${posY - 6})`);
    }
    heightFromSpeed(_speed) {
        let absSpeed = Math.abs(_speed);
        let height = 0;
        let found = false;
        if (absSpeed < this.gradSpeeds[0]) {
            let percent = absSpeed / this.gradSpeeds[0];
            height = this.gradYPosConverted[0] * percent;
        }
        else {
            for (let i = 0; i < this.gradSpeeds.length - 1; i++) {
                if (absSpeed >= this.gradSpeeds[i] && absSpeed < this.gradSpeeds[i + 1]) {
                    let percent = (absSpeed - this.gradSpeeds[i]) / (this.gradSpeeds[i + 1] - this.gradSpeeds[i]);
                    height = this.gradYPosConverted[i] + (this.gradYPosConverted[i + 1] - this.gradYPosConverted[i]) * percent;
                    found = true;
                    break;
                }
            }
            if (!found) {
                height = this.gradYPosConverted[this.gradYPosConverted.length - 1];
            }
        }
        return height;
    }
}

class GraduationsComponent extends DisplayComponent {
    constructor(props) {
        super(props);
        this.graduationSpacing = 54;
        this.nbPrimaryGraduations = 11;
        this.nbSecondaryGraduations = 1;
        this.totalGraduations = 21;
        this.graduationScroller = new Avionics.Scroller(this.nbPrimaryGraduations, 20);
        this.graduationScrollPosX = 112;
        this.graduationScrollPosY = 323.2;
        this.graduationsReferences = [];
        this.indicatedSpeed = this.props.indicatedSpeed;
        this.prepareGraduationsReferences();
    }
    prepareGraduationsReferences() {
        for (let i = 0; i < this.totalGraduations; i++) {
            let text = undefined;
            if (i % 2 === 0) {
                text = FSComponent.createRef();
            }
            this.graduationsReferences.push(new GraduationItem(FSComponent.createRef(), text));
        }
    }
    render() {
        return (FSComponent.buildComponent("g", null,
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[0].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("text", { ref: this.graduationsReferences[0].text, x: -32, fill: "white", "font-size": 27.5, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[1].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[2].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("text", { ref: this.graduationsReferences[2].text, x: -32, fill: "white", "font-size": 27.5, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[3].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[4].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("text", { ref: this.graduationsReferences[4].text, x: -32, fill: "white", "font-size": 27.5, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[5].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[6].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("text", { ref: this.graduationsReferences[6].text, x: -32, fill: "white", "font-size": 27.5, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[7].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[8].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("text", { ref: this.graduationsReferences[8].text, x: -32, fill: "white", "font-size": 27.5, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[9].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[10].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("text", { ref: this.graduationsReferences[10].text, x: -32, fill: "white", "font-size": 27.5, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[11].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[12].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("text", { ref: this.graduationsReferences[12].text, x: -32, fill: "white", "font-size": 27.5, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[13].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[14].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("text", { ref: this.graduationsReferences[14].text, x: -32, fill: "white", "font-size": 27.5, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[15].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[16].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("text", { ref: this.graduationsReferences[16].text, x: -32, fill: "white", "font-size": 27.5, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[17].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[18].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("text", { ref: this.graduationsReferences[18].text, x: -32, fill: "white", "font-size": 27.5, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[19].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("rect", { ref: this.graduationsReferences[20].line, x: -22, width: 22, height: 3, fill: "white" }),
            FSComponent.buildComponent("text", { ref: this.graduationsReferences[20].text, x: -32, fill: "white", "font-size": 27.5, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" })));
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.indicatedSpeed.sub((value) => {
            this.updateGraduation(value);
        });
    }
    updateGraduation(speed) {
        if (speed < 30) {
            speed = 30;
        }
        if (this.graduationScroller.scroll(speed)) {
            let currentValue = this.graduationScroller.firstValue;
            let currentY = this.graduationScrollPosY + this.graduationScroller.offsetY * this.graduationSpacing * 2;
            for (let i = 0; i < this.totalGraduations; i++) {
                const positionX = this.graduationScrollPosX;
                const positionY = currentY;
                if ((currentValue < 30) || (currentValue === 30 && !this.graduationsReferences[i].text)) {
                    let item = this.graduationsReferences[i];
                    item.line.instance.setAttribute('visibility', 'hidden');
                    if (item.text) {
                        item.text.instance.setAttribute('visibility', 'hidden');
                    }
                }
                else {
                    let item = this.graduationsReferences[i];
                    item.line.instance.setAttribute('visibility', 'visible');
                    item.line.instance.setAttribute('transform', `translate(${positionX} ${positionY})`);
                    if (item.text) {
                        if (currentValue < 30) {
                            item.text.instance.textContent = '';
                        }
                        else {
                            item.text.instance.textContent = String(currentValue);
                        }
                        item.text.instance.setAttribute('visibility', 'visible');
                        item.text.instance.setAttribute('transform', `translate(${positionX} ${positionY})`);
                    }
                }
                let item = this.graduationsReferences[i];
                if (item.text) {
                    currentValue = this.graduationScroller.nextValue;
                }
                currentY -= this.graduationSpacing;
            }
        }
    }
}
class GraduationItem {
    constructor(line, text) {
        this.line = line;
        this.text = text;
    }
}

/**
 * TODO: Rename the class because the class do not handle only integrals
 */
class CursorItemIntegralsComponent extends DisplayComponent {
    constructor(props) {
        super(props);
        this.textReferences = [];
        this.scroller = new Avionics.Scroller(3, this.props.increment, false, this.props.modulo, this.props.notched);
        this.prepareTextsReferences();
    }
    prepareTextsReferences() {
        this.textReferences.push(new CursorItem(FSComponent.createRef()));
        this.textReferences.push(new CursorItem(FSComponent.createRef()));
        this.textReferences.push(new CursorItem(FSComponent.createRef()));
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.cursorValue.sub((value) => {
            this.updateTexts(value);
        });
    }
    render() {
        return (FSComponent.buildComponent("g", null,
            FSComponent.buildComponent("text", { fill: "white", ref: this.textReferences[0].text, width: "105", "font-size": this.props.fontSize, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("text", { fill: "white", ref: this.textReferences[1].text, width: "105", "font-size": this.props.fontSize, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("text", { fill: "white", ref: this.textReferences[2].text, width: "105", "font-size": this.props.fontSize, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" })));
    }
    updateTexts(speed) {
        speed = Math.max(speed, 30);
        if (!this.scroller.scroll(Math.abs(speed) / this.props.divider)) {
            return;
        }
        let currentValue = this.scroller.firstValue;
        let currentY = this.props.positionY + this.scroller.offsetY * this.props.spacing;
        for (let i = 0; i < this.textReferences.length; i++) {
            let positionX = this.props.positionX;
            let positionY = currentY;
            /**
             * TODO: hack as hell... Should be removed/reworked
             *
             * Description: The "IF" condition depends on DIVIDER. The airspeed cursor uses only one scroller with
             * divider === 1 (the decimals) but the value is hardcoded and anyone can change the value. There should
             * be added another props "hideIfLower" because converting divider to hideIfLower happens under the hood
             * and the behavior is extremely magical...
             *
             * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
             * !!!!!!!!!!!                             WTF FACTOR 3000™                                 !!!!!!!!!!!
             * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
             */
            const hideIfLower = (this.props.divider === 1) ? undefined : this.props.divider;
            if (currentValue <= 0 && hideIfLower != undefined && Math.abs(speed) < hideIfLower) {
                this.textReferences[i].text.instance.textContent = '';
            }
            else if (currentValue === 0 && this.props.modulo === 100) {
                this.textReferences[i].text.instance.textContent = '00';
            }
            else {
                this.textReferences[i].text.instance.textContent = String(Math.abs(currentValue));
            }
            this.textReferences[i].text.instance.setAttribute('transform', `translate(${positionX} ${positionY})`);
            currentY -= this.props.spacing;
            currentValue = this.scroller.nextValue;
        }
    }
}
class CursorItem {
    constructor(text) {
        this.text = text;
    }
}

class CursorComponent extends DisplayComponent {
    render() {
        return (FSComponent.buildComponent("svg", { id: "CursorGroup", viewBox: "0 2 105 76", x: "0", y: "289", width: "105", height: "76", xmlns: "http://www.w3.org/2000/svg" },
            FSComponent.buildComponent("path", { fill: "black", stroke: "white", "stroke-width": "3", d: "M2 2 L76 2 L76 28 L88 38 L76 50 L76 78 L2 78 Z" }),
            FSComponent.buildComponent(CursorItemIntegralsComponent, { cursorValue: this.props.airspeed, divider: fastPow10(1), spacing: 52, increment: 1, modulo: 10, notched: 10, positionX: 50, positionY: 38, fontSize: 37.5 }),
            FSComponent.buildComponent(CursorItemIntegralsComponent, { cursorValue: this.props.airspeed, divider: fastPow10(2), spacing: 52, increment: 1, modulo: 10, notched: 100, positionX: 26, positionY: 38, fontSize: 37.5 }),
            FSComponent.buildComponent(CursorItemIntegralsComponent, { cursorValue: this.props.airspeed, divider: 1, spacing: 37, increment: 1, modulo: 10, notched: 0, positionX: 73, positionY: 38, fontSize: 37.5 })));
    }
}

class NoVSpeedComponent extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.noVSpeedRef = FSComponent.createRef();
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.vSpeeds.v1.sub(() => {
            this.checkVSpeeds();
        });
        this.props.vSpeeds.v2.sub(() => {
            this.checkVSpeeds();
        });
        this.props.vSpeeds.vR.sub(() => {
            this.checkVSpeeds();
        });
        this.props.grounded.sub(() => {
            this.checkVSpeeds();
        });
    }
    checkVSpeeds() {
        const vSpeeds = this.props.vSpeeds;
        if (vSpeeds.v1.get() <= 0 && vSpeeds.vR.get() <= 0 && vSpeeds.v2.get() <= 0 && this.props.grounded.get()) {
            this.noVSpeedRef.instance.removeAttribute('visibility');
        }
        else {
            this.noVSpeedRef.instance.setAttribute('visibility', 'hidden');
        }
    }
    render() {
        return (FSComponent.buildComponent("g", { id: "NoVSpeed", ref: this.noVSpeedRef },
            FSComponent.buildComponent("rect", { x: 118, y: 150, width: 38, height: 135, fill: 'black' }),
            FSComponent.buildComponent("text", { x: 137, y: 168, fill: 'orange', "font-size": 25, "font-family": 'Roboto-Bold', "text-anchor": 'middle', "alignment-baseline": 'central' }, "NO"),
            FSComponent.buildComponent("text", { x: 137, y: 193, fill: 'orange', "font-size": 25, "font-family": 'Roboto-Bold', "text-anchor": 'middle', "alignment-baseline": 'central' }, "V"),
            FSComponent.buildComponent("text", { x: 137, y: 218, fill: 'orange', "font-size": 25, "font-family": 'Roboto-Bold', "text-anchor": 'middle', "alignment-baseline": 'central' }, "S"),
            FSComponent.buildComponent("text", { x: 137, y: 243, fill: 'orange', "font-size": 25, "font-family": 'Roboto-Bold', "text-anchor": 'middle', "alignment-baseline": 'central' }, "P"),
            FSComponent.buildComponent("text", { x: 137, y: 268, fill: 'orange', "font-size": 25, "font-family": 'Roboto-Bold', "text-anchor": 'middle', "alignment-baseline": 'central' }, "D")));
    }
}

class TargetSpeedPointerComponent extends DisplayComponent {
    constructor(props) {
        super(props);
        this.pointerRef = FSComponent.createRef();
        this.refHeight = 640;
        this.isMachModeActive = this.props.autopilotSpeedMode.machModeActive;
        this.selectedSpeed = this.props.autopilotSpeedMode.airspeedHoldValue;
        this.machSpeed = this.props.autopilotSpeedMode.machHoldValue;
        this.indicatedSpeed = this.props.indicatedSpeed;
    }
    render() {
        return (FSComponent.buildComponent("svg", { ref: this.pointerRef, id: "TargetSpeedPointerGroup", viewBox: "0 0 105 40", x: 87.85, y: 300, width: 105, height: 40, xmlns: "http://www.w3.org/2000/svg" },
            FSComponent.buildComponent("path", { fill: 'none', stroke: '#D570FF', "stroke-width": 4, d: 'M 0 22 L 25 10 L 52 10 L 52 34 L 25 34 Z' })));
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.indicatedSpeed.sub((value) => {
            this.update(value);
        });
        this.isMachModeActive.sub(() => {
            this.update(this.selectedSpeed.get());
        });
    }
    update(currentSpeed) {
        const targetSpeed = this.resolveTargetSpeed();
        const positionY = this.valueToSVG(currentSpeed, targetSpeed);
        if (positionY > -10) {
            this.pointerRef.instance.setAttribute('visibility', 'visible');
            this.pointerRef.instance.setAttribute('y', `${positionY - 20}`);
        }
    }
    resolveTargetSpeed() {
        if (this.isMachModeActive.get()) {
            return SimVar.GetGameVarValue('FROM MACH TO KIAS', SimVarValueType.Number, this.machSpeed.get());
        }
        else {
            return this.selectedSpeed.get();
        }
    }
    valueToSVG(current, target) {
        const top = 0;
        const height = this.refHeight;
        if (current < 30) {
            current = 30;
        }
        const delta = Utils.Clamp(current - target, -60, 60);
        let factor = 2.5;
        const deltaSVG = delta * 54 * 2 / 20;
        const realPosition = (top + height * 0.5 + deltaSVG) + factor;
        if (realPosition > height) {
            return 640;
        }
        return (top + height * 0.5 + deltaSVG) + factor;
    }
}

class SpeedTrendComponent extends DisplayComponent {
    constructor(props) {
        super(props);
        this.refHeight = 640;
        this.speedTrendRef = FSComponent.createRef();
        this.accelerationCalculator = new AccelerationCalculator();
        this.indicatedSpeed = this.props.indicatedSpeed;
    }
    render() {
        return (FSComponent.buildComponent("svg", { id: "SpeedTrendArrow", viewBox: "0 0 250 640", x: 18, y: 0, width: 250, height: 640, xmlns: "http://www.w3.org/2000/svg" },
            FSComponent.buildComponent("path", { ref: this.speedTrendRef, fill: 'none', stroke: 'green', "stroke-width": 3, d: '' })));
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.indicatedSpeed.sub((value) => {
            this.updateTrend(value);
        });
    }
    updateTrend(indicatedSpeed) {
        const speedTrend = this.accelerationCalculator.calculate(indicatedSpeed);
        if (speedTrend) {
            let shouldHideSpeedTrend = true;
            if (Math.abs(speedTrend) > 1) {
                let currentSpeed = indicatedSpeed;
                if (currentSpeed < 30) {
                    currentSpeed = 30;
                }
                const path = this.prepareTrendPath(currentSpeed, speedTrend);
                this.speedTrendRef.instance.setAttribute('d', path);
                shouldHideSpeedTrend = false;
            }
            this.speedTrendRef.instance.setAttribute('visibility', (shouldHideSpeedTrend ? 'hidden' : 'visible'));
        }
    }
    prepareTrendPath(currentSpeed, speedTrend) {
        const base = this.valueToSVG(currentSpeed, currentSpeed);
        const top = Math.round((this.valueToSVG(currentSpeed, currentSpeed + speedTrend) + Number.EPSILON) * 10) / 10;
        const topFixed = (speedTrend > 0 ? fastToFixed(top + 11, 1) : fastToFixed(top - 11, 1));
        return `M 70 ${base} L 70 ${topFixed} L 64 ${topFixed} L 70 ${top} L 76 ${topFixed} L 70 ${topFixed}`;
    }
    valueToSVG(current, target) {
        const top = 0;
        const height = this.refHeight;
        if (current < 30) {
            current = 30;
        }
        const delta = current - target;
        const deltaSVG = delta * 54 * 2 / 20;
        return (top + height * 0.5 + deltaSVG) + 2.5;
    }
}
class AccelerationCalculator {
    constructor() {
        this.lastCalculation = undefined;
        this.calculatedAcceleration = 0;
    }
    calculate(currentSpeed, final = true) {
        let speed = currentSpeed < 30 ? 30 : currentSpeed;
        let currentTime = performance.now() / 1000;
        if (!this.lastCalculation) {
            this.lastCalculation = { speed: speed, time: currentTime };
            return;
        }
        const deltaTime = currentTime - this.lastCalculation.time;
        if (deltaTime > 0) {
            const accelerationPerFrame = (speed - this.lastCalculation.speed) / deltaTime;
            this.calculatedAcceleration = Utils.SmoothSin(this.calculatedAcceleration, accelerationPerFrame, 0.28, deltaTime);
        }
        this.lastCalculation = { speed: speed, time: currentTime };
        return (final) ? this.calculatedAcceleration * 10 : this.calculatedAcceleration;
    }
}

class B787Strip extends DisplayComponent {
    constructor(props) {
        super(props);
        this.refHeight = 640;
        /**
         * Need to be checked (maybe borders will make problems)
         * @type {number}
         * @protected
         */
        this.stripHeight = 1920;
        this.stripRef = FSComponent.createRef();
        this.maxSpeed = props.maxSpeed;
        this.forceHide = props.forceHide;
        this.topToBottom = props.topToBottom;
        this.indicatedSpeed = props.indicatedSpeed;
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.indicatedSpeed.sub((value) => {
            this.updateStrip(value);
        });
    }
    updateStrip(indicatedSpeed) {
        let shouldHide = true;
        if (!this.forceHide.get()) {
            if (this.maxSpeed.get() > 30) {
                let positionY = this.valueToSVG(indicatedSpeed, this.maxSpeed.get());
                if (this.topToBottom) {
                    positionY -= this.stripHeight;
                }
                this.stripRef.instance.setAttribute('transform', `translate(-2 ${positionY})`);
                shouldHide = false;
            }
        }
        if (shouldHide) {
            this.stripRef.instance.setAttribute('visibility', 'hidden');
        }
        else {
            this.stripRef.instance.setAttribute('visibility', 'visible');
        }
    }
    valueToSVG(current, target) {
        const top = 0;
        const height = this.refHeight;
        if (current < 30) {
            current = 30;
        }
        const delta = current - target;
        const deltaSVG = delta * 54 * 2 / 20;
        return (top + height * 0.5 + deltaSVG) + 2.5;
    }
}

class B787VMAXStrip extends B787Strip {
    constructor(props) {
        super(props);
    }
    render() {
        return (FSComponent.buildComponent("g", { ref: this.stripRef, id: "VMax" },
            FSComponent.buildComponent("path", { fill: 'black', stroke: 'none', d: 'M 0 0 l 14 0 l 0 1920 l -14 0 Z' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1906, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1876, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1846, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1816, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1786, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1756, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1726, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1696, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1666, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1636, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1606, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1576, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1546, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1516, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1486, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1456, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1426, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1396, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1366, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1336, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1306, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1276, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1246, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1216, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1186, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1156, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1126, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1096, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1066, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1036, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1006, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 976, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 946, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 916, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 886, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 856, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 826, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 796, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 766, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 736, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 706, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 676, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 646, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 616, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 586, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 556, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 526, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 496, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 466, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 436, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 406, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 376, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 346, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 316, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 286, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 256, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 226, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 196, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 166, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 136, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 106, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 76, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 46, fill: "red" }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 16, fill: "red" })));
    }
}

class B787StallProtMaxStrip extends B787Strip {
    constructor(props) {
        super(props);
    }
    render() {
        return (FSComponent.buildComponent("g", { ref: this.stripRef, id: "StallProtMax" },
            FSComponent.buildComponent("path", { fill: 'black', stroke: 'none', d: 'M 0 0 l 14 0 l 0 1920 l -14 0 Z' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1906, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1876, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1846, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1816, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1786, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1756, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1726, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1696, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1666, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1636, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1606, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1576, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1546, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1516, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1486, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1456, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1426, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1396, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1366, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1336, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1306, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1276, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1246, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1216, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1186, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1156, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1126, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1096, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1066, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1036, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 1006, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 976, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 946, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 916, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 886, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 856, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 826, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 796, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 766, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 736, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 706, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 676, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 646, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 616, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 586, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 556, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 526, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 496, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 466, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 436, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 406, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 376, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 346, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 316, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 286, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 256, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 226, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 196, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 166, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 136, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 106, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 76, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 46, fill: 'red' }),
            FSComponent.buildComponent("rect", { x: 0, width: 14, height: 14, y: 16, fill: 'red' })));
    }
}

class B787StallProtMinStrip extends B787Strip {
    constructor(props) {
        super(props);
    }
    render() {
        return (FSComponent.buildComponent("g", { ref: this.stripRef, id: "StallProtMin" },
            FSComponent.buildComponent("path", { fill: 'none', stroke: 'orange', "stroke-width": '3', d: 'M 0 0 l 9 0 l 0 1920 l -9 0 Z' })));
    }
}

class StripsComponent extends DisplayComponent {
    constructor(props) {
        super(props);
        this.shouldForceHideMaxSpeedStrip = Subject.create(false);
        this.shouldForceHideStallStrips = Subject.create(false);
        this.aircraftBaseSpeeds = this.props.aircraftBaseSpeeds;
        this.altitudeAboveGround = this.props.altitudeAboveGround;
        this.indicatedSpeed = this.props.indicatedSpeed;
    }
    onBeforeRender() {
        super.onBeforeRender();
        this.altitudeAboveGround.sub((value) => {
            this.shouldForceHideStallStrips.set((value < 10));
        });
    }
    render() {
        return (FSComponent.buildComponent("svg", { id: "StripsGroup", viewBox: "0 0 105 640", x: 112, y: 0, width: 105, height: 640, xmlns: "http://www.w3.org/2000/svg" },
            FSComponent.buildComponent(B787VMAXStrip, { indicatedSpeed: this.indicatedSpeed, maxSpeed: this.aircraftBaseSpeeds.maxSpeed, forceHide: this.shouldForceHideMaxSpeedStrip, topToBottom: true }),
            FSComponent.buildComponent(B787StallProtMinStrip, { indicatedSpeed: this.indicatedSpeed, maxSpeed: this.aircraftBaseSpeeds.stallProtectionMin, forceHide: this.shouldForceHideStallStrips, topToBottom: false }),
            FSComponent.buildComponent(B787StallProtMaxStrip, { indicatedSpeed: this.indicatedSpeed, maxSpeed: this.aircraftBaseSpeeds.stallProtectionMax, forceHide: this.shouldForceHideStallStrips, topToBottom: false })));
    }
}

class B787SpeedMarker extends DisplayComponent {
    constructor(props) {
        super(props);
        this.refHeight = 640;
        this.speedMarkerWidth = 105;
        this.speedMarkerHeight = 70;
        this.markerRef = FSComponent.createRef();
        this.markerLineRef = FSComponent.createRef();
        this.onScreenRef = FSComponent.createRef();
        this.offScreenRef = FSComponent.createRef();
        this.id = props.text + '_Marker';
        this.width = Math.round(this.speedMarkerWidth * props.scale);
        this.height = Math.round(this.speedMarkerHeight * props.scale * 1.05);
        this.viewBox = `0 0 ${this.speedMarkerWidth} ${(this.speedMarkerHeight * 1.05)}`;
        this.offsetY = (this.speedMarkerHeight - this.speedMarkerHeight * props.scale) * 0.5;
        this.offsetYLine = this.offsetY + this.speedMarkerHeight * 0.5;
        this.offsetYText = this.offsetY + (this.speedMarkerHeight * 0.5);
        this.offsetYSpeed = this.offsetY + (this.speedMarkerHeight * 0.8);
        this.fontSize = 25 * props.textScale;
    }
    /**
     * Default implementation of speed marker
     * (B787-10)
     * @returns {VNode}
     */
    render() {
        return (FSComponent.buildComponent("svg", { ref: this.markerRef, id: this.id, class: "SpeedMarker", x: this.props.x, y: this.props.y, width: this.width, height: this.height, viewBox: this.viewBox, xmlns: "http://www.w3.org/2000/svg" },
            FSComponent.buildComponent("line", { ref: this.markerLineRef, x1: 0, x2: 23, y1: this.offsetYLine, y2: this.offsetYLine, stroke: this.props.color, "stroke-width": 4 }),
            FSComponent.buildComponent("text", { ref: this.onScreenRef, x: 28, y: this.offsetYText, fill: this.props.color, "font-size": this.fontSize, "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }, this.props.text),
            FSComponent.buildComponent("text", { ref: this.offScreenRef, x: 45, y: this.offsetYSpeed, fill: this.props.color, "font-size": this.fontSize, "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }, "\u00A0")));
    }
    valueToSVG(current, target) {
        const top = 0;
        const height = this.refHeight;
        if (current < 30) {
            current = 30;
        }
        const delta = current - target;
        const deltaSVG = delta * 54 * 2 / 20;
        return (top + height * 0.5 + deltaSVG) + 2.5;
    }
}

class B787SpeedMarkerV1 extends B787SpeedMarker {
    constructor(props) {
        super(props);
        this.markerRef = FSComponent.createRef();
        this.markerGroupRef = FSComponent.createRef();
        this.isMarkerPassed = Subject.create(false);
        const params = this.props.params;
        this.v1Speed = params.vSpeeds.v1;
        this.indicatedSpeed = params.indicatedSpeed;
    }
    render() {
        return (FSComponent.buildComponent("svg", { ref: this.markerRef, id: this.id, class: "SpeedMarker", x: this.props.x, y: this.props.y, width: this.width, height: this.height, viewBox: this.viewBox, xmlns: "http://www.w3.org/2000/svg" },
            FSComponent.buildComponent("line", { ref: this.markerLineRef, x1: 0, x2: 40, y1: this.offsetYLine, y2: this.offsetYLine, stroke: this.props.color, "stroke-width": 4 }),
            FSComponent.buildComponent("text", { ref: this.onScreenRef, x: 45, y: this.offsetYText, fill: this.props.color, "font-size": this.fontSize, "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }, this.props.text),
            FSComponent.buildComponent("text", { ref: this.offScreenRef, x: 45, y: this.offsetYSpeed, fill: this.props.color, "font-size": this.fontSize, "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }, "\u00A0")));
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.bus.getSubscriber().on('altitudeAboveGround').whenChangedBy(5).handle((value) => {
            if (value > 30) {
                this.isMarkerPassed.set(true);
            }
        });
        this.isMarkerPassed.sub((value) => {
            if (value) {
                this.markerRef.instance.style.display = 'none';
            }
            else {
                this.markerRef.instance.style.display = '';
            }
        });
        this.v1Speed.sub(() => {
            if (!this.isMarkerPassed.get()) {
                this.updateMarker();
            }
        });
        this.indicatedSpeed.sub(() => {
            if (!this.isMarkerPassed.get()) {
                this.updateMarker();
            }
        });
    }
    updateMarker() {
        let v1Speed = this.v1Speed.get();
        let indicatedSpeed = this.indicatedSpeed.get();
        if (v1Speed > 0) {
            let positionY = this.fixPositionY(this.valueToSVG(indicatedSpeed, v1Speed));
            if (positionY < 0) {
                positionY = 0;
                this.offScreenRef.instance.textContent = Math.round(v1Speed).toString();
                this.offScreenRef.instance.setAttribute('visibility', 'visible');
                this.onScreenRef.instance.setAttribute('visibility', 'visible');
                this.markerLineRef.instance.setAttribute('visibility', 'hidden');
            }
            else {
                this.offScreenRef.instance.setAttribute('visibility', 'hidden');
                this.onScreenRef.instance.setAttribute('visibility', 'visible');
                this.markerLineRef.instance.setAttribute('visibility', 'visible');
            }
            this.markerRef.instance.style.display = '';
            this.markerRef.instance.setAttribute('y', positionY.toString());
        }
        else {
            this.markerRef.instance.style.display = 'none';
        }
    }
    fixPositionY(value) {
        return value - this.height * 0.5;
    }
}

class B787SpeedMarkerVR extends B787SpeedMarker {
    constructor(props) {
        super(props);
        this.isMarkerPassed = Subject.create(false);
        const params = this.props.params;
        this.vRSpeed = params.vSpeeds.vR;
        this.v1Speed = params.vSpeeds.v1;
        this.v2Speed = params.vSpeeds.v2;
        this.indicatedSpeed = params.indicatedSpeed;
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.bus.getSubscriber().on('altitudeAboveGround').whenChangedBy(5).handle((value) => {
            if (value > 30) {
                this.isMarkerPassed.set(true);
            }
        });
        this.isMarkerPassed.sub((value) => {
            if (value) {
                this.markerRef.instance.style.display = 'none';
            }
            else {
                this.markerRef.instance.style.display = 'block';
            }
        });
        this.vRSpeed.sub(() => {
            if (!this.isMarkerPassed.get()) {
                this.updateMarker();
            }
        });
        this.indicatedSpeed.sub(() => {
            if (!this.isMarkerPassed.get()) {
                this.updateMarker();
            }
        });
    }
    updateMarker() {
        let vRSpeed = this.vRSpeed.get();
        let indicatedSpeed = this.indicatedSpeed.get();
        let enableSaveArea = false;
        if (vRSpeed > 0) {
            let positionY = this.fixPositionY(this.valueToSVG(indicatedSpeed, vRSpeed));
            const safeBordersV1 = [this.v1Speed.get() - 4, this.v1Speed.get() + 4];
            const safeBordersV2 = [this.v2Speed.get() - 4, this.v2Speed.get() + 4];
            if ((vRSpeed >= safeBordersV1[0] && vRSpeed <= safeBordersV1[1]) || (vRSpeed >= safeBordersV2[0] && vRSpeed <= safeBordersV2[1])) {
                enableSaveArea = true;
            }
            if (positionY < 25) {
                positionY = 25;
                this.offScreenRef.instance.setAttribute('visibility', 'hidden');
                this.onScreenRef.instance.setAttribute('visibility', 'hidden');
                this.markerLineRef.instance.setAttribute('visibility', 'hidden');
            }
            else {
                this.onScreenRef.instance.textContent = (enableSaveArea ? 'R' : 'VR');
                this.offScreenRef.instance.setAttribute('visibility', 'hidden');
                this.onScreenRef.instance.setAttribute('visibility', 'visible');
                this.markerLineRef.instance.setAttribute('visibility', 'visible');
            }
            if (enableSaveArea) {
                this.onScreenRef.instance.setAttribute('transform', 'translate(30, 0)');
            }
            else {
                this.onScreenRef.instance.setAttribute('transform', '');
            }
            this.markerRef.instance.style.display = 'block';
            this.markerRef.instance.setAttribute('y', positionY.toString());
        }
        else {
            this.markerRef.instance.style.display = 'none';
        }
    }
    fixPositionY(value) {
        return value - this.height * 0.5;
    }
}

class B787SpeedMarkerV2 extends B787SpeedMarker {
    constructor(props) {
        super(props);
        this.afterTakeoff = Subject.create(false);
        this.isMarkerPassed = Subject.create(false);
        const params = this.props.params;
        this.v2Speed = params.vSpeeds.v2;
        this.indicatedSpeed = params.indicatedSpeed;
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.v2Speed.sub(() => {
            this.updateMarker();
        });
        this.indicatedSpeed.sub(() => {
            this.updateMarker();
        });
        this.afterTakeoff.sub(() => {
            this.updateMarker();
        });
    }
    updateMarker() {
        let isMarkerPassed = this.isMarkerPassed.get();
        if (isMarkerPassed) {
            this.markerRef.instance.setAttribute('visibility', 'hidden');
            return;
        }
        let v2Speed = this.v2Speed.get();
        if (v2Speed === -1) {
            this.afterTakeoff.set(true);
            /**
             * TODO: Check B787SpeedMarkerV1 for description
             * @type {number}
             */
            v2Speed = Simplane.getV2AirspeedP(FlightPhase.FLIGHT_PHASE_TAKEOFF);
        }
        let indicatedSpeed = this.indicatedSpeed.get();
        let afterTakeoff = this.afterTakeoff.get();
        if (afterTakeoff && isMarkerPassed) {
            this.markerRef.instance.setAttribute('visibility', 'hidden');
            return;
        }
        if (v2Speed > 0) {
            let positionY = this.fixPositionY(this.valueToSVG(indicatedSpeed, v2Speed));
            if (positionY < 25) {
                positionY = 25;
                //this.offScreenRef.instance.textContent = Math.round(v2Speed).toString();
                this.offScreenRef.instance.setAttribute('visibility', 'hidden');
                this.onScreenRef.instance.setAttribute('visibility', 'hidden');
                this.markerLineRef.instance.setAttribute('visibility', 'hidden');
            }
            else {
                this.offScreenRef.instance.setAttribute('visibility', 'hidden');
                this.onScreenRef.instance.setAttribute('visibility', 'visible');
                this.markerLineRef.instance.setAttribute('visibility', 'visible');
                if (positionY >= this.refHeight + 25) {
                    this.isMarkerPassed.set(true);
                }
            }
            this.markerRef.instance.setAttribute('visibility', 'visible');
            this.markerRef.instance.setAttribute('y', positionY.toString());
        }
        else {
            this.markerRef.instance.setAttribute('visibility', 'hidden');
        }
    }
    fixPositionY(value) {
        return value - this.height * 0.5;
    }
}

class B787SpeedMarkerFlaps extends B787SpeedMarker {
    constructor(props) {
        super(props);
        this.indicatedSpeed = Subject.create(0);
        this.flapsHandleIndex = Subject.create(0);
        this.flightPhase = Subject.create(FlightPhase.FLIGHT_PHASE_PREFLIGHT);
        this.altitude = Subject.create(0);
        const params = props.params;
        this.markerFlapIndex = params.markerFlapIndex;
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.bus.getSubscriber().on('indicatedSpeed').withPrecision(2).handle((value => {
            this.indicatedSpeed.set(value);
        }));
        this.props.bus.getSubscriber().on('altitude').whenChangedBy(10).handle((value => {
            this.altitude.set(value);
        }));
        this.props.bus.getSubscriber().on('flightPhase').whenChanged().handle((value) => {
            this.flightPhase.set(value);
        });
        this.props.bus.getSubscriber().on('flapsHandleIndex').whenChanged().handle((value) => {
            this.flapsHandleIndex.set(value);
        });
        this.flapsHandleIndex.sub(() => {
            this.updateMarker();
        });
        this.indicatedSpeed.sub(() => {
            this.updateMarker();
        });
    }
    updateMarker() {
        const altitude = this.altitude.get();
        const flightPhase = this.flightPhase.get();
        let shouldHideMarker = true;
        if (flightPhase >= FlightPhase.FLIGHT_PHASE_TAKEOFF || altitude < 20000) {
            if (this.markerFlapIndex == this.flapsHandleIndex.get()) {
                shouldHideMarker = false;
            }
            if (flightPhase == FlightPhase.FLIGHT_PHASE_CLIMB || flightPhase == FlightPhase.FLIGHT_PHASE_CRUISE) {
                if (this.markerFlapIndex == (this.flapsHandleIndex.get() - 1)) {
                    shouldHideMarker = false;
                }
            }
            else {
                if (this.markerFlapIndex == (this.flapsHandleIndex.get() + 1)) {
                    shouldHideMarker = false;
                }
            }
        }
        if (shouldHideMarker) {
            this.markerRef.instance.setAttribute('visibility', 'hidden');
        }
        else {
            let speedLimit;
            if (this.markerFlapIndex === 0) {
                speedLimit = Simplane.getFlapsLimitSpeed(Aircraft.AS01B, 1) + 20;
                this.onScreenRef.instance.textContent = this.props.text;
            }
            else {
                speedLimit = Simplane.getFlapsLimitSpeed(Aircraft.AS01B, this.markerFlapIndex);
                this.onScreenRef.instance.textContent = this.props.text;
            }
            const speedBuffer = B787SpeedMarkerFlaps.calculateSpeedBuffer(altitude);
            const positionY = this.fixPositionY(this.valueToSVG(this.indicatedSpeed.get(), speedLimit - speedBuffer));
            this.markerRef.instance.setAttribute('y', positionY.toString());
            this.markerRef.instance.setAttribute('visibility', 'visible');
        }
    }
    static calculateSpeedBuffer(altitude) {
        let speedBuffer = 50;
        let weightRatio = Simplane.getWeight() / Simplane.getMaxWeight();
        const altitudeRatio = altitude / 30000;
        weightRatio = (weightRatio - 0.65) / (1 - 0.65);
        weightRatio = 1.0 - Utils.Clamp(weightRatio, 0, 1);
        speedBuffer *= (weightRatio * 0.7 + altitudeRatio * 0.3);
        return speedBuffer;
    }
    fixPositionY(value) {
        return value - this.height * 0.5;
    }
}

class B787SpeedMarkerVREF extends B787SpeedMarker {
    constructor(props) {
        super(props);
        const params = this.props.params;
        this.vREFSpeed = params.vSpeeds.vREF;
        this.indicatedSpeed = params.indicatedSpeed;
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.vREFSpeed.sub(() => {
            this.updateMarker();
        });
        this.indicatedSpeed.sub(() => {
            this.updateMarker();
        });
    }
    updateMarker() {
        let vREFSpeed = this.vREFSpeed.get();
        if (vREFSpeed <= 0) {
            this.markerRef.instance.style.display = 'none';
            return;
        }
        else {
            let indicatedSpeed = this.indicatedSpeed.get();
            let positionY = this.valueToSVG(indicatedSpeed, vREFSpeed);
            if (positionY > this.refHeight - 55) {
                positionY = this.refHeight - 55;
                this.offScreenRef.instance.textContent = Math.round(vREFSpeed).toString();
                this.offScreenRef.instance.setAttribute('visibility', 'visible');
                this.onScreenRef.instance.setAttribute('visibility', 'visible');
                this.markerLineRef.instance.setAttribute('visibility', 'hidden');
            }
            else {
                this.offScreenRef.instance.setAttribute('visibility', 'hidden');
                this.onScreenRef.instance.setAttribute('visibility', 'visible');
                this.markerLineRef.instance.setAttribute('visibility', 'visible');
            }
            positionY = this.fixPositionY(positionY);
            this.markerRef.instance.style.display = 'block';
            this.markerRef.instance.setAttribute('y', positionY.toString());
        }
    }
    render() {
        return (FSComponent.buildComponent("svg", { ref: this.markerRef, id: this.id, class: "SpeedMarker", x: this.props.x, y: this.props.y, width: this.width, height: this.height, viewBox: this.viewBox, xmlns: "http://www.w3.org/2000/svg" },
            FSComponent.buildComponent("line", { ref: this.markerLineRef, x1: 0, x2: 23, y1: this.offsetYLine, y2: this.offsetYLine, stroke: this.props.color, "stroke-width": 4 }),
            FSComponent.buildComponent("text", { ref: this.onScreenRef, x: 28, y: this.offsetYText, fill: this.props.color, "font-size": this.fontSize, "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }, this.props.text),
            FSComponent.buildComponent("text", { ref: this.offScreenRef, x: 28, y: this.offsetYSpeed, fill: this.props.color, "font-size": this.fontSize, "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }, "\u00A0")));
    }
    fixPositionY(value) {
        return value - this.height * 0.5;
    }
}

class SpeedMarkersComponent extends DisplayComponent {
    constructor(props) {
        super(props);
    }
    render() {
        return (FSComponent.buildComponent("g", { id: "SpeedMarkersGroup" },
            FSComponent.buildComponent(B787SpeedMarkerV1, { bus: this.props.bus, text: "V1", x: 85, y: 0, scale: 0.87, textScale: 1, color: "#24F000", background: false, params: { vSpeeds: this.props.vSpeeds, indicatedSpeed: this.props.indicatedSpeed } }),
            FSComponent.buildComponent(B787SpeedMarkerVR, { bus: this.props.bus, text: "VR", x: 100, y: 0, scale: 0.87, textScale: 1, color: "#24F000", background: false, params: { vSpeeds: this.props.vSpeeds, indicatedSpeed: this.props.indicatedSpeed } }),
            FSComponent.buildComponent(B787SpeedMarkerV2, { bus: this.props.bus, text: "V2", x: 100, y: 0, scale: 0.87, textScale: 1, color: "#24F000", background: false, params: { vSpeeds: this.props.vSpeeds, indicatedSpeed: this.props.indicatedSpeed } }),
            FSComponent.buildComponent(B787SpeedMarkerVREF, { bus: this.props.bus, text: "REF", x: 100, y: 0, scale: 0.87, textScale: 1, color: "#24F000", background: false, params: { vSpeeds: this.props.vSpeeds, indicatedSpeed: this.props.indicatedSpeed } }),
            FSComponent.buildComponent(B787SpeedMarkerFlaps, { bus: this.props.bus, text: "UP", x: 107, y: 0, scale: 0.87, textScale: 1, color: "#24F000", background: false, params: { markerFlapIndex: 0 } }),
            FSComponent.buildComponent(B787SpeedMarkerFlaps, { bus: this.props.bus, text: "1", x: 107, y: 0, scale: 0.87, textScale: 1, color: "#24F000", background: false, params: { markerFlapIndex: 1 } }),
            FSComponent.buildComponent(B787SpeedMarkerFlaps, { bus: this.props.bus, text: "5", x: 107, y: 0, scale: 0.87, textScale: 1, color: "#24F000", background: false, params: { markerFlapIndex: 2 } }),
            FSComponent.buildComponent(B787SpeedMarkerFlaps, { bus: this.props.bus, text: "10", x: 107, y: 0, scale: 0.87, textScale: 1, color: "#24F000", background: false, params: { markerFlapIndex: 3 } }),
            FSComponent.buildComponent(B787SpeedMarkerFlaps, { bus: this.props.bus, text: "15", x: 107, y: 0, scale: 0.87, textScale: 1, color: "#24F000", background: false, params: { markerFlapIndex: 4 } }),
            FSComponent.buildComponent(B787SpeedMarkerFlaps, { bus: this.props.bus, text: "17", x: 107, y: 0, scale: 0.87, textScale: 1, color: "#24F000", background: false, params: { markerFlapIndex: 5 } }),
            FSComponent.buildComponent(B787SpeedMarkerFlaps, { bus: this.props.bus, text: "18", x: 107, y: 0, scale: 0.87, textScale: 1, color: "#24F000", background: false, params: { markerFlapIndex: 6 } }),
            FSComponent.buildComponent(B787SpeedMarkerFlaps, { bus: this.props.bus, text: "20", x: 107, y: 0, scale: 0.87, textScale: 1, color: "#24F000", background: false, params: { markerFlapIndex: 7 } }),
            FSComponent.buildComponent(B787SpeedMarkerFlaps, { bus: this.props.bus, text: "25", x: 107, y: 0, scale: 0.87, textScale: 1, color: "#24F000", background: false, params: { markerFlapIndex: 8 } }),
            FSComponent.buildComponent(B787SpeedMarkerFlaps, { bus: this.props.bus, text: "30", x: 107, y: 0, scale: 0.87, textScale: 1, color: "#24F000", background: false, params: { markerFlapIndex: 9 } })));
    }
}

class TargetSpeedComponent extends DisplayComponent {
    constructor(props) {
        super(props);
        this.textRef = FSComponent.createRef();
        this.refHeight = 640;
        this.isMachModeActive = this.props.autopilotSpeedMode.machModeActive;
        this.selectedSpeed = this.props.autopilotSpeedMode.airspeedHoldValue;
        this.machSpeed = this.props.autopilotSpeedMode.machHoldValue;
    }
    render() {
        return (FSComponent.buildComponent("g", null,
            FSComponent.buildComponent("rect", { x: "70", y: "20", width: "90", height: "45", fill: "black" }),
            FSComponent.buildComponent("text", { ref: this.textRef, x: "160", y: "40", fill: "#D570FF", "font-size": "37.5", "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" })));
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.autopilotSpeedMode.machModeActive.sub(() => {
            this.update();
        });
        this.props.autopilotSpeedMode.machHoldValue.sub(() => {
            this.update();
        });
        this.props.autopilotSpeedMode.airspeedHoldValue.sub(() => {
            this.update();
        });
    }
    update() {
        this.textRef.instance.textContent = this.resolveTargetSpeedText();
    }
    resolveTargetSpeedText() {
        if (this.isMachModeActive.get()) {
            const targetMach = this.machSpeed.get();
            if (targetMach < 1.0) {
                const fixedMach = fastToFixed(targetMach, 3);
                const dotPosition = fixedMach.indexOf('.');
                return fixedMach.slice(dotPosition);
            }
            else {
                return fastToFixed(targetMach, 1);
            }
        }
        else {
            return Utils.leadingZeros(Math.round(this.selectedSpeed.get()), 3);
        }
    }
}

class AirspeedIndicatorComponent extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.machSpeedRef = FSComponent.createRef();
    }
    render() {
        return (FSComponent.buildComponent("svg", { id: "ViewBox", viewBox: "0 0 250 800", xmlns: "http://www.w3.org/2000/svg" },
            FSComponent.buildComponent("g", { id: "Airspeed" },
                FSComponent.buildComponent(TargetSpeedComponent, { autopilotSpeedMode: this.props.autopilotSpeedMode }),
                FSComponent.buildComponent("svg", { id: "CenterGroup", viewBox: "0 0 160 640", x: "47.5", y: "85", width: "170", height: "640", xmlns: "http://www.w3.org/2000/svg" },
                    FSComponent.buildComponent("rect", { x: 7, y: 0, width: 105, height: 640, fill: '#525252', "fill-opacity": 0.6, stroke: 'black', "stroke-width": 1, "stroke-opacity": 0.5 }),
                    FSComponent.buildComponent(GraduationsComponent, { indicatedSpeed: this.props.indicatedAirspeed }),
                    FSComponent.buildComponent(CursorComponent, { airspeed: this.props.indicatedAirspeed }),
                    FSComponent.buildComponent(NoVSpeedComponent, { vSpeeds: this.props.vSpeeds, grounded: this.props.grounded }),
                    FSComponent.buildComponent(TargetSpeedPointerComponent, { indicatedSpeed: this.props.indicatedAirspeed, autopilotSpeedMode: this.props.autopilotSpeedMode }),
                    FSComponent.buildComponent(SpeedTrendComponent, { indicatedSpeed: this.props.indicatedAirspeed }),
                    FSComponent.buildComponent(StripsComponent, { aircraftBaseSpeeds: this.props.aircraftBaseSpeeds, altitudeAboveGround: this.props.altitudeAboveGround, indicatedSpeed: this.props.indicatedAirspeed }),
                    FSComponent.buildComponent(SpeedMarkersComponent, { bus: this.props.bus, vSpeeds: this.props.vSpeeds, indicatedSpeed: this.props.indicatedAirspeed })),
                FSComponent.buildComponent("text", { ref: this.machSpeedRef, x: 70, y: 770, fill: "white", "font-size": 35, "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "top" }))));
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.aircraftSpeeds.smoothMach.sub((value) => {
            if (value > 0.998) {
                value = 0.998;
            }
            if (value >= 0.4) {
                const valueString = fastToFixed(value, 3).slice(1);
                this.machSpeedRef.instance.textContent = valueString;
                this.machSpeedRef.instance.style.display = 'block';
            }
            else {
                this.machSpeedRef.instance.style.display = 'none';
            }
        });
    }
}
/**
 *         var posX = 100;
 *         var posY = 0;
 *         var width = 105;
 *         var height = 640;
 *         var arcWidth = 35;
 *         var sideTextHeight = 80;
 */

class AutopilotSpeedMode {
    constructor() {
        this.airspeedHoldValue = Subject.create(0);
        this.machHoldValue = Subject.create(0);
        this.machModeActive = Subject.create(false);
    }
}

class VSpeeds {
    constructor() {
        this.v1 = Subject.create(0);
        this.vR = Subject.create(0);
        this.v2 = Subject.create(0);
        this.vREF = Subject.create(0);
        this.vX = Subject.create(0);
    }
}

class AircraftBaseSpeeds {
    constructor() {
        this.cruiseMach = Subject.create(0);
        this.stallSpeed = Subject.create(0);
        this.lowestSelectableSpeed = Subject.create(0);
        this.stallProtectionMin = Subject.create(0);
        this.stallProtectionMax = Subject.create(0);
        this.crossSpeed = Subject.create(0);
        this.crossSpeedFactor = Subject.create(0);
        this.maxSpeed = Subject.create(0);
    }
}

class AircraftSpeeds {
    constructor() {
        this.indicatedAirspeed = Subject.create(0);
        this.trueMach = Subject.create(0);
        this.smoothMach = Subject.create(0);
    }
}

class ILSIndicatorComponent extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.glideSlopeCursorMinY = 306.375;
        this.glideSlopeCursorMaxY = 72.625;
        this.glideSlopeCursorPositionY = 189.5;
        this.glideSlopeCursorPositionX = 422.5;
        this.localizerCursorMinX = 132.625;
        this.localizerCursorMaxX = 366.375;
        this.localizerCursorPositionY = 452.5;
        this.localizerCursorPositionX = 249.5;
        this.ilsGroupRef = FSComponent.createRef();
        this.ilsInfoGroupRef = FSComponent.createRef();
        this.glideSlopeGroupRef = FSComponent.createRef();
        this.glideSlopeCursorGroupRef = FSComponent.createRef();
        this.glideSlopeCursorUpRef = FSComponent.createRef();
        this.glideSlopeCursorDownRef = FSComponent.createRef();
        this.localizerGroupRef = FSComponent.createRef();
        this.localizerCursorUpRef = FSComponent.createRef();
        this.localizerCursorDownRef = FSComponent.createRef();
        this.localizerCursorGroupRef = FSComponent.createRef();
        this.ilsIdentRef = FSComponent.createRef();
        this.ilsFrequencyRef = FSComponent.createRef();
        this.ilsDistanceRef = FSComponent.createRef();
        this.updateLoopId = undefined;
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.ilsBacon.sub((value) => {
            if (value !== 0) {
                this.localizer = this.props.radioNav.getBestILSBeacon();
                this.updateLoopId = window.setInterval(this.rerenderILS.bind(this), 50);
            }
            else {
                clearInterval(this.updateLoopId);
                this.ilsGroupRef.instance.style.display = 'none';
                this.ilsInfoGroupRef.instance.style.display = 'none';
            }
        });
    }
    rerenderILS() {
        const isApproachLoaded = Simplane.getAutoPilotApproachLoaded();
        const approachType = Simplane.getAutoPilotApproachType();
        /**
         * GlideSlope updater
         */
        if (this.localizer && this.localizer.id > 0 && SimVar.GetSimVarValue(`NAV HAS GLIDE SLOPE:${this.localizer.id}`, SimVarValueType.Bool)) {
            const gsi = -SimVar.GetSimVarValue(`NAV GSI:${this.localizer.id}`, SimVarValueType.Number) / 127;
            const delta = (gsi + 1) * 0.5;
            const positionY = this.glideSlopeCursorMinY + (this.glideSlopeCursorMaxY - this.glideSlopeCursorMinY) * delta;
            const calculatedPositionY = Math.min(this.glideSlopeCursorMinY, Math.max(this.glideSlopeCursorMaxY, positionY));
            this.glideSlopeCursorGroupRef.instance.setAttribute('transform', `translate(${this.glideSlopeCursorPositionX} ${calculatedPositionY})`);
            if (delta >= 0.95 || delta <= 0.05) {
                this.glideSlopeCursorUpRef.instance.setAttribute('fill', 'transparent');
                this.glideSlopeCursorDownRef.instance.setAttribute('fill', 'transparent');
            }
            else {
                this.glideSlopeCursorUpRef.instance.setAttribute('fill', '#FF0CE2');
                this.glideSlopeCursorDownRef.instance.setAttribute('fill', '#FF0CE2');
            }
            this.glideSlopeCursorUpRef.instance.setAttribute('visibility', 'visible');
            this.glideSlopeCursorDownRef.instance.setAttribute('visibility', 'visible');
        }
        else {
            this.glideSlopeCursorUpRef.instance.setAttribute('visibility', 'hidden');
            this.glideSlopeCursorDownRef.instance.setAttribute('visibility', 'hidden');
        }
        /**
         * Localizer updater
         */
        if ((!isApproachLoaded || approachType !== ApproachType.APPROACH_TYPE_RNAV) && this.localizer && this.localizer.id > 0) {
            const cdi = SimVar.GetSimVarValue(`NAV CDI:${this.localizer.id}`, SimVarValueType.Number) / 127;
            const delta = (cdi + 1) * 0.5;
            const positionX = this.localizerCursorMinX + (this.localizerCursorMaxX - this.localizerCursorMinX) * delta;
            const calculatedPositionX = Math.max(this.localizerCursorMinX, Math.min(this.localizerCursorMaxX, positionX));
            this.localizerCursorGroupRef.instance.setAttribute('transform', `translate(${calculatedPositionX} ${this.localizerCursorPositionY})`);
            if (delta >= 0.95 || delta <= 0.05) {
                this.localizerCursorUpRef.instance.setAttribute('fill', 'transparent');
                this.localizerCursorDownRef.instance.setAttribute('fill', 'transparent');
            }
            else {
                this.localizerCursorUpRef.instance.setAttribute('fill', '#FF0CE2');
                this.localizerCursorDownRef.instance.setAttribute('fill', '#FF0CE2');
            }
            this.localizerCursorUpRef.instance.setAttribute('visibility', 'visible');
            this.localizerCursorDownRef.instance.setAttribute('visibility', 'visible');
        }
        else {
            this.localizerCursorUpRef.instance.setAttribute('visibility', 'hidden');
            this.localizerCursorDownRef.instance.setAttribute('visibility', 'hidden');
        }
        /**
         * Information updater
         */
        if (this.localizer && this.localizer.id > 0) {
            this.ilsInfoGroupRef.instance.setAttribute('visibility', 'visible');
            this.ilsIdentRef.instance.textContent = this.localizer.ident;
            this.ilsFrequencyRef.instance.textContent = fastToFixed(this.localizer.freq, 2);
            if (SimVar.GetSimVarValue(`NAV HAS DME:${this.localizer.id}`, SimVarValueType.Bool)) {
                const distance = SimVar.GetSimVarValue(`NAV DME:${this.localizer.id}`, SimVarValueType.NM);
                this.ilsDistanceRef.instance.textContent = fastToFixed(distance, 1) + 'NM';
            }
            else {
                this.ilsDistanceRef.instance.textContent = '';
            }
        }
        else {
            this.ilsInfoGroupRef.instance.setAttribute('visibility', 'hidden');
        }
        this.ilsGroupRef.instance.style.display = 'block';
        this.ilsInfoGroupRef.instance.style.display = 'block';
    }
    render() {
        return (FSComponent.buildComponent("svg", { id: "ViewBox", viewBox: "0 0 500 500", xmlns: "http://www.w3.org/2000/svg" },
            FSComponent.buildComponent("g", { id: "ILSGroup", ref: this.ilsGroupRef, transform: 'translate(100 80) scale(0.6)' },
                FSComponent.buildComponent("g", { id: "GlideSlopeGroup", ref: this.glideSlopeGroupRef },
                    FSComponent.buildComponent("rect", { id: "GlideSlopeBackground", x: 405, y: 52, width: 35, height: 275, fill: '#525252', "fill-opacity": 0.6 }),
                    FSComponent.buildComponent("circle", { cx: this.glideSlopeCursorPositionX, cy: 247.9375, r: 5, fill: 'none', stroke: 'white', "stroke-width": 2 }),
                    FSComponent.buildComponent("circle", { cx: this.glideSlopeCursorPositionX, cy: 306.375, r: 5, fill: 'none', stroke: 'white', "stroke-width": 2 }),
                    FSComponent.buildComponent("circle", { cx: this.glideSlopeCursorPositionX, cy: 131.0625, r: 5, fill: 'none', stroke: 'white', "stroke-width": 2 }),
                    FSComponent.buildComponent("circle", { cx: this.glideSlopeCursorPositionX, cy: 72.625, r: 5, fill: 'none', stroke: 'white', "stroke-width": 2 })),
                FSComponent.buildComponent("g", { id: "CursorGroup", ref: this.glideSlopeCursorGroupRef },
                    FSComponent.buildComponent("path", { ref: this.glideSlopeCursorUpRef, d: "M -12 0.25 L0 -20 L 12 0.25", fill: '#FF0CE2', stroke: '#FF0CE2', "stroke-width": '2' }),
                    FSComponent.buildComponent("path", { ref: this.glideSlopeCursorDownRef, d: "M -12 -0.25 L0 20 L 12 -0.25", fill: '#FF0CE2', stroke: '#FF0CE2', "stroke-width": '2' })),
                FSComponent.buildComponent("line", { id: "GlideSlopeCenterLine", x1: 410, y1: 189.5, x2: 435, y2: 189.5, stroke: 'white', "stroke-width": 2, style: "z-index: 1" }),
                FSComponent.buildComponent("g", { id: "LocalizerGroup", ref: this.localizerGroupRef },
                    FSComponent.buildComponent("rect", { id: "LocalizerBackground", x: 112, y: 435, width: 275, height: 35, fill: '#525252', "fill-opacity": 0.6 }),
                    FSComponent.buildComponent("circle", { cx: 307.9375, cy: 452.5, r: 5, fill: 'none', stroke: 'white', "stroke-width": 2 }),
                    FSComponent.buildComponent("circle", { cx: 366.375, cy: 452.5, r: 5, fill: 'none', stroke: 'white', "stroke-width": 2 }),
                    FSComponent.buildComponent("circle", { cx: 191.0625, cy: 452.5, r: 5, fill: 'none', stroke: 'white', "stroke-width": 2 }),
                    FSComponent.buildComponent("circle", { cx: 132.625, cy: 452.5, r: 5, fill: 'none', stroke: 'white', "stroke-width": 2 })),
                FSComponent.buildComponent("g", { id: "LocalizerCursorGroup", ref: this.localizerCursorGroupRef },
                    FSComponent.buildComponent("path", { ref: this.localizerCursorUpRef, d: "M 0 -12 L -20 0 L0 12", fill: '#FF0CE2', stroke: '#FF0CE2', "stroke-width": '2' }),
                    FSComponent.buildComponent("path", { ref: this.localizerCursorDownRef, d: "M 0 -12 L 20 0 L0 12", fill: '#FF0CE2', stroke: '#FF0CE2', "stroke-width": '2' })),
                FSComponent.buildComponent("line", { x1: 249.5, y1: 440, x2: 249.5, y2: 465, stroke: "white", "stroke-width": 2 })),
            FSComponent.buildComponent("g", { id: "ILSInfoGroup", ref: this.ilsInfoGroupRef, transform: "translate(150 50)" },
                FSComponent.buildComponent("text", { id: "ILSIdent", ref: this.ilsIdentRef, x: 0, y: 0, fill: "white", "font-size": 10, "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }),
                FSComponent.buildComponent("text", { id: "ILSFrequencyIdent", ref: this.ilsFrequencyRef, x: 0, y: 10, fill: "white", "font-size": 10, "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }),
                FSComponent.buildComponent("text", { id: "ILSDistance", ref: this.ilsDistanceRef, x: 0, y: 20, fill: "white", "font-size": 10, "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }),
                FSComponent.buildComponent("text", { id: "ILSOrigin", x: 0, y: 40, fill: "white", "font-size": 13, "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }, "ILS/FMC"))));
    }
}

class FMAComponent extends DisplayComponent {
    render() {
        return (FSComponent.buildComponent("svg", { id: "ViewBox", viewBox: "0 0 2000 210", x: 0, y: 0, xmlns: "http://www.w3.org/2000/svg" },
            FSComponent.buildComponent("rect", { id: 'FMABackground', fill: "#525252", width: "100%", height: 210, "fill-opacity": 0.6 }),
            FSComponent.buildComponent("line", { id: "LeftLine", x1: '33%', x2: '33%', y1: 0, y2: 250, stroke: 'white', "stroke-width": 5 }),
            FSComponent.buildComponent("line", { id: "RightLine", x1: '66%', x2: '66%', y1: 0, y2: 250, stroke: 'white', "stroke-width": 5 }),
            FSComponent.buildComponent("g", { id: "Thrust" },
                FSComponent.buildComponent("text", { id: "TopThrust", x: "16.5%", y: "30%", width: "33%", height: "60%", "font-size": 130, "font-family": "Roboto-Bold", "text-anchor": "middle", "alignment-baseline": "central", fill: "green" }, this.props.fmaModes.activeThrust),
                FSComponent.buildComponent("text", { id: "BottomThrust", x: "16.5%", y: "80%", width: "33%", height: "40%", "font-size": 90, "font-family": "Roboto-Bold", "text-anchor": "middle", "alignment-baseline": "central", fill: "white" }, this.props.fmaModes.armedThrust)),
            FSComponent.buildComponent("g", { id: "Roll" },
                FSComponent.buildComponent("text", { id: "TopRoll", x: "50%", y: "30%", width: "33%", height: "60%", "font-size": 130, "font-family": "Roboto-Bold", "text-anchor": "middle", "alignment-baseline": "central", fill: "green" }, this.props.fmaModes.activeRoll),
                FSComponent.buildComponent("text", { id: "BottomRoll", x: "50%", y: "80%", width: "33%", height: "40%", "font-size": 90, "font-family": "Roboto-Bold", "text-anchor": "middle", "alignment-baseline": "central", fill: "white" }, this.props.fmaModes.armedRoll)),
            FSComponent.buildComponent("g", { id: "Pitch" },
                FSComponent.buildComponent("text", { id: "TopPitch", x: "83%", y: "30%", width: "33%", height: "60%", "font-size": 130, "font-family": "Roboto-Bold", "text-anchor": "middle", "alignment-baseline": "central", fill: "green" }, this.props.fmaModes.activePitch),
                FSComponent.buildComponent("text", { id: "BottomPitch", x: "83%", y: "80%", width: "33%", height: "40%", "font-size": 90, "font-family": "Roboto-Bold", "text-anchor": "middle", "alignment-baseline": "central", fill: "white" }, this.props.fmaModes.armedPitch))));
    }
}

class FMAModes {
    constructor() {
        this.activeThrust = Subject.create('');
        this.armedThrust = Subject.create('');
        this.activePitch = Subject.create('');
        this.armedPitch = Subject.create('');
        this.activeRoll = Subject.create('');
        this.armedRoll = Subject.create('');
    }
}

var FMAThrustMode;
(function (FMAThrustMode) {
    FMAThrustMode["HOLD"] = "HOLD";
    FMAThrustMode["IDLE"] = "IDLE";
    FMAThrustMode["SPD"] = "SPD";
    FMAThrustMode["THR"] = "THR";
    FMAThrustMode["THR_REF"] = "THR REF";
    FMAThrustMode["NONE"] = "";
})(FMAThrustMode || (FMAThrustMode = {}));

var FMARollMode;
(function (FMARollMode) {
    FMARollMode["B_CRS"] = "B/CRS";
    FMARollMode["FAC"] = "FAC";
    FMARollMode["HDG_HOLD"] = "HDG HOLD";
    FMARollMode["HDG_SEL"] = "HDG SEL";
    FMARollMode["HUD_TOGA"] = "HUD TO/GA";
    FMARollMode["LNAV"] = "LNAV";
    FMARollMode["LOC"] = "LOC";
    FMARollMode["ROLLOUT"] = "ROLLOUT";
    FMARollMode["TOGA"] = "TO/GA";
    FMARollMode["TRK_HOLD"] = "TRK HOLD";
    FMARollMode["TRK_SEL"] = "TRK SEL";
    FMARollMode["ATT"] = "ATT";
    FMARollMode["NONE"] = "";
})(FMARollMode || (FMARollMode = {}));

var FMAPitchMode;
(function (FMAPitchMode) {
    FMAPitchMode["ALT"] = "ALT";
    FMAPitchMode["FLARE"] = "FLARE";
    FMAPitchMode["FLCH_SPD"] = "FLCH SPD";
    FMAPitchMode["FPA"] = "FPA";
    FMAPitchMode["GS"] = "G/S";
    FMAPitchMode["GP"] = "G/P";
    FMAPitchMode["TOGA"] = "TO/GA";
    FMAPitchMode["VNAV_PTH"] = "VNAV PTH";
    FMAPitchMode["VNAV_SPD"] = "VNAV SPD";
    FMAPitchMode["VNAV_ALT"] = "VNAV ALT";
    FMAPitchMode["VNAV"] = "VNAV";
    FMAPitchMode["VS"] = "V/S";
    FMAPitchMode["NONE"] = "";
})(FMAPitchMode || (FMAPitchMode = {}));

class FMAModeResolver {
    resolveActiveThrustMode() {
        const autopilotThrottleArmed = Simplane.getAutoPilotThrottleArmed();
        if (!autopilotThrottleArmed) {
            return FMAThrustMode.NONE;
        }
        const apSPDActive = (SimVar.GetSimVarValue('L:AP_SPD_ACTIVE', SimVarValueType.Number) !== 0);
        if (!apSPDActive) {
            return FMAThrustMode.NONE;
        }
        const engineThrottleMode = Simplane.getEngineThrottleMode(0);
        if (engineThrottleMode === ThrottleMode.TOGA) {
            return FMAThrustMode.THR_REF;
        }
        const indicatedSpeed = Simplane.getIndicatedSpeed();
        if (indicatedSpeed < 65) {
            return FMAThrustMode.NONE;
        }
        if (engineThrottleMode === ThrottleMode.IDLE) {
            return FMAThrustMode.IDLE;
        }
        const autopilotFLCActive = Simplane.getAutoPilotFLCActive();
        const autopilotThrottleLeft = Simplane.getAutopilotThrottle(1);
        // const autopilotThrottleRight = Simplane.getAutopilotThrottle(2); // not need
        if (autopilotFLCActive && autopilotThrottleLeft < 30) {
            return FMAThrustMode.IDLE;
        }
        const verticalSpeed = Simplane.getVerticalSpeed();
        if (autopilotFLCActive && verticalSpeed > 100) {
            return FMAThrustMode.THR_REF;
        }
        if (engineThrottleMode === ThrottleMode.HOLD) {
            return FMAThrustMode.HOLD;
        }
        const apFLCHActive = (Simplane.getAPFLCHActive() === 1);
        if (apFLCHActive) {
            return FMAThrustMode.THR_REF;
        }
        if (apSPDActive) {
            return FMAThrustMode.SPD;
        }
        if (engineThrottleMode === ThrottleMode.CLIMB) {
            return FMAThrustMode.THR_REF;
        }
        const apSpeedInterventionActive = (SimVar.GetSimVarValue('L:AP_SPEED_INTERVENTION_ACTIVE', SimVarValueType.Number) === 1);
        if (apSpeedInterventionActive) {
            return FMAThrustMode.SPD;
        }
        const autopilotThrottleArmedLeft = Simplane.getAutoPilotThrottleArmed(1);
        const autopilotThrottleArmedRight = Simplane.getAutoPilotThrottleArmed(2);
        const autopilotThrottleActive = Simplane.getAutoPilotThrottleActive();
        if ((autopilotThrottleArmedLeft || autopilotThrottleArmedRight) && autopilotThrottleActive) {
            return FMAThrustMode.THR;
        }
        return FMAThrustMode.THR_REF;
    }
    /**
     * Thrust mode does not have armed state
     * @returns {string}
     */
    resolveArmedThrustMode() {
        return '';
    }
    resolveActivePitchMode() {
        const autopilotApproachHold = Simplane.getAutoPilotAPPRHold();
        const autopilotApproachActive = Simplane.getAutoPilotAPPRActive();
        const autopilotGlideslopeHold = Simplane.getAutoPilotGlideslopeHold();
        const autopilotGlideslopeActive = Simplane.getAutoPilotGlideslopeActive();
        if (autopilotApproachHold && autopilotApproachActive && autopilotGlideslopeHold && autopilotGlideslopeActive) {
            const autopilotApproachType = Simplane.getAutoPilotApproachType();
            if (autopilotApproachType === ApproachType.APPROACH_TYPE_RNAV) {
                return FMAPitchMode.GP;
            }
            else {
                return FMAPitchMode.GS;
            }
        }
        const engineThrottleMode = Simplane.getEngineThrottleMode(0);
        if (engineThrottleMode === ThrottleMode.TOGA) {
            return FMAPitchMode.TOGA;
        }
        const apVNAVActive = (Simplane.getAPVNAVActive() === 1);
        if (apVNAVActive) {
            const autopilotAltitudeLockActive = Simplane.getAutoPilotAltitudeLockActive();
            if (autopilotAltitudeLockActive) {
                const altitude = Simplane.getAltitude();
                const cruiseAltitude = SimVar.GetSimVarValue('L:AIRLINER_CRUISE_ALTITUDE', SimVarValueType.Number);
                if (altitude > cruiseAltitude + 100) {
                    return FMAPitchMode.VNAV_ALT;
                }
                return FMAPitchMode.VNAV_PTH;
            }
            return FMAPitchMode.VNAV_SPD;
        }
        const apVNAVArmed = (Simplane.getAPVNAVArmed() === 1);
        if (engineThrottleMode === ThrottleMode.HOLD && apVNAVArmed) {
            return FMAPitchMode.TOGA;
        }
        const apFLCHActive = (Simplane.getAPFLCHActive() === 1);
        if (apFLCHActive) {
            return FMAPitchMode.FLCH_SPD;
        }
        const apALTHoldActive = (Simplane.getAPAltHoldActive() === 1);
        if (apALTHoldActive) {
            return FMAPitchMode.ALT;
        }
        /**
         * Missing FLARE
         */
        const autopilotActive = Simplane.getAutoPilotActive();
        if (autopilotActive) {
            const autopilotAltitudeLockActive = Simplane.getAutoPilotAltitudeLockActive();
            if (autopilotAltitudeLockActive) {
                return FMAPitchMode.ALT;
            }
            const autopilotVerticalSpeedHoldActive = Simplane.getAutoPilotVerticalSpeedHoldActive();
            if (autopilotVerticalSpeedHoldActive) {
                const autopilotFPAModeActive = Simplane.getAutoPilotFPAModeActive();
                if (autopilotFPAModeActive) {
                    return FMAPitchMode.FPA;
                }
                else {
                    return FMAPitchMode.VS;
                }
            }
        }
        return FMAPitchMode.NONE;
    }
    resolveArmedPitchMode() {
        const autopilotApproachHold = Simplane.getAutoPilotAPPRHold();
        const autopilotApproachActive = Simplane.getAutoPilotAPPRActive();
        const autopilotGlideslopeHold = Simplane.getAutoPilotGlideslopeHold();
        const autopilotGlideslopeActive = Simplane.getAutoPilotGlideslopeActive();
        if (autopilotApproachHold && autopilotGlideslopeHold && !(autopilotApproachActive && autopilotGlideslopeActive)) {
            const autopilotApproachType = Simplane.getAutoPilotApproachType();
            if (autopilotApproachType === ApproachType.APPROACH_TYPE_RNAV) {
                return FMAPitchMode.GP;
            }
            else {
                return FMAPitchMode.GS;
            }
        }
        const apVNAVArmed = (Simplane.getAPVNAVArmed() === 1);
        const apVNAVActive = (Simplane.getAPVNAVActive() === 1);
        if (apVNAVArmed && !apVNAVActive) {
            return FMAPitchMode.VNAV;
        }
        return FMAPitchMode.NONE;
    }
    resolveActiveRollMode() {
        const autopilotApproachHold = Simplane.getAutoPilotAPPRHold();
        const autopilotApproachActive = Simplane.getAutoPilotAPPRActive();
        if (autopilotApproachHold && autopilotApproachActive) {
            const autopilotApproachType = Simplane.getAutoPilotApproachType();
            if (autopilotApproachType === ApproachType.APPROACH_TYPE_RNAV) {
                return FMARollMode.FAC;
            }
            else {
                return FMARollMode.LOC;
            }
        }
        /**
         * Missing ROLLOUT
         */
        const engineThrottleMode = Simplane.getEngineThrottleMode(0);
        if (engineThrottleMode === ThrottleMode.TOGA) {
            return FMARollMode.TOGA;
        }
        const apLNAVActive = (Simplane.getAPLNAVActive() === 1);
        if (apLNAVActive) {
            return FMARollMode.LNAV;
        }
        const autopilotActive = Simplane.getAutoPilotActive();
        const autopilotFlightDirector1Active = Simplane.getAutoPilotFlightDirectorActive(1);
        const autopilotFlightDirector2Active = Simplane.getAutoPilotFlightDirectorActive(2);
        if (autopilotActive || autopilotFlightDirector1Active || autopilotFlightDirector2Active) {
            const apLNAVArmed = (Simplane.getAPLNAVArmed() === 1);
            if (engineThrottleMode === ThrottleMode.HOLD && apLNAVArmed) {
                return FMARollMode.TOGA;
            }
        }
        const autopilotHeadingLockActive = Simplane.getAutoPilotHeadingLockActive();
        if (autopilotHeadingLockActive) {
            const apHeadingHoldActive = (SimVar.GetSimVarValue('L:AP_HEADING_HOLD_ACTIVE', SimVarValueType.Number) === 1);
            if (apHeadingHoldActive) {
                return FMARollMode.HDG_HOLD;
            }
            else {
                return FMARollMode.HDG_SEL;
            }
        }
        if (autopilotActive) {
            if (autopilotHeadingLockActive) {
                const apHeadingHoldActive = (SimVar.GetSimVarValue('L:AP_HEADING_HOLD_ACTIVE', SimVarValueType.Number) === 1);
                if (apHeadingHoldActive) {
                    const autopilotTRKModeActive = Simplane.getAutoPilotTRKModeActive();
                    if (autopilotTRKModeActive) {
                        return FMARollMode.TRK_HOLD;
                    }
                    else {
                        return FMARollMode.HDG_HOLD;
                    }
                }
                else {
                    const autopilotTRKModeActive = Simplane.getAutoPilotTRKModeActive();
                    if (autopilotTRKModeActive) {
                        return FMARollMode.TRK_SEL;
                    }
                    else {
                        return FMARollMode.HDG_SEL;
                    }
                }
            }
        }
        return FMARollMode.NONE;
    }
    resolveArmedRollMode() {
        const autopilotApproachHold = Simplane.getAutoPilotAPPRHold();
        const autopilotApproachArmed = Simplane.getAutoPilotAPPRArm();
        if (autopilotApproachHold && autopilotApproachArmed) {
            const autopilotApproachType = Simplane.getAutoPilotApproachType();
            if (autopilotApproachType === ApproachType.APPROACH_TYPE_RNAV) {
                return FMARollMode.FAC;
            }
            else {
                return FMARollMode.LOC;
            }
        }
        const apLNAVArmed = Simplane.getAPLNAVArmed();
        const apLNAVActive = Simplane.getAPLNAVActive();
        if (apLNAVArmed && !apLNAVActive) {
            return FMARollMode.LNAV;
        }
        return FMARollMode.NONE;
    }
}

class ApproachFlapsAndVREFComponent extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.approachReference = Subject.create('');
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.vSpeeds.vREF.sub((value) => {
            const approachFlaps = SimVar.GetSimVarValue('L:AIRLINER_APPROACH_FLAPS', SimVarValueType.Number);
            const approachReference = [approachFlaps, value].join('/');
            this.approachReference.set(approachReference);
        });
    }
    render() {
        return (FSComponent.buildComponent("svg", { id: "ViewBox", xmlns: "http://www.w3.org/2000/svg", width: 65, height: 18 },
            FSComponent.buildComponent("text", { y: 6, fill: "#24F000", "font-size": 16, "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }, this.approachReference)));
    }
}

class BaroComponent extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.stdRef = FSComponent.createRef();
        this.pressureRef = FSComponent.createRef();
        this.unitsRef = FSComponent.createRef();
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.pressureMode.sub((value) => {
            if (this.props.pressureMode.get() === 'STD') {
                this.stdRef.instance.style.display = 'block';
                this.pressureRef.instance.style.display = 'none';
                this.unitsRef.instance.style.display = 'none';
            }
            else {
                this.stdRef.instance.style.display = 'none';
                this.pressureRef.instance.style.display = 'block';
                this.unitsRef.instance.style.display = 'block';
            }
        });
        this.props.pressureValue.sub((value) => {
            if (this.props.pressureUnits.get() === 'inches of mercury') {
                this.unitsRef.instance.textContent = 'IN';
                this.pressureRef.instance.textContent = fastToFixed(value, 2);
            }
            else {
                this.unitsRef.instance.textContent = 'HPA';
                this.pressureRef.instance.textContent = fastToFixed(value, 0);
            }
        });
    }
    render() {
        return (FSComponent.buildComponent("svg", { id: "ViewBox", xmlns: "http://www.w3.org/2000/svg", width: 500, height: 500 },
            FSComponent.buildComponent("text", { ref: this.stdRef, x: "20", y: 6, fill: "#24F000", "font-size": 20, "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }, "STD"),
            FSComponent.buildComponent("text", { ref: this.pressureRef, y: 6, fill: "#24F000", "font-size": 16, "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" }),
            FSComponent.buildComponent("text", { ref: this.unitsRef, y: 8, x: 55, fill: "#24F000", "font-size": 12, "font-family": "Roboto-Bold", "text-anchor": "start", "alignment-baseline": "central" })));
    }
}

class MinimumsComponent extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.minimumReferenceModeRef = FSComponent.createRef();
        this.minimumValueRef = FSComponent.createRef();
    }
    onAfterRender(node) {
        super.onAfterRender(node);
        this.props.minimumReferenceMode.sub((value) => {
            console.log(value);
            this.minimumReferenceModeRef.instance.textContent = (value === MinimumReferenceMode.RADIO ? 'RADIO' : 'BARO');
        });
        this.props.minimumValue.sub((value) => {
            this.minimumValueRef.instance.textContent = value.toString();
        });
    }
    render() {
        return (FSComponent.buildComponent("svg", { id: "ViewBox", xmlns: "http://www.w3.org/2000/svg", width: 50, height: 30 },
            FSComponent.buildComponent("text", { ref: this.minimumReferenceModeRef, x: 45, y: 6, fill: "#24F000", "font-size": 12, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" }),
            FSComponent.buildComponent("text", { ref: this.minimumValueRef, x: 45, y: 20, fill: "#24F000", "font-size": 16, "font-family": "Roboto-Bold", "text-anchor": "end", "alignment-baseline": "central" })));
    }
}

class B787_10_PFD extends BaseInstrument {
    constructor() {
        super();
        this.isFlightStarted = false;
        /**
         * Subscribable values
         */
        this.altitude = Subject.create(0);
        this.grounded = Subject.create(true);
        this.altitudeAboveGround = Subject.create(0);
        this.altitudeSelected = Subject.create(0);
        this.indicatedSpeed = Subject.create(0);
        this.selectedPressureValue = Subject.create(0);
        this.selectedPressureMode = Subject.create('');
        this.selectedPressureUnits = Subject.create('');
        this.minimumReferenceMode = Subject.create(MinimumReferenceMode.RADIO);
        /**
         * Minimums are fake value -> the value is not used in systems
         * @type {Subject<number>}
         * @private
         */
        this.minimumValue = Subject.create(200);
        /**
         * VSpeeds
         * @type {Subject<VSpeeds>}
         * @private
         */
        this.vSpeeds = new VSpeeds();
        this.aircraftSpeeds = new AircraftSpeeds();
        this.aircraftBaseSpeeds = new AircraftBaseSpeeds();
        this.autopilotSpeedMode = new AutopilotSpeedMode();
        this.pitchAngle = Subject.create(0);
        this.flightDirectorPitchAngle = Subject.create(0);
        this.bankAngle = Subject.create(0);
        this.flightDirectorBankAngle = Subject.create(0);
        this.slipSkid = Subject.create(0);
        this.showMeters = Subject.create(false);
        this.deltaTimeSubject = Subject.create(0);
        this.eventBus = new EventBus();
        this.hEventPublisher = new HEventPublisher(this.eventBus);
        this.flightStartTime = -1;
        this.resetChrono = true;
        this.groundReference = 0;
        this.smoothMach = 0;
        this.ilsBacon = Subject.create(0);
        this.fmaModes = new FMAModes();
        this.radioNav = new RadioNav();
        this.fmaModeResolver = new FMAModeResolver();
        this.flightStartTime = this.chronoStartTime = SimVar.GetSimVarValue('E:ABSOLUTE TIME', SimVarValueType.Seconds);
        this.eventBus.getSubscriber().on('resetChrono').handle((value) => {
            this.resetChrono = true;
        });
        this.radioNav.init(NavMode.FOUR_SLOTS);
    }
    get templateID() {
        return 'B787_10_PFD';
    }
    connectedCallback() {
        super.connectedCallback();
        this.hEventPublisher.startPublish();
        FSComponent.render(FSComponent.buildComponent(AUXDisplayComponent, { bus: this.eventBus }), document.getElementById('AuxDisplay'));
        FSComponent.render(FSComponent.buildComponent(PFDDisplayComponent, { bus: this.eventBus }), document.getElementById('PFDDisplay'));
        FSComponent.render(FSComponent.buildComponent(AttitudeIndicatorComponent, { altitudeAboveGround: this.altitudeAboveGround, pitchAngle: this.pitchAngle, bankAngle: this.bankAngle, slipSkid: this.slipSkid, flightDirectorPitchAngle: this.flightDirectorPitchAngle, flightDirectorBankAngle: this.flightDirectorBankAngle, deltaTime: this.deltaTimeSubject }), document.getElementById('AttitudeIndicator'));
        FSComponent.render(FSComponent.buildComponent(AltimeterIndicatorComponent, { deltaTime: this.deltaTimeSubject, altitude: this.altitude, altitudeAboveGround: this.altitudeAboveGround, altitudeSelected: this.altitudeSelected, minimumValue: this.minimumValue, minimimReferenceMode: this.minimumReferenceMode, showMeters: this.showMeters }), document.getElementById('Altimeter'));
        FSComponent.render(FSComponent.buildComponent(VerticalSpeedIndicatorComponent, { bus: this.eventBus }), document.getElementById('VSpeed'));
        FSComponent.render(FSComponent.buildComponent(AirspeedIndicatorComponent, { bus: this.eventBus, grounded: this.grounded, deltaTime: this.deltaTimeSubject, altitudeAboveGround: this.altitudeAboveGround, indicatedAirspeed: this.indicatedSpeed, vSpeeds: this.vSpeeds, aircraftBaseSpeeds: this.aircraftBaseSpeeds, autopilotSpeedMode: this.autopilotSpeedMode, aircraftSpeeds: this.aircraftSpeeds }), document.getElementById('Airspeed'));
        FSComponent.render(FSComponent.buildComponent(ILSIndicatorComponent, { radioNav: this.radioNav, ilsBacon: this.ilsBacon }), document.getElementById('ILS'));
        FSComponent.render(FSComponent.buildComponent(FMAComponent, { fmaModes: this.fmaModes }), document.getElementById('FMA'));
        FSComponent.render(FSComponent.buildComponent(ApproachFlapsAndVREFComponent, { vSpeeds: this.vSpeeds }), document.getElementById('ApproachFlaps'));
        FSComponent.render(FSComponent.buildComponent(BaroComponent, { pressureMode: this.selectedPressureMode, pressureUnits: this.selectedPressureUnits, pressureValue: this.selectedPressureValue }), document.getElementById('Baro'));
        FSComponent.render(FSComponent.buildComponent(MinimumsComponent, { minimumReferenceMode: this.minimumReferenceMode, minimumValue: this.minimumValue }), document.getElementById('Minimum'));
        this.initSubjects();
    }
    initSubjects() {
        this.ilsBacon.notify();
        this.selectedPressureMode.notify();
        this.minimumReferenceMode.notify();
        this.minimumValue.notify();
        this.showMeters.notify();
    }
    Update() {
        if (!this.isFlightStarted) {
            return;
        }
        /**
         * Misc SimVars look up
         */
        this.deltaTimeSubject.set(this.deltaTime);
        const zulu = SimVar.GetGlobalVarValue('ZULU TIME', SimVarValueType.Seconds);
        const absoluteTime = SimVar.GetSimVarValue('E:ABSOLUTE TIME', SimVarValueType.Seconds);
        const localDay = SimVar.GetGlobalVarValue('LOCAL DAY OF MONTH', SimVarValueType.Number);
        const localMonth = SimVar.GetGlobalVarValue('LOCAL MONTH OF YEAR', SimVarValueType.Number);
        const localYear = SimVar.GetGlobalVarValue('LOCAL YEAR', SimVarValueType.Number);
        const formattedDate = this.formatDate(localYear, localMonth, localDay);
        /**
         * SimVars look up
         */
        const flightNumber = SimVar.GetSimVarValue('ATC FLIGHT NUMBER', SimVarValueType.String);
        const vhfActiveFrequency = SimVar.GetSimVarValue('L:VHF_ACTIVE_INDEX:1', SimVarValueType.Number);
        const vhfFrequency = SimVar.GetSimVarValue('COM ACTIVE FREQUENCY:' + (vhfActiveFrequency + 1), SimVarValueType.MHz);
        const transponderCode = SimVar.GetSimVarValue('TRANSPONDER CODE:1', SimVarValueType.Number);
        const altitude = Simplane.getAltitude();
        const altitudeSelected = Math.max(0, Simplane.getAutoPilotDisplayedAltitudeLockValue());
        const altitudeAboveGround = Simplane.getAltitudeAboveGround(true);
        const verticalSpeed = Simplane.getVerticalSpeed();
        const verticalSpeedSelected = Simplane.getAutoPilotVerticalSpeedHoldValue();
        const verticalSpeedHoldActive = Simplane.getAutoPilotVerticalSpeedHoldActive();
        const flapsHandleIndex = Simplane.getFlapsHandleIndex();
        const grounded = Simplane.getIsGrounded();
        const trueMach = Simplane.getMachSpeed();
        /**
         * BARO
         * TODO: set and sub are async. (Pressure subscriber can update pressure value before STD subscriber)
         * all getters use SlowSimVarTimer -> theoretically it will be possible to change mode getter to use MedSimVarTimer
         * but we really exchange performance of PFD for this non important visual "bug" especially when the happens only sometimes?
         */
        const selectedPressureMode = Simplane.getPressureSelectedMode(Aircraft.AS01B);
        const selectedPressureUnits = Simplane.getPressureSelectedUnits();
        const selectedPressureValue = Simplane.getPressureValue(selectedPressureUnits);
        this.selectedPressureMode.set(selectedPressureMode);
        this.selectedPressureUnits.set(selectedPressureUnits);
        this.selectedPressureValue.set(selectedPressureValue);
        /**
         * Minimums
         * Simplane.getMinimumReferenceMode() is bugged
         * This should be slow down
         */
        const minimumReferenceMode = SimVar.GetSimVarValue('L:XMLVAR_Mins_Selector_Baro', SimVarValueType.Number) === 0 ? MinimumReferenceMode.RADIO : MinimumReferenceMode.BARO;
        this.minimumReferenceMode.set(minimumReferenceMode);
        /**
         * SPEEDS
         */
        const indicatedSpeed = Simplane.getIndicatedSpeed();
        const v1Airspeed = Simplane.getV1Airspeed();
        const v2Airspeed = Simplane.getV2Airspeed();
        const vRAirspeed = Simplane.getVRAirspeed();
        const vREFAirspeed = Simplane.getREFAirspeed();
        const vXAirspeed = Simplane.getVXAirspeed();
        const autopilotMachModeActive = Simplane.getAutoPilotMachModeActive();
        const autopilotMachHoldValue = Simplane.getAutoPilotMachHoldValue();
        const autopilotAirspeedHoldValue = Simplane.getAutoPilotAirspeedHoldValue();
        /***
         * TODO: Do not call for the vars everytime
         */
        const cruiseMach = Simplane.getCruiseMach();
        const stallSpeed = Simplane.getStallSpeed();
        const lowestSelectableSpeed = Simplane.getLowestSelectableSpeed();
        const stallProtectionMin = Simplane.getStallProtectionMinSpeed();
        const stallProtectionMax = Simplane.getStallProtectionMaxSpeed();
        const crossSpeed = Simplane.getCrossoverSpeed();
        const crossSpeedFactor = Simplane.getCrossoverSpeedFactor(crossSpeed, cruiseMach);
        const maxSpeed = Simplane.getMaxSpeed(Aircraft.AS01B) * crossSpeedFactor;
        /**
         * Flight State
         */
        const flightPhase = Simplane.getCurrentFlightPhase();
        /**
         * Publishing
         */
        const auxDisplayEventsPublisher = this.eventBus.getPublisher();
        auxDisplayEventsPublisher.pub('flightNumber', flightNumber);
        auxDisplayEventsPublisher.pub('vhfFrequency', vhfFrequency);
        auxDisplayEventsPublisher.pub('transponderCode', transponderCode);
        if (zulu) {
            const secondsInInt = parseInt(zulu);
            const timeString = Utils.SecondsToDisplayTime(secondsInInt, true, true, false) + 'z';
            auxDisplayEventsPublisher.pub('zulu', timeString);
        }
        auxDisplayEventsPublisher.pub('date', formattedDate);
        auxDisplayEventsPublisher.pub('flightDuration', Utils.SecondsToDisplayTime(absoluteTime - this.flightStartTime, true, false, false));
        if (this.resetChrono) {
            this.chronoStartTime = absoluteTime;
            this.resetChrono = false;
        }
        const chronoDegrees = this.calclateChronoDegrees(absoluteTime, this.chronoStartTime);
        auxDisplayEventsPublisher.pub('chronoMinutesDegrees', chronoDegrees.minutes);
        auxDisplayEventsPublisher.pub('chronoSecondsDegrees', chronoDegrees.seconds);
        auxDisplayEventsPublisher.pub('chronoDigitalTime', Utils.SecondsToDisplayTime(absoluteTime - this.chronoStartTime, true, true, false));
        const pitchAngle = Simplane.getPitch();
        const flightDirectorPitchAngle = Simplane.getFlightDirectorPitch();
        const bankAngle = Simplane.getBank();
        const flightDirectorBankAngle = Simplane.getFlightDirectorBank();
        const slipSkid = Simplane.getInclinometer();
        const pfdDisplayEventsPublisher = this.eventBus.getPublisher();
        pfdDisplayEventsPublisher.pub('pitchAngle', pitchAngle);
        pfdDisplayEventsPublisher.pub('bankAngle', bankAngle);
        pfdDisplayEventsPublisher.pub('slipSkid', slipSkid);
        const pfdDisplayEventsPublisherState = this.eventBus.getPublisher();
        pfdDisplayEventsPublisherState.pub('altitude', altitude);
        pfdDisplayEventsPublisherState.pub('selectedAltitude', altitudeSelected);
        pfdDisplayEventsPublisherState.pub('groundReference', this.groundReference);
        pfdDisplayEventsPublisherState.pub('verticalSpeed', verticalSpeed);
        pfdDisplayEventsPublisherState.pub('verticalSpeedSelected', verticalSpeedSelected);
        pfdDisplayEventsPublisherState.pub('verticalSpeedHoldActive', verticalSpeedHoldActive);
        pfdDisplayEventsPublisherState.pub('indicatedSpeed', indicatedSpeed);
        pfdDisplayEventsPublisherState.pub('v1Airspeed', v1Airspeed);
        pfdDisplayEventsPublisherState.pub('v2Airspeed', v2Airspeed);
        pfdDisplayEventsPublisherState.pub('vRAirspeed', vRAirspeed);
        pfdDisplayEventsPublisherState.pub('vREFAirspeed', vREFAirspeed);
        pfdDisplayEventsPublisherState.pub('vXAirspeed', vXAirspeed);
        pfdDisplayEventsPublisherState.pub('flightPhase', flightPhase);
        pfdDisplayEventsPublisherState.pub('flapsHandleIndex', flapsHandleIndex);
        pfdDisplayEventsPublisherState.pub('cruiseMach', cruiseMach);
        pfdDisplayEventsPublisherState.pub('stallSpeed', stallSpeed);
        pfdDisplayEventsPublisherState.pub('lowestSelectableSpeed', lowestSelectableSpeed);
        pfdDisplayEventsPublisherState.pub('stallProtectionMax', stallProtectionMax);
        pfdDisplayEventsPublisherState.pub('stallProtectionMin', stallProtectionMin);
        pfdDisplayEventsPublisherState.pub('crossSpeed', crossSpeed);
        pfdDisplayEventsPublisherState.pub('crossSpeedFactor', crossSpeedFactor);
        pfdDisplayEventsPublisherState.pub('maxSpeed', maxSpeed);
        pfdDisplayEventsPublisherState.pub('autopilotMachModeActive', autopilotMachModeActive);
        pfdDisplayEventsPublisherState.pub('autopilotMachHoldValue', autopilotMachHoldValue);
        pfdDisplayEventsPublisherState.pub('autopilotAirspeedHoldValue', autopilotAirspeedHoldValue);
        pfdDisplayEventsPublisherState.pub('grounded', grounded);
        const groundReferencePublisher = this.eventBus.getPublisher();
        groundReferencePublisher.pub('altitudeAboveGround', altitudeAboveGround);
        /**
         * Refactored props
         */
        /**
         * DONE
         */
        this.altitude.set(altitude);
        this.altitudeAboveGround.set(altitudeAboveGround);
        this.altitudeSelected.set(altitudeSelected);
        this.vSpeeds.v1.set(v1Airspeed);
        this.vSpeeds.vR.set(vRAirspeed);
        this.vSpeeds.v2.set(v2Airspeed);
        this.vSpeeds.vREF.set(vREFAirspeed);
        this.vSpeeds.vX.set(vXAirspeed);
        this.autopilotSpeedMode.machModeActive.set(autopilotMachModeActive);
        this.autopilotSpeedMode.machHoldValue.set(autopilotMachHoldValue);
        this.autopilotSpeedMode.airspeedHoldValue.set(autopilotAirspeedHoldValue);
        this.aircraftBaseSpeeds.cruiseMach.set(cruiseMach);
        this.aircraftBaseSpeeds.stallSpeed.set(stallSpeed);
        this.aircraftBaseSpeeds.lowestSelectableSpeed.set(lowestSelectableSpeed);
        this.aircraftBaseSpeeds.stallProtectionMin.set(stallProtectionMin);
        this.aircraftBaseSpeeds.stallProtectionMax.set(stallProtectionMax);
        this.aircraftBaseSpeeds.crossSpeed.set(crossSpeed);
        this.aircraftBaseSpeeds.crossSpeedFactor.set(crossSpeedFactor);
        this.aircraftBaseSpeeds.maxSpeed.set(maxSpeed);
        this.indicatedSpeed.set(indicatedSpeed);
        this.aircraftSpeeds.indicatedAirspeed.set(indicatedSpeed);
        this.aircraftSpeeds.trueMach.set(trueMach);
        this.smoothMach = Utils.SmoothSin(this.smoothMach, trueMach, 0.25, this.deltaTime / 1000);
        this.aircraftSpeeds.smoothMach.set(this.smoothMach);
        this.pitchAngle.set(pitchAngle);
        this.flightDirectorPitchAngle.set(flightDirectorPitchAngle);
        this.bankAngle.set(bankAngle);
        this.flightDirectorBankAngle.set(flightDirectorBankAngle);
        this.slipSkid.set(slipSkid);
        this.grounded.set(grounded);
        /**
         * ILS Handling
         */
        const localizer = this.radioNav.getBestILSBeacon(UseNavSource.YES_FALLBACK);
        this.ilsBacon.set(localizer.id);
        /**
         * FMA handling
         */
        this.fmaModes.activeThrust.set(this.fmaModeResolver.resolveActiveThrustMode());
        this.fmaModes.armedThrust.set(this.fmaModeResolver.resolveArmedThrustMode());
        this.fmaModes.activePitch.set(this.fmaModeResolver.resolveActivePitchMode());
        this.fmaModes.armedPitch.set(this.fmaModeResolver.resolveArmedPitchMode());
        this.fmaModes.activeRoll.set(this.fmaModeResolver.resolveActiveRollMode());
        this.fmaModes.armedRoll.set(this.fmaModeResolver.resolveArmedRollMode());
    }
    onInteractionEvent(_args) {
        super.onInteractionEvent(_args);
        const event = _args[0];
        if (event === 'AS01B_PFD_Mins_INC') {
            this.updateMinimum(true);
        }
        else if (event === 'AS01B_PFD_Mins_DEC') {
            this.updateMinimum(false);
        }
        else if (event === 'AS01B_PFD_Mins_Press') {
            this.updateMinimum(true, true);
        }
        if (event === 'AS01B_PFD_MTRS') {
            this.showMeters.set(!this.showMeters.get());
        }
        this.hEventPublisher.dispatchHEvent(event);
    }
    onFlightStart() {
        super.onFlightStart();
        this.isFlightStarted = true;
    }
    updateMinimum(up, reset = false) {
        if (reset) {
            this.minimumValue.set(200);
            return;
        }
        const currentValue = this.minimumValue.get();
        const toSet = (up ? currentValue + 10 : currentValue - 10);
        this.minimumValue.set((toSet < 0 ? 0 : toSet));
    }
    calclateChronoDegrees(absoluteTime, chronoStartTime) {
        const minutes = Math.floor((absoluteTime - chronoStartTime) / 60);
        const seconds = Math.floor((absoluteTime - chronoStartTime) - (minutes * 60));
        const minutesDegrees = (6 * minutes) % 360;
        const secondsDegrees = (6 * seconds) % 360;
        return { minutes: minutesDegrees, seconds: secondsDegrees };
    }
    formatDate(year, month, day) {
        const monthTable = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const dateArray = [];
        dateArray.push(day.toString().padStart(2, '0'));
        dateArray.push(monthTable[month - 1]);
        dateArray.push(year);
        return dateArray.join(' ');
    }
}
registerInstrument('b787-10-pfd', B787_10_PFD);
