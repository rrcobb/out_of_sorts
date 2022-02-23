const assert = require('assert/strict');
const { performance } = require('perf_hooks');

// radix sort
// have n buckets
// put the items into the buckets by the 'first digit'
// flatten, then do it again

// alternatives for the buckets
//  modular arithmetic with a greater than 
//  string index arithmetic, per https://www.digitalocean.com/community/tutorials/js-radix-sort
// lets compare them both

let stringBucket = (num, index) => {
  let strNum = String(num);
  let end = strNum.length - 1;
  let found = strNum[end - index];
  return found == undefined ? 0 : found;
}

// string length of n
// same as Math.floor(Math.log10(n)) + 1
let maxLength = (nums) => {
  let max = 0;
  for (let num of nums) {
    let strlen = String(num).length;
    if (strlen > max) {
      max = strlen;
    }
  }
  return max;
}

// in place sort the nums array, using string conversion and indexing
let radixSortString = (nums) => {
  let iterations = maxLength(nums);
  for (let i = 0; i < iterations; i++) {
    // length must be 10 because we are using decimal string repr of nums
    let buckets = Array.from({length: 10}, () => []);
    for (let n of nums) {
      buckets[stringBucket(n, i)].push(n);
    }
    nums = buckets.flat();
  }
  return nums;
}

// test
assert.deepEqual(radixSortString([3,2,1]), [1,2,3]);
assert.deepEqual(radixSortString([30,25,100]), [25, 30, 100])
assert.deepEqual(radixSortString([315,2,11012, 80, 654, 100000]), [2, 80, 315, 654, 11012, 100000 ])

// first step is n % numBuckets, so n % 10 for decimal
// last step is (n / numbuckets ^ count) % numBucket, so (n / 100000) % 10 if the largest number
//   is a six-digit decimal number
// Bucket is (n / (numBuckets ** step)) % numBuckets
let bucket = (n, step, numBuckets) => {
  return (Math.floor(n / (numBuckets ** step))) % numBuckets; 
}

// thought it would be faster to use right shift; looks like it's slower
// it's about the same speed, so long as we are less than 
Number.MAX_BITWISE_SAFE_INTEGER = Math.pow(2,31) - 1;
// turns out the JIT is really good
let bucketByShifting = (n, step, numBuckets) => {
  let rightshifts = Math.log2(numBuckets) * step;
  return (n >> rightshifts) % numBuckets
}

let bigBuckets =  (n, step, numBuckets) => {
  let rightshifts = Math.log2(numBuckets) * step;
  return Number(
    (BigInt(n) >> BigInt(rightshifts)) % BigInt(numBuckets)
  )
}

let numIterations = (nums, numBuckets) => { 
  let max = 0;
  for (let n of nums) {
    if (n > max) {
      max = n
    }
  }
  return [Math.floor((Math.log(max) / Math.log(numBuckets))) + 1, max]
};

// TODO: account for negative numbers, max(abs(n)) or max(n ** 2)
// in place sort the nums array, using modular arithmetic
let radixSort = (nums, numBuckets = 8) => {
  // number of iterations needed: log base number of buckets (max n)
  let [iterations, max] = numIterations(nums, numBuckets);
  let bucketAlg = max > Number.MAX_BITWISE_SAFE_INTEGER ? bucket : bucketByShifting;
  for (let i = 0; i < iterations; i++) {
    let buckets = Array.from({length: numBuckets}, () => []);
    for (let n of nums) {
      let b = bucketAlg(n, i, numBuckets)
      buckets[b].push(n);
    }
    nums = buckets.flat();
  }
  return nums;
}

// lite test for correctness
assert.deepEqual(radixSort([3,2,1]), [1,2,3]);
assert.deepEqual(radixSort([30,25,100]), [25, 30, 100])
assert.deepEqual(radixSort([315,2,11012, 80, 654, 100000]), [2, 80, 315, 654, 11012, 100000 ])

let gen = (max) => Math.floor(Math.random() * max)

// algorithmic analysis
// nlogn comparisons? no, we just do n * m ops of %
//  (and floating point divisions!)
// where m is log base bucket count of max(arr)

function compareStringAndModRadixSort() {
  let stringTotal = 0;
  let modTotal = 0;
  let count = 0;
  for (let x = 1; x < 10; x++) {
    let n = x * 5000;
    let m = 10 ** x;
    let i = new Array(n).fill(0).map(_ => gen(m));

    let start = performance.now();
    radixSort(i);
    let end = performance.now();
    let radixSortDuration = end - start;
    modTotal += radixSortDuration;

    start = performance.now();
    radixSortString(i);
    end = performance.now();
    let radixSortStringDuration = end - start;
    stringTotal += radixSortStringDuration;
    count += 1;

    console.log(n, 'elements,', m, 'max')
    console.log('modulo:\t', radixSortDuration.toFixed(2), 'ms')
    console.log('string:\t', radixSortStringDuration.toFixed(2), 'ms')
  }
  let stringAverage = (stringTotal / count).toFixed(2);
  let modAverage = (modTotal / count).toFixed(2);
  console.log({stringTotal, modTotal, stringAverage, modAverage});
}

function compareBucketSizes() {
  // testing different bucket sizes
  for (let n = 10 ** 3; n < 10 ** 7; n = n * 8) {
    let total = 0;
    let count = 0;
    let bestTime = Infinity;
    let bestBucketSize = 2; //init
    let maxBuckets = 0;

    for (let x = 9; x < 17; x ++) {
      let numBuckets = 2 ** x;
      maxBuckets = numBuckets;
      let m = Number.MAX_BITWISE_SAFE_INTEGER * 1000;
      let i = new Array(n).fill(0).map(_ => gen(m));

      let start = performance.now();
      radixSort(i, numBuckets);
      let end = performance.now();
      let radixSortDuration = end - start;
      if (radixSortDuration < bestTime) {
        bestTime = radixSortDuration;
        bestBucketSize = numBuckets;
      }

      console.log(numBuckets, 'buckets', radixSortDuration.toFixed(2), 'ms (', n, 'elements,', m, 'max)')
      total += radixSortDuration;
      count += 1;
    }
    let averageTime = (total / count).toFixed(2);
    console.log({n, averageTime, bestTime, bestBucketSize, maxBuckets})
  }
}

function findMinuteMark() {
  let n = 10000; 
  let duration = 0
  let m = Number.MAX_BITWISE_SAFE_INTEGER * 1000;
  let bucketNum = 16384;
  do {
    n = n * 2;
    let i = new Array(n).fill(0).map(_ => gen(m));
    let start = performance.now();
    radixSort(i, bucketNum);
    let end = performance.now();
    duration = end - start;
    console.log(n, 'elements:', duration.toFixed(2), 'ms')
  } while (duration < 1000)
}

let nativeSort = (arr) => {
  return arr.sort((a,b) => a - b);
}

function compareNativeAndRadix() {
  let nativeTotal = 0;
  let radixTotal = 0;
  let nbuckets = 16384;
  let count = 0;
  for (let x = 1; x < 10; x++) {
    let n = x * 250000;
    let m = 10000;
    let i = new Array(n).fill(0).map(_ => gen(m));

    let start = performance.now();
    radixSort(i, nbuckets);
    let end = performance.now();
    let radixSortDuration = end - start;
    radixTotal += radixSortDuration;

    start = performance.now();
    nativeSort(i);
    end = performance.now();
    let nativeSortDuration = end - start;
    nativeTotal += nativeSortDuration
    count += 1;

    console.log(n, 'elements,', m, 'max')
    console.log('radix:\t', radixSortDuration.toFixed(2), 'ms')
    console.log('native:\t', nativeSortDuration.toFixed(2), 'ms')
  }
  let nativeAverage = (nativeTotal / count).toFixed(2);
  let radixAverage = (radixTotal / count).toFixed(2);
  console.log({nativeTotal, radixTotal, nativeAverage, radixAverage});
}

// compareStringAndModRadixSort();
// compareBucketSizes();
// findMinuteMark()

compareNativeAndRadix()
