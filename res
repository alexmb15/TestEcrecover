



  TestEcrecover
    √ should allow to send and receive payments with executeCall() (1530ms)
executeDelegateCall
    1) should allow to send and receive payments with executeDelegateCall()
    √ should fail with 'invalid sig!' when not owner


  2 passing (2s)
  1 failing

  1) TestEcrecover
       should allow to send and receive payments with executeDelegateCall():
     TypeError: overflow (argument="value", value=90000000000000000000, code=INVALID_ARGUMENT, version=6.11.1)
      at makeError (node_modules\ethers\src.ts\utils\errors.ts:687:21)
      at assert (node_modules\ethers\src.ts\utils\errors.ts:715:25)
      at assertArgument (node_modules\ethers\src.ts\utils\errors.ts:727:5)
      at getNumber (node_modules\ethers\src.ts\utils\maths.ts:154:27)
      at toNumber (node_modules\ethers\src.ts\utils\maths.ts:177:12)
      at Reader.readIndex (node_modules\ethers\src.ts\abi\coders\abstract-coder.ts:490:24)
      at D:\Work\prog\js\1Portfolio\ecrecover\node_modules\ethers\src.ts\abi\coders\array.ts:90:33
      at Array.forEach (<anonymous>)
      at unpack (node_modules\ethers\src.ts\abi\coders\array.ts:86:12)
      at TupleCoder.decode (node_modules\ethers\src.ts\abi\coders\tuple.ts:66:22)



