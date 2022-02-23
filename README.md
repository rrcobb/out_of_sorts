# Some algorithms in js

Just fooling around with sorts so far.

findings:
- radix sort is a lot faster than merge sort
- the best bucket size for radix sort is 16384, though it shifts a little based
    on the input array
- new Array(n) fails before the radix sort does (a memory thing I suppose)
- radix can do an array of 2560000 elements in under a minute

Questions remain:
- what kind of sort does the engine use?
    - https://v8.dev/blog/array-sort#timsort
- how does it fare against the radix sort?

    ~~
    - looks like the native sort is a ~constant factor of 3 faster than this radix sort impl
    - that likely means it's just doing a faster radix sort under the hood
        maybe an insertion sort when the bins are small
    - nope! it's timsort that probably means there's some degenerate cases where the radix sort is faster
    ~~

    - Scratch that, I was picking bad bucket sizes for the comparison
    - picking a better bucket size, and radix sort is indeed faster than the
        built-in Array.prototype.sort.

