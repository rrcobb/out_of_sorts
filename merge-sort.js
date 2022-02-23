const assert = require('assert/strict');
// merge sort
// 
// split list into pieces
// sort pieces
// merge the (sorted) pieces back together
//  look at the first elements of left and right lists
//  add the earlier one to the result list

// merge a and b
// a and b must be sorted
// runtime is linear in a.length + b.length
// memory is a+b, or maybe upper bounded by 2(a+b), depending on js array
// implementation
const { performance } = require('perf_hooks');

function merge(a, b, compare) {
  let results = []
  while (a.length > 0 && b.length > 0) {
    if (compare(a[0], b[0])) {
      results.push(a.shift());
    } else {
      results.push(b.shift());
    }
  }
  results = results.concat(a);
  results = results.concat(b);
  return results;
}

// test out merge
assert.deepEqual(merge([1,3,5], [2,4,6], cmp), [1,2,3,4,5,6])
assert.deepEqual(merge([10, 20, 30], [2,4,6], cmp), [2,4,6,10,20,30])

function cmp(a,b) {
  return a < b
}

function mergesort(list, comparefunc = cmp) {
  if (list.length > 1) {
    // split list in two
    let a = list.slice(0,list.length / 2);
    let b = list.slice(list.length / 2, list.length);
    // mergesort each
    let sorted_a = mergesort(a, comparefunc);
    let sorted_b = mergesort(b, comparefunc);
    // merge the sorted versions
    return merge(sorted_a, sorted_b, comparefunc);
  } else {
    // base case, list has one or none items
    // zero and one-element arrays are sorted
    return list;
  }
}

// sort
assert.deepEqual(mergesort([5,4,3,2,1]), [1,2,3,4,5]);
assert.deepEqual(mergesort([50,45,3,25,11], (x,y) => x > y), [50, 45, 25, 11, 3]);

// algorithmic analysis
let [counting_compare, getcount, reset] = (function() {
  let count = 0;
  function compare(a,b) {
    count += 1;
    return a < b
  }
  let get_count = () => count;
  let reset = () => { count = 0; }
  return [compare, get_count, reset];
})();

function countComparisons() {
  console.log('counting comparisons and timing')
  let g = mergesort([5,4,3,2,1], counting_compare);
  console.log(g)
  console.log(getcount());
  reset();
  let h = mergesort([50,45,3,25,11], counting_compare);
  console.log(h)
  console.log(getcount());

  for (let x = 1; x < 20; x++) {
    let n = x * 500;
    reset();
    let i = new Array(n).fill(0).map(_ => Math.random());
    let start = performance.now();
    mergesort(i, counting_compare);
    let end = performance.now();
    let duration = end - start;
    let count = getcount()
    // log2(n) is optimal, what's K?
    let nlog2n = n * Math.log2(n);
    console.log(n, 'elements:', duration.toFixed(2), 'ms,', count, 'compares', nlog2n.toFixed(2), 'is n * log2(n)', (count/nlog2n).toFixed(2), 'is K');
  }
}


// countComparisons();
function findMinuteMark() {
  let n = 20500; 
  let duration = 0
  do {
    n = n * 2;
    let i = new Array(n).fill(0).map(_ => Math.random());
    let start = performance.now();
    mergesort(i, cmp);
    let end = performance.now();
    duration = end - start;
    console.log(n, 'elements:', duration.toFixed(2), 'ms')
  } while (duration < 1000)
}
findMinuteMark();

