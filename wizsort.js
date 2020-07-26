function WizSorting(container, algos, settingsPosition = "inside") {
    const _this = this; // damn callbacks
    const MAX_GRID_SIZE = 512; // even this is too slow

    this.audio = false;
    this.ph = 8; // point height
    this.pw = 8; // point width
    this.arraySize = 128;
    this.speed = 1000; // 1 - 1000
    this.max = this.arraySize;
    this.detail = 3;
    this.color_map = "magma";
    let reset = true;
    let algoRepeatCount = 0;

    this.settingsPosition = settingsPosition;

    // functions
    this.start = main;
    this.stop = stop;
    this.onSortsFinished = onSortsFinished;

    this.algos = algos;

    let canvas, hiddenCanvas; // offscreen canvas for faster rendering
    let ctx, ctxHidden;
    let audioCtx;

    this.color_maps = {
        hsl: function (x, max) {
            let j = rescale(x, 0, max, 0, 360);
            return "hsl(" + j + ", 50%, 50%)";
        },
        grayscale: function (x, max) {
            let j = rescale(x, 0, max, 0, 255);
            return "rgb(" + [j, j, j].join() + ")";
        },
        magma: function (x, max) {
            let j = rescale(x, 0, max, 0, 360);
            return `hsl(${j * 0.5 + 250},${50}%,${(50 * j) / 180}%)`;
        }
    };

    init();
    renderLoop();

    function settingsDatGUI() {
        const datgui = new dat.GUI({ autoPlace: false, });
        if (_this.settingsPosition === "inside") {
            container.appendChild(datgui.domElement);
        }
        datgui.domElement.style.cssText = 'position:absolute;';
        datgui.add(_this, "arraySize", 8, 512, 8).name("Size");
        datgui.add(_this, "speed", 1, 1000, 1).name("Speed");
        datgui.add(_this, "detail", 1, 3, 1).name("Detail");
        datgui.add(_this, 'audio').name("Sound");
        datgui.add(_this, 'color_map', Object.keys(_this.color_maps)).name("Color Scheme");

        // list all algos
        _this.algos.forEach((v, i) => {
            if (_this.algos[i].enabled == undefined) {
                _this.algos[i].enabled = true;
            }
            datgui.add(_this.algos[i], "enabled").name(v.name);
        });

        datgui.add(_this, "start").name("(RE)START)");
        datgui.add(_this, "stop").name("STOP");
        datgui.close();
    }

    function settingsTweakpane() {
        const pane = new Tweakpane({
            container: _this.settingsPosition === "inside" ? container : null,
            title: 'Settings'
        });
        // pane.hidden = true;
        pane.expanded = false;
        pane.element.style.cssText = 'position:absolute;';
        pane.addInput(_this, "arraySize", { min: 8, max: 512, step: 8, label: "Size" });
        pane.addInput(_this, "speed", { min: 1, max: 1000, step: 1, label: "Speed" });
        pane.addInput(_this, "detail", { min: 1, max: 3, step: 1, label: "Detail" });

        pane.addInput(_this, 'audio', { label: "Sound" });
        pane.addInput(_this, 'color_map', { options: Object.keys(_this.color_maps).reduce((o, v) => (o[v] = v, o), {}), label: "Color Scheme" });

        // list all algos
        _this.algos.forEach((v, i) => {
            if (_this.algos[i].enabled == undefined) {
                _this.algos[i].enabled = true;
            }
            pane.addInput(_this.algos[i], "enabled", { label: v.name });
        });

        pane.addButton({ title: '(RE)START' }).on('click', _this.start);
        pane.addButton({ title: "STOP" }).on('click', _this.stop);
    }

    function init() {
        audioCtx = new AudioContext();
        // settingsDatGUI();
        settingsTweakpane();

        canvas = document.createElement("canvas"); //.getElementById("cvs");
        canvas.width = MAX_GRID_SIZE;
        canvas.height = MAX_GRID_SIZE;
        ctx = canvas.getContext("2d", { alpha: false }); // on screen context

        container.appendChild(canvas);
        canvas.onclick = () => {
            _this.start();
        };

        // everything will be rendered on this off-screen canvas
        // and will be copied to on-screen canvas in requestAnimationFrame
        hiddenCanvas = new OffscreenCanvas(MAX_GRID_SIZE, MAX_GRID_SIZE);
        ctxHidden = hiddenCanvas.getContext("2d");

        _this.ph = _this.pw = MAX_GRID_SIZE / _this.arraySize;

        // fill the canvas with selected color scheme only, nothing to do with data
        for (let i = 0; i < _this.arraySize; i++) {
            drawPoint(i, 0, i * _this.ph, MAX_GRID_SIZE, _this.ph);
        }
    };


    function renderLoop() {
        // draw from offscreen canvas
        ctx.drawImage(ctxHidden.canvas, 0, 0);

        // alternate
        // let bitmap = offCanvas.transferToImageBitmap();
        // _ctx.transferFromImageBitmap(bitmap);

        requestAnimationFrame(renderLoop);
    };


    // let recorder = new CanvasRecorder(iterationsanvas);

    function main() {
        reset = !reset;
        _this.max = _this.arraySize;
        _this.ph = _this.pw = MAX_GRID_SIZE / _this.arraySize;

        // recorder.start();

        // selected sorts
        let selectedAlgos = _this.algos.filter(v => v.enabled == undefined ? true : v.enabled); // if enabled wasnt define, its enabled
        if (selectedAlgos.length == 0) {
            return;
        }

        displayAlgoNames("algonames", selectedAlgos);

        // number of times an algo will be drawn on canvas
        algoRepeatCount = Math.ceil(_this.arraySize / selectedAlgos.length);

        // create an array of ascending numbers
        let numbers = new Int32Array(_this.arraySize)
            .fill(0, 0, _this.arraySize)
            .map(function (v, i) {
                return i + 1;
            });

        const n = selectedAlgos.length * algoRepeatCount;
        let dataArrays = deriveRandomizedArrays(numbers, n);

        // draw
        for (let i = 0; i < n; i++) {
            drawArray(dataArrays[i], i);
        }

        runSortAlgos(dataArrays, selectedAlgos);
    }

    /**
     * returns an array containing N unique randomized arrays made from given input array
     * @param {*} inputArray 
     * @param {*} N 
     * @returns array containing N unique randomized arrays made from given input array
     */
    function deriveRandomizedArrays(inputArray, N) {
        let dataArrays = new Array(N);
        for (let i = 0; i < N; i++) {
            dataArrays[i] = shuffle(inputArray).slice();
        }
        return dataArrays;
    }

    // apply selected sorting function on each array
    function runSortAlgos(dataArrays, algos) {
        let numOps = [];
        let x = 0;
        // for (let i = 0; i < algos.length; i++) {
        for (const algo of algos) {
            for (let j = 0; j < algoRepeatCount; j++) {
                // const algo = algos[i].fn;
                // run algo
                const arr = dataArrays[x];
                let ops = algo.fn(arr, drawSleepFn(arr, x));
                x = x + 1;
                numOps.push(ops);
            }
        }

        Promise.all(numOps).then(values => {
            _this.onSortsFinished(values);
        });
    }

    function displayAlgoNames(element, algos) {
        const div = document.getElementById(element);
        if (div) {
            div.innerText = "";
            algos.forEach((algo, i) => {
                div.innerText += algo.name;
                if (i < algos.length - 1) {
                    div.innerText += " |  ";
                }
            });
        }
    }

    function stop() {
        // if(_this.audio && osc) osc.stop();
        if (reset == false) {
            reset = true;
        }
    }

    function onSortsFinished(e) {
        // console.log("Finished", e);
        // recorder.stop();
        // recorder.save();
    }

    function playAudio(freq, time = 0.7) {
        // todo: https://egonelbre.com/project/jsfx/
        // todo: https://github.com/loov/jsfx
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.connect(audioCtx.destination);
        // osc.connect(gain);
        // gain.connect(audioCtx.destination);
        osc.type = 'sine';

        // note c4 is 261

        osc.frequency.value = 261 + freq * 2;
        osc.start(); // play sound
        // gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + time); // reduce it gradually
        setTimeout(() => osc.stop(), 10);
        //o.stop();
    }

    // draw and wait
    function drawSleepFn(arr, x) {
        return async function (detail = 1, ...indexes) {
            if (_this.detail != detail) return;
            if (reset) return Promise.reject("stopped");

            draw_indexes(arr, x, ...indexes);
            await sleep(1000 - _this.speed);
        }
    }

    // draw immediately
    function draw(arr, x, detail = 1, ...indexes) {
        if (_this.detail != detail) return;

        draw_indexes(arr, x, ...indexes);
    }

    // draw only indexes of array if provided, full array otherwise
    function draw_indexes(arr, x, ...indexes) {
        if (!arr)
            return;

        if (indexes.length == 0) {
            drawArray(arr, x);
            return;
        }

        for (let i = 0; i < indexes.length; i++) {
            const j = indexes[i];
            drawPoint(arr[j], x * _this.pw, j * _this.ph, _this.pw, _this.ph);

            // play the music
            if (x === 0 && _this.audio) {
                playAudio(j, 1.7);
            }
        }
    }

    async function sleep(ms) {
        return new Promise(rs => setTimeout(rs, ms));
    }

    // draw array on position x
    function drawArray(arr, x) {
        for (let i = arr.length - 1; i >= 0; i--) {
            drawPoint(arr[i], x * _this.pw, i * _this.ph, _this.pw, _this.ph);
        }
    }

    // draw number as HSL block with constant saturation and luminence
    function drawPoint(hue, x, y, w, h, highlight = false) {
        let j = rescale(hue, 0, _this.max, 0, 360);
        ctxHidden.fillStyle = _this.color_maps[_this.color_map](hue, _this.max);
        ctxHidden.fillRect(x, y, w, h);
    }

    // rescale a number from old range to new range
    function rescale(number, old_min, old_max, new_min, new_max) {
        const old_range = old_max - old_min;
        const new_range = new_max - new_min;

        const ratio = new_range / old_range;

        return new_min + number * ratio;
    }

    function shuffle(array) {
        let m = array.length,
            t,
            i;

        // While there remain elements to shuffle…
        while (m) {
            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }

        return array;
    }
}

// const algos = [
//     { name: "Bubble Sort", fn: bubbleSort, enabled: false },
//     { name: "Cocktail Sort", fn: cocktailSort, enabled: false },
//     { name: "Insertion Sort", fn: insertionSort, enabled: false },
//     { name: "Gnome Sort", fn: gnomeSort, enabled: false },
//     { name: "Comb Sort", fn: combSort, enabled: false },
//     { name: "Shell Sort", fn: shellSort, enabled: false },
//     { name: "Selection Sort", fn: selectionSort, enabled: false },
//     { name: "Merge Sort", fn: mergeSort, enabled: false },
//     { name: "Parallel Merge Sort", fn: parallelMergeSort, enabled: false },
//     { name: "Radix Sort", fn: radixSort, enabled: false },
//     { name: "Quick Sort", fn: quickSort, enabled: false },
//     { name: "Odd-Even Sort", fn: oddEvenSort, enabled: false },
//     { name: "Cycle Sort", fn: cycleSort, enabled: false },
//     { name: "Heap Sort", fn: heapSort, enabled: false },
//     // _this.oddEvenSort2 ? Sorting.oddEvenSort2 : null,
// ];
// let wizSorting = new WizSorting(document.getElementById("bubble_sort_canvas"), algos);