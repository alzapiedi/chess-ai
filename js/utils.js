var Utils = {};

Utils.inherits = function (subclass, parentClass) {
  var Surrogate = function () {};
  Surrogate.prototype = parentClass.prototype;
  subclass.prototype = new Surrogate();
  subclass.prototype.constructor = subclass;
}

Utils.arrayEquals = function (arr1, arr2) {
  if (!arr1 || !arr2) {
    return false;
  }
  return arr1[0] === arr2[0] && arr1[1] === arr2[1];
}

Utils.arrayReduce = function (arr) {
  sum = 0;
  for (var i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}


module.exports = Utils;
