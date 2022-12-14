/*!
 * Webkit-input-range-fill-lower
 *
 * Licensed under MIT
 * Copyright (c) 2020 [Samuel Carreira]
 */
class WebkitInputRangeFillLower {
    constructor(options) {
        this.options = options;
        this._updatedInlineStyle = document.createElement("style");
        document.body.append(this._updatedInlineStyle);
        this._cachedValues = [];
        this._validateOptions(options);
        this._removeDuplicates();
        this._removeUnknownElements();
        this._removeInvalidElements();
        this._setSelectorsCombined();
        this._addDefaultStyles();
        this._addEventListeners()
    }
    get getElementsList() { return this._options.selectors.map(value => `#${value}`) }
    _validateOptions(options) {
        const defaultOptions = { selectors: null, angle: 90, color: null, gradient: null };
        this._options = Object.assign(Object.assign({}, defaultOptions), options);
        if (!Array.isArray(options.selectors)) { this._options.selectors = [options.selectors] }
        if (this._options.angle < 0 || this._options.angle > 360) { this._options.angle = 90 }
        if (this._options.color === null && this._options.gradient === null) { this._options.gradient = "#0ABFBC, #FC354C" }
        if (this._options.color !== null && !this._validateColor(this._options.color)) { throw new TypeError("Please enter a valid CSS color") }
    }
    _addEventListeners() {
        const eventName = new Event("input");
        for (const id of this._options.selectors) {
            const selector = document.getElementById(id);
            // selector.addEventListener("input", () => {
            setInterval(() => {
                const rangeInterval = Number(selector.getAttribute("max")) - Number(selector.getAttribute("min"));
                const rangePercent = (Number(selector.value) + Math.abs(Number(selector.getAttribute("min")))) / rangeInterval * 100;
                this._writeStyle(id, rangePercent)
            }, 1)

            // }, false);
            selector.dispatchEvent(eventName)
        }
    }
    _checkCachedData(id, percent) { const findResult = this._cachedValues.map(x => x.id).indexOf(id); if (findResult === -1) { this._cachedValues.push({ id: id, percent: percent }) } else { this._cachedValues[findResult] = { id: id, percent: percent } } }
    _writeStyle(id, percent) {
        this._checkCachedData(id, percent);
        let textToWrite = "";
        for (const item of this._cachedValues) { textToWrite += `#${item.id}::-webkit-slider-runnable-track{background-size: ${item.percent}% 100% !important }` }
        this._updatedInlineStyle.textContent = textToWrite
    }
    _removeDuplicates() { this._options.selectors = this._options.selectors.filter((item, index) => this._options.selectors.indexOf(item) === index) }
    _removeUnknownElements() { this._options.selectors = this._options.selectors.filter(id => document.getElementById(id) !== null) }
    _removeInvalidElements() { this._options.selectors = this._options.selectors.filter(id => document.getElementById(id).type === "range") }
    _setSelectorsCombined() {
        let selectorText = "";
        this._options.selectors.forEach((element, index) => { selectorText += `#${element}`; if (index < this._options.selectors.length - 1) { selectorText += ", " } });
        this._selectors_combined = selectorText
    }
    _generateGradientCSS() { let cssColors = ""; if (this._options.color === null) { cssColors = this._options.gradient } else { cssColors = `${this._options.color}, ${this._options.color}` } return `${this._options.angle}deg, ${cssColors}` }
    _addDefaultStyles() {
        let runnableTrackPortion = "";
        this._options.selectors.forEach(id => {
            const backgroundStyle = `background: linear-gradient(${this._generateGradientCSS()}) 0 100% no-repeat content-box !important;         -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 5px;
            outline: none;
            opacity: 0.7;
            border-radius: 10px;
            -webkit-transition: .2s;
            transition: opacity .2s;
            direction: ltr;`;
            runnableTrackPortion += `#${id}::-webkit-slider-runnable-track {${backgroundStyle}} `;
            runnableTrackPortion += `#${id}::-moz-range-progress {${backgroundStyle}} `;
            runnableTrackPortion += `#${id}::-ms-fill-lower {${backgroundStyle}} `
        });
        const defaultCSS = `<style>\n      ${runnableTrackPortion}\n      ${this._selectors_combined}:focus {outline: none !important;}\n    </style>`;
        document.head.insertAdjacentHTML("beforeend", defaultCSS)
    }
    _validateColor(stringColor) {
        const s = (new Option).style;
        s.color = stringColor;
        return s.color !== ""
    }
}