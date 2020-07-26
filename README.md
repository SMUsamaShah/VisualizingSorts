# Visualize and Listen to sorting algorithms

[![HitCount](http://hits.dwyl.io/smusamashah/VisualizingSorts.svg)](http://hits.dwyl.io/smusamashah/VisualizingSorts)

## [Demo](https://smusamashah.github.io/VisualizingSorts/sorting.html)

Blog post: https://smusamashah.github.io/sorting-algorithms-visual-comparison/

## How to use:

Include `wizsort.js`. 

Your sort algo  
- must be async
- first param must be the input array
- second param the draw function
  - to the draw function pass values in format of `await mydrawfn(level_of_detail, array_index_to_draw, array_index_to_draw, array_index_to_draw)`. There can be any number of `array_index_to_draw` arguments including none. Leaving it empty will draw whole array in its current state and therefore slower than drawing given indexes.
  


### Example:
```
<script src="wizsort.js"></script>
<script type="text/javascript">
  async function bubbleSort(arr, draw) {
      const n = arr.length;

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
          }
          await draw(1);
      } while (swapped == true);

      return arr;
  }
  const algos = [
      { name: "Bubble Sort", fn: bubbleSort, enabled: false }
  ];
  let wizSorting = new WizSorting(document.getElementById("container"), algos, "auto");
</script>
```

# Screenshots:

![Screenshot 1](screenshot3.png)
![Screenshot 1](screenshot1.png)
![Screenshot 1](screenshot2.png)

