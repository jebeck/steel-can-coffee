module.exports = function() {
  if (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0)) {
    return true;
  }
  return false;
};