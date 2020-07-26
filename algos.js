function swap(array, i, j) {
    if (i >= array.length || j >= array.length) return;
    if (i === j) return;

    let t = array[i];
    array[i] = array[j];
    array[j] = t;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////// SORTING ALGORITHMS ///////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// g(n) = n^2
// f(n) < O(n^2); => We have constant 'k' which makes k*n^2 always bigger than f(n) for any value of n > n0. e.g. 2n^2 + 2n < 3n^2
// simply,  O(n^2) will always go over f(n) after a certain value of n

// Bubble Sort: Hello world of sorting algorithms.
// Loop through array while keeping an eye on current and next element
// Swap the two whenever current one is bigger until you reach the end
// keep repeating this process until no swap is done in a loop
async function bubbleSort(arr, draw) {
    const n = arr.length;
    let iterations = 0;

    let swapped = false;
    do {
        swapped = false;
        for (let j = 0; j < n - 1; j++) {
            if (arr[j + 1] < arr[j]) {
                swap(arr, j, j + 1);
                swapped = true;

                await draw(3, j + 1, j);
            }
            await draw(2);
            iterations++;
        }
        await draw(1);
    } while (swapped == true);

    console.log(`bubblesort -> ${iterations}`);
    return arr;
}

// Cocktail Sort: bubble sort bouncing back and forth.
// Same as bubble sort, instead of looping from the start every time,
// when it reaches the end, it starts the loop from the end swapping in
// reverse.
async function cocktailSort(arr, draw) {
    const n = arr.length;
    const x = arguments[1];
    let iterations = 0;

    let swapped = false;
    do {
        swapped = false;
        for (let j = 0; j < n - 1; j++) {
            if (arr[j + 1] < arr[j]) {
                swap(arr, j + 1, j);
                swapped = true;

                await draw(3, j + 1, j);
            }
            iterations++;
            await draw(2);
        }
        if (!swapped)
            break;
        for (let j = n - 1; j >= 0; j--) {
            if (arr[j + 1] < arr[j]) {
                swap(arr, j + 1, j);
                swapped = true;

                await draw(3, j + 1, j);
            }
            iterations++;
            await draw(2);
        }
        await draw(1);

    } while (swapped == true);

    console.log(`cocktail sort ${iterations}`);
    return arr;
}

// Insertion Sort: Pick an item, and loop back to first item while swapping
// where required, like bubble sort backwards each iterations. 
// Pick next element and repeat til end of array.
async function insertionSort(data, draw) {
    const n = data.length;
    const x = arguments[1];
    let iterations = 0;

    for (let i = 1; i < n; i++) { // start from second elmeent
        for (let j = i; j >= 1; j--) { // loop to move back to zero
            if (data[j - 1] > data[j]) { // while swapping
                swap(data, j - 1, j);
                await draw(3, j - 1, j);
            }
            iterations++;
            await draw(2);
        }
        await draw(1);
    }
}

// Gnome Sort (Stupid Sort): An upgrade to insertion sort
// Unlike insertion sort, which even after correctly positioning the selected 
// item still runs upto first item, Gnome Sort skips those comparisons and
// picks the next item to sort.
async function gnomeSort(arr, draw) {
    const n = arr.length;
    const x = arguments[1];
    let iterations = 0;

    let pos = 0; // start from first index
    while (pos < n) {
        if (pos == 0 || arr[pos - 1] < arr[pos]) {
            pos++; // if it is in correct position w.r.t. previous item, move forward
        } else {
            swap(arr, pos, pos - 1); // otherwise, swap it with previous item
            await draw(3, pos, pos - 1);
            pos--; // and move back
        }
        await draw(1);
        await draw(2);
        iterations++;
    }

    console.log(`gnome sort ${iterations}`);
    return arr;
}

// Comb Sort: A Bubble Sort with varying swap items distance
// Bubble sort always swap adjacent items, while Comb Sort starts swapping very
// distant items and gradually narrows the distance on each iterations. This
// also increases the comparisons on each iterations.
async function combSort(data, draw) {
    const x = arguments[1];
    const n = data.length;
    let gap = data.length;
    const shrink = 1.3; // 1.3 is considered ideal shrink factors by authors
    let iterations = 0;
    let _s = 0;

    let sorted = false;
    while (!sorted) { // a bubble sort like check
        gap = Math.floor(gap / shrink); // set the distance based on shrink factor
        if (gap > 1) {
            sorted = false;
        } else {
            gap = 1;
            sorted = true;
        }

        for (let i = 0; i + gap < n; i++) { // start looping from item near list end
            // await sleepHighlight(data, x, i, i+gap);
            if (data[i] > data[i + gap]) { // comparisons will increase with gap decreasing on each iterations
                swap(data, i, i + gap);
                sorted = false;

                _s++;
                await draw(3, i, i + gap);
            }
            await draw(2, i, i + gap);
            iterations++;
        }
        await draw(1);
    }

    console.log(`comb sort ${iterations}`);
    return data;
}

// Shell Sort: Applies gapping method (as in comb sort) on insertion sort
// 
async function shellSort(data, draw) {
    const x = arguments[1];
    const n = data.length;
    const gaps = [7501, 701, 301, 132, 57, 23, 10, 4, 1]; // most optimized gap sequence
    let iterations = 0, iterations2 = 0;

    for (let g = 0; g < gaps.length; g++) {
        const gap = gaps[g];

        for (let i = gap; i < n; i++) { // select a gap value within list, and loop upto last element in list
            const temp = data[i]; // pick element on that position

            let j = i
            // await draw( j, j-gap, true);
            while (j >= gap && data[j - gap] > temp) {
                data[j] = data[j - gap];
                await draw(3, j);

                j -= gap;
                iterations++;
            }
            data[j] = temp;
            draw(data, x, 3, j);

            iterations2++;
            await draw(2);
        }
        await draw(1);
    }
    console.log(`shellsort ${iterations + iterations2}`);
}

// Selection Sort: A simple algorithm like bubble sort
// start from first item and iterate through remaining list to find a 
// smaller item when found, swap with it and move to next position and 
// repeat the process
async function selectionSort(data, draw) {
    const n = data.length;
    const x = arguments[1];
    let iterations = 0;

    let imin = 0;
    for (let j = 0; j < n - 1; ++j) {
        imin = j;
        for (let i = j + 1; i < n; ++i) { // loop to find minimum
            if (data[imin] > data[i]) {
                imin = i;
                await draw(3, imin);
            }
            iterations++;
        }

        if (imin != j) { // swap with newly found minimum
            swap(data, imin, j);
            await draw(3, j, imin);
        }
        await draw(2);
        await draw(1);
    }
}

// Merge Sort: Basic divide and conquer. Split an array recursively until it can not be further divided.
// Sorting happens on merge. Splitted arrays are merge in a way so that final array is sorted. This 
// goes on until all pieces are merged making on sorted array. 
async function mergeSort(data, draw) {
    const n = data.length;
    const x = arguments[1];
    let iterations = 0;

    const split = async function (arr, i1, i2) {
        if (i2 == i1)
            return;

        const m = Math.floor((i1 + i2) / 2);
        await split(arr, i1, m);
        await split(arr, m + 1, i2);

        await merge(arr, i1, m, m + 1, i2);

        await draw(1);
    };

    const merge = async function (arr, i1, i2, j1, j2) {
        const a1 = arr.slice(i1, i2 + 1);
        const a2 = arr.slice(j1, j2 + 1);

        let i = 0, j = 0, k = i1;

        while (k <= j2) {
            if (i >= a1.length) {
                arr[k] = a2[j];
                j++;
            }
            else if (j >= a2.length) {
                arr[k] = a1[i];
                i++;
            }
            else if (a1[i] < a2[j]) {
                arr[k] = a1[i];
                i++;
            } else {
                arr[k] = a2[j];
                j++;
            }
            await draw(3, k);
            k++;
        }
        await draw(2);
    };

    split(data, 0, data.length - 1);
}

// Merge Sort Parallel: Same as original, both branches of split work on different data, they are only made
// to run in parallel instead of one after another.
async function parallelMergeSort(data, draw) {
    const n = data.length;
    const x = arguments[1];
    let iterations = 0;

    const split = async function (arr, i1, i2) {
        if (i2 == i1)
            return;

        const m = Math.floor((i1 + i2) / 2);
        let s1 = split(arr, i1, m);
        let s2 = split(arr, m + 1, i2);

        await s1; await s2;

        await merge(arr, i1, m, m + 1, i2);

        await draw(1);
    };

    const merge = async function (arr, i1, i2, j1, j2) {
        const a1 = arr.slice(i1, i2 + 1);
        const a2 = arr.slice(j1, j2 + 1);

        let i = 0, j = 0, k = i1;

        while (k <= j2) {
            if (i >= a1.length) {
                arr[k] = a2[j];
                j++;
            }
            else if (j >= a2.length) {
                arr[k] = a1[i];
                i++;
            }
            else if (a1[i] < a2[j]) {
                arr[k] = a1[i];
                i++;
            } else {
                arr[k] = a2[j];
                j++;
            }
            await draw(3, k);
            k++;
        }
        await draw(2);
    };

    await split(data, 0, data.length - 1);
}

// Radix Sort: Sort without comparisons, the weird one
// put items in buckets based on their last digits, then empty the buckets
// back on the list. do it again for second last digit. after going 
// through all digits list will be sorted
async function radixSort(data, draw) {
    const x = arguments[1];
    const n = data.length;
    let iterations = 0;

    const getDigit = (number, index) => Math.floor(Math.abs(number) / Math.pow(10, index)) % 10;
    const countDigits = (number) => Math.floor(Math.log10(Math.abs(number))) + 1;

    let maxDigits = 0;
    for (let i = 0; i < n; i++) {
        let d = countDigits(data[i]);
        maxDigits = d > maxDigits ? d : maxDigits;
    }

    // init 2d array
    let buckets = [];
    while (buckets.push([]) < 10);

    for (let di = 0; di < maxDigits; di++) {
        // pick each number, and put it in bucket matching its selected digit
        for (let j = 0; j < n; j++) {
            const d = getDigit(data[j], di);
            buckets[d].push(data[j]);
        }

        // empty all buckets one by one into the original array
        let i = 0;
        for (let j = 0; j < n; j++) {
            while (buckets[j] != undefined && buckets[j].length > 0) {
                data[i] = buckets[j].shift();
                await draw(3, i);
                i++;
            }
            await draw(2);
            await draw(1);
        }
    }
}

// Bucket Sort: Almost same as Radix.
// TODO
async function bucketSort(arr, draw) {

}

// TODO
async function countingSort(arr, draw) {

}

// Quick Sort: Put all smaller and all greater items on left and right of a selected pivot in any order.
// Start by selecting right most as pivot. Compare with first item, if bigger, move
// it to right side of pivot by shifting pivot to left. Continue moving right and shifting
// pivot to left until all bigger items are on its right. Repate on left and right sides of pivot.
async function quickSort(arr, draw) {
    const x = arguments[1];
    let iterations = 0;

    await sort(arr, 0, arr.length - 1);

    async function sort(arr, lo, hi) {
        if (lo < hi) {
            const p = await sortPartition(arr, lo, hi);
            await sort(arr, lo, p - 1);
            await sort(arr, p + 1, hi);
        }
    }

    async function sortPartition(arr, lo, hi) {
        const pivot = arr[hi];

        let pi = hi;
        let i = lo;
        while (i <= pi - 1) {
            if (arr[i] > pivot) {
                swap(arr, i, pi - 1);
                swap(arr, pi - 1, pi);
                await draw(3, i, pi, pi - 1);
                pi = pi - 1;
            } else {
                i++;
            }
            await draw(2);
            iterations++;
        }
        await draw(1);
        //arr[pi] = pivot;


        // let i = lo;
        // for(let j = lo; j <= hi - 1; j++) {
        //     if(arr[j] < pivot) {
        //         if(i != j) {
        //             swap(arr, i, j);
        //             await drawAndSleep(arr, x);
        //         } 
        //         i++;
        //     }
        //     iterations++;
        // }
        // swap(arr, i, hi);
        // await drawAndSleep(arr, x);

        return pi;
    }
    console.log(`quicksort ${iterations}`);
}

// Odd-Even Sort: This is for parallel processors, a modification of bubble sort.
// Too loops, one for even indexes, one for odd.
async function oddEvenSort(arr, draw) {
    const x = arguments[1];
    const n = arr.length;
    let iterations = 0;

    let swapped = false;
    do {
        swapped = false;
        for (let j = 0; j < n - 1; j += 2) {
            if (arr[j] > arr[j + 1]) {
                swap(arr, j + 1, j);
                swapped = true;
                await draw(3, j + 1, j);
            }
            iterations++;
            await draw(2);
        }

        for (let j = 1; j < n - 1; j += 2) {
            if (arr[j] > arr[j + 1]) {
                swap(arr, j + 1, j);
                swapped = true;
                await draw(3, j + 1, j);
            }
            iterations++;
            await draw(2);
        }

        // await oddeven();

        // let e = even();
        // let o = odd();                    
        // let c = await o;
        // let d = await e;

        await draw(1);
    } while (swapped == true);

    async function oddeven() {
        odd();
        even();
    }

    async function odd() {
        for (let j = 1; j < n - 1; j += 2) {
            if (arr[j] > arr[j + 1]) {
                swap(arr, j + 1, j);
                swapped = true;

                await draw(3, j + 1, j);
            }
            iterations++;
            await draw(2);
        }
    }

    async function even() {
        for (let j = 0; j < n - 1; j += 2) {
            if (arr[j] > arr[j + 1]) {
                swap(arr, j + 1, j);
                swapped = true;

                await draw(3, j + 1, j);
            }
            iterations++;
            await draw(2);
        }
    }

    console.log(`odd-even sort ${iterations}`);
    return arr;
}

async function oddEvenSort2(arr, draw) {
    const x = arguments[1];
    const n = arr.length;
    let swapped = false;
    let iterations = 0;
    let k = 7;

    while (k-- > 1)
        do {
            //console.log(k);
            swapped = false;
            for (let i = 0; i < k; i++) {
                for (let j = i; j < n - 1; j += k) {
                    if (arr[j] > arr[j + k]) {
                        swap(arr, j + k, j);
                        swapped = true;

                        await draw(3, j + k, j);
                    }
                    iterations++;
                    await draw(2);
                }
            }
            await draw(1);
        } while (swapped == true);

    console.log(`odd-even sort2 ${iterations}`);
    return arr;
}

// Cycle Sort: Take each item one by one and only write it on its correct position.
// Least number of write operations but O(n^2).
async function cycleSort(arr, draw) {
    const x = arguments[1];
    const n = arr.length;
    let _w = 0;
    let iterations = 0;

    for (let cycleStart = 0; cycleStart < n - 1; cycleStart++) {
        let item = arr[cycleStart];

        let pos = cycleStart;
        for (let i = cycleStart + 1; i < n; i++) {
            if (arr[i] < item) {
                pos++;
            }
            iterations++;
        }

        if (pos === cycleStart) {
            continue;
        }

        while (item === arr[pos]) {
            pos++;
        }
        let t = arr[pos];
        arr[pos] = item;
        item = t;
        // [arr[pos], item] = [item, arr[pos]];
        await draw(3, pos);

        _w += 1;

        while (pos != cycleStart) {
            pos = cycleStart;
            for (let i = cycleStart + 1; i < n; i++) {
                if (arr[i] < item) {
                    pos++;
                }
            }
            while (item === arr[pos]) {
                pos++;
            }
            let tt = arr[pos];
            arr[pos] = item;
            item = tt;
            _w++;
            await draw(3, pos);
        }

        await draw(2);
        await draw(1);
    }

    console.log(`cyclesort ${_w}`);
    return { iterations, x };
}

// TODO
async function pigeonholeSort(arr, draw) {

}

// TODO
async function introSort(arr, draw) {
    const n = arr.length;

    function sort(arr, maxDepth) {

    }
}

async function heapSort(list, draw) {
    const n = list.length;
    const x = arguments[1];

    const iParent = (i) => Math.floor((i - 1) / 2);
    const iLeftChild = (i) => 2 * i + 1;
    const iRightChild = (i) => 2 * i + 2;

    async function maxheapify(arr, i, max) {
        let parent;
        while (i < max) {
            parent = i;
            const leftChild = iLeftChild(parent);
            const rightChild = iRightChild(parent);

            if (leftChild < max && arr[leftChild] > arr[parent]) {
                parent = leftChild;
            }

            if (rightChild < max && arr[rightChild] > arr[parent]) {
                parent = rightChild;
            }

            // if neither left or right child is bigger, end
            if (parent == i) {
                return;
            }

            swap(arr, parent, i);
            await draw(3, parent, i);
            i = parent;
        }
    }
    function verifyHeap(arr) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] < arr[iLeftChild(i)] || arr[i] < arr[iRightChild(i)]) {
                console.log("heap is incorrect at ", i);
                console.log(arr);
                return;
            }
        }
        console.log("heap is correct");
    }

    async function buildMaxHeap(arr) {
        var i = Math.floor(arr.length / 2 - 1); //iParent(arr.length - 1);
        while (i >= 0) {
            await maxheapify(arr, i, arr.length);
            i--;
        }
    }

    await buildMaxHeap(list);

    let last = n - 1; // last and first of a heap are always min and max of array

    while (last > 0) {
        swap(list, 0, last);// put max on end of array and re-heap the remaining array
        await draw(3, 0, last);

        await maxheapify(list, 0, last);

        await draw(2);
        await draw(1);
        last--;
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////// END  SORTING ALGORITHMS //////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////